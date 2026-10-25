/* Hirely Job Portal — enhanced beginner-friendly JavaScript
   The original HTML, loading screen, Sign Up/Login modal, and CSS are preserved. */

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
function timeSince(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date not available";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Posted just now";
  if (minutes < 60) return `Posted ${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `Posted ${years} year${years === 1 ? "" : "s"} ago`;
}
const jobs = [
  { id: 1, title: "Frontend Developer", company: "NovaTech", location: "Bengaluru", type: "Full-time", salary: "₹8–12 LPA", category: "Engineering", skills: ["React", "JavaScript", "CSS"], description: "Build responsive web experiences, collaborate with designers and backend engineers, and ship polished product features.", postedAt: daysAgo(1) },
  { id: 2, title: "UI/UX Designer", company: "PixelCraft", location: "Remote", type: "Full-time", salary: "₹6–10 LPA", category: "Design", skills: ["Figma", "UI Design", "UX"], description: "Create intuitive user experiences, design systems and prototypes for a fast-growing digital product.", postedAt: daysAgo(3) },
  { id: 3, title: "Java Developer", company: "CloudBridge", location: "Hyderabad", type: "Full-time", salary: "₹9–14 LPA", category: "Engineering", skills: ["Java", "Spring Boot", "SQL"], description: "Develop scalable backend services and APIs while working with a collaborative engineering team.", postedAt: daysAgo(5) },
  { id: 4, title: "Marketing Intern", company: "GrowthLab", location: "Delhi", type: "Internship", salary: "₹20k/month", category: "Marketing", skills: ["SEO", "Content", "Social Media"], description: "Support campaigns, content creation and analytics while learning from an experienced growth team.", postedAt: daysAgo(2) },
  { id: 5, title: "Product Manager", company: "FinEdge", location: "Mumbai", type: "Full-time", salary: "₹15–22 LPA", category: "Product", skills: ["Strategy", "Agile", "Analytics"], description: "Own product discovery, roadmap planning and cross-functional execution for fintech products.", postedAt: daysAgo(7) },
  { id: 6, title: "React Developer", company: "BrightApps", location: "Remote", type: "Part-time", salary: "₹5–8 LPA", category: "Engineering", skills: ["React", "TypeScript", "Git"], description: "Work on modern React interfaces and reusable components for a distributed product team.", postedAt: daysAgo(10) },
  { id: 7, title: "Data Analyst Intern", company: "DataNest", location: "Bengaluru", type: "Internship", salary: "₹18k/month", category: "Data", skills: ["SQL", "Excel", "Python"], description: "Turn business data into useful insights and help teams build clear reports and dashboards.", postedAt: daysAgo(1) },
  { id: 8, title: "Backend Developer", company: "ByteWorks", location: "Remote", type: "Full-time", salary: "₹10–16 LPA", category: "Engineering", skills: ["Java", "APIs", "Databases"], description: "Build and maintain reliable backend services, APIs and database integrations.", postedAt: daysAgo(4) },
  { id: 9, title: "Graphic Design Intern", company: "StudioMint", location: "Delhi", type: "Internship", salary: "₹15k/month", category: "Design", skills: ["Figma", "Illustrator", "Branding"], description: "Help create digital creatives and visual assets for campaigns and product launches.", postedAt: daysAgo(6) }
];

const $ = id => document.getElementById(id);
const readStore = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
};

let customJobs = readStore("hirelyCustomJobs", []);
let closedJobIds = readStore("hirelyClosedJobs", []);
let saved = readStore("hirelySaved", []);
let applicationRecords = readStore("hirelyApplicationRecords", []);
let applications = Number(localStorage.getItem("hirelyApplications") || applicationRecords.length || 0);
let authMode = "login";
let activeJobId = null;

const allJobs = () => [...customJobs, ...jobs];
const toast = message => {
  const oldToast = $("toast");
  if (oldToast) {
    oldToast.textContent = message;
    oldToast.classList.add("show");
    clearTimeout(window.hirelyToastTimer);
    window.hirelyToastTimer = setTimeout(() => oldToast.classList.remove("show"), 2400);
  }
  showHirelyToast(message);
};

function showHirelyToast(message, type = "success") {
  const container = $("toastContainer");
  if (!container) return;
  const item = document.createElement("div");
  item.className = `hirely-toast ${type}`;
  const icon = document.createElement("span");
  icon.textContent = type === "success" ? "✓" : "i";
  const text = document.createElement("span");
  text.textContent = message;
  item.append(icon, text);
  container.appendChild(item);
  setTimeout(() => {
    item.classList.add("hide");
    setTimeout(() => item.remove(), 280);
  }, 2600);
}

function navigate(page) {
  const targetPage = $(page);
  if (!targetPage) return;
  document.querySelectorAll(".page").forEach(section => section.classList.remove("active"));
  targetPage.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === page);
  });
  document.querySelector(".nav-links")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (page === "jobs") renderJobs();
  if (page === "saved") renderSaved();
  if (page === "manage") renderManageJobs();
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-page]");
  if (target) navigate(target.dataset.page);
});

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function card(job) {
  const isSaved = saved.includes(job.id);
  const isClosed = closedJobIds.includes(job.id) || job.status === "closed";
  const postedText = timeSince(job.postedAt);
  return `
    <article class="job-card ${isClosed ? "is-closed" : ""}">
      <div class="job-head">
        <div class="company-logo">${escapeHTML(job.company.charAt(0).toUpperCase())}</div>
        <button class="save ${isSaved ? "saved" : ""}" aria-label="${isSaved ? "Remove saved job" : "Save job"}" onclick="toggleSave(${job.id})">${isSaved ? "♥" : "♡"}</button>
      </div>
      <h3>${escapeHTML(job.title)}</h3>
      <div class="company">${escapeHTML(job.company)} · ${escapeHTML(job.location)}</div>
      <div class="job-posted ${postedText.includes("just now") || postedText.includes("min") || postedText.includes("1 day") ? "recent" : "old"}"><span class="posted-dot"></span>${escapeHTML(postedText)}</div>
      <div class="job-tags">${(job.skills || []).map(skill => `<span>${escapeHTML(skill)}</span>`).join("")}</div>
      <div class="job-meta"><b>${escapeHTML(job.salary || "Salary not disclosed")}</b><span>${escapeHTML(job.type)}</span></div>
      <div class="job-actions">
        <button class="view-btn" onclick="openJob(${job.id})">View Details</button>
        <button class="apply-btn" ${isClosed ? "disabled" : ""} onclick="${isClosed ? "" : `applyJob(${job.id})`}">${isClosed ? "Closed" : "Apply →"}</button>
      </div>
    </article>`;
}
function renderHome() {
  const container = $("homeJobs");
  if (container) container.innerHTML = allJobs().slice(0, 3).map(card).join("");
}

function ensureSortControl() {
  const panel = document.querySelector(".search-panel");
  if (!panel || $("sortFilter")) return;
  const wrapper = document.createElement("div");
  wrapper.className = "search-field";
  wrapper.innerHTML = '<label for="sortFilter">SORT BY</label><select id="sortFilter"><option value="recommended">Recommended</option><option value="title">Job title (A–Z)</option><option value="company">Company (A–Z)</option></select>';
  const reset = $("clearFilters");
  panel.insertBefore(wrapper, reset);
  $("sortFilter").addEventListener("change", renderJobs);
}

function renderJobs() {
  if (!$("jobsGrid")) return;
  const query = ($("jobSearch")?.value || "").trim().toLowerCase();
  const location = $("locationFilter")?.value || "";
  const type = $("typeFilter")?.value || "";
  const sort = $("sortFilter")?.value || "recommended";

  let list = allJobs().filter(job => {
    const searchable = `${job.title} ${job.company} ${job.location} ${job.type} ${job.skills.join(" ")} ${job.category} ${job.description}`.toLowerCase();
    return searchable.includes(query) && (!location || job.location === location) && (!type || job.type === type);
  });

  if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "company") list.sort((a, b) => a.company.localeCompare(b.company));

  $("resultCount").textContent = list.length;
  $("jobsGrid").innerHTML = list.length
    ? list.map(card).join("")
    : '<div class="empty"><b>No matching jobs</b>Try another keyword or reset your filters.</div>';
}

function renderSaved() {
  const list = allJobs().filter(job => saved.includes(job.id));
  $("savedGrid").innerHTML = list.length
    ? list.map(card).join("")
    : '<div class="empty"><b>♡ Nothing saved yet</b>Save jobs you like and they will appear here.</div>';
}

function toggleSave(id) {
  saved = saved.includes(id) ? saved.filter(savedId => savedId !== id) : [...saved, id];
  localStorage.setItem("hirelySaved", JSON.stringify(saved));
  renderHome();
  renderJobs();
  renderSaved();
  toast(saved.includes(id) ? "Job saved to your collection!" : "Removed from saved jobs");
}

function renderManageJobs() {
  const grid = $("manageJobsGrid");
  if (!grid) return;
  const activeCount = customJobs.filter(job => !closedJobIds.includes(job.id) && job.status !== "closed").length;
  const closedCount = customJobs.length - activeCount;
  $("manageSummary").innerHTML = `
    <div class="manage-stat"><strong>${customJobs.length}</strong><span>Total jobs posted by you</span></div>
    <div class="manage-stat"><strong>${activeCount}</strong><span>Currently active</span></div>
    <div class="manage-stat"><strong>${closedCount}</strong><span>Closed listings</span></div>`;
  if (!customJobs.length) {
    grid.innerHTML = '<div class="empty"><b>No job posts yet</b>Use “Post a Job” to publish your first listing. You can close or remove it here later.</div>';
    return;
  }
  grid.innerHTML = customJobs.map(job => {
    const isClosed = closedJobIds.includes(job.id) || job.status === "closed";
    return `<article class="job-card ${isClosed ? "is-closed" : ""}">
      <div class="job-head"><div class="company-logo">${escapeHTML(job.company.charAt(0).toUpperCase())}</div><span class="result-pill">${isClosed ? "Closed" : "Active"}</span></div>
      <h3>${escapeHTML(job.title)}</h3>
      <div class="company">${escapeHTML(job.company)} · ${escapeHTML(job.location)}</div>
      <div class="job-posted"><span class="posted-dot"></span>${escapeHTML(timeSince(job.postedAt))}</div>
      <div class="job-tags">${(job.skills || []).map(skill => `<span>${escapeHTML(skill)}</span>`).join("")}</div>
      <div class="job-meta"><b>${escapeHTML(job.salary || "Salary not disclosed")}</b><span>${escapeHTML(job.type)}</span></div>
      <div class="manage-actions">
        <button class="${isClosed ? "reopen-job-btn" : "close-job-btn"}" onclick="toggleJobStatus(${job.id})">${isClosed ? "Reopen Job" : "Close Job"}</button>
        <button class="remove-job-btn" onclick="removeJob(${job.id})">Remove Job</button>
        <button class="view-btn" onclick="openJob(${job.id})">View Details</button>
      </div>
    </article>`;
  }).join("");
}
function toggleJobStatus(id) {
  const job = customJobs.find(item => item.id === Number(id));
  if (!job) return;
  if (closedJobIds.includes(job.id) || job.status === "closed") {
    closedJobIds = closedJobIds.filter(closedId => closedId !== job.id);
    job.status = "active";
    toast("Job reopened — candidates can apply again.");
  } else {
    closedJobIds.push(job.id);
    job.status = "closed";
    toast("Job closed. New applications are disabled.");
  }
  localStorage.setItem("hirelyClosedJobs", JSON.stringify(closedJobIds));
  localStorage.setItem("hirelyCustomJobs", JSON.stringify(customJobs));
  renderManageJobs(); renderHome(); renderJobs(); renderSaved();
}
function removeJob(id) {
  const job = customJobs.find(item => item.id === Number(id));
  if (!job) return;
  if (!window.confirm(`Remove "${job.title}" from your job listings? This cannot be undone.`)) return;
  customJobs = customJobs.filter(item => item.id !== job.id);
  closedJobIds = closedJobIds.filter(closedId => closedId !== job.id);
  saved = saved.filter(savedId => savedId !== job.id);
  localStorage.setItem("hirelyCustomJobs", JSON.stringify(customJobs));
  localStorage.setItem("hirelyClosedJobs", JSON.stringify(closedJobIds));
  localStorage.setItem("hirelySaved", JSON.stringify(saved));
  renderManageJobs(); renderHome(); renderJobs(); renderSaved();
  toast("Job removed successfully.");
}
window.toggleJobStatus = toggleJobStatus;
window.removeJob = removeJob;

function findJob(id) {
  return allJobs().find(job => job.id === Number(id));
}

function openJob(id) {
  const job = findJob(id);
  if (!job) return;
  activeJobId = job.id;
  $("modalContent").innerHTML = `
    <div class="company-logo">${escapeHTML(job.company.charAt(0).toUpperCase())}</div>
    <h2 style="margin:15px 0 3px">${escapeHTML(job.title)}</h2>
    <div class="company">${escapeHTML(job.company)} · ${escapeHTML(job.location)} · ${escapeHTML(job.type)}</div>
    <div class="job-tags">${job.skills.map(skill => `<span>${escapeHTML(skill)}</span>`).join("")}</div>
    <h3>${escapeHTML(job.salary || "Salary not disclosed")}</h3>
    <p>${escapeHTML(job.description)}</p>
    <button class="btn primary" onclick="applyJob(${job.id});closeModal()">Apply for this job →</button>`;
  $("modal").classList.remove("hidden");
}

function closeModal() {
  $("modal").classList.add("hidden");
}
$("closeModal")?.addEventListener("click", closeModal);
$("modal")?.addEventListener("click", event => {
  if (event.target.id === "modal") closeModal();
});

function applyJob(id) {
  const job = findJob(id);
  if (!job) return;
  if (closedJobIds.includes(job.id) || job.status === "closed") {
    toast("This job is closed and is no longer accepting applications.");
    return;
  }
  activeJobId = job.id;
  $("applicationJob").textContent = `Applying for ${job.title} at ${job.company} · ${job.location}`;
  const user = readStore("hirelyUser", null);
  if (user) {
    if ($("appName") && user.name) $("appName").value = user.name;
    if ($("appEmail") && user.email) $("appEmail").value = user.email;
  }
  $("applicationModal").classList.remove("hidden");
}
window.applyJob = applyJob;
window.openJob = openJob;
window.closeModal = closeModal;
window.toggleSave = toggleSave;

["jobSearch", "locationFilter", "typeFilter"].forEach(id => {
  $(id)?.addEventListener("input", renderJobs);
  $(id)?.addEventListener("change", renderJobs);
});
$("clearFilters")?.addEventListener("click", () => {
  $("jobSearch").value = "";
  $("locationFilter").value = "";
  $("typeFilter").value = "";
  if ($("sortFilter")) $("sortFilter").value = "recommended";
  renderJobs();
});
document.querySelectorAll(".category").forEach(category => {
  category.addEventListener("click", () => {
    navigate("jobs");
    $("jobSearch").value = category.dataset.query || "";
    renderJobs();
  });
});

$("postForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const job = {
    id: Date.now(),
    postedAt: new Date().toISOString(),
    status: "active",
    title: $("postTitle").value.trim(),
    company: $("postCompany").value.trim(),
    location: $("postLocation").value,
    type: $("postType").value,
    salary: $("postSalary").value.trim() || "Salary not disclosed",
    category: $("postCategory").value.trim() || "General",
    skills: ($("postCategory").value.trim() || "General").split(",").map(skill => skill.trim()).filter(Boolean),
    description: $("postDescription").value.trim()
  };
  customJobs.unshift(job);
  localStorage.setItem("hirelyCustomJobs", JSON.stringify(customJobs));
  event.target.reset();
  renderJobs();
  renderHome();
  toast("Job published successfully!");
  navigate("jobs");
});

$("menuBtn")?.addEventListener("click", () => {
  document.querySelector(".nav-links")?.classList.toggle("open");
});

/* Loading animation — retained from the original project. */
let progress = 0;
const loadingTimer = setInterval(() => {
  progress = Math.min(100, progress + 4);
  if ($("progressBar")) $("progressBar").style.width = `${progress}%`;
  if ($("progressText")) $("progressText").textContent = `${progress}%`;
  if (progress === 100) {
    clearInterval(loadingTimer);
    setTimeout(() => $("loader")?.classList.add("hide"), 250);
  }
}, 35);

/* Application form: checks resume size and prevents duplicate applications. */
$("closeApplication")?.addEventListener("click", () => $("applicationModal").classList.add("hidden"));
$("applicationModal")?.addEventListener("click", event => {
  if (event.target.id === "applicationModal") $("applicationModal").classList.add("hidden");
});
$("applicationForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const resume = $("appResume").files[0];
  if (resume && resume.size > 5 * 1024 * 1024) {
    toast("Please choose a resume under 5 MB");
    return;
  }
  const job = findJob(activeJobId);
  if (!job) {
    toast("Please select a job first.");
    return;
  }
  if (applicationRecords.some(record => record.jobId === job.id && record.email === $("appEmail").value.trim())) {
    toast("You have already applied to this job with this email.");
    return;
  }
  applicationRecords.push({
    id: Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    email: $("appEmail").value.trim(),
    applicant: $("appName").value.trim(),
    appliedOn: new Date().toLocaleDateString("en-IN")
  });
  applications = applicationRecords.length;
  localStorage.setItem("hirelyApplicationRecords", JSON.stringify(applicationRecords));
  localStorage.setItem("hirelyApplications", String(applications));
  $("applicationModal").classList.add("hidden");
  event.target.reset();
  toast("Application submitted successfully! 🎉");
});

/* Existing Sign Up / Login modal is kept visually unchanged. */
const authModal = $("authModal");
function openAuth(mode) {
  authMode = mode;
  $("authTitle").textContent = mode === "login" ? "Welcome back" : "Create your Hirely account";
  $("authSubtitle").textContent = mode === "login"
    ? "Login to continue exploring opportunities."
    : "Sign up to save jobs and manage your opportunities.";
  $("authNameWrap").classList.toggle("hidden", mode === "login");
  $("loginTab").classList.toggle("active", mode === "login");
  $("signupTab").classList.toggle("active", mode === "signup");
  $("authSubmitText").textContent = mode === "login" ? "Login" : "Create Account";
  authModal.classList.remove("hidden");
}
$("loginBtn")?.addEventListener("click", () => openAuth("login"));
$("signupBtn")?.addEventListener("click", () => openAuth("signup"));
$("closeAuth")?.addEventListener("click", () => authModal.classList.add("hidden"));
$("loginTab")?.addEventListener("click", () => openAuth("login"));
$("signupTab")?.addEventListener("click", () => openAuth("signup"));
authModal?.addEventListener("click", event => {
  if (event.target === authModal) authModal.classList.add("hidden");
});

$("authForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const email = $("authEmail").value.trim().toLowerCase();
  const password = $("authPassword").value;
  const existingUser = readStore("hirelyUser", null);

  if (authMode === "signup") {
    const name = $("authName").value.trim();
    if (name.length < 2) {
      toast("Please enter your full name.");
      $("authName").focus();
      return;
    }
    if (existingUser && existingUser.email.toLowerCase() === email) {
      toast("An account with this email already exists. Please login.");
      openAuth("login");
      $("authEmail").value = email;
      return;
    }
    localStorage.setItem("hirelyUser", JSON.stringify({ name, email, password }));
    localStorage.setItem("hirelyLoggedIn", "true");
    toast("Account created successfully!");
  } else {
    if (existingUser && existingUser.email.toLowerCase() === email && existingUser.password !== password) {
      toast("Incorrect password. Please try again.");
      return;
    }
    if (existingUser && existingUser.email.toLowerCase() !== email) {
      toast("No account found for this email. Please sign up.");
      return;
    }
    // Demo mode: keeps the original project usable even before an account is created.
    localStorage.setItem("hirelyLoggedIn", "true");
    toast(`Login successful! Welcome back${existingUser?.name ? `, ${existingUser.name}` : ""}.`);
  }
  authModal.classList.add("hidden");
  updateAuthButtons();
});

function updateAuthButtons() {
  const user = readStore("hirelyUser", null);
  const loggedIn = localStorage.getItem("hirelyLoggedIn") === "true";
  const actions = document.querySelector(".auth-actions");
  if (!actions) return;
  if (loggedIn) {
    const displayName = user?.name ? user.name.split(" ")[0] : "Account";
    actions.innerHTML = `<button class="login-btn" id="profileBtn" title="Signed in">${escapeHTML(displayName)}</button><button class="signup-btn" id="logoutBtn">Log Out</button>`;
    $("profileBtn").addEventListener("click", () => toast(user?.email || "You're using demo mode."));
    $("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("hirelyLoggedIn");
      updateAuthButtons();
      toast("You have been logged out.");
    });
  } else {
    actions.innerHTML = '<button class="login-btn" id="loginBtn">Login</button><button class="signup-btn" id="signupBtn">Sign Up</button>';
    $("loginBtn").addEventListener("click", () => openAuth("login"));
    $("signupBtn").addEventListener("click", () => openAuth("signup"));
  }
}

ensureSortControl();
renderHome();
renderJobs();
renderSaved();
renderManageJobs();
updateAuthButtons();