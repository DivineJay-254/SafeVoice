
// Ensure auth
checkAuth();

document.getElementById('logoutBtn').addEventListener('click', logout);

let allReports = [];

async function fetchReports() {
  try {
    const response = await authFetch('/admin/reports');
    if (!response.ok) throw new Error('Failed to fetch');
    
    allReports = await response.json();
    renderTable(allReports);
  } catch (error) {
    document.getElementById('reportsTable').innerHTML = `<tr><td colspan="6" class="text-error">Error loading reports.</td></tr>`;
  }
}

function renderTable(reports) {
  const tbody = document.getElementById('reportsTable');
  tbody.innerHTML = '';

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No reports found.</td></tr>`;
    return;
  }

  reports.forEach(report => {
    const date = new Date(report.createdAt).toLocaleDateString();
    // Normalize status for badge class (replace spaces with _)
    const statusClass = report.status.replace(/\s+/g, '_');
    
    const row = `
      <tr>
        <td style="font-family: monospace; font-weight: bold; color: var(--primary);">${report.trackingCode}</td>
        <td>${report.type}</td>
        <td>${report.location}</td>
        <td>${date}</td>
        <td><span class="badge badge-${statusClass}">${report.status}</span></td>
        <td>
          <a href="report-details.html?id=${report.id}" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">View</a>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Search Functionality
document.getElementById('searchInput').addEventListener('keyup', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allReports.filter(r => 
    r.trackingCode.toLowerCase().includes(term) ||
    r.location.toLowerCase().includes(term) ||
    r.type.toLowerCase().includes(term)
  );
  renderTable(filtered);
});

// Initial Load
fetchReports();
