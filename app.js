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

// Data state
let transactions = [];
const defaultCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Outros'];
let categories = [];

// Initialize App
function init() {
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
openModalBtn.addEventListener('click', () => toggleModal(true));
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

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const category = document.getElementById('category').value;

    const newTransaction = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        description,
        amount,
        date,
        type,
        category
    };

    transactions.push(newTransaction);
    // Sort transactions by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveTransactions();
    updateUI();
    toggleModal(false);
});

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

// Dashboard Updates
function updateDashboard() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
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
}

// Render Transactions
function renderTransactions() {
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        transactionList.parentElement.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    transactionList.parentElement.classList.remove('hidden');
    emptyState.classList.add('hidden');

    transactions.forEach(t => {
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
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-600 hover:text-red-900 focus:outline-none';
        deleteBtn.title = 'Remover';
        deleteBtn.addEventListener('click', () => deleteTransaction(t.id));
        deleteBtn.innerHTML = `
            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        `;
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
    updateDashboard();
    renderTransactions();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
