import { css } from "lit";

export const widgetStyles = css`
  :host { display:block; max-width:760px; color:#172033; font:15px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
  * { box-sizing:border-box; }
  .shell { overflow:hidden; border:1px solid #d8dee8; border-radius:10px; background:#fff; box-shadow:0 4px 18px rgb(25 42 70 / 7%); }
  header { padding:22px 24px 18px; border-bottom:1px solid #e4e9f0; background:#f7f9fc; }
  h2 { margin:0; color:#132b4c; font-size:1.35rem; line-height:1.25; }
  header p { margin:6px 0 0; color:#536176; }
  form { display:flex; gap:10px; padding:20px 24px; }
  .address-fields { min-width:0; flex:1; }
  label { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
  input { min-width:0; flex:1; padding:11px 13px; border:1px solid #aeb9c8; border-radius:6px; color:#172033; font:inherit; }
  input:focus { outline:3px solid #cce2f8; border-color:#1b5ea8; }
  button { padding:11px 18px; border:0; border-radius:6px; background:#1b5ea8; color:#fff; font:700 inherit; cursor:pointer; }
  button:hover { background:#154c89; } button:disabled { opacity:.65; cursor:wait; }
  .ward-prompt { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:14px; margin-bottom:18px; padding:14px; border:1px solid #e3b74f; border-radius:8px; background:#fff9e8; color:#5c4615; }
  .ward-prompt strong, .ward-prompt span { display:block; }
  .ward-prompt span { margin-top:3px; font-size:.85rem; }
  .ward-controls { display:flex; align-items:center; gap:8px; }
  .ward-controls label { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
  .ward-controls input { width:76px; background:#fff; }
  .ward-controls button { align-self:stretch; padding:8px 12px; }
  .body { padding:0 24px 24px; }
  .status { padding:14px 16px; border-radius:6px; background:#f3f6fa; color:#536176; }
  .error { background:#fff1f0; color:#9b2c25; }
  h3 { margin:24px 0 10px; color:#132b4c; font-size:1rem; text-transform:uppercase; letter-spacing:.06em; }
  .district-summary { margin:-7px 0 10px; color:#667389; font-size:.82rem; }
  .rep { margin-bottom:14px; border:1px solid #dce2ea; border-radius:8px; overflow:hidden; }
  .rep-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; background:#fbfcfe; }
  .identity { display:flex; align-items:center; gap:12px; min-width:0; }
  .avatar { position:relative; display:grid; flex:0 0 54px; width:54px; height:54px; place-items:center; overflow:hidden; border:1px solid #d8dee8; border-radius:50%; background:#eaf0f7; color:#40516a; font-size:.8rem; font-weight:800; }
  .avatar img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .rep-name { font-weight:750; } .meta { color:#667389; font-size:.87rem; }
  .chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; }
  .party { flex:none; padding:2px 8px; border-radius:999px; background:#eaf0f7; font-size:.78rem; font-weight:700; }
  .floterial { padding:2px 8px; border-radius:999px; background:#f1edff; color:#593c9d; font-size:.72rem; font-weight:750; }
  .contact { display:flex; flex-wrap:wrap; gap:12px; padding:10px 16px; border-top:1px solid #e5e9ef; font-size:.85rem; }
  .contact a { color:#1b5ea8; font-weight:650; }
  .towns { padding:10px 16px; border-top:1px solid #e5e9ef; background:#f8fafc; color:#536176; font-size:.82rem; }
  .filter { display:grid; grid-template-columns:auto minmax(160px,1fr); align-items:center; gap:7px 12px; margin-bottom:18px; padding:13px; border:1px solid #cbdcf0; border-radius:8px; background:#f1f6fc; }
  .filter label { position:static; width:auto; height:auto; overflow:visible; clip:auto; color:#274a70; font-size:.78rem; font-weight:800; letter-spacing:.05em; text-transform:uppercase; }
  .filter select { width:100%; padding:8px 32px 8px 10px; border:1px solid #9fb6d0; border-radius:6px; background:#fff; color:#172033; font:inherit; }
  .filter span { grid-column:1 / -1; color:#607087; font-size:.78rem; }
  .vote-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; padding:14px 16px; border-top:1px solid #e5e9ef; }
  .bill-code { color:#1b5ea8; font-weight:800; }
  .bill-title { font-weight:650; } .issue { margin-top:3px; color:#667389; font-size:.82rem; }
  .impact { margin:7px 0 0; color:#39475c; font-size:.9rem; }
  a { color:inherit; } .pill { align-self:start; padding:4px 9px; border-radius:999px; background:#edf1f6; color:#40516a; font-size:.78rem; font-weight:800; white-space:nowrap; }
  .support { background:#e3f4e9; color:#176334; } .against { background:#fde8e6; color:#9b2c25; }
  footer { padding:12px 24px; border-top:1px solid #e4e9f0; color:#6c7789; font-size:.78rem; }
  @media (max-width:560px) { form { flex-direction:column; } button { width:100%; } .vote-row { grid-template-columns:1fr; } .filter { grid-template-columns:1fr; } .filter span { grid-column:auto; } .ward-prompt { grid-template-columns:1fr; } .ward-controls { align-items:stretch; flex-direction:column; } .ward-controls input { width:100%; } }
  @media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto !important; } }
`;
