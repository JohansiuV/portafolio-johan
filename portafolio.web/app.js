// ==============================
//  APP.JS — Portfolio Logic
// ==============================

const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY_PORTFOLIO_DATA = "portfolio_data_v1";
const STORAGE_KEY_CERTS = "portfolio_certs";
const STORAGE_KEY_PROFILE = "portfolio_profile";

// ---- NAVIGATION ----
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.toggle("active", l.dataset.section === id);
  });

  window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

// ---- THEME TOGGLE ----
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.dataset.theme === "dark";
    html.dataset.theme = isDark ? "light" : "dark";
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", html.dataset.theme);
  });

  (function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) {
      document.documentElement.dataset.theme = saved;
      themeToggle.textContent = saved === "light" ? "☀️" : "🌙";
    }
  })();
}

// ---- CLOCK ----
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "pm" : "am";
  const el = document.getElementById("navTime");
  if (el) el.textContent = `${h}:${m}:${s} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ---- ADMIN ----
function togglePassVis() {
  const input = document.getElementById("adminPass");
  input.type = input.type === "password" ? "text" : "password";
}

function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("loginError").style.display = "none";
    renderAdminCertList();
    toast("✅ Bienvenido al panel admin", "success");
  } else {
    document.getElementById("loginError").style.display = "block";
    document.getElementById("adminPass").value = "";
  }
}

document.getElementById("adminPass").addEventListener("keydown", e => {
  if (e.key === "Enter") adminLogin();
});

function adminLogout() {
  document.getElementById("adminLogin").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminPass").value = "";
}

function switchAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".admin-content").forEach(c => c.style.display = "none");

  const tabEl = document.querySelector(`.admin-tab[onclick="switchAdminTab('${tab}')"]`);
  if (tabEl) tabEl.classList.add("active");

  const content = document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (content) content.style.display = "block";
}

// ---- CERTIFICATES ----
let certImgDataUrl = null;

function previewCert(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    certImgDataUrl = e.target.result;
    const preview = document.getElementById("certPreview");
    preview.src = certImgDataUrl;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function addCertificate() {
  const title = document.getElementById("certTitle").value.trim();
  const issuer = document.getElementById("certIssuer").value.trim();
  const date = document.getElementById("certDate").value.trim();
  const category = document.getElementById("certCategory").value;

  if (!title) { toast("Por favor ingresa el título del certificado", "error"); return; }

  const certs = getCerts();
  const newCert = { id: Date.now(), title, issuer, date, category, img: certImgDataUrl };
  certs.push(newCert);
  saveCerts(certs);

  // Reset form
  document.getElementById("certTitle").value = "";
  document.getElementById("certIssuer").value = "";
  document.getElementById("certDate").value = "";
  document.getElementById("certPreview").style.display = "none";
  certImgDataUrl = null;

  renderAdminCertList();
  renderCertsGrid();
  toast("✅ Certificado agregado correctamente", "success");
}

function deleteCert(id) {
  const certs = getCerts().filter(c => c.id !== id);
  saveCerts(certs);
  renderAdminCertList();
  renderCertsGrid();
  toast("🗑️ Certificado eliminado");
}

function getPortfolioData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PORTFOLIO_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          certs: Array.isArray(parsed.certs) ? parsed.certs : [],
          profile: parsed.profile && typeof parsed.profile === "object" ? parsed.profile : {}
        };
      }
    }
  } catch (error) {
    console.warn("No se pudo leer la copia de respaldo del portafolio", error);
  }

  try {
    return {
      certs: JSON.parse(localStorage.getItem(STORAGE_KEY_CERTS)) || [],
      profile: JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE)) || {}
    };
  } catch {
    return { certs: [], profile: {} };
  }
}

function savePortfolioData(certs, profile) {
  const normalizedCerts = Array.isArray(certs) ? certs : [];
  const normalizedProfile = profile && typeof profile === "object" ? profile : {};

  try {
    localStorage.setItem(STORAGE_KEY_PORTFOLIO_DATA, JSON.stringify({
      version: 1,
      certs: normalizedCerts,
      profile: normalizedProfile
    }));
    localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(normalizedCerts));
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(normalizedProfile));
  } catch (error) {
    console.warn("No se pudo guardar la copia de respaldo del portafolio", error);
  }
}

function getCerts() {
  return getPortfolioData().certs;
}
function saveCerts(certs) {
  savePortfolioData(certs, getProfile());
}

function renderAdminCertList() {
  const list = document.getElementById("adminCertList");
  if (!list) return;
  const certs = getCerts();
  if (!certs.length) { list.innerHTML = '<p style="color:var(--text-muted)">No hay certificados aún.</p>'; return; }

  list.innerHTML = certs.map(c => `
    <div class="admin-cert-item">
      ${c.img ? `<img class="admin-cert-thumb" src="${c.img}" alt="" />` : '<div class="admin-cert-thumb" style="background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🏅</div>'}
      <div class="admin-cert-info">
        <strong>${escHtml(c.title)}</strong>
        <span>${escHtml(c.issuer || "")} ${c.date ? "· " + escHtml(c.date) : ""}</span>
      </div>
      <button class="admin-delete" onclick="deleteCert(${c.id})" title="Eliminar">🗑️</button>
    </div>
  `).join("");
}

function renderCertsGrid(filter = "all") {
  const grid = document.getElementById("certsGrid");
  if (!grid) return;
  let certs = getCerts();
  if (filter !== "all") certs = certs.filter(c => c.category === filter);

  if (!certs.length) {
    grid.innerHTML = `<div class="cert-placeholder">
      <div class="cert-placeholder-icon">🏅</div>
      <p>Aún no hay certificados. Ve al <a href="#" onclick="showSection('admin')" class="text-link">Panel Admin</a> para agregar los tuyos.</p>
    </div>`;
    return;
  }

  grid.innerHTML = certs.map(c => `
    <div class="cert-card" onclick="openLightbox('${c.img || ""}', '${escAttr(c.title)}')">
      ${c.img
      ? `<img class="cert-card-img" src="${c.img}" alt="${escAttr(c.title)}" />`
      : `<div class="cert-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;">🏅</div>`}
      <div class="cert-card-body">
        <div class="cert-card-title">${escHtml(c.title)}</div>
        ${c.issuer ? `<div class="cert-card-issuer">${escHtml(c.issuer)}</div>` : ""}
        ${c.date ? `<div class="cert-card-date">${escHtml(c.date)}</div>` : ""}
        <span class="cert-card-tag">${escHtml(c.category)}</span>
      </div>
    </div>
  `).join("");
}

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderCertsGrid(btn.dataset.filter);
  });
});

// ---- PROFILE UPDATE ----
function updateProfilePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("profilePhoto").src = e.target.result;
    const profile = getProfile();
    profile.photo = e.target.result;
    saveProfile_(profile);
    toast("✅ Foto actualizada", "success");
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const name = document.getElementById("profileName").value.trim();
  const role = document.getElementById("profileRole").value.trim();
  const bio = document.getElementById("profileBio").value.trim();
  const profile = getProfile();
  if (name) profile.name = name;
  if (role) profile.role = role;
  if (bio) profile.bio = bio;
  saveProfile_(profile);
  applyProfile(profile);
  toast("✅ Perfil guardado", "success");
}

function getProfile() {
  return getPortfolioData().profile;
}
function saveProfile_(p) { savePortfolioData(getCerts(), p); }

function applyProfile(p) {
  if (p.photo) {
    const el = document.getElementById("profilePhoto");
    if (el) el.src = p.photo;
  }
  if (p.name) {
    document.querySelectorAll(".about-name").forEach(el => el.textContent = p.name);
  }
  if (p.role) {
    document.querySelectorAll(".about-role").forEach(el => el.textContent = p.role);
  }
  if (p.bio) {
    document.querySelectorAll(".about-bio").forEach((el, i) => { if (i === 0) el.textContent = p.bio; });
  }
}

// ---- PORTFOLIO DATA BACKUP ----
function exportPortfolioData() {
  const data = getPortfolioData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "portfolio-data.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("✅ Datos exportados correctamente", "success");
}

function importPortfolioData(input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || typeof parsed !== "object") throw new Error("Formato inválido");

      const certs = Array.isArray(parsed.certs) ? parsed.certs : [];
      const profile = parsed.profile && typeof parsed.profile === "object" ? parsed.profile : {};

      savePortfolioData(certs, profile);
      renderAdminCertList();
      renderCertsGrid();
      applyProfile(getProfile());
      toast("✅ Datos importados correctamente", "success");
    } catch (error) {
      console.error(error);
      toast("❌ El archivo no es válido", "error");
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

// ---- LIGHTBOX ----
function openLightbox(src, caption) {
  if (!src) return;
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightboxCaption").textContent = caption || "";
  document.getElementById("lightbox").classList.add("open");
}
function closeLightbox() { document.getElementById("lightbox").classList.remove("open"); }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

// ---- TOAST ----
let toastTimeout;
function toast(msg, type = "") {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(toastTimeout);
  setTimeout(() => el.classList.add("show"), 10);
  toastTimeout = setTimeout(() => el.classList.remove("show"), 3000);
}

// ---- UTILS ----
function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escAttr(s) { return String(s).replace(/'/g, "&#39;").replace(/"/g, "&quot;"); }

// ---- INIT ----
(function init() {
  renderCertsGrid();
  applyProfile(getProfile());
})();