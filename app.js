// Demo Users Database
const users = [
    {
        id: 1,
        name: 'Demo User',
        email: 'demo@lawfirm.com',
        password: 'Demo@123',
        userType: 'firm',
        role: 'Law Firm'
    },
    {
        id: 2,
        name: 'Solo Attorney',
        email: 'solo@attorney.com',
        password: 'Solo@123',
        userType: 'solo',
        role: 'Solo Practitioner'
    },
    {
        id: 3,
        name: 'Corporate Counsel',
        email: 'counsel@corp.com',
        password: 'Corp@123',
        userType: 'corporate',
        role: 'In-House Counsel'
    }
];

let currentUser = null;

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        errorDiv.innerHTML = '<div class="form-message error">❌ Invalid email or password</div>';
    }
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('registerUserType').value;
    const errorDiv = document.getElementById('registerError');

    if (password.length < 6) {
        errorDiv.innerHTML = '<div class="form-message error">❌ Password must be at least 6 characters</div>';
        return;
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        errorDiv.innerHTML = '<div class="form-message error">❌ Email already registered</div>';
        return;
    }

    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        userType: userType,
        role: userType === 'firm' ? 'Law Firm' : userType === 'solo' ? 'Solo Practitioner' : 'In-House Counsel'
    };

    users.push(newUser);
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showDashboard();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// UI Functions
function toggleToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function toggleToLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function showDashboard() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    
    // Update user info
    document.getElementById('displayUserName').textContent = currentUser.name;
    document.getElementById('displayUserRole').textContent = currentUser.role;
    document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();
    
    showSection('dashboard');
}

function showSection(sectionId, linkEl) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId + '-section').classList.add('active');
    
    // Add active to clicked link if provided
    if (linkEl && linkEl.classList) {
        linkEl.classList.add('active');
    }
}

// Check for saved user
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        // Ensure default active link reflects the visible section
        const defaultLink = document.querySelector('.sidebar-link[href="#"]');
        if (defaultLink) {
            showSection('dashboard', defaultLink);
        } else {
            showSection('dashboard');
        }
    }
});
