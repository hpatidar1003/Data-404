// Matrix Rain Effect
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix characters (Katakana + Latin)
const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

// Array of drops - one per column
const drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    // White BG for the canvas
    // Translucent white to show trail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000'; // Black text
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Sending the drop back to the top randomly after it has crossed the screen
        // Adding a randomness to the reset to make the drops scattered on the Y axis
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Incrementing Y coordinate
        drops[i]++;
    }
}

setInterval(drawMatrix, 33);


// Modal Logic
const modal = document.getElementById('login-modal');
const btn = document.getElementById('download-btn');
const span = document.getElementsByClassName('close-modal')[0];
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const modalTitle = document.getElementById('modal-title');

// Initialize users from localStorage (mock database)
function getUsers() {
    const users = localStorage.getItem('data404_users');
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem('data404_users', JSON.stringify(users));
}

// Open modal
btn.onclick = function () {
    modal.classList.remove('hidden');
}

// Close modal
span.onclick = function () {
    modal.classList.add('hidden');
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.add('hidden');
    }
}

// Toggle between login and register
showRegisterLink.onclick = function () {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    modalTitle.textContent = 'CREATE NEW ACCOUNT';
}

showLoginLink.onclick = function () {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    modalTitle.textContent = 'AUTHENTICATION REQUIRED';
}

// Login Handler
loginForm.onsubmit = function (e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    const users = getUsers();

    if (users[user] && users[user].password === pass) {
        alert('ACCESS GRANTED. DOWNLOADING DATA 404...');
        modal.classList.add('hidden');

        // Actual download
        const link = document.createElement('a');
        link.href = 'dist/DATA404.exe'; // Path to the executable
        link.download = 'DATA404.exe';
        document.body.appendChild(link);
        link.click(); // Trigger download
        document.body.removeChild(link);

        // Reset form
        loginForm.reset();
    } else {
        alert('ACCESS DENIED: Invalid credentials');
    }
}

// Registration Handler
registerForm.onsubmit = function (e) {
    e.preventDefault();
    const user = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const pass = document.getElementById('register-password').value;
    const confirmPass = document.getElementById('register-confirm').value;

    const users = getUsers();

    // Username validation
    if (user.length < 3 || user.length > 20) {
        alert('ERROR: Username must be between 3 and 20 characters');
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(user)) {
        alert('ERROR: Username can only contain letters, numbers, and underscores');
        return;
    }

    if (users[user]) {
        alert('ERROR: User ID already exists');
        return;
    }

    // Email validation
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
        alert('ERROR: Please enter a valid email address');
        return;
    }

    // Password validation
    if (pass.length < 8) {
        alert('ERROR: Password must be at least 8 characters');
        return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(pass)) {
        alert('ERROR: Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
    }

    if (pass !== confirmPass) {
        alert('ERROR: Passwords do not match');
        return;
    }

    // Save new user
    users[user] = {
        email: email,
        password: pass,
        registered: new Date().toISOString()
    };

    saveUsers(users);

    alert('ACCOUNT CREATED SUCCESSFULLY. Please login.');

    // Switch to login form
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    modalTitle.textContent = 'AUTHENTICATION REQUIRED';

    // Reset form
    registerForm.reset();
}
