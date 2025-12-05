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
const loginToggleText = document.getElementById('login-toggle-text');



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
    modalTitle.textContent = 'Create Account';
    // Toggle the bottom text visibility
    showRegisterLink.parentElement.classList.add('hidden');
    loginToggleText.classList.remove('hidden');
}

showLoginLink.onclick = function () {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    modalTitle.textContent = 'Login to Your Account';
    // Toggle the bottom text visibility
    loginToggleText.classList.add('hidden');
    showRegisterLink.parentElement.classList.remove('hidden');
}



// Custom Notification System
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('Notification container not found!');
        alert(message); // Fallback
        return;
    }

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Login Handler
loginForm.onsubmit = async function (e) {
    e.preventDefault();
    const loginIdentifier = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loginIdentifier: loginIdentifier,
                password: pass
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification('ACCESS GRANTED. DOWNLOADING DATA 404...', 'success');
            modal.classList.add('hidden');

            // Open the secure download link provided by the server
            if (data.downloadLink) {
                window.open(data.downloadLink, '_blank');
            }

            loginForm.reset();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showNotification('Connection error. Please try again.', 'error');
    }
}

// Registration Handler
registerForm.onsubmit = async function (e) {
    e.preventDefault();
    const user = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const pass = document.getElementById('register-password').value;

    // Client-side validation
    if (user.length < 3 || user.length > 20) {
        showNotification('Username must be between 3 and 20 characters', 'error');
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(user)) {
        showNotification('Username can only contain letters, numbers, and underscores', 'error');
        return;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (pass.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(pass)) {
        showNotification('Password must contain at least one uppercase letter, one lowercase letter, and one number', 'error');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                email: email,
                password: pass
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification('ACCOUNT CREATED SUCCESSFULLY. Please login.', 'success');

            // Switch to login form
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            modalTitle.textContent = 'Login to Your Account';
            loginToggleText.classList.add('hidden');
            showRegisterLink.parentElement.classList.remove('hidden');

            registerForm.reset();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration Error:', error);
        showNotification('Connection error. Please try again.', 'error');
    }
}
