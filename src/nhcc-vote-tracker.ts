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
  @property() partner?: string;
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
  @state() private searchQuery = "";
  @state() private expandedReps = new Set<number>();

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
        apiBase: this.apiBase, address, ward: this.ward.trim() || undefined, partner: this.partner,
        sheet: this.sheet, sheetGid: this.sheetGid,
        sessionYear: this.sessionYear, candidateYear: this.candidateYear
      });
      this.selectedIssue = "";
      this.searchQuery = "";
      this.expandedReps = new Set();
      this.emit("nhcc-widget-success", { address, result: this.result });
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Unable to load voting information.";
      this.emit("nhcc-widget-error", { address, error: this.error });
    } finally { this.loading = false; }
  }

  private voteRow(item: TrackedVote) {
    const label = item.vote?.vote_label || item.vote?.vote || "No vote found";
    const title = item.bill.title
      .replace(new RegExp(`^${item.bill.billNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*`, "i"), "")
      .trim();
    const issues = item.bill.issueArea
      ?.split(",")
      .map((issue) => issue.trim())
      .filter(Boolean) || [];
    const tone = item.vote?.alignment === "preferred"
      ? "support"
      : item.vote?.alignment === "opposed"
        ? "against"
        : "";
    return html`<div class="vote-row">
      <div class="bill-details">
        <div class="bill-heading">
          <span class="bill-code">${item.bill.billNumber}</span>
          <span class="bill-title">${item.bill.url ? html`<a href=${item.bill.url} target="_blank" rel="noopener noreferrer">${title}</a>` : title}</span>
        </div>
        ${issues.length ? html`<div class="issues">${issues.map((issue) => html`<span>${issue}</span>`)}</div>` : nothing}
        ${item.bill.summary ? html`<details class="why">
          <summary>Why this matters</summary>
          <p>${item.bill.summary}</p>
        </details>` : nothing}
      </div>
      <div class="vote-result">
        <span class="vote-label">Vote</span>
        <span class="pill ${tone}" title=${item.vote?.question_motion || ""}>${label}</span>
      </div>
    </div>`;
  }

  private initials(name: string) {
    return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }

  private filteredVotes(rep: RepresentativeResult) {
    const query = this.searchQuery.trim().toLowerCase();
    return rep.trackedVotes.filter(({ bill }) => {
      const matchesIssue = !this.selectedIssue || bill.issueArea
        ?.split(",")
        .some((issue) => issue.trim() === this.selectedIssue);
      const matchesSearch = !query || [
        bill.billNumber,
        bill.title,
        bill.summary,
        bill.issueArea,
        bill.yeaInterpretation,
        bill.nayInterpretation
      ].some((value) => value?.toLowerCase().includes(query));
      return Boolean(matchesIssue && matchesSearch);
    });
  }

  private toggleExpanded(repId: number) {
    const expanded = new Set(this.expandedReps);
    expanded.has(repId) ? expanded.delete(repId) : expanded.add(repId);
    this.expandedReps = expanded;
  }

  private repCard(rep: RepresentativeResult) {
    const votes = this.filteredVotes(rep);
    const expanded = this.expandedReps.has(rep.id);
    const visibleVotes = expanded ? votes : votes.slice(0, 3);
    const preferred = votes.filter(({ vote }) => vote?.alignment === "preferred").length;
    const opposed = votes.filter(({ vote }) => vote?.alignment === "opposed").length;
    const neutral = votes.length - preferred - opposed;
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
            ${rep.townsRepresented ? html`<div class="communities">
              <strong>Communities represented:</strong> ${rep.townsRepresented}
            </div>` : nothing}
          </div>
        </div>
      </div>
      ${(rep.email || rep.phone || rep.websiteUrl) ? html`<div class="contact">
        ${rep.email ? html`<a href=${`mailto:${rep.email}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 5.5h18v13H3zM4 7l8 6 8-6"/></svg>
          Email
        </a>` : nothing}
        ${rep.phone ? html`<a href=${`tel:${rep.phone}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.2 3.5 10 7.8 7.9 10c1.3 2.7 3.4 4.8 6.1 6.1l2.2-2.1 4.3 2.8-.8 3.1c-.2.7-.8 1.1-1.5 1.1C9.8 20.5 3.5 14.2 3 5.8c0-.7.4-1.3 1.1-1.5z"/></svg>
          ${rep.phone}
        </a>` : nothing}
        ${rep.websiteUrl ? html`<a href=${rep.websiteUrl} target="_blank" rel="noopener noreferrer">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M19 13v7H4V5h7"/></svg>
          Official page
        </a>` : nothing}
      </div>` : nothing}
      ${votes.length ? html`
        <div class="vote-summary" aria-label="Tracked vote summary">
          <strong>${votes.length} tracked vote${votes.length === 1 ? "" : "s"}</strong>
          <span class="summary-preferred">${preferred} preferred</span>
          <span class="summary-opposed">${opposed} opposed</span>
          ${neutral ? html`<span class="summary-neutral">${neutral} other</span>` : nothing}
        </div>
        ${visibleVotes.map((v) => this.voteRow(v))}
        ${votes.length > 3 ? html`<div class="view-all">
          <button class="secondary" type="button" @click=${() => this.toggleExpanded(rep.id)}>
            ${expanded ? "Show fewer votes" : `View all ${votes.length} votes`}
          </button>
        </div>` : nothing}
      ` : html`<div class="empty-votes">No tracked votes match these filters.</div>`}
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
      <div class="filter-control">
        <label for="issue">Filter by issue</label>
        <select id="issue" .value=${this.selectedIssue} @change=${(event: Event) => this.selectedIssue = (event.target as HTMLSelectElement).value}>
          <option value="">All issues</option>
          ${issues.map((issue) => html`<option value=${issue}>${issue}</option>`)}
        </select>
      </div>
      <div class="filter-control">
        <label for="vote-search">Search bills</label>
        <input id="vote-search" type="search" placeholder="Bill number or keyword" .value=${this.searchQuery}
          @input=${(event: InputEvent) => this.searchQuery = (event.target as HTMLInputElement).value}>
      </div>
      <div class="legend" aria-label="Vote color legend">
        <strong>Vote colors</strong>
        <span><i class="legend-preferred"></i>Matches preferred stance</span>
        <span><i class="legend-opposed"></i>Opposes preferred stance</span>
        <span><i class="legend-neutral"></i>Absent, present, or other</span>
      </div>
      <span class="tracker-count">${this.result.tracker.count} bills meet the tracker’s vote-sequence and preferred-stance requirements.</span>
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
          html`<div class="status ready">
            <strong>See who represents you and how they voted.</strong>
            <span>Enter a New Hampshire address to connect the bills that matter with the people casting the votes.</span>
          </div>`}
      </div>
      <footer>Voting data from NH Civic Commons</footer>
    </section>`;
  }
}

declare global { interface HTMLElementTagNameMap { "nhcc-vote-tracker": NhccVoteTracker } }
