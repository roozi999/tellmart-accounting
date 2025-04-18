const users = [{username: "roozbeh", password: "roozbeh", access: ["dataEntry"]}];
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
let currentUser = null;

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");
  errorDiv.classList.add("hidden");
  errorDiv.innerText = "";
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem("loginData", JSON.stringify({user, loginTime: new Date().getTime()}));
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dataEntryPage").classList.remove("hidden");
    initializeStageSelector();
  } else {
    errorDiv.innerText = "نام کاربری یا رمز عبور اشتباه است";
    errorDiv.classList.remove("hidden");
  }
}

function logout() {
  localStorage.removeItem("loginData");
  currentUser = null;
  document.getElementById("dataEntryPage").classList.add("hidden");
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
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.options[type][category] = stage.options[type][category].filter(opt => opt.value !== value);
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function addTehaterySubOption(stageId, type, category) {
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
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.options[type][category] = stage.options[type][category].filter(item => !(item.income === income && item.cost === cost));
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function addSourceAccount(stageId) {
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
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.sourceAccounts = stage.sourceAccounts.filter(a => a.value !== value);
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}

function addDestAccount(stageId) {
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
  const stage = stages.find(s => s.id === parseInt(stageId));
  stage.destAccounts = stage.destAccounts.filter(a => a.value !== value);
  localStorage.setItem("stages", JSON.stringify(stages));
  updateStageOptions(stageId);
}