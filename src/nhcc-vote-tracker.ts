import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { lookupVotes, DEFAULT_API_BASE } from "./api";
import { DEFAULT_SHEET_URL } from "./config";
import { widgetStyles } from "./styles";
import type { RepresentativeResult, TrackedVote, VoteTrackerLookupResponse } from "./types";

@customElement("nhcc-vote-tracker")
export class NhccVoteTracker extends LitElement {
  static styles = widgetStyles;

  @property() sheet = DEFAULT_SHEET_URL;
  @property({ attribute: "sheet-gid" }) sheetGid?: string;
  @property({ type: Number, attribute: "session-year" }) sessionYear?: number;
  @property({ type: Number, attribute: "candidate-year" }) candidateYear?: number;
  @property() title = "See how your NH representatives voted";
  @property() subtitle = "Enter your address to match your representatives with this bill tracker.";
  @property({ attribute: "button-label" }) buttonLabel = "Find votes";
  @property() placeholder = "Street address, city, NH";
  @property({ attribute: "api-base" }) apiBase = DEFAULT_API_BASE;
  @state() private address = "";
  @state() private ward = "";
  @state() private loading = false;
  @state() private error = "";
  @state() private result?: VoteTrackerLookupResponse;
  @state() private selectedIssue = "";

  private emit(name: string, detail: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private async submit(event: SubmitEvent) {
    event.preventDefault();
    await this.runLookup();
  }

  private async runLookup() {
    const address = this.address.trim();
    this.error = "";
    if (!address) { this.error = "Address is required."; return; }
    this.loading = true;
    this.result = undefined;
    this.emit("nhcc-widget-submit", { address });
    try {
      this.result = await lookupVotes({
        apiBase: this.apiBase, address, ward: this.ward.trim() || undefined, sheet: this.sheet, sheetGid: this.sheetGid,
        sessionYear: this.sessionYear, candidateYear: this.candidateYear
      });
      this.selectedIssue = "";
      this.emit("nhcc-widget-success", { address, result: this.result });
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Unable to load voting information.";
      this.emit("nhcc-widget-error", { address, error: this.error });
    } finally { this.loading = false; }
  }

  private voteRow(item: TrackedVote) {
    const label = item.vote?.vote_label || item.vote?.vote || "No vote found";
    const tone = item.vote?.alignment === "preferred"
      ? "support"
      : item.vote?.alignment === "opposed"
        ? "against"
        : "";
    return html`<div class="vote-row">
      <div>
        <div><span class="bill-code">${item.bill.billNumber}</span> · <span class="bill-title">${item.bill.url ? html`<a href=${item.bill.url} target="_blank" rel="noopener noreferrer">${item.bill.title}</a>` : item.bill.title}</span></div>
        ${item.bill.issueArea ? html`<div class="issue">${item.bill.issueArea}</div>` : nothing}
        ${item.bill.impact ? html`<p class="impact">${item.bill.impact}</p>` : nothing}
      </div>
      <span class="pill ${tone}" title=${item.vote?.question_motion || ""}>${label}</span>
    </div>`;
  }

  private initials(name: string) {
    return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }

  private filteredVotes(rep: RepresentativeResult) {
    if (!this.selectedIssue) return rep.trackedVotes;
    return rep.trackedVotes.filter(({ bill }) =>
      bill.issueArea?.split(",").some((issue) => issue.trim() === this.selectedIssue)
    );
  }

  private repCard(rep: RepresentativeResult) {
    const votes = this.filteredVotes(rep);
    return html`<article class="rep">
      <div class="rep-head">
        <div class="identity">
          <div class="avatar" aria-hidden="true">
            <span>${this.initials(rep.name)}</span>
            ${rep.photoUrl ? html`<img src=${rep.photoUrl} alt="" loading="lazy" referrerpolicy="no-referrer" @error=${(event: Event) => (event.currentTarget as HTMLImageElement).remove()}>` : nothing}
          </div>
          <div>
            <div class="rep-name">${rep.name}</div>
            <div class="meta">${rep.chamber} · District ${rep.district}</div>
            <div class="chips">
              ${rep.party ? html`<span class="party">${rep.party}</span>` : nothing}
              ${rep.isFloterial ? html`<span class="floterial">Floterial district</span>` : nothing}
            </div>
          </div>
        </div>
      </div>
      ${(rep.email || rep.phone || rep.websiteUrl) ? html`<div class="contact">
        ${rep.email ? html`<a href=${`mailto:${rep.email}`}>Email</a>` : nothing}
        ${rep.phone ? html`<a href=${`tel:${rep.phone}`}>${rep.phone}</a>` : nothing}
        ${rep.websiteUrl ? html`<a href=${rep.websiteUrl} target="_blank" rel="noopener noreferrer">Official page</a>` : nothing}
      </div>` : nothing}
      ${rep.townsRepresented ? html`<div class="towns"><strong>Communities represented:</strong> ${rep.townsRepresented}</div>` : nothing}
      ${votes.length ? votes.map((v) => this.voteRow(v)) : html`<div class="vote-row">No tracked votes match this issue.</div>`}
    </article>`;
  }

  private group(label: string, reps: RepresentativeResult[]) {
    const districts = [...new Set(reps.map((rep) => rep.district))];
    return reps.length ? html`<section>
      <h3>${label}</h3>
      <div class="district-summary">${districts.length} district${districts.length === 1 ? "" : "s"} · ${reps.length} representative${reps.length === 1 ? "" : "s"}</div>
      ${reps.map((r) => this.repCard(r))}
    </section>` : nothing;
  }

  private issueFilter() {
    if (!this.result) return nothing;
    const issues = [...new Set(this.result.tracker.bills.flatMap((bill) =>
      bill.issueArea?.split(",").map((issue) => issue.trim()).filter(Boolean) || []
    ))].sort();
    return issues.length ? html`<div class="filter">
      <label for="issue">Filter votes by issue</label>
      <select id="issue" .value=${this.selectedIssue} @change=${(event: Event) => this.selectedIssue = (event.target as HTMLSelectElement).value}>
        <option value="">All issues</option>
        ${issues.map((issue) => html`<option value=${issue}>${issue}</option>`)}
      </select>
      <span>Showing ${this.result.tracker.count} tracked bills from the partner tracker.</span>
    </div>` : nothing;
  }

  private wardPrompt() {
    if (!this.result?.location.wardRequired) return nothing;
    return html`<div class="ward-prompt" role="status">
      <div>
        <strong>What ward do you live in?</strong>
        <span>${this.result.location.placeName} uses wards, but Google did not return one for this address. Add your ward so we can include every House representative, including floterial districts.</span>
      </div>
      <div class="ward-controls">
        <label for="ward">Ward number</label>
        <input id="ward" type="number" min="1" max="99" inputmode="numeric" .value=${this.ward} @input=${(event: InputEvent) => this.ward = (event.target as HTMLInputElement).value} placeholder="Ward">
        <button type="button" ?disabled=${!this.ward.trim() || this.loading} @click=${() => this.runLookup()}>Update representatives</button>
      </div>
    </div>`;
  }

  render() {
    const total = this.result ? this.result.groups.house.length + this.result.groups.senate.length : 0;
    return html`<section class="shell">
      <header>
        <div class="eyebrow">Community-powered civic information</div>
        <h2>${this.title}</h2>
        <p>${this.subtitle}</p>
      </header>
      <form @submit=${this.submit}>
        <div class="address-fields">
          <label for="address">New Hampshire address</label>
          <input id="address" autocomplete="street-address" .value=${this.address} @input=${(e: InputEvent) => this.address = (e.target as HTMLInputElement).value} placeholder=${this.placeholder} ?disabled=${this.loading}>
        </div>
        <button type="submit" ?disabled=${this.loading}>${this.loading ? "Looking up…" : this.buttonLabel}</button>
      </form>
      <div class="body" aria-live="polite">
        ${this.error ? html`<div class="status error" role="alert">${this.error}</div>` :
          this.loading ? html`<div class="status">Looking up districts and tracked votes...</div>` :
          this.result && !total ? html`<div class="status">No representatives were found for that address.</div>` :
          this.result ? html`${this.wardPrompt()}${this.issueFilter()}${this.group("State Senate", this.result.groups.senate)}${this.group("State House", this.result.groups.house)}` :
          html`<div class="status">Ready when you are.</div>`}
      </div>
      <footer>Voting data from NH Civic Commons</footer>
    </section>`;
  }
}

declare global { interface HTMLElementTagNameMap { "nhcc-vote-tracker": NhccVoteTracker } }
