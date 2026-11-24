const STORAGE_KEY = "pdn-workspace-v1";
const initialState = { problems: [], ideas: [], decisions: [], updatedAt: null };
let state = loadState();
let currentType = null;
let editingId = null;

function loadState() {
  try { return { ...initialState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return { ...initialState }; }
}
function persist() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.getElementById("save-status").textContent = "● All changes saved";
  document.getElementById("last-updated").textContent = "Updated " + new Date(state.updatedAt).toLocaleString();
  render();
}
function id() { return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); }
function esc(value="") { return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function toast(message) {
  const el = document.getElementById("toast"); el.textContent = message; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2300);
}
function navigate(view) {
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === `view-${view}`));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  const labels = { overview:"Overview", problems:"Problem briefs", prioritisation:"Prioritisation", decisions:"Decision log" };
  document.getElementById("page-title").textContent = labels[view];
}
document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.view)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.go)));

const fields = {
  problem: [
    ["title","Problem title","text","e.g. Users abandon onboarding before completing setup",true],
    ["user","Who experiences this problem?","text","e.g. First-time workspace admins",true],
    ["problem","What is happening?","textarea","Describe the current situation without proposing a solution.",true],
    ["evidence","What evidence do you have?","textarea","Research, support tickets, analytics, observations…",false],
    ["outcome","What outcome would improve the situation?","textarea","Describe the change you want to see.",false]
  ],
  idea: [
    ["title","Idea or opportunity","text","e.g. Add a guided setup checklist",true],
    ["description","What would this change?","textarea","Briefly describe the proposed opportunity.",false],
    ["impact","Impact (1–5)","number","3",true],
    ["confidence","Confidence (1–5)","number","3",true],
    ["effort","Effort (1–5)","number","2",true]
  ],
  decision: [
    ["title","Decision","text","e.g. Prioritise guided setup over advanced customisation",true],
    ["context","Context","textarea","What situation or problem prompted this decision?",true],
    ["choice","What did you choose?","textarea","State the decision clearly.",true],
    ["rationale","Why did you choose it?","textarea","Evidence, trade-offs, assumptions and alternatives considered.",true],
    ["expected","Expected outcome","textarea","What do you expect to happen, and how will you know?",false]
  ]
};
function openDialog(type, item=null) {
  currentType = type; editingId = item?.id || null;
  const dialog = document.getElementById("item-dialog");
  const titles = {problem:"Problem brief",idea:"Prioritisation idea",decision:"Decision record"};
  document.getElementById("dialog-eyebrow").textContent = editingId ? "EDIT ENTRY" : "NEW ENTRY";
  document.getElementById("dialog-title").textContent = (editingId ? "Edit " : "Create ") + titles[type].toLowerCase();
  document.getElementById("dialog-fields").innerHTML = fields[type].map(([name,label,inputType,placeholder,required]) => {
    const value = item?.[name] ?? "";
    const control = inputType === "textarea"
      ? `<textarea id="f-${name}" name="${name}" placeholder="${esc(placeholder)}" ${required?"required":""}>${esc(value)}</textarea>`
      : `<input id="f-${name}" name="${name}" type="${inputType}" ${inputType==="number"?'min="1" max="5" step="1"':''} value="${esc(value)}" placeholder="${esc(placeholder)}" ${required?"required":""}>`;
    return `<div class="field"><label for="f-${name}">${label}${required?' <span aria-hidden="true">*</span>':''}</label>${control}</div>`;
  }).join("");
  dialog.showModal();
}
document.getElementById("add-problem").addEventListener("click", () => openDialog("problem"));
document.getElementById("add-idea").addEventListener("click", () => openDialog("idea"));
document.getElementById("add-decision").addEventListener("click", () => openDialog("decision"));
document.getElementById("item-form").addEventListener("submit", e => {
  if (e.submitter?.value === "cancel") return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  if (currentType === "idea") ["impact","confidence","effort"].forEach(k => data[k] = Math.max(1,Math.min(5,Number(data[k])||1)));
  const listKey = currentType === "problem" ? "problems" : currentType === "idea" ? "ideas" : "decisions";
  if (editingId) {
    state[listKey] = state[listKey].map(item => item.id === editingId ? { ...item, ...data, updatedAt:new Date().toISOString() } : item);
  } else state[listKey].unshift({ id:id(), ...data, createdAt:new Date().toISOString() });
  document.getElementById("item-dialog").close(); e.currentTarget.reset(); persist(); toast(editingId ? "Entry updated" : "Entry saved");
});
document.getElementById("item-dialog").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

function empty(icon,title,copy,buttonLabel,action) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><h4>${title}</h4><p>${copy}</p><button class="button button-primary" data-empty-action="${action}">${buttonLabel}</button></div>`;
}
function bindCardActions() {
  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const [type, key] = btn.dataset.edit.split(":");
    const list = type==="problem" ? state.problems : type==="idea" ? state.ideas : state.decisions;
    openDialog(type, list.find(x=>x.id===key));
  }));
  document.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => {
    const [type,key] = btn.dataset.delete.split(":");
    const listKey = type==="problem" ? "problems" : type==="idea" ? "ideas" : "decisions";
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    state[listKey] = state[listKey].filter(x=>x.id!==key); persist(); toast("Entry deleted");
  }));
  document.querySelectorAll("[data-empty-action]").forEach(btn => btn.addEventListener("click", () => openDialog(btn.dataset.emptyAction)));
}
function render() {
  document.getElementById("stat-problems").textContent = state.problems.length;
  document.getElementById("stat-ideas").textContent = state.ideas.length;
  document.getElementById("stat-decisions").textContent = state.decisions.length;
  document.getElementById("problem-list").innerHTML = state.problems.length ? state.problems.map(x => `
    <article class="entry-card"><div class="entry-top"><div><h4>${esc(x.title)}</h4><p><strong>User:</strong> ${esc(x.user)}</p><p>${esc(x.problem)}</p></div><div class="card-actions"><button class="small-action" data-edit="problem:${x.id}">Edit</button><button class="small-action" data-delete="problem:${x.id}">Delete</button></div></div><div class="entry-meta"><span class="pill">Problem brief</span>${x.evidence?'<span class="pill">Evidence captured</span>':''}</div></article>`).join("") : empty("◎","Start with the problem","Capture the user, situation, evidence and desired outcome before exploring solutions.","Create first brief","problem");
  const sorted = [...state.ideas].sort((a,b)=>(b.impact*b.confidence/b.effort)-(a.impact*a.confidence/a.effort));
  document.getElementById("idea-list").innerHTML = sorted.length ? sorted.map(x => {
    const score = (x.impact*x.confidence/x.effort).toFixed(1);
    return `<article class="idea-card"><div><h4>${esc(x.title)}</h4><p>${esc(x.description)}</p><div class="idea-details"><span>Impact ${x.impact}/5</span><span>Confidence ${x.confidence}/5</span><span>Effort ${x.effort}/5</span></div></div><div class="score"><strong>${score}</strong><small>relative score</small><div class="card-actions" style="justify-content:center;margin-top:8px"><button class="small-action" data-edit="idea:${x.id}">Edit</button><button class="small-action" data-delete="idea:${x.id}">×</button></div></div></article>`;
  }).join("") : empty("↗","Compare your opportunities","Add ideas and score them consistently to make trade-offs easier to discuss.","Add an idea","idea");
  document.getElementById("decision-list").innerHTML = state.decisions.length ? state.decisions.map(x => `
    <article class="entry-card"><div class="entry-top"><div><h4>${esc(x.title)}</h4><p><strong>Decision:</strong> ${esc(x.choice)}</p><p><strong>Rationale:</strong> ${esc(x.rationale)}</p></div><div class="card-actions"><button class="small-action" data-edit="decision:${x.id}">Edit</button><button class="small-action" data-delete="decision:${x.id}">Delete</button></div></div><div class="entry-meta"><span class="pill">Decision record</span>${x.expected?'<span class="pill">Outcome defined</span>':''}</div></article>`).join("") : empty("▤","Make your reasoning visible","Record what you chose, why you chose it and what outcome you expect.","Record a decision","decision");
  bindCardActions();
}
document.getElementById("export-button").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download="product-decision-notebook-export.json"; a.click(); URL.revokeObjectURL(url);
  toast("Workspace export downloaded");
});
render();
