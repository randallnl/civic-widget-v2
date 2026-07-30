import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { lookupVotes, DEFAULT_API_BASE } from "./api";
import { widgetStyles } from "./styles";
import type { RepresentativeResult, TrackedVote, VoteTrackerLookupResponse } from "./types";

@customElement("nhcc-vote-tracker")
export class NhccVoteTracker extends LitElement {
  static styles = widgetStyles;

  @property() sheet = "";
  @property({ attribute: "sheet-gid" }) sheetGid?: string;
  @property({ type: Number, attribute: "session-year" }) sessionYear?: number;
  @property({ type: Number, attribute: "candidate-year" }) candidateYear?: number;
  @property() title = "See how your NH representatives voted";
  @property() subtitle = "Enter your address to match your representatives with this bill tracker.";
  @property({ attribute: "button-label" }) buttonLabel = "Find votes";
  @property() placeholder = "Street address, city, NH";
  @property({ attribute: "api-base" }) apiBase = DEFAULT_API_BASE;
  @state() private address = "";
  @state() private loading = false;
  @state() private error = "";
  @state() private result?: VoteTrackerLookupResponse;

  private emit(name: string, detail: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private async submit(event: SubmitEvent) {
    event.preventDefault();
    const address = this.address.trim();
    this.error = "";
    if (!address) { this.error = "Address is required."; return; }
    if (!this.sheet) { this.error = "This widget needs a sheet URL."; return; }
    this.loading = true;
    this.result = undefined;
    this.emit("nhcc-widget-submit", { address });
    try {
      this.result = await lookupVotes({
        apiBase: this.apiBase, address, sheet: this.sheet, sheetGid: this.sheetGid,
        sessionYear: this.sessionYear, candidateYear: this.candidateYear
      });
      this.emit("nhcc-widget-success", { address, result: this.result });
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Unable to load voting information.";
      this.emit("nhcc-widget-error", { address, error: this.error });
    } finally { this.loading = false; }
  }

  private voteRow(item: TrackedVote) {
    const label = item.vote?.vote_label || item.vote?.vote || "No vote found";
    const tone = /support|yea/i.test(label) ? "support" : /against|nay/i.test(label) ? "against" : "";
    return html`<div class="vote-row">
      <div>
        <div><span class="bill-code">${item.bill.billNumber}</span> · <span class="bill-title">${item.bill.url ? html`<a href=${item.bill.url} target="_blank" rel="noopener noreferrer">${item.bill.title}</a>` : item.bill.title}</span></div>
        ${item.bill.issueArea ? html`<div class="issue">${item.bill.issueArea}</div>` : nothing}
        ${item.bill.impact ? html`<p class="impact">${item.bill.impact}</p>` : nothing}
      </div>
      <span class="pill ${tone}" title=${item.vote?.question_motion || ""}>${label}</span>
    </div>`;
  }

  private repCard(rep: RepresentativeResult) {
    return html`<article class="rep">
      <div class="rep-head"><div><div class="rep-name">${rep.name}</div><div class="meta">${rep.chamber} · District ${rep.district}</div></div>${rep.party ? html`<span class="party">${rep.party}</span>` : nothing}</div>
      ${rep.trackedVotes.length ? rep.trackedVotes.map((v) => this.voteRow(v)) : html`<div class="vote-row">No tracked votes found.</div>`}
    </article>`;
  }

  private group(label: string, reps: RepresentativeResult[]) {
    return reps.length ? html`<section><h3>${label}</h3>${reps.map((r) => this.repCard(r))}</section>` : nothing;
  }

  render() {
    const total = this.result ? this.result.groups.house.length + this.result.groups.senate.length : 0;
    return html`<section class="shell">
      <header><h2>${this.title}</h2><p>${this.subtitle}</p></header>
      <form @submit=${this.submit}>
        <label for="address">New Hampshire address</label>
        <input id="address" autocomplete="street-address" .value=${this.address} @input=${(e: InputEvent) => this.address = (e.target as HTMLInputElement).value} placeholder=${this.placeholder} ?disabled=${this.loading}>
        <button type="submit" ?disabled=${this.loading}>${this.loading ? "Looking up…" : this.buttonLabel}</button>
      </form>
      <div class="body" aria-live="polite">
        ${this.error ? html`<div class="status error" role="alert">${this.error}</div>` :
          this.loading ? html`<div class="status">Looking up districts and tracked votes...</div>` :
          this.result && !total ? html`<div class="status">No representatives were found for that address.</div>` :
          this.result ? html`${this.group("State Senate", this.result.groups.senate)}${this.group("State House", this.result.groups.house)}` :
          html`<div class="status">Ready when you are.</div>`}
      </div>
      <footer>Voting data from NH Civic Commons</footer>
    </section>`;
  }
}

declare global { interface HTMLElementTagNameMap { "nhcc-vote-tracker": NhccVoteTracker } }
