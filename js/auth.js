/* ============================================================
   🔐 سیستم احراز هویت — آپارتمان پلاس
   ============================================================ */

const AUTH_KEY = 'ham_sakhteman_auth';
const USER_PHONE_KEY = 'ham_sakhteman_user_phone';
const USER_PASSWORD_KEY = 'ham_sakhteman_user_password';

/* ✅ ذخیره اطلاعات کاربر */
function saveUserAuth(phone, password) {
  const hash = simpleHashAuth(password);
  localStorage.setItem(USER_PHONE_KEY, phone);
  localStorage.setItem(USER_PASSWORD_KEY, hash);
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    phone: phone,
    createdAt: new Date().toISOString(),
  }));
}

/* ✅ چک کردن اطلاعات ورود */
function checkUserAuth(phone, password) {
  const savedPhone = localStorage.getItem(USER_PHONE_KEY);
  const savedHash = localStorage.getItem(USER_PASSWORD_KEY);
  
  if (!savedPhone || !savedHash) {
    return { ok: false, error: 'حساب کاربری وجود ندارد. لطفاً ثبت‌نام کنید.' };
  }
  
  // نرمال‌سازی شماره
  const cleanPhone = normalizePhone(phone);
  const cleanSavedPhone = normalizePhone(savedPhone);
  
  if (cleanPhone !== cleanSavedPhone) {
    return { ok: false, error: 'شماره موبایل یافت نشد.' };
  }
  
  const inputHash = simpleHashAuth(password);
  if (inputHash !== savedHash) {
    return { ok: false, error: 'رمز عبور اشتباه است.' };
  }
  
  return { ok: true };
}

/* ✅ خروج از پنل */
function logoutUser() {
  localStorage.setItem('ham_sakhteman_logged_out', 'true');
  window.location.href = 'login.html';
}

/* ✅ بررسی لاگین بودن */
function isLoggedIn() {
  const phone = localStorage.getItem(USER_PHONE_KEY);
  const password = localStorage.getItem(USER_PASSWORD_KEY);
  const loggedOut = localStorage.getItem('ham_sakhteman_logged_out');
  
  if (loggedOut === 'true') {
    // کاربر خارج شده، ولی رمز و پروفایلش هست
    return false;
  }
  
  return !!(phone && password);
}

/* ✅ نرمال‌سازی شماره موبایل (تبدیل اعداد فارسی) */
function normalizePhone(phone) {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  let cleaned = String(phone);
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replace(new RegExp(persianDigits[i], 'g'), i);
    cleaned = cleaned.replace(new RegExp(arabicDigits[i], 'g'), i);
  }
  return cleaned.replace(/[^\d]/g, '');
}

/* ✅ هش ساده */
function simpleHashAuth(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

/* ✅ نمایش Toast */
function showToastAuth(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const titles = {
    success: 'موفق',
    error: 'خطا',
    warning: 'هشدار',
    info: 'اطلاع'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || '✅'}</div>
    <div class="toast-body">
      <div class="toast-title">${titles[type] || 'پیام'}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.closest('.toast').remove()">✖</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ============================================================
   🎯 راه‌اندازی صفحه ورود
   ============================================================ */
function initLoginPage() {
  // اگه کاربر قبلاً لاگین کرده، بره به پنل
  if (isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // تب‌ها
  document.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.loginTab;
      document.querySelectorAll('.login-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.loginTab === target);
      });
      document.querySelectorAll('.login-tab-content').forEach(c => {
        c.classList.toggle('active', c.dataset.loginTabContent === target);
      });
    });
  });

  // لینک‌های جابجایی
  document.querySelectorAll('[data-switch-to-signup]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelector('.login-tab[data-login-tab="signup"]').click();
    });
  });

  document.querySelectorAll('[data-switch-to-login]').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelector('.login-tab[data-login-tab="login"]').click();
    });
  });

  // نمایش/مخفی رمز
  document.querySelectorAll('[data-toggle-pass]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePass);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // دکمه ورود
  document.getElementById('btnLoginSubmit')?.addEventListener('click', handleLoginSubmit);

  // دکمه شروع ثبت‌نام
  document.getElementById('btnStartSignup')?.addEventListener('click', () => {
    // برو به index.html برای شروع wizard
    localStorage.removeItem('ham_sakhteman_logged_out');
    window.location.href = 'index.html?signup=1';
  });

  // Enter برای ورود
  document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLoginSubmit();
  });
  document.getElementById('loginPhone')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('loginPassword').focus();
  });
}

/* ✅ مدیریت ورود */
function handleLoginSubmit() {
  const phoneInput = document.getElementById('loginPhone');
  const passwordInput = document.getElementById('loginPassword');
  const phoneError = document.getElementById('loginPhoneError');
  const passwordError = document.getElementById('loginPasswordError');

  const phone = phoneInput.value.trim();
  const password = passwordInput.value;

  // پاک کردن خطاها
  phoneInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');
  phoneError.classList.remove('show');
  passwordError.classList.remove('show');

  // اعتبارسنجی
  if (!phone) {
    phoneInput.classList.add('input-error');
    phoneError.textContent = 'لطفاً شماره موبایل را وارد کنید.';
    phoneError.classList.add('show');
    return;
  }

  if (!password) {
    passwordInput.classList.add('input-error');
    passwordError.textContent = 'لطفاً رمز عبور را وارد کنید.';
    passwordError.classList.add('show');
    return;
  }

  // چک کردن
  const result = checkUserAuth(phone, password);

  if (!result.ok) {
    if (result.error.includes('رمز')) {
      passwordInput.classList.add('input-error');
      passwordError.textContent = result.error;
      passwordError.classList.add('show');
    } else {
      phoneInput.classList.add('input-error');
      phoneError.textContent = result.error;
      phoneError.classList.add('show');
    }
    return;
  }

  // ورود موفق
  localStorage.removeItem('ham_sakhteman_logged_out');
  showToastAuth('خوش آمدید! در حال ورود...', 'success');
  
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
}

// راه‌اندازی
document.addEventListener('DOMContentLoaded', initLoginPage);