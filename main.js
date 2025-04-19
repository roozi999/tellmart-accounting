const users = [
  { username: "roozbeh", password: "roozbeh", access: ["form", "dataEntry", "reports"] },
  { username: "majid", password: "majid", access: ["form", "reports"] },
  { username: "saeed", password: "saeed", access: ["form", "reports"] },
  { username: "ramtin", password: "ramtin", access: ["form", "reports"] }
];
let stages = JSON.parse(localStorage.getItem("stages")) || [
  {id: 1, title: "نوع تراکنش", type: "select", options: [
    {value: "واریز", label: "واریز شده به حساب"},
    {value: "برداشت", label: "برداشت شده از حساب"},
    {value: "تهاتری", label: "تراکنش تهاتری"}
  ]},
  {id: 2, title: "دسته‌بندی", type: "select", options: {
    "واریز": [{value: "درآمد", label: "درآمد"}, {value: "افزایش سرمایه", label: "افزایش سرمایه"}],
    "برداشت": [{value: "هزینه", label: "هزینه"}, {value: "کاهش سرمایه", label: "کاهش سرمایه"}],
    "تهاتری": [{value: "درآمد و هزینه", label: "درآمد و هزینه"}]
  }},
  {id: 3, title: "مبلغ (ریال)", type: "text"},
  {id: 4, title: "بابت", type: "select", options: {
    "واریز": {
      "درآمد": [{value: "فروش سایت", label: "فروش سایت"}, {value: "فروش به خطیب", label: "فروش به خطیب"}],
      "افزایش سرمایه": [{value: "سرمایه‌گذاری", label: "سرمایه‌گذاری"}]
    },
    "برداشت": {
      "هزینه": [{value: "اجاره", label: "اجاره"}, {value: "خرید کالا", label: "خرید کالا"}],
      "کاهش سرمایه": [{value: "بازگشت سرمایه", label: "بازگشت سرمایه"}]
    },
    "تهاتری": {"درآمد و هزینه": [{income: "فروش به خطیب", cost: "تسویه با حامد"}]}
  }},
  {id: 5, title: "حساب‌ها", type: "double-select", sourceAccounts: [
    {value: "پاسارگاد شرکت", label: "پاسارگاد شرکت"}, {value: "نسرین", label: "نسرین"}
  ], destAccounts: [
    {value: "صادرات یامی", label: "صادرات یامی"}, {value: "تجارت خطیب", label: "تجارت خطیب"}
  ]},
  {id: 6, title: "شماره فاکتور/رسید", type: "text-checkbox", options: [
    {value: "no-invoice", label: "فاقد شماره فاکتور/رسید"}
  ]},
  {id: 7, title: "آپلود مدارک", type: "file-checkbox", options: [
    {value: "no-document", label: "فاقد مدارک"}
  ]},
  {id: 8, title: "توضیحات", type: "textarea"},
  {id: 9, title: "پایان", type: "button"}
];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let logs = JSON.parse(localStorage.getItem("logs")) || [];
let isFormActive = false;
let currentUser = null;

window.onload = function() {
  const loginData = JSON.parse(localStorage.getItem("loginData"));
  if (loginData && loginData.user) {
    const now = new Date().getTime();
    const timeDiff = now - loginData.loginTime;
    const hours24 = 24 * 60 * 60 * 1000;
    if (timeDiff < hours24) {
      currentUser = loginData.user;
      showMainUI();
    } else {
      localStorage.removeItem("loginData");
    }
  }
};

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  errorDiv.classList.add("hidden");

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem("loginData", JSON.stringify({
      user: user,
      loginTime: new Date().getTime()
    }));
    showMainUI();
  } else {
    errorDiv.innerText = "نام کاربری یا رمز عبور اشتباه است";
    errorDiv.classList.remove("hidden");
  }
}

function showMainUI() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainPage").classList.remove("hidden");

  const manageDataButton = document.getElementById("manageDataButton");
  if (currentUser.access.includes("dataEntry")) {
    manageDataButton.classList.remove("hidden");
  } else {
    manageDataButton.classList.add("hidden");
  }
}

function logout() {
  localStorage.removeItem("loginData");
  currentUser = null;
  document.getElementById("mainPage").classList.add("hidden");
  document.getElementById("dataEntryPage").classList.add("hidden");
  document.getElementById("reportPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function initializeStageSelector() {
  const stageSelector = document.getElementById("stageSelector");
  stageSelector.innerHTML = '<option value="">مرحله را انتخاب کنید</option>';
  stages.forEach(stage => {
    stageSelector.innerHTML += `<option value="${stage.id}">مرحله ${stage.id}: ${stage.title}</option>`;
  });
}

function showStageManagement() {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const stageId = parseInt(document.getElementById("stageSelector").value);
  const contentDiv = document.getElementById("stageManagementContent");
  contentDiv.innerHTML = "";
  contentDiv.classList.remove("hidden");
  if (!stageId) {
    contentDiv.classList.add("hidden");
    return;
  }
  const stage = stages.find(s => s.id === stageId);
  if (!stage) return;
  let html = `<div class="mb-4"><label class="block mb-2">عنوان مرحله:</label><input type="text" id="stageTitle${stage.id}" class="border p-2 w-full mb-2" value="${stage.title}"><button onclick="updateStageTitle(${stage.id})" class="bg-green-500 text-white p-2">به‌روزرسانی عنوان</button></div>`;
  if (["select", "text-checkbox", "file-checkbox"].includes(stage.type) || stage.type === "double-select") {
    if (stage.type === "select" && stage.id === 1) {
      html += `<div class="mb-4"><h3 class="font-bold mb-2">مدیریت گزینه‌ها</h3><ul id="stageOptions${stage.id}" class="list-disc pl-5 mb-2"></ul><input type="text" id="optionValue${stage.id}" class="border p-2 w-full mb-2" placeholder="مقدار (value)"><input type="text" id="optionLabel${stage.id}" class="border p-2 w-full mb-2" placeholder="برچسب (label)"><button onclick="addStageOption(${stage.id})" class="bg-green-500 text-white p-2">اضافه کردن گزینه</button></div>`;
    } else if (stage.type === "select" && [2, 4].includes(stage.id)) {
      html += `<div class="mb-4"><h3 class="font-bold mb-2">مدیریت گزینه‌ها</h3><div id="subOptions${stage.id}"></div></div>`;
    } else if (stage.type === "double-select") {
      html += `<div class="mb-4"><h3 class="font-bold mb-2">حساب‌های مبدا</h3><ul id="sourceAccountList${stage.id}" class="list-disc pl-5 mb-2"></ul><input type="text" id="sourceAccountValue${stage.id}" class="border p-2 w-full mb-2" placeholder="مقدار (value)"><input type="text" id="sourceAccountLabel${stage.id}" class="border p-2 w-full mb-2" placeholder="برچسب (label)"><button onclick="addSourceAccount(${stage.id})" class="bg-green-500 text-white p-2">اضافه کردن حساب مبدا</button></div><div class="mb-4"><h3 class="font-bold mb-2">حساب‌های مقصد</h3><ul id="destAccountList${stage.id}" class="list-disc pl-5 mb-2"></ul><input type="text" id="destAccountValue${stage.id}" class="border p-2 w-full mb-2" placeholder="مقدار (value)"><input type="text" id="destAccountLabel${stage.id}" class="border p-2 w-full mb-2" placeholder="برچسب (label)"><button onclick="addDestAccount(${stage.id})" class="bg-green-500 text-white p-2">اضافه کردن حساب مقصد</button></div>`;
    } else if (["text-checkbox", "file-checkbox"].includes(stage.type)) {
      html += `<div class="mb-4"><h3 class="font-bold mb-2">مدیریت گزینه‌ها</h3><ul id="stageOptions${stage.id}" class="list-disc pl-5 mb-2"></ul><input type="text" id="optionValue${stage.id}" class="border p-2 w-full mb-2" placeholder="مقدار (value)"><input type="text" id="optionLabel${stage.id}" class="border p-2 w-full mb-2" placeholder="برچسب (label)"><button onclick="addStageOption(${stage.id})" class="bg-green-500 text-white p-2">اضافه کردن گزینه</button></div>`;
    }
  }
  contentDiv.innerHTML = html;
  updateStageOptions(stage.id);
}

function updateStageOptions(stageId) {
  const stage = stages.find(s => s.id === parseInt(stageId));
  if (!stage) return;
  if (["text-checkbox", "file-checkbox"].includes(stage.type) || (stage.type === "select" && stage.id === 1)) {
    const list = document.getElementById(`stageOptions${stageId}`);
    list.innerHTML = "";
    stage.options.forEach(opt => {
      list.innerHTML += `<li class="mb-2"><input type="text" id="optionValue${stageId}_${opt.value}" class="border p-2 w-1/3" value="${opt.value}"><input type="text" id="optionLabel${stageId}_${opt.value}" class="border p-2 w-1/3 mx-2" value="${opt.label}"><button onclick="updateOption(${stageId},'${opt.value}')" class="bg-yellow-500 text-white p-2">به‌روزرسانی</button><button onclick="removeStageOption(${stageId},'${opt.value}')" class="bg-red-500 text-white p-2 ml-2">حذف</button></li>`;
    });
  } else if (stage.type === "select" && [2, 4].includes(stage.id)) {
    const subContainer = document.getElementById(`subOptions${stageId}`);
    subContainer.innerHTML = "";
    Object.keys(stage.options).forEach(type => {
      const typeDiv = document.createElement("div");
      typeDiv.className = "mb-2 nested";
      typeDiv.innerHTML = `<h4 class="font-semibold mb-2">${stages.find(s => s.id === 1).options.find(o => o.value === type)?.label || type}</h4>`;
      subContainer.appendChild(typeDiv);
      Object.keys(stage.options[type]).forEach(category => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "mb-2 nested";
        categoryDiv.innerHTML = `<div class="mb-2"><label class="block mb-1">عنوان زیرمجموعه:</label><input type="text" id="categoryLabel${stageId}_${type}_${category}" class="border p-2 w-full mb-2" value="${category}"><button onclick="updateCategoryLabel(${stageId},'${type}','${category}')" class="bg-yellow-500 text-white p-2">به‌روزرسانی عنوان</button></div><ul id="subOptionList${stageId}_${type}_${category}" class="list-disc pl-5 mb-2"></ul>`;
        if (type === "تهاتری") {
          categoryDiv.innerHTML += `<input type="text" id="subOptionIncome${stageId}_${type}_${category}" class="border p-2 w-full mb-2" placeholder="درآمد"><input type="text" id="subOptionCost${stageId}_${type}_${category}" class="border p-2 w-full mb-2" placeholder="هزینه"><button onclick="addTehaterySubOption(${stageId},'${type}','${category}')" class="bg-green-500 text-white p-2">اضافه کردن گزینه</button>`;
        } else {
          categoryDiv.innerHTML += `<input type="text" id="subOptionValue${stageId}_${type}_${category}" class="border p-2 w-full mb-2" placeholder="مقدار (value)"><input type="text" id="subOptionLabel${stageId}_${type}_${category}" class="border p-2 w-full mb-2" placeholder="برچسب (label)"><button onclick="addSubOption(${stageId},'${type}','${category}')" class="bg-green-500 text-white p-2">اضافه کردن گزینه</button>`;
        }
        typeDiv.appendChild(categoryDiv);
        const subList = document.getElementById(`subOptionList${stageId}_${type}_${category}`);
        stage.options[type][category].forEach(opt => {
          if (type === "تهاتری") {
            subList.innerHTML += `<li class="mb-2"><input type="text" id="subOptionIncome${stageId}_${type}_${category}_${opt.income}" class="border p-2 w-1/3" value="${opt.income}"><input type="text" id="subOptionCost${stageId}_${type}_${category}_${opt.cost}" class="border p-2 w-1/3 mx-2" value="${opt.cost}"><button onclick="updateTehaterySubOption(${stageId},'${type}','${category}','${opt.income}','${opt.cost}')" class="bg-yellow-500 text-white p-2">به‌روزرسانی</button><button onclick="removeTehaterySubOption(${stageId},'${type}','${category}','${opt.income}','${opt.cost}')" class="bg-red-500 text-white p-2 ml-2">حذف</button></li>`;
          } else {
            subList.innerHTML += `<li class="mb-2"><input type="text" id="subOptionValue${stageId}_${type}_${category}_${opt.value}" class="border p-2 w-1/3" value="${opt.value}"><input type="text" id="subOptionLabel${stageId}_${type}_${category}_${opt.value}" class="border p-2 w-1/3 mx-2" value="${opt.label}"><button onclick="updateSubOption(${stageId},'${type}','${category}','${opt.value}')" class="bg-yellow-500 text-white p-2">به‌روزرسانی</button><button onclick="removeSubOption(${stageId},'${type}','${category}','${opt.value}')" class="bg-red-500 text-white p-2 ml-2">حذف</button></li>`;
          }
        });
      });
    });
  } else if (stage.type === "double-select") {
    const sourceList = document.getElementById(`sourceAccountList${stageId}`);
    const destList = document.getElementById(`destAccountList${stageId}`);
    sourceList.innerHTML = "";
    destList.innerHTML = "";
    stage.sourceAccounts.forEach(account => {
      sourceList.innerHTML += `<li class="mb-2"><input type="text" id="sourceAccountValue${stageId}_${account.value}" class="border p-2 w-1/3" value="${account.value}"><input type="text" id="sourceAccountLabel${stageId}_${account.value}" class="border p-2 w-1/3 mx-2" value="${account.label}"><button onclick="updateSourceAccount(${stageId},'${account.value}')" class="bg-yellow-500 text-white p-2">به‌روزرسانی</button><button onclick="removeSourceAccount(${stageId},'${account.value}')" class="bg-red-500 text-white p-2 ml-2">حذف</button></li>`;
    });
    stage.destAccounts.forEach(account => {
      destList.innerHTML += `<li class="mb-2"><input type="text" id="destAccountValue${stageId}_${account.value}" class="border p-2 w-1/3" value="${account.value}"><input type="text" id="destAccountLabel${stageId}_${account.value}" class="border p-2 w-1/3 mx-2" value="${account.label}"><button onclick="updateDestAccount(${stageId},'${account.value}')" class="bg-yellow-500 text-white p-2">به‌روزرسانی</button><button onclick="removeDestAccount(${stageId},'${account.value}')" class="bg-red-500 text-white p-2 ml-2">حذف</button></li>`;
    });
  }
}
function updateStageTitle(stageId) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const title = document.getElementById(`stageTitle${stageId}`).value;
  if (title) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    stage.title = title;
    localStorage.setItem("stages", JSON.stringify(stages));
    initializeStageSelector();
    showStageManagement();
  }
}

function addStageOption(stageId) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const value = document.getElementById(`optionValue${stageId}`).value;
  const label = document.getElementById(`optionLabel${stageId}`).value;
  if (value && label) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    if (!stage.options.some(opt => opt.value === value)) {
      stage.options.push({value, label});
      if (stageId === 1) {
        stages.find(s => s.id === 2).options[value] = [];
        stages.find(s => s.id === 4).options[value] = {};
      }
      localStorage.setItem("stages", JSON.stringify(stages));
      updateStageOptions(stageId);
      document.getElementById(`optionValue${stageId}`).value = "";
      document.getElementById(`optionLabel${stageId}`).value = "";
    }
  }
}

function updateOption(stageId, oldValue) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const newValue = document.getElementById(`optionValue${stageId}_${oldValue}`).value;
  const newLabel = document.getElementById(`optionLabel${stageId}_${oldValue}`).value;
  if (newValue && newLabel) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    const option = stage.options.find(opt => opt.value === oldValue);
    option.value = newValue;
    option.label = newLabel;
    if (stageId === 1) {
      const stage2 = stages.find(s => s.id === 2);
      const stage4 = stages.find(s => s.id === 4);
      stage2.options[newValue] = stage2.options[oldValue];
      stage4.options[newValue] = stage4.options[oldValue];
      delete stage2.options[oldValue];
      delete stage4.options[oldValue];
    }
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
  }
}

function removeStageOption(stageId, value) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.options = stage.options.filter(opt => opt.value !== value);
  if (stageId === 1) {
    delete stages.find(s => s.id === 2).options[value];
    delete stages.find(s => s.id === 4).options[value];
  }
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function updateCategoryLabel(stageId, type, oldCategory) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const newCategory = document.getElementById(`categoryLabel${stageId}_${type}_${oldCategory}`).value;
  if (newCategory) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    stage.options[type][newCategory] = stage.options[type][oldCategory];
    delete stage.options[type][oldCategory];
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
  }
}

function addSubOption(stageId, type, category) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const value = document.getElementById(`subOptionValue${stageId}_${type}_${category}`).value;
  const label = document.getElementById(`subOptionLabel${stageId}_${type}_${category}`).value;
  if (value && label) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    if (!stage.options[type][category].some(opt => opt.value === value)) {
      stage.options[type][category].push({value, label});
      localStorage.setItem("stages", JSON.stringify(stages));
      updateStageOptions(stageId);
      document.getElementById(`subOptionValue${stageId}_${type}_${category}`).value = "";
      document.getElementById(`subOptionLabel${stageId}_${type}_${category}`).value = "";
    }
  }
}

function updateSubOption(stageId, type, category, oldValue) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const newValue = document.getElementById(`subOptionValue${stageId}_${type}_${category}_${oldValue}`).value;
  const newLabel = document.getElementById(`subOptionLabel${stageId}_${type}_${category}_${oldValue}`).value;
  if (newValue && newLabel) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    const option = stage.options[type][category].find(opt => opt.value === oldValue);
    option.value = newValue;
    option.label = newLabel;
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
  }
}

function removeSubOption(stageId, type, category, value) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.options[type][category] = stage.options[type][category].filter(opt => opt.value !== value);
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function addTehaterySubOption(stageId, type, category) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const income = document.getElementById(`subOptionIncome${stageId}_${type}_${category}`).value;
  const cost = document.getElementById(`subOptionCost${stageId}_${type}_${category}`).value;
  if (income && cost) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    stage.options[type][category].push({income, cost});
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
    document.getElementById(`subOptionIncome${stageId}_${type}_${category}`).value = "";
    document.getElementById(`subOptionCost${stageId}_${type}_${category}`).value = "";
  }
}

function updateTehaterySubOption(stageId, type, category, oldIncome, oldCost) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const newIncome = document.getElementById(`subOptionIncome${stageId}_${type}_${category}_${oldIncome}`).value;
  const newCost = document.getElementById(`subOptionCost${stageId}_${type}_${category}_${oldCost}`).value;
  if (newIncome && newCost) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    const option = stage.options[type][category].find(opt => opt.income === oldIncome && opt.cost === oldCost);
    option.income = newIncome;
    option.cost = newCost;
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
  }
}

function removeTehaterySubOption(stageId, type, category, income, cost) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.options[type][category] = stage.options[type][category].filter(item => !(item.income === income && item.cost === cost));
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function addSourceAccount(stageId) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const value = document.getElementById(`sourceAccountValue${stageId}`).value;
  const label = document.getElementById(`sourceAccountLabel${stageId}`).value;
  if (value && label) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    if (!stage.sourceAccounts.some(account => account.value === value)) {
      stage.sourceAccounts.push({value, label});
      localStorage.setItem("stages", JSON.stringify(stages));
      updateStageOptions(stageId);
      document.getElementById(`sourceAccountValue${stageId}`).value = "";
      document.getElementById(`sourceAccountLabel${stageId}`).value = "";
    }
  }
}

function updateSourceAccount(stageId, oldValue) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const newValue = document.getElementById(`sourceAccountValue${stageId}_${oldValue}`).value;
  const newLabel = document.getElementById(`sourceAccountLabel${stageId}_${oldValue}`).value;
  if (newValue && newLabel) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    const account = stage.sourceAccounts.find(acc => acc.value === oldValue);
    account.value = newValue;
    account.label = newLabel;
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
  }
}

function removeSourceAccount(stageId, value) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.sourceAccounts = stage.sourceAccounts.filter(a => a.value !== value);
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function addDestAccount(stageId) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const value = document.getElementById(`destAccountValue${stageId}`).value;
  const label = document.getElementById(`destAccountLabel${stageId}`).value;
  if (value && label) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    if (!stage.destAccounts.some(account => account.value === value)) {
      stage.destAccounts.push({value, label});
      localStorage.setItem("stages", JSON.stringify(stages));
      updateStageOptions(stageId);
      document.getElementById(`destAccountValue${stageId}`).value = "";
      document.getElementById(`destAccountLabel${stageId}`).value = "";
    }
  }
}

function updateDestAccount(stageId, oldValue) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const newValue = document.getElementById(`destAccountValue${stageId}_${oldValue}`).value;
  const newLabel = document.getElementById(`destAccountLabel${stageId}_${oldValue}`).value;
  if (newValue && newLabel) {
    const stage = stages.find(s => s.id === parseInt(stageId));
    const account = stage.destAccounts.find(acc => acc.value === oldValue);
    account.value = newValue;
    account.label = newLabel;
    localStorage.setItem("stages", JSON.stringify(stages));
    updateStageOptions(stageId);
  }
}

function removeDestAccount(stageId, value) {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.destAccounts = stage.destAccounts.filter(a => a.value !== value);
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function numberToWords(num) {
  if (num === 0) return 'صفر';
  const units = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const thousands = ['', 'هزار', 'میلیون', 'میلیارد'];

  function convertChunk(n) {
    let result = '';
    if (n >= 100) {
      result += hundreds[Math.floor(n / 100)] + ' ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result.trim();
    }
    if (n > 0) {
      result += units[n] + ' ';
    }
    return result.trim();
  }

  let result = '';
  let chunkIndex = 0;
  while (num > 0) {
    let chunk = num % 1000;
    if (chunk > 0) {
      result = convertChunk(chunk) + ' ' + thousands[chunkIndex] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    chunkIndex++;
  }
  return result.trim();
}

function formatAmount(rowId) {
  let input = document.getElementById(`amount${rowId}`);
  let value = input.value.replace(/,/g, '');
  if (value && !isNaN(value)) {
    input.value = Number(value).toLocaleString('en-US');
    let toman = Math.floor(value / 10);
    document.getElementById(`amountText${rowId}`).innerText = `${numberToWords(toman)} تومان`;
  } else {
    document.getElementById(`amountText${rowId}`).innerText = '';
  }
}

function initializeForm(rowId) {
  const typeSelect = document.getElementById(`type${rowId}`);
  typeSelect.innerHTML = '<option value="">انتخاب کنید</option>';
  stages.find(s => s.id === 1).options.forEach(opt => {
    typeSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
  });
  stages.forEach(stage => {
    if (stage.id <= 8) {
      const labelElement = document.getElementById(`stage${stage.id}Label`);
      if (labelElement) {
        labelElement.innerText = `مرحله ${stage.id}: ${stage.title}`;
      }
    }
    if (stage.id === 5) {
      const sourceLabel = document.getElementById(`stage5SourceLabel`);
      const destLabel = document.getElementById(`stage5DestLabel`);
      if (sourceLabel) sourceLabel.innerText = `مرحله 5: حساب مبدا`;
      if (destLabel) destLabel.innerText = `حساب مقصد`;
    }
  });
  updateAccountOptions(rowId);
}

function startForm(rowId) {
  if (isFormActive) {
    alert('لطفاً فرم فعلی را ذخیره کنید');
    return;
  }
  isFormActive = true;
  document.getElementById(`form${rowId}`).classList.remove('hidden');
  document.getElementById('addRowButton').classList.add('disabled');
}

function showTypeOptions(rowId) {
  const type = document.getElementById(`type${rowId}`).value;
  const categorySelect = document.getElementById(`category${rowId}`);
  categorySelect.innerHTML = '<option value="">انتخاب کنید</option>';
  const stage2 = stages.find(s => s.id === 2);
  if (type && stage2.options[type]) {
    stage2.options[type].forEach(opt => {
      categorySelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
    });
  }
  updateReasonOptions(rowId);
}

function updateReasonOptions(rowId) {
  const type = document.getElementById(`type${rowId}`).value;
  const category = document.getElementById(`category${rowId}`).value;
  const reasonSelect = document.getElementById(`reason${rowId}`);
  reasonSelect.innerHTML = '<option value="">انتخاب کنید</option>';
  const stage4 = stages.find(s => s.id === 4);
  if (type && category && stage4.options[type] && stage4.options[type][category]) {
    if (type === 'تهاتری') {
      stage4.options[type][category].forEach(item => {
        reasonSelect.innerHTML += `<option value="${item.income}">${item.income}</option>`;
      });
    } else {
      stage4.options[type][category].forEach(opt => {
        reasonSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
      });
    }
  }
}

function updateAccountOptions(rowId) {
  const sourceAccountSelect = document.getElementById(`sourceAccount${rowId}`);
  const destAccountSelect = document.getElementById(`destAccount${rowId}`);
  sourceAccountSelect.innerHTML = '<option value="">انتخاب کنید</option>';
  destAccountSelect.innerHTML = '<option value="">انتخاب کنید</option>';
  const stage5 = stages.find(s => s.id === 5);
  stage5.sourceAccounts.forEach(account => {
    sourceAccountSelect.innerHTML += `<option value="${account.value}">${account.label}</option>`;
  });
  stage5.destAccounts.forEach(account => {
    destAccountSelect.innerHTML += `<option value="${account.value}">${account.label}</option>`;
  });
}

function toggleInvoice(rowId) {
  const noInvoice = document.getElementById(`noInvoice${rowId}`).checked;
  document.getElementById(`invoice${rowId}`).disabled = noInvoice;
  if (noInvoice) document.getElementById(`invoice${rowId}`).value = '';
}

function toggleDocument(rowId) {
  const noDocument = document.getElementById(`noDocument${rowId}`).checked;
  document.getElementById(`document${rowId}`).disabled = noDocument;
  if (noDocument) document.getElementById(`document${rowId}`).value = '';
}

function nextStep(rowId, currentStep, nextStep) {
  let valid = false;
  const type = document.getElementById(`type${rowId}`).value;
  if (currentStep === 1) {
    valid = type !== '';
  } else if (currentStep === 2) {
    valid = document.getElementById(`category${rowId}`).value !== '';
  } else if (currentStep === 3) {
    valid = document.getElementById(`amount${rowId}`).value !== '' && document.getElementById(`confirmAmount${rowId}`).checked;
  } else if (currentStep === 4) {
    valid = document.getElementById(`reason${rowId}`).value !== '';
  } else if (currentStep === 5) {
    valid = document.getElementById(`sourceAccount${rowId}`).value !== '' && document.getElementById(`destAccount${rowId}`).value !== '';
  } else if (currentStep === 6) {
    valid = document.getElementById(`noInvoice${rowId}`).checked || document.getElementById(`invoice${rowId}`).value !== '';
  } else if (currentStep === 7) {
    valid = document.getElementById(`noDocument${rowId}`).checked || document.getElementById(`document${rowId}`).files.length > 0;
  }
  if (!valid) {
    alert('لطفاً این مرحله را کامل کنید');
    return;
  }
  document.getElementById(`step${currentStep}_${rowId}`).classList.add('hidden');
  document.getElementById(`step${nextStep}_${rowId}`).classList.remove('hidden');
}

function goBack(rowId, currentStep, prevStep) {
  document.getElementById(`step${currentStep}_${rowId}`).classList.add('hidden');
  document.getElementById(`step${prevStep}_${rowId}`).classList.remove('hidden');
}

function deleteRow(rowId) {
  if (confirm('آیا از حذف این ردیف مطمئن هستید؟')) {
    document.getElementById(`row${rowId}`).remove();
    transactions = transactions.filter(t => t.rowId !== rowId);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    isFormActive = false;
    document.getElementById('addRowButton').classList.remove('disabled');
    updateSavedTransactions();
    updateReports();
  }
}

function addRow() {
  const rowCount = transactions.length + 1;
  const tbody = document.getElementById("transactionBody");
  const newRow = document.createElement("tr");
  newRow.id = `row${rowCount}`;
  newRow.innerHTML = `
    <td><button onclick="startForm(${rowCount})" class="bg-green-500 text-white p-2">شروع</button></td>
    <td>
      <div id="form${rowCount}" class="p-2 hidden">
        <div id="step1_${rowCount}" class="mb-2">
          <label id="stage1Label">مرحله 1: نوع تراکنش</label>
          <select id="type${rowCount}" onchange="showTypeOptions(${rowCount})" class="border p-2 w-full">
            <option value="">انتخاب کنید</option>
          </select>
          <button onclick="nextStep(${rowCount}, 1, 2)" class="bg-blue-500 text Cowan-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step2_${rowCount}" class="hidden mb-2">
          <label id="stage2Label">مرحله 2: دسته‌بندی</label>
          <select id="category${rowCount}" onchange="updateReasonOptions(${rowCount})" class="border p-2 w-full">
            <option value="">انتخاب کنید</option>
          </select>
          <button onclick="goBack(${rowCount}, 2, 1)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="nextStep(${rowCount}, 2, 3)" class="bg-blue-500 text-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step3_${rowCount}" class="hidden mb-2">
          <label id="stage3Label">مرحله 3: مبلغ (ریال)</label>
          <input type="text" id="amount${rowCount}" oninput="formatAmount(${rowCount})" class="border p-2 w-full" placeholder="مثال: 200,000">
          <p id="amountText${rowCount}" class="text-sm text-gray-600 mt-1"></p>
          <label class="flex items-center mt-2">
            <input type="checkbox" id="confirmAmount${rowCount}" class="mr-2">
            <span>مبلغ واردشده درست است</span>
          </label>
          <button onclick="goBack(${rowCount}, 3, 2)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="nextStep(${rowCount}, 3, 4)" class="bg-blue-500 text-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step4_${rowCount}" class="hidden mb-2">
          <label id="stage4Label">مرحله 4: بابت</label>
          <select id="reason${rowCount}" class="border p-2 w-full">
            <option value="">انتخاب کنید</option>
          </select>
          <button onclick="goBack(${rowCount}, 4, 3)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="nextStep(${rowCount}, 4, 5)" class="bg-blue-500 text-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step5_${rowCount}" class="hidden mb-2">
          <label id="stage5SourceLabel">مرحله 5: حساب مبدا</label>
          <select id="sourceAccount${rowCount}" class="border p-2 w-full mb-2">
            <option value="">انتخاب کنید</option>
          </select>
          <label id="stage5DestLabel">حساب مقصد</label>
          <select id="destAccount${rowCount}" class="border p-2 w-full">
            <option value="">انتخاب کنید</option>
          </select>
          <button onclick="goBack(${rowCount}, 5, 4)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="nextStep(${rowCount}, 5, 6)" class="bg-blue-500 text-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step6_${rowCount}" class="hidden mb-2">
          <label id="stage6Label">مرحله 6: شماره فاکتور/رسید</label>
          <input type="text" id="invoice${rowCount}" class="border p-2 w-full">
          <label class="flex items-center mt-2">
            <input type="checkbox" id="noInvoice${rowCount}" class="mr-2" onchange="toggleInvoice(${rowCount})">
            <span>فاقد شماره فاکتور/رسید</span>
          </label>
          <button onclick="goBack(${rowCount}, 6, 5)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="nextStep(${rowCount}, 6, 7)" class="bg-blue-500 text-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step7_${rowCount}" class="hidden mb-2">
          <label id="stage7Label">مرحله 7: آپلود مدارک</label>
          <input type="file" id="document${rowCount}" class="border p-2 w-full">
          <label class="flex items-center mt-2">
            <input type="checkbox" id="noDocument${rowCount}" class="mr-2" onchange="toggleDocument(${rowCount})">
            <span>فاقد مدارک</span>
          </label>
          <button onclick="goBack(${rowCount}, 7, 6)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="nextStep(${rowCount}, 7, 8)" class="bg-blue-500 text-white p-2 mt-2">بعدی</button>
        </div>
        <div id="step8_${rowCount}" class="hidden mb-2">
          <label id="stage8Label">مرحله 8: توضیحات</label>
          <textarea id="description${rowCount}" class="border p-2 w-full" rows="4" placeholder="توضیحات (اختیاری)"></textarea>
          <button onclick="goBack(${rowCount}, 8, 7)" class="bg-gray-500 text-white p-2 mt-2">قبلی</button>
          <button onclick="saveTransaction(${rowCount})" class="bg-green-500 text-white p-2 mt-2">مرحله 9: پایان</button>
        </div>
        <button onclick="deleteRow(${rowCount})" class="bg-red-500 text-white p-2 mt-2">حذف ردیف</button>
      </div>
    </td>
  `;
  tbody.appendChild(newRow);
  initializeForm(rowCount);
}

function saveTransaction(rowId, isEdit = false) {
  const type = document.getElementById(`type${rowId}`).value;
  const description = document.getElementById(`description${rowId}`).value;
  const transaction = {
    rowId,
    username: currentUser.username,
    date: new Date().toISOString(),
    type,
    category: document.getElementById(`category${rowId}`).value,
    amount: document.getElementById(`amount${rowId}`).value.replace(/,/g, ''),
    reason: document.getElementById(`reason${rowId}`).value,
    sourceAccount: document.getElementById(`sourceAccount${rowId}`).value,
    destAccount: document.getElementById(`destAccount${rowId}`).value,
    invoice: document.getElementById(`noInvoice${rowId}`).checked ? '' : document.getElementById(`invoice${rowId}`).value,
    document: '',
    description
  };
  const documentFile = document.getElementById(`document${rowId}`).files[0];
  const save = () => {
    if (isEdit) {
      const index = transactions.findIndex(t => t.rowId === rowId);
      transactions[index] = transaction;
      logs.push({
        rowId,
        username: currentUser.username,
        date: new Date().toISOString(),
        action: 'ویرایش',
        details: `ردیف ${rowId} ویرایش شد`
      });
    } else {
      transactions.push(transaction);
      logs.push({
        rowId,
        username: currentUser.username,
        date: new Date().toISOString(),
        action: 'ایجاد',
        details: `ردیف ${rowId} ایجاد شد`
      });
    }
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("logs", JSON.stringify(logs));
    isFormActive = false;
    document.getElementById('addRowButton').classList.remove('disabled');
    document.getElementById(`form${rowId}`).classList.add('hidden');
    updateSavedTransactions();
    updateReports();
    alert('تراکنش با موفقیت ذخیره شد');
  };
  if (documentFile && !document.getElementById(`noDocument${rowId}`).checked) {
    const reader = new FileReader();
    reader.onload = function(e) {
      transaction.document = e.target.result;
      save();
    };
    reader.readAsDataURL(documentFile);
  } else {
    save();
  }
}

function editTransaction(rowId) {
  if (isFormActive) {
    alert('لطفاً فرم فعلی را ذخیره کنید');
    return;
  }
  isFormActive = true;
  document.getElementById('addRowButton').classList.add('disabled');
  const transaction = transactions.find(t => t.rowId === rowId);
  const formId = rowId;
  document.getElementById(`form${formId}`).classList.remove('hidden');
  document.getElementById(`type${formId}`).value = transaction.type;
  showTypeOptions(formId);
  document.getElementById(`category${formId}`).value = transaction.category;
  updateReasonOptions(formId);
  document.getElementById(`reason${formId}`).value = transaction.reason;
  document.getElementById(`amount${formId}`).value = Number(transaction.amount).toLocaleString('en-US');
  formatAmount(formId);
  document.getElementById(`sourceAccount${formId}`).value = transaction.sourceAccount;
  document.getElementById(`destAccount${formId}`).value = transaction.destAccount;
  document.getElementById(`invoice${formId}`).value = transaction.invoice;
  document.getElementById(`noInvoice${formId}`).checked = !transaction.invoice;
  toggleInvoice(formId);
  document.getElementById(`noDocument${formId}`).checked = !transaction.document;
  toggleDocument(formId);
  document.getElementById(`description${formId}`).value = transaction.description;
  document.getElementById(`step1_${formId}`).classList.remove('hidden');
}

function updateSavedTransactions() {
  const savedBody = document.getElementById('savedTransactionsBody');
  savedBody.innerHTML = '';
  const search = document.getElementById('searchTransactions').value.toLowerCase();
  transactions.filter(t => {
    return !search ||
      t.sourceAccount.toLowerCase().includes(search) ||
      t.destAccount.toLowerCase().includes(search) ||
      t.reason.toLowerCase().includes(search) ||
      t.invoice.toLowerCase().includes(search);
  }).forEach(t => {
    const row = savedBody.insertRow();
    row.innerHTML = `
      <td>${t.rowId}</td>
      <td>${stages.find(s => s.id === 1).options.find(o => o.value === t.type)?.label || t.type}</td>
      <td>${t.category}</td>
      <td>${(t.amount / 10).toLocaleString('en-US')}</td>
      <td>${t.reason}</td>
      <td>${t.sourceAccount}</td>
      <td>${t.destAccount}</td>
      <td>${t.invoice || 'فاقد'}</td>
      <td>${t.description || 'بدون توضیح'}</td>
      <td><button onclick="editTransaction(${t.rowId})" class="bg-yellow-500 text-white p-1">ویرایش</button></td>
    `;
  });
}

function filterTransactions() {
  updateSavedTransactions();
}

function showReports() {
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('dataEntryPage').classList.add('hidden');
  document.getElementById('reportPage').classList.remove('hidden');
  updateReports();
}

function showDataEntry() {
  if (!currentUser.access.includes("dataEntry")) {
    alert("شما دسترسی به این صفحه ندارید");
    return;
  }
  document.getElementById('mainPage').classList.add('hidden');
  document.getElementById('reportPage').classList.add('hidden');
  document.getElementById('dataEntryPage').classList.remove('hidden');
  initializeStageSelector();
}

function showMainPage() {
  document.getElementById('reportPage').classList.add('hidden');
  document.getElementById('dataEntryPage').classList.add('hidden');
  document.getElementById('mainPage').classList.remove('hidden');
}

function updateReports() {
  const reportBody = document.getElementById('reportBody');
  reportBody.innerHTML = '';
  const searchInvoice = document.getElementById('searchInvoice').value.toLowerCase();
  transactions.filter(t => !searchInvoice || t.invoice.toLowerCase().includes(searchInvoice)).forEach(t => {
    const row = reportBody.insertRow();
    row.innerHTML = `
      <td>${t.username}</td>
      <td>${new Date(t.date).toLocaleDateString('fa-IR')}</td>
      <td>${stages.find(s => s.id === 1).options.find(o => o.value === t.type)?.label || t.type}</td>
      <td>${t.category}</td>
      <td>${(t.amount / 10).toLocaleString('en-US')}</td>
      <td>${t.reason}</td>
      <td>${t.sourceAccount}</td>
      <td>${t.destAccount}</td>
      <td>${t.invoice || 'فاقد'}</td>
      <td>${t.description || 'بدون توضیح'}</td>
    `;
  });
}

function filterReports() {
  updateReports();
}