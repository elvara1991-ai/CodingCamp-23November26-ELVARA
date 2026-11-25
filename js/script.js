
/* =====================================
   1. SELECT HTML ELEMENTS
===================================== */

// Custom Category Elements
const categoryForm = document.getElementById("category-form");
const newCategoryInput = document.getElementById("new-category");
const categoryList = document.getElementById("category-list");

const transactionForm = document.getElementById("transaction-form");
const itemNameInput = document.getElementById("item-name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const totalBalance = document.getElementById("total-balance");                                                                                                                                                                                                                 
// Monthly Summary Elements
const summaryMonthInput = document.getElementById("summary-month");
const monthlyTotal = document.getElementById("monthly-total");
const monthlyTransactionCount = document.getElementById("monthly-transaction-count");

// Transaction Date Element
const transactionDateInput = document.getElementById("transaction-date");

// Sorting Element
const transactionSort = document.getElementById("transaction-sort");
// Mengambil elemen canvas untuk grafik
const chartCanvas = document.getElementById("expense-chart");

// Menyimpan objek grafik
let expenseChart = null;

/* =====================================
   2. TRANSACTION DATA
===================================== */

// Default categories
const defaultCategories = ["Food", "Transport", "Fun"];

// Load saved categories
let categories = JSON.parse(
    localStorage.getItem("categories")
) || [...defaultCategories];

// Mengambil data transaksi dari Local Storage
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


/* =====================================
   3. FORMAT CURRENCY
===================================== */

/* =====================================
   PIE CHART - SPENDING BY CATEGORY
===================================== */


/* =====================================
   PIE CHART - SPENDING BY CATEGORY
   DYNAMIC CATEGORY VERSION
===================================== */

function updateChart() {

    // Mengelompokkan pengeluaran berdasarkan kategori
    const categoryTotals = {};

    transactions.forEach((transaction) => {

        const category = transaction.category;

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += Number(transaction.amount);

    });

    // Mengambil kategori dan nilai pengeluaran
    const chartLabels = Object.keys(categoryTotals);

    const chartData = Object.values(categoryTotals);

    // Warna untuk setiap kategori
    const colors = [
        "#27AE60",
        "#3498DB",
        "#F39C12",
        "#9B59B6",
        "#E74C3C",
        "#1ABC9C",
        "#E67E22",
        "#34495E",
        "#F1C40F",
        "#D35400"
    ];

    const chartColors = chartLabels.map((category, index) => {
        return colors[index % colors.length];
    });

    // Jika grafik sudah ada, perbarui datanya
    if (expenseChart) {

        expenseChart.data.labels = chartLabels;

        expenseChart.data.datasets[0].data = chartData;

        expenseChart.data.datasets[0].backgroundColor = chartColors;

        expenseChart.update();

        return;
    }

    // Membuat grafik pertama kali
    expenseChart = new Chart(chartCanvas, {

        type: "pie",

        data: {

            labels: chartLabels,

            datasets: [{

                label: "Spending by Category",

                data: chartData,

                backgroundColor: chartColors,

                borderWidth: 2,

                borderColor: "#ffffff"

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return context.label + ": " +
                                formatCurrency(context.raw);

                        }

                    }

                }

            }

        }

    });

}



/* =====================================
   4. SAVE TRANSACTIONS
===================================== */

/* =====================================
   SAVE CATEGORIES
===================================== */

function saveCategories() {
    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );
}

/* =====================================
   DISPLAY CATEGORIES
===================================== */

function displayCategories() {

    // Update transaction category options
    categoryInput.innerHTML = `
        <option value="">Select category</option>
    `;

    categories.forEach((category) => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryInput.appendChild(option);

    });

    // Display category tags
    categoryList.innerHTML = "";

    categories.forEach((category) => {

        const tag = document.createElement("div");
        tag.className = "category-tag";

        const name = document.createElement("span");
        name.textContent = category;

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Remove " + category);

        deleteButton.addEventListener("click", function () {
            deleteCategory(category);
        });

        tag.appendChild(name);
        tag.appendChild(deleteButton);

        categoryList.appendChild(tag);

    });

}

/* =====================================
   ADD CUSTOM CATEGORY
===================================== */

categoryForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newCategory = newCategoryInput.value.trim();

    if (!newCategory) {
        alert("Please enter a category name.");
        return;
    }

    const alreadyExists = categories.some(
        category => category.toLowerCase() === newCategory.toLowerCase()
    );

    if (alreadyExists) {
        alert("This category already exists.");
        return;
    }

    categories.push(newCategory);

    saveCategories();
    displayCategories();

    newCategoryInput.value = "";

    alert("Category added successfully!");

});

/* =====================================
   DELETE CUSTOM CATEGORY
===================================== */

function deleteCategory(category) {

    if (defaultCategories.includes(category)) {
        alert("Default categories cannot be deleted.");
        return;
    }

    const isUsed = transactions.some(
        transaction => transaction.category === category
    );

    if (isUsed) {
        alert("This category is already used in transactions.");
        return;
    }

    categories = categories.filter(
        item => item !== category
    );

    saveCategories();
    displayCategories();

}

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}



/* =====================================
   5. UPDATE TOTAL BALANCE
===================================== */

function updateTotalBalance() {

    const total = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
    );

    totalBalance.textContent = formatCurrency(total);

}


/* =====================================
   GET LOCAL DATE
===================================== */

function getLocalDateString() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =====================================
   MONTHLY SUMMARY
===================================== */

function updateMonthlySummary() {

    const selectedMonth = summaryMonthInput.value;

    if (!selectedMonth) {
        monthlyTotal.textContent = formatCurrency(0);
        monthlyTransactionCount.textContent = "0 transactions";
        return;
    }

    const monthlyTransactions = transactions.filter(
        (transaction) => {

            return transaction.date &&
                transaction.date.startsWith(selectedMonth);

        }
    );

    const monthlySpending = monthlyTransactions.reduce(
        (total, transaction) =>
            total + Number(transaction.amount),
        0
    );

    monthlyTotal.textContent = formatCurrency(monthlySpending);

    const count = monthlyTransactions.length;

    monthlyTransactionCount.textContent =
        count + (count === 1 ? " transaction" : " transactions");

}




/* =====================================
   6. DISPLAY TRANSACTIONS
   WITH SORTING FEATURE
===================================== */

function displayTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No transactions yet.";

        transactionList.appendChild(emptyMessage);

        return;
    }

    // Copy transactions before sorting
    const sortedTransactions = [...transactions];

    const sortValue = transactionSort.value;

    // Sorting options
    if (sortValue === "newest") {

        sortedTransactions.sort((a, b) =>
            (b.date || "").localeCompare(a.date || "")
        );

    } else if (sortValue === "oldest") {

        sortedTransactions.sort((a, b) =>
            (a.date || "").localeCompare(b.date || "")
        );

    } else if (sortValue === "highest") {

        sortedTransactions.sort((a, b) =>
            Number(b.amount) - Number(a.amount)
        );

    } else if (sortValue === "lowest") {

        sortedTransactions.sort((a, b) =>
            Number(a.amount) - Number(b.amount)
        );

    } else if (sortValue === "category") {

        sortedTransactions.sort((a, b) =>
            a.category.localeCompare(b.category)
        );

    }

    sortedTransactions.forEach((transaction) => {

        const transactionItem = document.createElement("div");
        transactionItem.className = "transaction-item";

        const transactionInfo = document.createElement("div");
        transactionInfo.className = "transaction-info";

        const name = document.createElement("h3");
        name.textContent = transaction.name;

        const category = document.createElement("p");
        category.textContent = transaction.category;

        const amount = document.createElement("strong");
        amount.textContent = formatCurrency(transaction.amount);

        transactionInfo.appendChild(name);
        transactionInfo.appendChild(category);

        // Display transaction date when available
        if (transaction.date) {

            const date = document.createElement("p");
            date.textContent = transaction.date;

            transactionInfo.appendChild(date);

        }

        transactionInfo.appendChild(amount);

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function () {

            deleteTransaction(transaction.id);

        });

        transactionItem.appendChild(transactionInfo);
        transactionItem.appendChild(deleteButton);

        transactionList.appendChild(transactionItem);

    });

}


// Sorting Event Listener
transactionSort.addEventListener("change", function () {

    displayTransactions();

});



/* =====================================
   7. ADD TRANSACTION
===================================== */

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const itemName = itemNameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = transactionDateInput.value;
    // Validasi input
    if (!itemName || !category || !date || !Number.isFinite(amount) || amount <= 0) {

        alert("Please enter valid transaction details.");

        return;
    }

    // Membuat object transaksi
    const newTransaction = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name: itemName,
    amount: amount,
    category: category,
    date: date
};

    // Menambahkan transaksi ke array
    transactions.push(newTransaction);

    // Menyimpan data
    saveTransactions();

    // Memperbarui tampilan
    displayTransactions();
    updateTotalBalance();
    updateChart();
    updateMonthlySummary();

    // Mengosongkan formulir
    transactionForm.reset();

// Restore today's date after form reset
transactionDateInput.value = getLocalDateString();

});


/* =====================================
   8. DELETE TRANSACTION
===================================== */

function deleteTransaction(id) {

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();

    displayTransactions();
    updateTotalBalance();
    updateChart();
    updateMonthlySummary();
}


/* =====================================
   GET LOCAL DATE
===================================== */

function getLocalDateString() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}/* =====================================
   9. INITIALIZE WEBSITE
===================================== */

// Set today's date as default transaction date
transactionDateInput.value = getLocalDateString();

// Set current month as default summary month
const today = new Date();

const currentMonth =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0");

summaryMonthInput.value = currentMonth;

// Update summary when month changes
summaryMonthInput.addEventListener("change", function () {

    updateMonthlySummary();

});

// Display saved data
displayCategories();
displayTransactions();
updateTotalBalance();
updateChart();
updateMonthlySummary();

/* =====================================
   FORMAT CURRENCY
===================================== */

function formatCurrency(amount) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);

}
