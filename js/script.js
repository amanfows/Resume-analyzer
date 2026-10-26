// ---------- theme (dark mode) ----------
const root=document.documentElement;
root.setAttribute("data-bs-theme",localStorage.getItem("theme")||"light");
const tbtn=document.getElementById("themeBtn");
if(tbtn)tbtn.onclick=()=>{const t=root.getAttribute("data-bs-theme")==="dark"?"light":"dark";
 root.setAttribute("data-bs-theme",t);localStorage.setItem("theme",t);};

// ---------- matching logic (JS copy of matcher.py) ----------
const allSkills=()=>[...new Set(Object.values(ROLES).flatMap(r=>Object.keys(r)))].sort();
function normalize(text){const s=new Set();
 text.split(",").forEach(x=>{x=x.trim().toLowerCase();if(x)s.add(SYNONYMS[x]||x);});return s;}
function level(p){return p>=80?"Job Ready":p>=50?"Intermediate":"Beginner";}
function analyze(text,role){
 const have=normalize(text),req=ROLES[role],matched=[],missing=[];
 for(const[skill,topics]of Object.entries(req))
  have.has(skill.toLowerCase())?matched.push(skill):missing.push({skill,topics});
 const pct=Math.round(matched.length/Object.keys(req).length*1000)/10;
 return{role,percentage:pct,level:level(pct),matched,missing};}
const rank=text=>Object.keys(ROLES).map(r=>analyze(text,r)).sort((a,b)=>b.percentage-a.percentage);
const get=k=>JSON.parse(localStorage.getItem(k)||"[]");

// ---------- index page ----------
const form=document.getElementById("analyzeForm");
if(form){
 const box=document.getElementById("skills");
 document.getElementById("roleSel").innerHTML+=Object.keys(ROLES).map(r=>`<option>${r}</option>`).join("");
 const chips=document.getElementById("chips");
 allSkills().forEach(s=>{const b=document.createElement("button");b.type="button";
  b.className="btn btn-outline-secondary btn-sm chip";b.textContent=s;
  b.onclick=()=>{const l=box.value.split(",").map(x=>x.trim()).filter(Boolean);
   const i=l.indexOf(s);i<0?l.push(s):l.splice(i,1);box.value=l.join(", ");
   b.classList.toggle("on",i<0);};chips.appendChild(b);});
 form.onsubmit=e=>{e.preventDefault();
  const name=document.getElementById("name").value.trim()||"Guest",skills=box.value.trim(),
   role=document.getElementById("roleSel").value,err=document.getElementById("err");
  if(!skills||!role){err.textContent="Please enter your skills and choose a role.";err.classList.remove("d-none");return;}
  const result=analyze(skills,role);
  sessionStorage.setItem("last",JSON.stringify({name,skills,result}));
  const h=get("history");h.unshift({name,role,percentage:result.percentage,date:new Date().toLocaleString()});
  localStorage.setItem("history",JSON.stringify(h));location="result.html";};
}

// ---------- result page ----------
const out=document.getElementById("result");
if(out){
 const d=JSON.parse(sessionStorage.getItem("last")||"null");
 if(!d)location="index.html";else{
  const r=d.result;
  document.getElementById("title").innerHTML=`${d.name}, you match ${r.percentage}% of ${r.role} <span class="badge bg-info">${r.level}</span>`;
  const bar=document.getElementById("bar");bar.style.width=r.percentage+"%";
  bar.className="progress-bar "+(r.percentage>=80?"bg-success":r.percentage>=50?"bg-warning":"bg-danger");
  document.getElementById("matched").innerHTML=r.matched.map(s=>`<span class="badge bg-success badge-skill">${s}</span>`).join("")||"<em>None yet</em>";
  document.getElementById("missing").innerHTML=r.missing.map(m=>`<div class="card mb-2"><div class="card-body"><h6 class="text-danger">${m.skill}</h6><ul class="mb-0">${m.topics.map(t=>`<li>${t}</li>`).join("")}</ul></div></div>`).join("")||"<em>Nothing missing. Great!</em>";
  document.getElementById("others").innerHTML=rank(d.skills).slice(0,3).map(o=>`<li>${o.role}: ${o.percentage}%</li>`).join("");
  new Chart(document.getElementById("chart"),{type:"doughnut",data:{labels:["Matched","Missing"],datasets:[{data:[r.percentage,100-r.percentage],backgroundColor:["#16a34a","#e5e7eb"]}]}});
 }}

// ---------- history page ----------
const hb=document.getElementById("histBody");
if(hb){const h=get("history");
 hb.innerHTML=h.length?h.map(x=>`<tr><td>${x.date}</td><td>${x.name}</td><td>${x.role}</td><td>${x.percentage}%</td></tr>`).join("")
 :`<tr><td colspan="4" class="text-center">No analyses yet.</td></tr>`;}
