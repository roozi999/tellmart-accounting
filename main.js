
// مثال: تعریف کاربران و تابع login
const users = [
  { username: "roozbeh", password: "roozbeh", access: ["dataEntry", "report", "manage"] },
  { username: "ramtin", password: "ramtin", access: ["report", "form"] },
  { username: "saeed", password: "saeed", access: ["report"] },
  { username: "majid", password: "majid", access: ["report"] }
];

let currentUser = null;

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

function initializeForm(step) {
  console.log("Initializing step: " + step);
  // تابع نمونه، باید با فرم واقعی شما جایگزین شود
}
