// Authentication Manager for Gym Tracker
// Simple client-side authentication for personal use

class AuthManager {
    constructor() {
        this.PASSWORD_HASH_KEY = 'gymTrackerPasswordHash';
        this.SESSION_KEY = 'gymTrackerAuth';
        this.SESSION_EXPIRY_DAYS = 7;
    }

    // Hash password using SHA-256
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Check if password has been set up
    isPasswordSet() {
        return localStorage.getItem(this.PASSWORD_HASH_KEY) !== null;
    }

    // Set up initial password
    async setupPassword(password) {
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        const hash = await this.hashPassword(password);
        localStorage.setItem(this.PASSWORD_HASH_KEY, hash);
        return true;
    }

    // Verify password
    async verifyPassword(password) {
        const storedHash = localStorage.getItem(this.PASSWORD_HASH_KEY);
        if (!storedHash) {
            return false;
        }

        const inputHash = await this.hashPassword(password);
        return inputHash === storedHash;
    }

    // Create session
    createSession() {
        const sessionData = {
            token: this.generateToken(),
            expiry: Date.now() + (this.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }

    // Generate random token
    generateToken() {
        return crypto.randomUUID();
    }

    // Check if user is authenticated
    isAuthenticated() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) {
            return false;
        }

        try {
            const session = JSON.parse(sessionData);
            // Check if session has expired
            if (Date.now() > session.expiry) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    // Login
    async login(password) {
        const isValid = await this.verifyPassword(password);
        if (isValid) {
            this.createSession();
            return true;
        }
        return false;
    }

    // Logout
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }

    // Reset (for testing or if user forgets password)
    reset() {
        localStorage.removeItem(this.PASSWORD_HASH_KEY);
        localStorage.removeItem(this.SESSION_KEY);
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// UI Functions
function showLoginScreen() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

function showSetupScreen() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('setup-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('setup-form').style.display = 'none';
}

// Setup password
async function handleSetup(event) {
    event.preventDefault();

    const password = document.getElementById('setup-password').value;
    const confirmPassword = document.getElementById('setup-confirm-password').value;
    const errorElement = document.getElementById('setup-error');

    // Clear previous error
    errorElement.textContent = '';

    // Validate passwords match
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }

    // Validate password length
    if (password.length < 8) {
        errorElement.textContent = 'Password must be at least 8 characters';
        return;
    }

    try {
        await authManager.setupPassword(password);
        authManager.createSession();
        showApp();
        // Initialize the gym tracker app
        window.app = new GymTracker();
    } catch (error) {
        errorElement.textContent = error.message;
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();

    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    // Clear previous error
    errorElement.textContent = '';

    const success = await authManager.login(password);

    if (success) {
        showApp();
        // Initialize the gym tracker app
        window.app = new GymTracker();
    } else {
        errorElement.textContent = 'Incorrect password';
        document.getElementById('login-password').value = '';
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        authManager.logout();
        showLoginScreen();
        // Reload page to reset app state
        window.location.reload();
    }
}

// Initialize auth on page load
function initAuth() {
    // Check if already authenticated
    if (authManager.isAuthenticated()) {
        showApp();
        return true; // Allow app initialization
    }

    // Check if password needs to be set up
    if (!authManager.isPasswordSet()) {
        showSetupScreen();
    } else {
        showLoginForm();
    }

    showLoginScreen();
    return false; // Block app initialization
}
