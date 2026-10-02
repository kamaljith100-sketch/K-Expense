let expenses = JSON.parse(
  localStorage.getItem("kExpenseData") || "[]"
);

const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const search = document.getElementById("search");

const todayTotal = document.getElementById("todayTotal");
const monthTotal = document.getElementById("monthTotal");
const grandTotal = document.getElementById("grandTotal");

const dateInput = document.getElementById("date");

const today = new Date();

dateInput.value = today.toISOString().split("T")[0];

function saveData() {
  localStorage.setItem(
    "kExpenseData",
    JSON.stringify(expenses)
  );
}

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateDashboard() {

  const now = new Date();

  const todayString =
    now.toISOString().split("T")[0];

  const currentMonth =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0");

  let today = 0;
  let month = 0;
  let total = 0;

  expenses.forEach(expense => {

    const amount = Number(expense.amount);

    total += amount;

    if (expense.date === todayString) {
      today += amount;
    }

    if (expense.date.startsWith(currentMonth)) {
      month += amount;
    }

  });

  todayTotal.textContent = money(today);
  monthTotal.textContent = money(month);
  grandTotal.textContent = money(total);
}

function renderExpenses() {

  const keyword =
    search.value.toLowerCase().trim();

  expenseList.innerHTML = "";

  const filtered = expenses.filter(expense => {

    return (
      expense.category.toLowerCase().includes(keyword) ||
      expense.description.toLowerCase().includes(keyword) ||
      expense.payment.toLowerCase().includes(keyword) ||
      expense.bill.toLowerCase().includes(keyword)
    );

  });

  document.getElementById("emptyMessage").style.display =
    filtered.length ? "none" : "block";

  filtered.forEach(expense => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td><strong>${money(expense.amount)}</strong></td>
      <td>${expense.payment}</td>
      <td>
        <button
          class="delete-btn"
          onclick="deleteExpense('${expense.id}')"
        >
          Delete
        </button>
      </td>
    `;

    expenseList.appendChild(row);

  });

}

form.addEventListener("submit", function(event) {

  event.preventDefault();

  const expense = {

    id: Date.now().toString(),

    date: document.getElementById("date").value,

    category:
      document.getElementById("category").value,

    description:
      document.getElementById("description").value,

    amount:
      Number(document.getElementById("amount").value),

    payment:
      document.getElementById("payment").value,

    bill:
      document.getElementById("bill").value,

    notes:
      document.getElementById("notes").value

  };

  expenses.unshift(expense);

  saveData();

  form.reset();

  dateInput.value =
    new Date().toISOString().split("T")[0];

  updateDashboard();
  renderExpenses();

});

function deleteExpense(id) {

  if (!confirm("Delete this expense?")) {
    return;
  }

  expenses =
    expenses.filter(expense => expense.id !== id);

  saveData();

  updateDashboard();
  renderExpenses();

}

search.addEventListener(
  "input",
  renderExpenses
);

document.getElementById("exportBtn")
.addEventListener("click", function() {

  if (!expenses.length) {
    alert("No expenses to export.");
    return;
  }

  let csv =
    "Date,Category,Description,Amount,Payment,Bill,Notes\n";

  expenses.forEach(expense => {

    csv += [
      expense.date,
      `"${expense.category}"`,
      `"${expense.description}"`,
      expense.amount,
      `"${expense.payment}"`,
      `"${expense.bill}"`,
      `"${expense.notes}"`
    ].join(",") + "\n";

  });

  const blob = new Blob(
    [csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = "K-Expense-Report.csv";

  link.click();

  URL.revokeObjectURL(url);

});

updateDashboard();
renderExpenses();
