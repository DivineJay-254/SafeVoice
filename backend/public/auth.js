
const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
  }
  return token;
}

// Redirect if already logged in (for login page)
function checkAlreadyLoggedIn() {
  const token = localStorage.getItem('adminToken');
  if (token) {
    window.location.href = 'dashboard.html';
  }
}

// Login Function
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Invalid credentials');
    
    const data = await response.json();
    localStorage.setItem('adminToken', data.token);
    window.location.href = 'dashboard.html';
  } catch (err) {
    throw err;
  }
}

// Logout Function
function logout() {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}

// Global fetch wrapper with Auth
async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    logout();
  }

  return response;
}
