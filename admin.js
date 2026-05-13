const supabaseUrl = "https://jaizsjcrwpeuxrlhtkfr.supabase.co";

const supabaseKey = "sb_publishable_wbusVwM2HQx8pIi5k2y-Ug_0vDVMY2a";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const loginView = document.querySelector("#loginView");
const dashboardView = document.querySelector("#dashboardView");

const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");

const logoutBtn = document.querySelector("#logoutBtn");
const downloadCsvBtn = document.querySelector("#downloadCsvBtn");

const applicationCount = document.querySelector("#applicationCount");
const applicationsTable = document.querySelector("#applicationsTable");
const detailCard = document.querySelector("#detailCard");

const searchInput = document.querySelector("#searchInput");
const teamFilter = document.querySelector("#teamFilter");

let applications = [];
let filteredApplications = [];
let selectedApplicationId = null;

const teamLabels = {
  boernehold: "Børnehold",
  drengehold: "Drengehold",
  ungdomshold: "Ungdomshold",
  dansehold: "Dansehold",
  voksenhold: "Voksenhold",
};

document.addEventListener("DOMContentLoaded", checkSession);

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  loginError.textContent = "";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginPassword.value,
  });

  if (error) {
    loginError.textContent = "Forkert email eller adgangskode.";
    return;
  }

  await showDashboard();
});

logoutBtn.addEventListener("click", async function () {
  await supabaseClient.auth.signOut();

  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");

  applications = [];
  filteredApplications = [];
  selectedApplicationId = null;
});

searchInput.addEventListener("input", applyFilters);
teamFilter.addEventListener("change", applyFilters);

downloadCsvBtn.addEventListener("click", downloadCsv);

async function checkSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session) {
    await showDashboard();
  } else {
    loginView.classList.remove("hidden");
    dashboardView.classList.add("hidden");
  }
}

async function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");

  await fetchApplications();
}

async function fetchApplications() {
  const { data, error } = await supabaseClient.from("applications").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("Kunne ikke hente ansøgninger:", error);
    alert("Kunne ikke hente ansøgninger.");
    return;
  }

  applications = data || [];
  filteredApplications = [...applications];

  applicationCount.textContent = applications.length;

  renderTable();
  renderDetail(filteredApplications[0] || null);
}

function applyFilters() {
  const searchValue = searchInput.value.toLowerCase().trim();
  const selectedTeam = teamFilter.value;

  filteredApplications = applications.filter((application) => {
    const teams = application.teams || [];

    const matchesSearch = application.name?.toLowerCase().includes(searchValue) || application.email?.toLowerCase().includes(searchValue) || application.phone?.toLowerCase().includes(searchValue);

    const matchesTeam = selectedTeam === "alle" || teams.includes(selectedTeam);

    return matchesSearch && matchesTeam;
  });

  renderTable();
  renderDetail(filteredApplications[0] || null);
}

function renderTable() {
  applicationsTable.innerHTML = "";

  filteredApplications.forEach((application) => {
    const tr = document.createElement("tr");

    if (application.id === selectedApplicationId) {
      tr.classList.add("active");
    }

    const teams = formatTeams(application.teams);

    tr.innerHTML = `
  <td>${escapeHtml(application.name || "-")}</td>

  <td>${escapeHtml(String(application.age || "-"))}</td>

  <td>${escapeHtml(application.email || "-")}</td>

  <td>${escapeHtml(application.phone || "-")}</td>

  <td>${escapeHtml(teams || "-")}</td>
`;

    tr.addEventListener("click", () => {
      renderDetail(application);
    });

    applicationsTable.appendChild(tr);
  });
}

function renderDetail(application) {
  if (!application) {
    selectedApplicationId = null;

    detailCard.innerHTML = `
      <p>Ingen ansøgninger fundet.</p>
    `;

    return;
  }

  selectedApplicationId = application.id;

  const teams = application.teams || [];

  detailCard.innerHTML = `
    <h2>${escapeHtml(application.name || "-")}</h2>

    <hr>

    <h3>Personlige oplysninger</h3>

    <div class="detail-row">
      <span>Mail</span>
      <span>${escapeHtml(application.email || "-")}</span>
    </div>

    <div class="detail-row">
      <span>Telefon</span>
      <span>${escapeHtml(application.phone || "-")}</span>
    </div>

    <div class="detail-row">
      <span>Alder</span>
      <span>${escapeHtml(String(application.age || "-"))}</span>
    </div>

    <div class="detail-row">
      <span>Dato</span>
      <span>${formatDate(application.created_at)}</span>
    </div>

    <hr>

    <h3>Holdinteresse</h3>

    <div class="badge-list">
      ${teams.length ? teams.map((team) => `<span class="badge">${escapeHtml(teamLabels[team] || team)}</span>`).join("") : `<span class="badge">Ingen valgt</span>`}
    </div>

    <hr>

    <h3>Erfaring</h3>
    <p class="detail-text">${escapeHtml(application.experience || "-")}</p>

    <hr>

    <h3>Ideer</h3>
    <p class="detail-text">${escapeHtml(application.ideas || "-")}</p>
  `;

  renderTable();
}

function downloadCsv() {
  const rows = filteredApplications.map((application) => ({
    navn: application.name || "",
    alder: application.age || "",
    email: application.email || "",
    telefon: application.phone || "",
    hold: formatTeams(application.teams),
    erfaring: application.experience || "",
    ideer: application.ideas || "",
    dato: formatDate(application.created_at),
  }));

  const csv = convertToCsv(rows);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "valby-if-ansoegninger.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function convertToCsv(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);

  const csvRows = [
    headers.join(";"),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? "");
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(";"),
    ),
  ];

  return csvRows.join("\n");
}

function formatTeams(teams) {
  if (!teams || !teams.length) return "";

  return teams.map((team) => teamLabels[team] || team).join(", ");
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
