// ===== STATE MANAGEMENT =====
const planPrices = { 'Basic': 1000, 'Premium': 2000, 'VIP': 2500 };

let members = JSON.parse(localStorage.getItem('fittrack_members')) || [];
let transactions = JSON.parse(localStorage.getItem('fittrack_transactions')) || [];

// Seed initial data if empty for demonstration
if (members.length === 0) {
    members = [
        { id: 1, name: "Juan Dela Cruz", email: "juan@example.com", phone: "09171234567", plan: "Premium", payment: "GCash", start: "2026-08-01", end: "2026-09-01", status: "Active" },
        { id: 2, name: "Maria Clara", email: "maria@example.com", phone: "09187654321", plan: "Basic", payment: "Cash", start: "2026-07-15", end: "2026-08-15", status: "Expired" }
    ];
    localStorage.setItem('fittrack_members', JSON.stringify(members));
    
    transactions = [
        { id: "TXN-1001", memberName: "Juan Dela Cruz", plan: "Premium", amount: 2000, method: "GCash", date: "2026-08-01", status: "Success" },
        { id: "TXN-1002", memberName: "Maria Clara", plan: "Basic", amount: 1000, method: "Cash", date: "2026-07-15", status: "Success" }
    ];
    localStorage.setItem('fittrack_transactions', JSON.stringify(transactions));
}

let growthChartInstance = null;
let planChartInstance = null;

// ===== NAVIGATION =====
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const page = link.getAttribute('data-page');
        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(page).classList.add('active');
        
        // Update header title
        const titleMap = {
            'dashboard': 'Dashboard',
            'members': 'Members List',
            'add-member': 'Add New Member',
            'transactions': 'Transaction History',
            'plans': 'Membership Plans'
        };
        document.getElementById('pageTitle').textContent = titleMap[page] || 'Dashboard';
        document.getElementById('pageSubtitle').textContent = page === 'dashboard' ? 'Overview of gym activity and performance' : `Manage your gym ${page.replace('-', ' ')}`;

        if (page === 'dashboard') updateDashboard();
        if (page === 'members') renderMembers();
        if (page === 'transactions') renderTransactions();
    });
});

// ===== ADD MEMBER FORM =====
function updatePricePreview() {
    const plan = document.getElementById('fPlan').value;
    document.getElementById('pricePreview').innerHTML = `Total Amount: <strong>₱${planPrices[plan].toLocaleString()}</strong>`;
}

document.getElementById('addForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('fName').value;
    const email = document.getElementById('fEmail').value;
    const phone = document.getElementById('fPhone').value;
    const plan = document.getElementById('fPlan').value;
    const payment = document.getElementById('fPayment').value;
    const start = document.getElementById('fStart').value;
    const end = document.getElementById('fEnd').value;

    const newMember = {
        id: Date.now(),
        name, email, phone, plan, payment, start, end,
        status: new Date(end) >= new Date() ? 'Active' : 'Expired'
    };
    
    members.push(newMember);
    localStorage.setItem('fittrack_members', JSON.stringify(members));

    const txn = {
        id: 'TXN-' + Date.now().toString().slice(-6),
        memberName: name,
        plan,
        amount: planPrices[plan],
        method: payment,
        date: start,
        status: 'Success'
    };
    
    transactions.push(txn);
    localStorage.setItem('fittrack_transactions', JSON.stringify(transactions));

    alert('✅ Member added successfully!');
    e.target.reset();
    
    // Reset dates to default
    setDefaultDates();
    updatePricePreview();
    
    // Refresh views
    renderMembers();
    renderTransactions();
    updateDashboard();
});

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fStart').value = today;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('fEnd').value = nextMonth.toISOString().split('T')[0];
}

// ===== MEMBERS TABLE =====
function renderMembers() {
    const tbody = document.getElementById('membersTable');
    const search = document.getElementById('searchBar').value.toLowerCase();
    const filter = document.getElementById('statusFilter').value;
    tbody.innerHTML = '';

    const filtered = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search) || m.email.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || m.status === filter;
        return matchesSearch && matchesFilter;
    });

    filtered.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.name}</td>
            <td>${m.email}</td>
            <td><span class="plan-badge">${m.plan}</span></td>
            <td><span class="payment-badge">${m.payment}</span></td>
            <td>${m.start}</td>
            <td>${m.end}</td>
            <td><span class="status ${m.status}">${m.status}</span></td>
            <td class="action-btns">
                <button class="btn-sm btn-del" onclick="deleteMember(${m.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('searchBar').addEventListener('input', renderMembers);
document.getElementById('statusFilter').addEventListener('change', renderMembers);

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        members = members.filter(m => m.id !== id);
        localStorage.setItem('fittrack_members', JSON.stringify(members));
        renderMembers();
        updateDashboard();
    }
}

// ===== TRANSACTIONS TABLE =====
function renderTransactions() {
    const tbody = document.getElementById('transactionsTable');
    const search = document.getElementById('txnSearch').value.toLowerCase();
    tbody.innerHTML = '';

    const filtered = transactions.filter(t => 
        t.memberName.toLowerCase().includes(search) || t.id.toLowerCase().includes(search)
    );

    filtered.slice().reverse().forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.id}</td>
            <td>${t.memberName}</td>
            <td>${t.plan}</td>
            <td>₱${t.amount.toLocaleString()}</td>
            <td>${t.method}</td>
            <td>${t.date}</td>
            <td><span class="txn-success">${t.status}</span></td>
            <td class="action-btns">
                <button class="btn-sm btn-del" onclick="deleteTxn('${t.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('txnSearch').addEventListener('input', renderTransactions);

function deleteTxn(id) {
    if (confirm('Delete this transaction record?')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('fittrack_transactions', JSON.stringify(transactions));
        renderTransactions();
        updateDashboard();
    }
}

// ===== DASHBOARD & CHARTS =====
function updateDashboard() {
    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Expiring in 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const expiring = members.filter(m => {
        const endDate = new Date(m.end);
        return endDate >= now && endDate <= sevenDaysFromNow;
    }).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statRevenue').textContent = '₱' + revenue.toLocaleString();
    document.getElementById('statExpiring').textContent = expiring;

    renderCharts();
}

function renderCharts() {
    const ctxGrowth = document.getElementById('growthChart');
    const ctxPlan = document.getElementById('planChart');

    if (growthChartInstance) growthChartInstance.destroy();
    if (planChartInstance) planChartInstance.destroy();

    // Mock growth data (simplified logic for demo)
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const growthData = [12, 15, 22, 28, 32, members.length > 32 ? members.length : 35]; 

    growthChartInstance = new Chart(ctxGrowth, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Total Members',
                data: growthData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const plans = { 'Basic': 0, 'Premium': 0, 'VIP': 0 };
    members.forEach(m => { if (plans[m.plan] !== undefined) plans[m.plan]++; });

    planChartInstance = new Chart(ctxPlan, {
        type: 'doughnut',
        data: {
            labels: Object.keys(plans),
            datasets: [{
                data: Object.values(plans),
                backgroundColor: ['#3498db', '#9b59b6', '#f1c40f'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    updatePricePreview();
    renderMembers();
    renderTransactions();
    updateDashboard();
});
