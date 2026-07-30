import { css } from "lit";

export const widgetStyles = css`
  :host {
    display: block;
    max-width: 880px;
    margin-inline: auto;
    color: #252c34;
    font: 15px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --navy: #252c34;
    --blue: #315ec9;
    --blue-dark: #244aa8;
    --orange: #d45a20;
    --orange-dark: #b94715;
    --cream: #fffaf4;
    --line: #dce2e8;
    --muted: #65707e;
  }

  * { box-sizing: border-box; }

  .shell {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 18px 46px rgb(38 52 71 / 10%);
  }

  .shell::before,
  .shell::after {
    position: absolute;
    z-index: 0;
    width: 170px;
    height: 170px;
    border-radius: 50%;
    content: "";
    pointer-events: none;
  }

  .shell::before {
    top: -86px;
    right: -72px;
    border: 1px solid #cdd9f2;
    background: #eef3ff;
  }

  .shell::after {
    top: 148px;
    left: -125px;
    background: #f9e7dd;
  }

  header, form, .body, footer { position: relative; z-index: 1; }

  header {
    padding: 34px 34px 22px;
    text-align: center;
  }

  .eyebrow {
    margin-bottom: 10px;
    color: var(--blue);
    font-size: .75rem;
    font-weight: 850;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: var(--navy);
    font-size: clamp(1.55rem, 4vw, 2.25rem);
    font-weight: 850;
    line-height: 1.12;
    letter-spacing: -.035em;
  }

  header p {
    max-width: 620px;
    margin: 10px auto 0;
    color: #4f5966;
    font-size: 1rem;
  }

  form {
    display: flex;
    gap: 10px;
    margin: 0 34px 26px;
    padding: 22px;
    border: 1px solid #cbd4e4;
    border-radius: 14px;
    background: rgb(255 255 255 / 92%);
    box-shadow: 0 14px 34px rgb(49 94 201 / 10%);
  }

  .address-fields { min-width: 0; flex: 1; }

  label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  input {
    width: 100%;
    min-width: 0;
    padding: 13px 16px;
    border: 1px solid #b9c5d8;
    border-radius: 999px;
    background: #f9fbfe;
    color: var(--navy);
    font: inherit;
    font-weight: 600;
  }

  input::placeholder { color: #7d8795; }
  input:focus { outline: 3px solid rgb(49 94 201 / 18%); border-color: var(--blue); }

  button {
    padding: 12px 22px;
    border: 0;
    border-radius: 999px;
    background: var(--orange);
    color: #fff;
    font: 800 inherit;
    cursor: pointer;
    box-shadow: 0 5px 12px rgb(212 90 32 / 18%);
    transition: background .16s ease, transform .16s ease, box-shadow .16s ease;
  }

  button:hover {
    background: var(--orange-dark);
    box-shadow: 0 7px 16px rgb(185 71 21 / 23%);
    transform: translateY(-1px);
  }

  button:focus-visible { outline: 3px solid rgb(49 94 201 / 28%); outline-offset: 2px; }
  button:disabled { opacity: .65; cursor: wait; transform: none; }

  .body { padding: 0 34px 30px; }

  .status {
    padding: 15px 17px;
    border: 1px solid #dce4f1;
    border-radius: 10px;
    background: #f5f8fd;
    color: #536176;
    text-align: center;
  }

  .error { border-color: #efc4bd; background: #fff2ef; color: #922f21; }

  .ready {
    padding: 20px;
    background: linear-gradient(135deg, #f4f7fe 0%, #fff8f3 100%);
  }

  .ready strong {
    display: block;
    color: var(--navy);
    font-size: 1rem;
    font-weight: 850;
  }

  .ready span {
    display: block;
    max-width: 590px;
    margin: 4px auto 0;
    color: #5d6876;
    font-size: .86rem;
  }

  h3 {
    margin: 28px 0 8px;
    color: var(--navy);
    font-size: 1.1rem;
    font-weight: 850;
    letter-spacing: -.01em;
  }

  .district-summary { margin: -4px 0 12px; color: var(--muted); font-size: .82rem; }

  .rep {
    margin-bottom: 18px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 8px 24px rgb(38 52 71 / 7%);
    text-align: left;
  }

  .rep-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 20px;
    background: linear-gradient(135deg, #fff 0%, #f7f9fe 100%);
  }

  .identity { display: flex; align-items: center; gap: 16px; min-width: 0; }

  .avatar {
    position: relative;
    display: grid;
    flex: 0 0 110px;
    width: 110px;
    height: 110px;
    place-items: center;
    overflow: hidden;
    border: 3px solid #fff;
    border-radius: 14px;
    background: #e9eef8;
    color: #40516a;
    font-size: 1.15rem;
    font-weight: 850;
    box-shadow: 0 5px 17px rgb(30 48 77 / 18%);
  }

  .avatar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .rep-name { color: var(--navy); font-size: 1.25rem; font-weight: 850; letter-spacing: -.02em; }
  .meta { margin-top: 2px; color: var(--muted); font-size: .9rem; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

  .party, .floterial {
    padding: 3px 9px;
    border-radius: 999px;
    font-size: .72rem;
    font-weight: 800;
  }

  .party { background: #edf2ff; color: var(--blue-dark); }
  .floterial { background: #fff0e7; color: #a84518; }

  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 11px 20px;
    border-top: 1px solid #e7ebf0;
    font-size: .85rem;
  }

  .contact a { color: var(--blue-dark); font-weight: 750; text-decoration-thickness: 1px; text-underline-offset: 3px; }

  .communities {
    max-width: 570px;
    margin-top: 9px;
    color: #596371;
    font-size: .79rem;
    line-height: 1.4;
  }

  .communities strong { color: #444f5d; }

  .vote-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    padding: 10px 20px;
    border-top: 1px solid #e7ebf0;
    background: #fafbfc;
    color: #697380;
    font-size: .75rem;
  }

  .vote-summary strong { margin-right: 3px; color: #3f4a57; }
  .vote-summary span { padding: 2px 7px; border-radius: 999px; font-weight: 750; }
  .summary-preferred { background: #e1f3e8; color: #176438; }
  .summary-opposed { background: #fce8e3; color: #98351f; }
  .summary-neutral { background: #edf0f4; color: #596472; }

  .filter {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
    padding: 15px 17px;
    border: 1px solid #ccd8ed;
    border-radius: 12px;
    background: #f3f6fd;
  }

  .filter-control label {
    position: static;
    display: block;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    margin-bottom: 6px;
    color: #304977;
    font-size: .75rem;
    font-weight: 850;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .filter select, .filter input {
    width: 100%;
    min-height: 42px;
    padding: 9px 34px 9px 12px;
    border: 1px solid #aebed8;
    border-radius: 8px;
    background: #fff;
    color: var(--navy);
    font: inherit;
  }

  .filter input { padding-right: 12px; border-radius: 8px; font-weight: 500; }
  .tracker-count { grid-column: 1 / -1; color: var(--muted); font-size: .78rem; }

  .legend {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px 14px;
    padding-top: 2px;
    color: #596574;
    font-size: .74rem;
  }

  .legend strong { color: #304977; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; }
  .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .legend i { width: 10px; height: 10px; border-radius: 50%; }
  .legend-preferred { background: #65ae7c; }
  .legend-opposed { background: #d57864; }
  .legend-neutral { background: #9aa4b0; }

  .ward-prompt {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid #e8b18e;
    border-radius: 12px;
    background: #fff5ee;
    color: #633c27;
  }

  .ward-prompt strong, .ward-prompt span { display: block; }
  .ward-prompt span { margin-top: 3px; font-size: .85rem; }
  .ward-controls { display: flex; align-items: center; gap: 8px; }
  .ward-controls input { width: 82px; background: #fff; }
  .ward-controls button { align-self: stretch; padding: 8px 14px; }

  .vote-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(150px, auto);
    gap: 14px;
    padding: 17px 20px;
    border-top: 1px solid #e7ebf0;
    text-align: left;
  }

  .bill-details { min-width: 0; text-align: left; }
  .bill-heading { display: flex; align-items: baseline; gap: 9px; line-height: 1.35; }
  .bill-code {
    flex: none;
    padding: 2px 7px;
    border-radius: 5px;
    background: #edf2ff;
    color: var(--blue-dark);
    font-size: .78rem;
    font-weight: 850;
    letter-spacing: .02em;
  }
  .bill-title { color: var(--navy); font-size: .95rem; font-weight: 750; }
  .bill-title a { text-decoration-color: #aebee1; text-underline-offset: 3px; }
  .issues { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
  .issues span {
    padding: 2px 7px;
    border-radius: 999px;
    background: #f2f3f5;
    color: #66707c;
    font-size: .7rem;
    font-weight: 700;
  }
  .why {
    max-width: 66ch;
    margin-top: 9px;
    color: #46515e;
    font-size: .85rem;
  }

  .why summary {
    width: max-content;
    color: var(--blue-dark);
    font-weight: 800;
    cursor: pointer;
  }

  .why summary:hover { text-decoration: underline; text-underline-offset: 3px; }

  .why p {
    margin: 7px 0 0;
    padding: 10px 12px;
    border-left: 3px solid #c9d6f1;
    background: #f7f9fd;
    color: #46515e;
    font-size: .87rem;
    line-height: 1.5;
  }
  a { color: inherit; }

  .pill {
    align-self: start;
    max-width: 280px;
    padding: 6px 11px;
    border-radius: 999px;
    background: #edf0f4;
    color: #4b5664;
    font-size: .75rem;
    font-weight: 850;
    line-height: 1.3;
    text-align: center;
  }

  .vote-result {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 5px;
  }

  .vote-label {
    color: #6d7784;
    font-size: .66rem;
    font-weight: 850;
    letter-spacing: .1em;
    line-height: 1;
    text-transform: uppercase;
  }

  .support { background: #e1f3e8; color: #176438; }
  .against { background: #fce8e3; color: #98351f; }

  .view-all {
    padding: 13px 20px 16px;
    border-top: 1px solid #e7ebf0;
    text-align: center;
  }

  button.secondary {
    width: auto;
    padding: 8px 16px;
    border: 1px solid #b8c7e1;
    background: #fff;
    color: var(--blue-dark);
    box-shadow: none;
    font-size: .8rem;
  }

  button.secondary:hover { border-color: var(--blue); background: #f2f6ff; box-shadow: none; }
  .empty-votes { padding: 18px 20px; border-top: 1px solid #e7ebf0; color: var(--muted); font-size: .85rem; }

  footer {
    padding: 13px 34px;
    border-top: 1px solid #e4e8ed;
    background: #fafbfc;
    color: #76808d;
    font-size: .76rem;
    text-align: center;
  }

  @media (max-width: 600px) {
    header { padding: 28px 20px 18px; }
    form { flex-direction: column; margin: 0 18px 22px; padding: 16px; }
    button { width: 100%; }
    .body { padding: 0 18px 22px; }
    .rep-head { padding: 16px; }
    .identity { align-items: flex-start; gap: 13px; }
    .avatar { flex-basis: 88px; width: 88px; height: 88px; }
    .rep-name { font-size: 1.08rem; }
    .vote-row, .filter, .ward-prompt { grid-template-columns: 1fr; }
    .legend, .tracker-count { grid-column: auto; }
    .ward-controls { align-items: stretch; flex-direction: column; }
    .ward-controls input { width: 100%; }
    .pill { max-width: none; justify-self: start; }
    .vote-result { align-items: flex-start; }
    footer { padding-inline: 18px; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { scroll-behavior: auto !important; transition: none !important; }
  }
`;
