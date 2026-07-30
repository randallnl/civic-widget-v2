import { css } from "lit";

export const widgetStyles = css`
  :host { display:block; max-width:760px; color:#172033; font:15px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
  * { box-sizing:border-box; }
  .shell { overflow:hidden; border:1px solid #d8dee8; border-radius:10px; background:#fff; box-shadow:0 4px 18px rgb(25 42 70 / 7%); }
  header { padding:22px 24px 18px; border-bottom:1px solid #e4e9f0; background:#f7f9fc; }
  h2 { margin:0; color:#132b4c; font-size:1.35rem; line-height:1.25; }
  header p { margin:6px 0 0; color:#536176; }
  form { display:flex; gap:10px; padding:20px 24px; }
  label { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
  input { min-width:0; flex:1; padding:11px 13px; border:1px solid #aeb9c8; border-radius:6px; color:#172033; font:inherit; }
  input:focus { outline:3px solid #cce2f8; border-color:#1b5ea8; }
  button { padding:11px 18px; border:0; border-radius:6px; background:#1b5ea8; color:#fff; font:700 inherit; cursor:pointer; }
  button:hover { background:#154c89; } button:disabled { opacity:.65; cursor:wait; }
  .body { padding:0 24px 24px; }
  .status { padding:14px 16px; border-radius:6px; background:#f3f6fa; color:#536176; }
  .error { background:#fff1f0; color:#9b2c25; }
  h3 { margin:24px 0 10px; color:#132b4c; font-size:1rem; text-transform:uppercase; letter-spacing:.06em; }
  .rep { margin-bottom:14px; border:1px solid #dce2ea; border-radius:8px; overflow:hidden; }
  .rep-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; background:#fbfcfe; }
  .rep-name { font-weight:750; } .meta { color:#667389; font-size:.87rem; }
  .party { flex:none; padding:2px 8px; border-radius:999px; background:#eaf0f7; font-size:.78rem; font-weight:700; }
  .vote-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; padding:14px 16px; border-top:1px solid #e5e9ef; }
  .bill-code { color:#1b5ea8; font-weight:800; }
  .bill-title { font-weight:650; } .issue { margin-top:3px; color:#667389; font-size:.82rem; }
  .impact { margin:7px 0 0; color:#39475c; font-size:.9rem; }
  a { color:inherit; } .pill { align-self:start; padding:4px 9px; border-radius:999px; background:#edf1f6; color:#40516a; font-size:.78rem; font-weight:800; white-space:nowrap; }
  .support { background:#e3f4e9; color:#176334; } .against { background:#fde8e6; color:#9b2c25; }
  footer { padding:12px 24px; border-top:1px solid #e4e9f0; color:#6c7789; font-size:.78rem; }
  @media (max-width:560px) { form { flex-direction:column; } button { width:100%; } .vote-row { grid-template-columns:1fr; } }
  @media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto !important; } }
`;
