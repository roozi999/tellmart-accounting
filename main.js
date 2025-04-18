
const users = [
  { username: "roozbeh", password: "roozbeh", access: ["dataEntry", "report", "manage"] },
  { username: "ramtin", password: "ramtin", access: ["report", "form"] },
  { username: "saeed", password: "saeed", access: ["report"] },
  { username: "majid", password: "majid", access: ["report"] }
];

let currentUser = null;

window.onload = function () {
  const loginData = JSON.parse(localStorage.getItem('loginData'));
  if (loginData && loginData.user) {
    const now = new Date().getTime();
    const loginTime = loginData.loginTime;
    const timeDiff = now - loginTime;
    const hours24 = 24 * 60 * 60 * 1000;
    if (timeDiff < hours24) {
      currentUser = loginData.user;
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('mainPage').classList.remove('hidden');
      if (currentUser.access.includes('dataEntry')) {
        document.getElementById('dataEntryButton').classList.remove('hidden');
      }
      initializeForm(1);
      return;
    }
  }
  localStorage.removeItem('loginData');
};

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('loginError');
  errorDiv.classList.add('hidden');
  errorDiv.innerText = '';

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    const loginData = {
      user: user,
      loginTime: new Date().getTime()
    };
    localStorage.setItem('loginData', JSON.stringify(loginData));
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
    if (user.access.includes('dataEntry')) {
      document.getElementById('dataEntryButton').classList.remove('hidden');
    }
    initializeForm(1);
  } else {
    errorDiv.innerText = 'نام کاربری یا رمز عبور اشتباه است';
    errorDiv.classList.remove('hidden');
  }
}

// نمونه‌ای از جلوگیری از افزودن ردیف جدید در صورت ناقص بودن ردیف فعلی
function addRowIfComplete() {
  const rows = document.querySelectorAll('#formTable tbody tr');
  const lastRow = rows[rows.length - 1];
  const inputs = lastRow ? lastRow.querySelectorAll('input, select, textarea') : [];

  let allFilled = true;
  inputs.forEach(input => {
    if (input.value.trim() === '') {
      allFilled = false;
    }
  });

  if (allFilled) {
    addNewRow(); // تابعی که ردیف جدید اضافه می‌کند
  } else {
    alert('لطفاً ردیف فعلی را کامل کنید یا ذخیره/حذف نمایید.');
  }
}
