// DOM Elements
const modal = document.getElementById('transaction-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const form = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const emptyState = document.getElementById('empty-state');

const totalIncomesEl = document.getElementById('total-incomes');
const totalExpensesEl = document.getElementById('total-expenses');
const totalBalanceEl = document.getElementById('total-balance');

// Data state
let transactions = [];

// Initialize App
function init() {
    loadTransactions();
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

// Event Listeners for Modal
openModalBtn.addEventListener('click', () => toggleModal(true));
closeModalBtn.addEventListener('click', () => toggleModal(false));
cancelBtn.addEventListener('click', () => toggleModal(false));
modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
});

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

        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${t.description}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${amountColor}">
                ${sign} ${formatCurrency(t.amount)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    ${t.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(t.date)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button onclick="deleteTransaction('${t.id}')" class="text-red-600 hover:text-red-900 focus:outline-none" title="Remover">
                    <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        `;
        transactionList.appendChild(tr);
    });
}

// Master UI Update
function updateUI() {
    updateDashboard();
    renderTransactions();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
