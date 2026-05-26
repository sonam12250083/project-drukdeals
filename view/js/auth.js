// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== AUTH STATE =====
function getUser() {
  return {
    id: localStorage.getItem('user_id'),
    name: localStorage.getItem('user_name'),
  };
}

function isLoggedIn() {
  return !!localStorage.getItem('user_id');
}

// ===== SIGNUP =====
async function signup() {
  const btn = document.getElementById('signupBtn');
  const fullname = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!fullname || !email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast('Account created! Redirecting to login...');
      setTimeout(() => window.location.href = '/', 1500);
    } else {
      showToast(data.error || 'Signup failed. Email may already be in use.', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ===== LOGIN =====
async function login() {
  const btn = document.getElementById('loginBtn');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showToast('Please enter your email and password', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_name', data.name);
      window.location.href = '/home';
    } else {
      showToast(data.error || 'Invalid credentials', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

// ===== LOGOUT =====
async function logout() {
  try {
    await fetch('/logout', { method: 'POST' });
  } catch {}
  localStorage.clear();
  window.location.href = '/';
}

// ===== ALLOW ENTER KEY =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) login();
        if (signupBtn) signup();
      }
    });
  });
});
