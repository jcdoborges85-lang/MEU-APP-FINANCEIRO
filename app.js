// DOM Elements
const modal = document.getElementById('transaction-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const form = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const emptyState = document.getElementById('empty-state');
const categorySelect = document.getElementById('category');

const totalIncomesEl = document.getElementById('total-incomes');
const totalExpensesEl = document.getElementById('total-expenses');
const totalBalanceEl = document.getElementById('total-balance');

// Category Management DOM Elements
const categoriesModal = document.getElementById('categories-modal');
const openCategoriesBtn = document.getElementById('open-categories-btn');
const closeCategoriesBtn = document.getElementById('close-categories-btn');
const addCategoryForm = document.getElementById('add-category-form');
const newCategoryInput = document.getElementById('new-category-input');
const categoriesListEl = document.getElementById('categories-list');

// Temporal Filter DOM Elements
const viewDiarioBtn = document.getElementById('view-diario');
const viewSemanalBtn = document.getElementById('view-semanal');
const viewMensalBtn = document.getElementById('view-mensal');
const viewAnualBtn = document.getElementById('view-anual');
const prevPeriodBtn = document.getElementById('prev-period-btn');
const nextPeriodBtn = document.getElementById('next-period-btn');
const todayBtn = document.getElementById('today-btn');
const periodLabel = document.getElementById('period-label');
const expenseComparisonEl = document.getElementById('expense-comparison');

const filterTabs = {
    'diario': viewDiarioBtn,
    'semanal': viewSemanalBtn,
    'mensal': viewMensalBtn,
    'anual': viewAnualBtn
};

// Data state
let transactions = [];
const defaultCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Outros'];
let categories = [];

// Temporal Filter State
let currentView = 'mensal'; // 'diario', 'semanal', 'mensal', 'anual'
let currentDate = new Date(); // Local date

// Date helper to prevent timezone issues
function parseDateLocal(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}

// Get the start and end of the period for the given date and view
function getPeriodBounds(date, view) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    let start, end;

    if (view === 'diario') {
        start = new Date(d);
        end = new Date(d);
        end.setHours(23, 59, 59, 999);
    } else if (view === 'semanal') {
        // Assume week starts on Monday
        const day = d.getDay() || 7;
        start = new Date(d);
        start.setDate(d.getDate() - day + 1);

        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    } else if (view === 'mensal') {
        start = new Date(d.getFullYear(), d.getMonth(), 1);
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
    } else if (view === 'anual') {
        start = new Date(d.getFullYear(), 0, 1);
        end = new Date(d.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);
    }

    return { start, end };
}

// Get the equivalent date for the previous period
function getPreviousPeriodDate(date, view) {
    const d = new Date(date);
    if (view === 'diario') {
        d.setDate(d.getDate() - 1);
    } else if (view === 'semanal') {
        d.setDate(d.getDate() - 7);
    } else if (view === 'mensal') {
        d.setDate(1); // prevent month skipping edge case
        d.setMonth(d.getMonth() - 1);
    } else if (view === 'anual') {
        d.setDate(1);
        d.setFullYear(d.getFullYear() - 1);
    }
    return d;
}

// Format the period label for display
function formatPeriodLabel(date, view) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    if (view === 'diario') {
        return `${String(date.getDate()).padStart(2, '0')} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
    } else if (view === 'semanal') {
        const { start, end } = getPeriodBounds(date, view);
        // Calculate week number roughly
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (start - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

        const formatShortDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        return `Semana ${weekNum} (${formatShortDate(start)} - ${formatShortDate(end)}/${end.getFullYear()})`;
    } else if (view === 'mensal') {
        return `${months[date.getMonth()]} / ${date.getFullYear()}`;
    } else if (view === 'anual') {
        return `${date.getFullYear()}`;
    }
}

// Temporal Filter Event Listeners
function setupTemporalFilterListeners() {
    // Tab Clicks
    Object.keys(filterTabs).forEach(view => {
        filterTabs[view].addEventListener('click', () => {
            currentView = view;

            // Update Tab UI
            Object.keys(filterTabs).forEach(v => {
                const btn = filterTabs[v];
                if (v === currentView) {
                    btn.className = 'filter-tab bg-white shadow px-4 py-2 rounded-md text-sm font-medium text-blue-600 focus:outline-none';
                } else {
                    btn.className = 'filter-tab px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none';
                }
            });

            updateUI();
        });
    });

    // Navigator Clicks
    prevPeriodBtn.addEventListener('click', () => {
        currentDate = getPreviousPeriodDate(currentDate, currentView);
        updateUI();
    });

    nextPeriodBtn.addEventListener('click', () => {
        // Inverse of getPreviousPeriodDate
        const d = new Date(currentDate);
        if (currentView === 'diario') {
            d.setDate(d.getDate() + 1);
        } else if (currentView === 'semanal') {
            d.setDate(d.getDate() + 7);
        } else if (currentView === 'mensal') {
            d.setDate(1); // prevent month skipping edge case
            d.setMonth(d.getMonth() + 1);
        } else if (currentView === 'anual') {
            d.setDate(1);
            d.setFullYear(d.getFullYear() + 1);
        }
        currentDate = d;
        updateUI();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        updateUI();
    });
}

// Initialize App
function init() {
    setupTemporalFilterListeners();
    loadTransactions();
    loadCategories();
    updateUI();
}

// LocalStorage Functions
function loadTransactions() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadCategories() {
    const saved = localStorage.getItem('categories');
    if (saved) {
        categories = JSON.parse(saved);
    } else {
        categories = [...defaultCategories];
    }
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Modal Toggle
function toggleModal(show) {
    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        form.reset();
    }
}

function toggleCategoriesModal(show) {
    if (show) {
        categoriesModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        renderCategories();
    } else {
        categoriesModal.classList.add('hidden');
        // Restore body overflow only if transaction modal is also closed
        if (modal.classList.contains('hidden')) {
            document.body.style.overflow = 'auto';
        }
        addCategoryForm.reset();
    }
}

// Event Listeners for Modal
openModalBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Nova Transação';
    document.getElementById('submit-btn').textContent = 'Salvar';
    document.getElementById('transaction-id').value = '';
    toggleModal(true);
});
closeModalBtn.addEventListener('click', () => toggleModal(false));
cancelBtn.addEventListener('click', () => toggleModal(false));
modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
});

// Event Listeners for Categories Modal
openCategoriesBtn.addEventListener('click', () => toggleCategoriesModal(true));
closeCategoriesBtn.addEventListener('click', () => toggleCategoriesModal(false));
categoriesModal.addEventListener('click', (e) => {
    if (e.target === categoriesModal) toggleCategoriesModal(false);
});

// Add New Category
addCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCat = newCategoryInput.value.trim();

    if (newCat && !categories.includes(newCat)) {
        categories.push(newCat);
        saveCategories();
        updateCategorySelect();
        renderCategories();
        newCategoryInput.value = '';
    } else if (categories.includes(newCat)) {
        alert('Esta categoria já existe.');
    }
});

function renderCategories() {
    categoriesListEl.innerHTML = '';

    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'px-4 py-3 flex justify-between items-center';

        const span = document.createElement('span');
        span.className = 'text-sm text-gray-800';
        span.textContent = category;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-500 hover:text-red-700 focus:outline-none';
        deleteBtn.title = 'Excluir categoria';
        deleteBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        `;
        deleteBtn.addEventListener('click', () => deleteCategory(category));

        li.appendChild(span);
        li.appendChild(deleteBtn);
        categoriesListEl.appendChild(li);
    });
}

function deleteCategory(category) {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category}"?`)) {
        categories = categories.filter(c => c !== category);
        saveCategories();
        updateCategorySelect();
        renderCategories();

        // Optional: Update existing transactions to a default or 'Outros' if their category is deleted
        // transactions = transactions.map(t => {
        //     if (t.category === category) t.category = 'Outros';
        //     return t;
        // });
        // saveTransactions();
        // renderTransactions();
    }
}

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const idInput = document.getElementById('transaction-id').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const category = document.getElementById('category').value;

    if (idInput) {
        // Edit existing transaction
        const index = transactions.findIndex(t => t.id === idInput);
        if (index !== -1) {
            transactions[index] = {
                id: idInput,
                description,
                amount,
                date,
                type,
                category
            };
        }
    } else {
        // Create new transaction
        const newTransaction = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            description,
            amount,
            date,
            type,
            category
        };
        transactions.push(newTransaction);
    }

    // Sort transactions by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveTransactions();
    updateUI();
    toggleModal(false);
});

// Edit Transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('date').value = transaction.date;
    document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
    document.getElementById('category').value = transaction.category;
    document.getElementById('transaction-id').value = transaction.id;

    document.getElementById('modal-title').textContent = 'Editar Transação';
    document.getElementById('submit-btn').textContent = 'Atualizar';

    toggleModal(true);
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

// Formatting utilities
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

function calculateExpensesForPeriod(periodStart, periodEnd) {
    return transactions.reduce((acc, t) => {
        if (t.type === 'expense') {
            const tDate = parseDateLocal(t.date);
            if (tDate >= periodStart && tDate <= periodEnd) {
                return acc + t.amount;
            }
        }
        return acc;
    }, 0);
}

function updateComparison(currentExpense) {
    // Check if there are any transactions prior to the current period
    const { start: currentStart } = getPeriodBounds(currentDate, currentView);

    const hasHistory = transactions.some(t => {
        const tDate = parseDateLocal(t.date);
        return tDate < currentStart;
    });

    if (!hasHistory) {
        expenseComparisonEl.textContent = "Sem histórico anterior para comparação";
        expenseComparisonEl.className = "text-xs text-gray-500 mt-auto";
        return;
    }

    const prevDate = getPreviousPeriodDate(currentDate, currentView);
    const { start: prevStart, end: prevEnd } = getPeriodBounds(prevDate, currentView);

    const prevExpense = calculateExpensesForPeriod(prevStart, prevEnd);

    if (prevExpense === 0) {
        if (currentExpense > 0) {
            expenseComparisonEl.textContent = `+100% em relação ao período anterior`;
            expenseComparisonEl.className = "text-xs text-red-500 mt-auto font-medium";
        } else {
            expenseComparisonEl.textContent = `Sem gastos no período anterior`;
            expenseComparisonEl.className = "text-xs text-gray-500 mt-auto";
        }
    } else {
        const diff = currentExpense - prevExpense;
        const percentage = Math.round((diff / prevExpense) * 100);

        let viewLabel = 'período';
        if (currentView === 'diario') viewLabel = 'dia';
        else if (currentView === 'semanal') viewLabel = 'semana';
        else if (currentView === 'mensal') viewLabel = 'mês';
        else if (currentView === 'anual') viewLabel = 'ano';

        if (percentage > 0) {
            expenseComparisonEl.textContent = `+${percentage}% em relação ao ${viewLabel} anterior`;
            expenseComparisonEl.className = "text-xs text-red-500 mt-auto font-medium";
        } else if (percentage < 0) {
            expenseComparisonEl.textContent = `${percentage}% gastos a menos que o ${viewLabel} anterior`;
            expenseComparisonEl.className = "text-xs text-green-500 mt-auto font-medium";
        } else {
            expenseComparisonEl.textContent = `Mesmo nível de gastos do ${viewLabel} anterior`;
            expenseComparisonEl.className = "text-xs text-gray-500 mt-auto";
        }
    }
}

// Dashboard Updates
function updateDashboard(filteredTransactions) {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else {
            expense += t.amount;
        }
    });

    const total = income - expense;

    totalIncomesEl.textContent = formatCurrency(income);
    totalExpensesEl.textContent = formatCurrency(expense);
    totalBalanceEl.textContent = formatCurrency(total);

    updateComparison(expense);
}

// Render Transactions
function renderTransactions(filteredTransactions) {
    transactionList.innerHTML = '';

    if (filteredTransactions.length === 0) {
        transactionList.parentElement.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    transactionList.parentElement.classList.remove('hidden');
    emptyState.classList.add('hidden');

    filteredTransactions.forEach(t => {
        const tr = document.createElement('tr');

        const amountColor = t.type === 'income' ? 'text-green-600' : 'text-red-600';
        const sign = t.type === 'income' ? '+' : '-';

        // Description
        const tdDesc = document.createElement('td');
        tdDesc.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
        tdDesc.textContent = t.description;

        // Amount
        const tdAmount = document.createElement('td');
        tdAmount.className = `px-6 py-4 whitespace-nowrap text-sm font-semibold ${amountColor}`;
        tdAmount.textContent = `${sign} ${formatCurrency(t.amount)}`;

        // Category
        const tdCat = document.createElement('td');
        tdCat.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
        const spanCat = document.createElement('span');
        spanCat.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
        spanCat.textContent = t.category;
        tdCat.appendChild(spanCat);

        // Date
        const tdDate = document.createElement('td');
        tdDate.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
        tdDate.textContent = formatDate(t.date);

        // Action
        const tdAction = document.createElement('td');
        tdAction.className = 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium';

        const editBtn = document.createElement('button');
        editBtn.className = 'text-blue-600 hover:text-blue-900 focus:outline-none mr-3';
        editBtn.title = 'Editar';
        editBtn.addEventListener('click', () => editTransaction(t.id));
        editBtn.innerHTML = `
            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-600 hover:text-red-900 focus:outline-none';
        deleteBtn.title = 'Remover';
        deleteBtn.addEventListener('click', () => deleteTransaction(t.id));
        deleteBtn.innerHTML = `
            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        `;

        tdAction.appendChild(editBtn);
        tdAction.appendChild(deleteBtn);

        tr.appendChild(tdDesc);
        tr.appendChild(tdAmount);
        tr.appendChild(tdCat);
        tr.appendChild(tdDate);
        tr.appendChild(tdAction);

        transactionList.appendChild(tr);
    });
}

function updateCategorySelect() {
    // Clear all existing options except the placeholder
    categorySelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';

    // Add dynamically loaded categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Master UI Update
function updateUI() {
    updateCategorySelect();

    periodLabel.textContent = formatPeriodLabel(currentDate, currentView);

    const { start, end } = getPeriodBounds(currentDate, currentView);

    const filteredTransactions = transactions.filter(t => {
        const tDate = parseDateLocal(t.date);
        return tDate >= start && tDate <= end;
    });

    updateDashboard(filteredTransactions);
    renderTransactions(filteredTransactions);
}

// Start app
document.addEventListener('DOMContentLoaded', init);
