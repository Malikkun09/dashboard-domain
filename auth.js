// Authentication handler with encrypted credentials
// Simple XOR encryption for demonstration purposes

// Encrypted credentials (using simple XOR encryption)
const encryptedCredentials = {
    username: 'Qh^kZg',    // Encrypted "Malik"
    password: 'Fj}h|n|{~{r{t{u{v{w{x{y{z{{{||}|~', // Encrypted "Admin2009123"
    encryptionKey: 'SecureKey123'
};

// Simple XOR encryption/decryption function
function xorEncryptDecrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Decrypt credentials
function decryptCredentials() {
    const decryptedUsername = xorEncryptDecrypt(encryptedCredentials.username, encryptedCredentials.encryptionKey);
    const decryptedPassword = xorEncryptDecrypt(encryptedCredentials.password, encryptedCredentials.encryptionKey);
    
    return {
        username: decryptedUsername,
        password: decryptedPassword
    };
}

// Authenticate user
async function authenticate(username, password) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const credentials = decryptCredentials();
    
    return username === credentials.username && password === credentials.password;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Logout user
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    return localStorage.getItem('username');
}

// Session timeout check (30 minutes)
function checkSessionTimeout() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
        const currentTime = Date.now();
        const sessionDuration = currentTime - parseInt(loginTime);
        const timeoutDuration = 30 * 60 * 1000; // 30 minutes
        
        if (sessionDuration > timeoutDuration) {
            logout();
            return false;
        }
    }
    return true;
}

// Auto-logout on inactivity
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        logout();
    }, 15 * 60 * 1000); // 15 minutes of inactivity
}

// Set up activity listeners
function setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
}

// Initialize authentication
function initAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!checkSessionTimeout()) {
        return false;
    }
    
    setupActivityListeners();
    resetInactivityTimer();
    return true;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticate,
        isLoggedIn,
        logout,
        getCurrentUser,
        checkSessionTimeout,
        initAuth
    };
}