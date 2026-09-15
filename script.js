const jobs=[
{id:1,title:"Frontend Developer",company:"NovaTech",location:"Bengaluru",type:"Full-time",salary:"₹8–12 LPA",category:"Engineering",skills:["React","JavaScript","CSS"],description:"Build responsive web experiences, collaborate with designers and backend engineers, and ship polished product features."},
{id:2,title:"UI/UX Designer",company:"PixelCraft",location:"Remote",type:"Full-time",salary:"₹6–10 LPA",category:"Design",skills:["Figma","UI Design","UX"],description:"Create intuitive user experiences, design systems and prototypes for a fast-growing digital product."},
{id:3,title:"Java Developer",company:"CloudBridge",location:"Hyderabad",type:"Full-time",salary:"₹9–14 LPA",category:"Engineering",skills:["Java","Spring","SQL"],description:"Develop scalable backend services and APIs while working with a collaborative engineering team."},
{id:4,title:"Marketing Intern",company:"GrowthLab",location:"Delhi",type:"Internship",salary:"₹20k/month",category:"Marketing",skills:["SEO","Content","Social"],description:"Support campaigns, content creation and analytics while learning from an experienced growth team."},
{id:5,title:"Product Manager",company:"FinEdge",location:"Mumbai",type:"Full-time",salary:"₹15–22 LPA",category:"Product",skills:["Strategy","Agile","Analytics"],description:"Own product discovery, roadmap planning and cross-functional execution for fintech products."},
{id:6,title:"React Developer",company:"BrightApps",location:"Remote",type:"Part-time",salary:"₹5–8 LPA",category:"Engineering",skills:["React","TypeScript","Git"],description:"Work on modern React interfaces and reusable components for a distributed product team."}
];

let customJobs=JSON.parse(localStorage.getItem("hirelyCustomJobs")||"[]");
let saved=JSON.parse(localStorage.getItem("hirelySaved")||"[]");
let applications=Number(localStorage.getItem("hirelyApplications")||0);
const allJobs=()=>[...customJobs,...jobs];
const $=id=>document.getElementById(id);
const toast=msg=>{$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)};

function navigate(page){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 $(page).classList.add("active");
 document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
 document.querySelector(".nav-links").classList.remove("open");
 window.scrollTo({top:0,behavior:"smooth"});
 if(page==="jobs") renderJobs();
 if(page==="saved") renderSaved();
}
document.addEventListener("click",e=>{
 const target=e.target.closest("[data-page]");
 if(target) navigate(target.dataset.page);
});

function card(j){
 const isSaved=saved.includes(j.id);
 return `<article class="job-card">
 <div class="job-head"><div class="company-logo">${j.company[0]}</div><button class="save ${isSaved?"saved":""}" onclick="toggleSave(${j.id})">${isSaved?"♥":"♡"}</button></div>
 <h3>${j.title}</h3><div class="company">${j.company} · ${j.location}</div>
 <div class="job-tags">${j.skills.map(s=>`<span>${s}</span>`).join("")}</div>
 <div class="job-meta"><b>${j.salary}</b><span>${j.type}</span></div>
 <div class="job-actions"><button class="view-btn" onclick="openJob(${j.id})">View Details</button><button class="apply-btn" onclick="applyJob(${j.id})">Apply →</button></div>
 </article>`;
}
function renderHome(){ $("homeJobs").innerHTML=jobs.slice(0,3).map(card).join(""); }
function renderJobs(){
 const q=($("jobSearch").value||"").toLowerCase(),loc=$("locationFilter").value,type=$("typeFilter").value;
 const list=allJobs().filter(j=>`${j.title} ${j.company} ${j.skills.join(" ")} ${j.category}`.toLowerCase().includes(q)&&(!loc||j.location===loc)&&(!type||j.type===type));
 $("resultCount").textContent=list.length;
 $("jobsGrid").innerHTML=list.length?list.map(card).join(""):`<div class="empty"><b>No matching jobs</b>Try changing your search or filters.</div>`;
}
function renderSaved(){
 const list=allJobs().filter(j=>saved.includes(j.id));
 $("savedGrid").innerHTML=list.length?list.map(card).join(""):`<div class="empty"><b>♡ Nothing saved yet</b>Save jobs you like and they'll appear here.</div>`;
}
function toggleSave(id){
 saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];
 localStorage.setItem("hirelySaved",JSON.stringify(saved));
 renderHome();renderJobs();renderSaved();
 toast(saved.includes(id)?"Job saved!":"Removed from saved jobs");
}
function findJob(id){return allJobs().find(j=>j.id===id)}
function openJob(id){
 const j=findJob(id);if(!j)return;
 $("modalContent").innerHTML=`<div class="company-logo">${j.company[0]}</div><h2 style="margin:15px 0 3px">${j.title}</h2><div class="company">${j.company} · ${j.location} · ${j.type}</div><div class="job-tags">${j.skills.map(s=>`<span>${s}</span>`).join("")}</div><h3>${j.salary}</h3><p>${j.description}</p><button class="btn primary" onclick="applyJob(${j.id});closeModal()">Apply for this job →</button>`;
 $("modal").classList.remove("hidden");
}
function closeModal(){$("modal").classList.add("hidden")}
$("closeModal").onclick=closeModal;
$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
function applyJob(id){
 const j=findJob(id); if(!j)return;
 $("applicationJob").textContent=`Applying for ${j.title} at ${j.company} · ${j.location}`;
 $("applicationModal").classList.remove("hidden");
}

["jobSearch","locationFilter","typeFilter"].forEach(id=>$(id).addEventListener("input",renderJobs));
$("clearFilters").onclick=()=>{$("jobSearch").value="";$("locationFilter").value="";$("typeFilter").value="";renderJobs()};
document.querySelectorAll(".category").forEach(c=>c.onclick=()=>{navigate("jobs");$("jobSearch").value=c.dataset.query;renderJobs()});
$("postForm").addEventListener("submit",e=>{
 e.preventDefault();
 const job={id:Date.now(),title:$("postTitle").value.trim(),company:$("postCompany").value.trim(),location:$("postLocation").value,type:$("postType").value,salary:$("postSalary").value||"Salary not disclosed",category:$("postCategory").value||"General",skills:[$("postCategory").value||"General"],description:$("postDescription").value.trim()};
 customJobs.unshift(job);localStorage.setItem("hirelyCustomJobs",JSON.stringify(customJobs));e.target.reset();renderJobs();renderHome();toast("Job published successfully!");navigate("jobs");
});
$("menuBtn").onclick=()=>document.querySelector(".nav-links").classList.toggle("open");

let p=0;const timer=setInterval(()=>{p=Math.min(100,p+4);$("progressBar").style.width=p+"%";$("progressText").textContent=p+"%";if(p===100){clearInterval(timer);setTimeout(()=>$("loader").classList.add("hide"),250)}},35);
renderHome();renderJobs();


/* Job application form */
$("closeApplication").onclick=()=>$("applicationModal").classList.add("hidden");
$("applicationModal").onclick=e=>{if(e.target.id==="applicationModal")$("applicationModal").classList.add("hidden")};
$("applicationForm").onsubmit=e=>{
 e.preventDefault();
 const resume=$("appResume").files[0];
 if(resume && resume.size>5*1024*1024){toast("Please choose a resume under 5 MB");return}
 applications++;
 localStorage.setItem("hirelyApplications",applications);
 $("applicationModal").classList.add("hidden");
 e.target.reset();
 toast("Application submitted successfully! 🎉");
};

/* Login / Sign Up demo modal */
let authMode="login";
const authModal=$("authModal");
function openAuth(mode){
  authMode=mode;
  $("authTitle").textContent=mode==="login"?"Welcome back":"Create your Hirely account";
  $("authSubtitle").textContent=mode==="login"?"Login to continue exploring opportunities.":"Sign up to save jobs and manage your opportunities.";
  $("authNameWrap").classList.toggle("hidden",mode==="login");
  $("loginTab").classList.toggle("active",mode==="login");
  $("signupTab").classList.toggle("active",mode==="signup");
  $("authSubmitText").textContent=mode==="login"?"Login":"Create Account";
  authModal.classList.remove("hidden");
}
$("loginBtn").onclick=()=>openAuth("login");
$("signupBtn").onclick=()=>openAuth("signup");
$("closeAuth").onclick=()=>authModal.classList.add("hidden");
$("loginTab").onclick=()=>openAuth("login");
$("signupTab").onclick=()=>openAuth("signup");
authModal.onclick=e=>{if(e.target===authModal)authModal.classList.add("hidden")};
$("authForm").onsubmit=e=>{
 e.preventDefault();
 const email=$("authEmail").value.trim();
 const name=authMode==="signup"?$("authName").value.trim():"User";
 if(authMode==="signup"){
   localStorage.setItem("hirelyUser",JSON.stringify({name,email,password:$("authPassword").value}));
   toast("Account created successfully!");
 }else{
   toast("Login successful! Welcome back.");
 }
 authModal.classList.add("hidden");
};


/* ===== Hirely Toast Notifications ===== */
function showHirelyToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `hirely-toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✓" : "i"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 280);
  }, 2600);
}
