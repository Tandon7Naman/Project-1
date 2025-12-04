// Secure Frontend with JWT Token-Based Authentication
// Integrated with Flask backend API
// IMPORTANT: Replace 'http://localhost:5000' with your backend URL in production

const API_BASE_URL = 'http://localhost:5000';
let currentUser = null;
let authToken = null;
const SESSION_TIMEOUT_MINUTES = 30;
let sessionTimeoutTimer = null;

// Configuration
const config = {
  apiBaseUrl: API_BASE_URL,
  tokenKey: 'auth_token',
  userKey: 'current_user_email',
  sessionTimeout: SESSION_TIMEOUT_MINUTES * 60 * 1000 // Convert to milliseconds
};

// ============ SECURITY UTILITIES ============

/**
 * Retrieve JWT token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem(config.tokenKey);
}

/**
 * Store JWT token in localStorage
 */
function setAuthToken(token) {
  localStorage.setItem(config.tokenKey, token);
  authToken = token;
}

/**
 * Clear JWT token and user data
 */
function clearAuthData() {
  localStorage.removeItem(config.tokenKey);
  localStorage.removeItem(config.userKey);
  authToken = null;
  currentUser = null;
  clearSessionTimeout();
}

/**
 * Add Authorization header with JWT token to API requests
 */
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Set session timeout - automatically logout after inactivity
 */
function resetSessionTimeout() {
  clearSessionTimeout();
  sessionTimeoutTimer = setTimeout(() => {
    console.warn('Session expired due to inactivity');
    handleLogout();
  }, config.sessionTimeout);
}

/**
 * Clear session timeout timer
 */
function clearSessionTimeout() {
  if (sessionTimeoutTimer) {
    clearTimeout(sessionTimeoutTimer);
    sessionTimeoutTimer = null;
  }
}

// ============ AUTHENTICATION FUNCTIONS ============

/**
 * Secure Login - Calls Backend API
 * Uses POST to /api/auth/login with bcrypt verification
 */
async function handleLogin(event) {
  event.preventDefault();
  
  try {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    // Client-side validation
    if (!email || !password) {
      errorDiv.innerHTML = '<div class="form-message error">❌ Email and password required</div>';
      return;
    }
    
    if (!email.includes('@')) {
      errorDiv.innerHTML = '<div class="form-message error">❌ Invalid email format</div>';
      return;
    }
    
    // Clear previous error
    errorDiv.innerHTML = '';
    
    // Call backend API for secure authentication
    const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      errorDiv.innerHTML = `<div class="form-message error">❌ ${data.error || 'Login failed'}</div>`;
      console.error('Login error:', data);
      return;
    }
    
    // Store JWT token (NOT user password or sensitive data)
    setAuthToken(data.token);
    localStorage.setItem(config.userKey, data.user.email);
    
    // Set current user
    currentUser = data.user;
    
    // Reset session timeout
    resetSessionTimeout();
    
    console.log('Login successful:', currentUser.email);
    
    // Show dashboard
    showDashboard();
    
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('loginError').innerHTML = '<div class="form-message error">❌ Connection error. Check if backend is running.</div>';
  }
}

/**
 * Secure Register - Calls Backend API
 * Creates new account with backend password hashing
 */
async function handleRegister(event) {
  event.preventDefault();
  
  try {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('registerUserType').value;
    const errorDiv = document.getElementById('registerError');
    
    // Client-side validation
    if (!name || !email || !password || !userType) {
      errorDiv.innerHTML = '<div class="form-message error">❌ All fields required</div>';
      return;
    }
    
    if (password.length < 12) {
      errorDiv.innerHTML = '<div class="form-message error">❌ Password must be at least 12 characters</div>';
      return;
    }
    
    if (!email.includes('@')) {
      errorDiv.innerHTML = '<div class="form-message error">❌ Invalid email format</div>';
      return;
    }
    
    // Clear previous error
    errorDiv.innerHTML = '';
    
    // Call backend API to create account (password will be hashed server-side)
    const response = await fetch(`${config.apiBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, password, user_type: userType})
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      errorDiv.innerHTML = `<div class="form-message error">❌ ${data.error || 'Registration failed'}</div>`;
      console.error('Registration error:', data);
      return;
    }
    
    // Store JWT token from successful registration
    setAuthToken(data.token);
    localStorage.setItem(config.userKey, data.user.email);
    currentUser = data.user;
    
    // Reset session timeout
    resetSessionTimeout();
    
    console.log('Registration successful:', currentUser.email);
    
    // Show dashboard
    showDashboard();
    
  } catch (error) {
    console.error('Registration error:', error);
    document.getElementById('registerError').innerHTML = '<div class="form-message error">❌ Connection error</div>';
  }
}

/**
 * Secure Logout - Calls Backend API
 * Invalidates session on server
 */
async function handleLogout() {
  try {
    const token = getAuthToken();
    if (!token) {
      // Not logged in, just clear UI
      clearAuthData();
      showAuthScreen();
      return;
    }
    
    // Call backend to invalidate session
    await fetch(`${config.apiBaseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local auth data
    clearAuthData();
    showAuthScreen();
  }
}

// ============ PROTECTED RESOURCE ACCESS ============

/**
 * Fetch user profile from backend
 * Requires valid JWT token
 */
async function getUserProfile() {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/user/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Token expired, logging out');
        handleLogout();
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * Validates JWT token exists
 */
function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Check if user has specific role
 * Requires valid user data
 */
function hasRole(requiredRole) {
  if (!currentUser) return false;
  return currentUser.role === requiredRole || currentUser.role === 'Admin';
}

// ============ UI FUNCTIONS ============

function toggleToRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function toggleToLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

function showAuthScreen() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

async function showDashboard() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('dashboard').classList.add('active');
  
  // Update user info from stored data
  if (currentUser) {
    document.getElementById('displayUserName').textContent = currentUser.name;
    document.getElementById('displayUserRole').textContent = currentUser.role;
  }
  
  showSection('dashboard');
}

/**
 * Show dashboard section
 * Validates authorization before showing protected sections
 */
function showSection(sectionId, linkEl) {
  // Verify user is still authenticated
  if (!isAuthenticated()) {
    console.warn('Not authenticated, redirecting to login');
    handleLogout();
    return;
  }
  
  // Reset session timeout on activity
  resetSessionTimeout();
  
  // Check authorization for specific sections if needed
  const protectedSections = {
    'settings': ['Admin', 'Law Firm'], // Only admins and firm admins
    'team': ['Admin', 'Law Firm']      // Only admins and firm admins
  };
  
  if (protectedSections[sectionId]) {
    if (!protectedSections[sectionId].includes(currentUser.role)) {
      console.warn(`User ${currentUser.email} not authorized for section ${sectionId}`);
      alert('You do not have permission to access this section');
      return;
    }
  }
  
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active from all links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Show selected section
  const sectionElement = document.getElementById(sectionId + '-section');
  if (sectionElement) {
    sectionElement.classList.add('active');
  }
  
  // Add active to clicked link if provided
  if (linkEl && linkEl.classList) {
    linkEl.classList.add('active');
  }
  
  console.log(`Switched to section: ${sectionId}`);
}

// ============ INITIALIZATION ============

/**
 * Check for existing session on page load
 * Restore session if valid JWT token exists
 */
window.addEventListener('load', async () => {
  try {
    const token = getAuthToken();
    
    if (token) {
      // Try to restore session with stored token
      const profile = await getUserProfile();
      
      if (profile) {
        currentUser = profile;
        resetSessionTimeout();
        showDashboard();
        console.log('Session restored for:', profile.email);
      } else {
        // Token is invalid, clear it
        clearAuthData();
        showAuthScreen();
      }
    } else {
      showAuthScreen();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showAuthScreen();
  }
});

/**
 * Activity detector - reset timeout on user interaction
 */
document.addEventListener('mousemove', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('click', resetSessionTimeout);

// Prevent access when not authenticated
window.addEventListener('beforeunload', () => {
  if (!isAuthenticated()) {
    clearAuthData();
  }
});

// Log out when user leaves page (optional - remove if you want persistent sessions)
// window.addEventListener('beforeunload', handleLogout);
