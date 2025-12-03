
checkAuth();

const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get('id');

if (!reportId) {
  window.location.href = 'dashboard.html';
}

async function loadReport() {
  try {
    const response = await authFetch(`/admin/reports/${reportId}`);
    if (!response.ok) throw new Error('Report not found');
    
    const report = await response.json();
    renderReport(report);
  } catch (error) {
    document.getElementById('loading').textContent = "Error loading report details.";
  }
}

function renderReport(report) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('detailsContent').classList.remove('hidden');

  document.getElementById('trackingCode').textContent = report.trackingCode;
  document.getElementById('dateReported').textContent = `Reported on ${new Date(report.createdAt).toLocaleString()}`;
  document.getElementById('reportType').textContent = report.type;
  document.getElementById('reportLocation').textContent = report.location;
  document.getElementById('reportDescription').textContent = report.description;

  // Status
  const badge = document.getElementById('currentStatusBadge');
  badge.textContent = report.status;
  badge.className = `badge badge-${report.status.replace(/\s+/g, '_')}`;
  
  document.getElementById('statusSelect').value = report.status;

  // Attachments
  const attContainer = document.getElementById('attachmentsContainer');
  attContainer.innerHTML = '';
  if (report.attachments && report.attachments.length > 0) {
    report.attachments.forEach(att => {
      // Note: In a real app, 'att.url' comes from backend. 
      // Since we simulate uploads in backend/server.js to /uploads/, we prefix properly.
      // If URL is already full path, use it. If filename, prefix.
      const url = att.url.startsWith('http') || att.url.startsWith('/') ? att.url : `/uploads/${att.url}`;
      
      const el = document.createElement('div');
      el.className = 'attachment-item';
      
      // Icon selection based on type
      let icon = '📄';
      if (att.type.includes('image')) icon = '📷';
      if (att.type.includes('video')) icon = '🎥';
      if (att.type.includes('audio')) icon = '🎤';

      el.innerHTML = `
        <div style="font-size: 1.5rem;">${icon}</div>
        <a href="${url}" target="_blank" title="${att.name}">${att.name}</a>
      `;
      attContainer.appendChild(el);
    });
  } else {
    attContainer.innerHTML = '<span style="color: #9ca3af; font-size: 0.875rem;">No media attached.</span>';
  }
}

// Update Status
document.getElementById('saveStatusBtn').addEventListener('click', async () => {
  const newStatus = document.getElementById('statusSelect').value;
  const btn = document.getElementById('saveStatusBtn');
  
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const response = await authFetch(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      alert('Status updated successfully');
      loadReport(); // Reload to reflect changes
    } else {
      alert('Failed to update status');
    }
  } catch (error) {
    alert('Error updating status');
  } finally {
    btn.textContent = 'Update Status';
    btn.disabled = false;
  }
});

loadReport();
