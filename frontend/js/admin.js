/**
 * Admin Dashboard - Asian Institute of Technology and Education
 * Manage visitor passes, approve requests, view analytics
 */

// ========== STATE ==========
let pendingRequests = [];
let allVisitors = [];
let recentActivities = [];
let currentStats = {
    total: 0,
    pending: 0,
    approvedToday: 0,
    active: 0
};

// ========== DOM ELEMENTS ==========
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const userDropdown = document.getElementById('userDropdown');
const userAvatar = document.getElementById('userAvatar');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

// Stats elements
const totalVisitorsEl = document.getElementById('totalVisitors');
const pendingCountEl = document.getElementById('pendingCount');
const approvedTodayEl = document.getElementById('approvedToday');
const activePassesEl = document.getElementById('activePasses');
const pendingBadge = document.getElementById('pendingBadge');

// Page elements
const recentActivityEl = document.getElementById('recentActivity');
const pendingRequestsList = document.getElementById('pendingRequestsList');
const visitorsTableBody = document.getElementById('visitorsTableBody');
const weeklyCountEl = document.getElementById('weeklyCount');
const monthlyCountEl = document.getElementById('monthlyCount');
const approvalRateEl = document.getElementById('approvalRate');
const refreshBtn = document.getElementById('refreshBtn');
const pendingSearch = document.getElementById('pendingSearch');
const visitorSearch = document.getElementById('visitorSearch');
const statusFilter = document.getElementById('statusFilter');
const exportCSV = document.getElementById('exportCSV');
const exportPDF = document.getElementById('exportPDF');

// Settings
const themeOptions = document.querySelectorAll('.theme-option');
const emailNotif = document.getElementById('emailNotif');

// ========== HELPER FUNCTIONS ==========


function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== THEME MANAGEMENT ==========
function setTheme(theme) {
    if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('adminTheme', theme);
    
    themeOptions.forEach(opt => {
        if (opt.dataset.theme === theme) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('adminTheme') || 'light';
    setTheme(savedTheme);
}

// ========== NAVIGATION ==========
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageId}Page`).classList.add('active');
    
    navItems.forEach(item => {
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    const titles = { 
        dashboard: 'Dashboard', 
        requests: 'Pending Requests', 
        visitors: 'All Visitors', 
        reports: 'Reports', 
        settings: 'Settings' 
    };
    pageTitle.textContent = titles[pageId] || 'Dashboard';
}

// ========== UPDATE STATS UI ==========
function updateStatsUI() {
    totalVisitorsEl.textContent = currentStats.total;
    pendingCountEl.textContent = currentStats.pending;
    approvedTodayEl.textContent = currentStats.approvedToday;
    activePassesEl.textContent = currentStats.active;
    if (pendingBadge) pendingBadge.textContent = currentStats.pending;
}

// ========== RENDER RECENT ACTIVITY ==========
function renderRecentActivity() {
    if (!recentActivityEl) return;
    
    if (recentActivities.length === 0) {
        recentActivityEl.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent activity</p></div>';
        return;
    }
    
    recentActivityEl.innerHTML = recentActivities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <p><strong>${escapeHtml(activity.title)}</strong> - ${escapeHtml(activity.description)}</p>
                <span class="activity-time">${getRelativeTime(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

// ========== RENDER PENDING REQUESTS ==========
function renderPendingRequests() {
    if (!pendingRequestsList) return;
    
    let filtered = [...pendingRequests];
    const searchTerm = pendingSearch ? pendingSearch.value.toLowerCase() : '';
    
    if (searchTerm) {
        filtered = filtered.filter(req => 
            req.name.toLowerCase().includes(searchTerm) || 
            (req.idNumber && req.idNumber.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filtered.length === 0) {
        pendingRequestsList.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No pending requests</p></div>';
        return;
    }
    
    pendingRequestsList.innerHTML = filtered.map(req => `
        <div class="request-card" data-id="${req.id}">
            <div class="request-info">
                <p><strong>${escapeHtml(req.name)}</strong> (ID: ${escapeHtml(req.idNumber || 'N/A')})</p>
                <p><i class="fas fa-chalkboard-user"></i> Meeting: ${escapeHtml(req.host)}</p>
                <p><i class="fas fa-calendar"></i> ${formatDate(req.date)} at ${req.time}</p>
                <p><i class="fas fa-comment"></i> Reason: ${escapeHtml(req.reason)}</p>
            </div>
            <div class="request-actions">
                <button class="action-btn approve-btn" onclick="approveRequest('${req.id}')" title="Approve">
                    <i class="fas fa-check-circle"></i> Approve
                </button>
                <button class="action-btn reject-btn" onclick="rejectRequest('${req.id}')" title="Reject">
                    <i class="fas fa-times-circle"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

// ========== RENDER ALL VISITORS TABLE ==========
function renderVisitorsTable() {
    if (!visitorsTableBody) return;
    
    let filtered = [...allVisitors];
    const searchTerm = visitorSearch ? visitorSearch.value.toLowerCase() : '';
    const status = statusFilter ? statusFilter.value : 'all';
    
    if (searchTerm) {
        filtered = filtered.filter(v => 
            v.name.toLowerCase().includes(searchTerm) || 
            (v.idNumber && v.idNumber.toLowerCase().includes(searchTerm))
        );
    }
    
    if (status !== 'all') {
        filtered = filtered.filter(v => v.status === status);
    }
    
    if (filtered.length === 0) {
        visitorsTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No visitors found</td></tr>';
        return;
    }
    
    visitorsTableBody.innerHTML = filtered.map(v => {
        let statusClass = '';
        let statusText = '';
        switch(v.status) {
            case 'active': statusClass = 'status-active'; statusText = 'Active'; break;
            case 'pending': statusClass = 'status-pending'; statusText = 'Pending'; break;
            case 'completed': statusClass = 'status-completed'; statusText = 'Completed'; break;
            default: statusClass = 'status-expired'; statusText = 'Expired';
        }
        
        return `
            <tr>
                <td>${escapeHtml(v.name)}</td>
                <td>${escapeHtml(v.idNumber || 'N/A')}</td>
                <td>${escapeHtml(v.host || 'N/A')}</td>
                <td>${formatDate(v.date)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn" onclick="viewVisitorDetails('${v.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ========== UPDATE REPORTS ==========
function updateReports() {
    if (!weeklyCountEl) return;
    
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    
    const weekly = allVisitors.filter(v => new Date(v.requestedAt) >= weekAgo).length;
    const monthly = allVisitors.filter(v => new Date(v.requestedAt) >= monthAgo).length;
    const approved = allVisitors.filter(v => v.status === 'active' || v.status === 'completed').length;
    const total = allVisitors.length || 1;
    const rate = Math.round((approved / total) * 100);
    
    weeklyCountEl.textContent = weekly;
    monthlyCountEl.textContent = monthly;
    approvalRateEl.textContent = `${rate}%`;
}

// ========== API CALLS (Replace with your endpoints) ==========

async function fetchStats() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/admin/stats');
    // const data = await response.json();
    // currentStats = data;
    // updateStatsUI();
    
    console.log('API: GET /api/admin/stats - Ready for integration');
    
    // Mock data for demo - REMOVE in production
    currentStats = { total: 0, pending: 0, approvedToday: 0, active: 0 };
    updateStatsUI();
}

async function fetchPendingRequests() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/admin/pending');
    // const data = await response.json();
    // pendingRequests = data.requests;
    // renderPendingRequests();
    
    console.log('API: GET /api/admin/pending - Ready for integration');
    pendingRequests = [];
    renderPendingRequests();
}

async function fetchAllVisitors() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/admin/visitors');
    // const data = await response.json();
    // allVisitors = data.visitors;
    // renderVisitorsTable();
    // updateReports();
    
    console.log('API: GET /api/admin/visitors - Ready for integration');
    allVisitors = [];
    renderVisitorsTable();
    updateReports();
}

async function fetchRecentActivity() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/admin/activity');
    // const data = await response.json();
    // recentActivities = data.activities;
    // renderRecentActivity();
    
    console.log('API: GET /api/admin/activity - Ready for integration');
    recentActivities = [];
    renderRecentActivity();
}

async function approveRequest(requestId) {
    // TODO: Replace with actual API
    // const response = await fetch(`/api/admin/approve/${requestId}`, { method: 'POST' });
    // const result = await response.json();
    
    console.log(`API: POST /api/admin/approve/${requestId} - Ready for integration`);
    showToast(`Request approved successfully`, 'success');
    
    // Remove from pending and refresh
    pendingRequests = pendingRequests.filter(r => r.id !== requestId);
    renderPendingRequests();
    fetchStats();
    fetchAllVisitors();
    fetchRecentActivity();
}

async function rejectRequest(requestId) {
    // TODO: Replace with actual API
    // const response = await fetch(`/api/admin/reject/${requestId}`, { method: 'POST' });
    // const result = await response.json();
    
    console.log(`API: POST /api/admin/reject/${requestId} - Ready for integration`);
    showToast(`Request rejected`, 'error');
    
    pendingRequests = pendingRequests.filter(r => r.id !== requestId);
    renderPendingRequests();
    fetchStats();
}

async function viewVisitorDetails(visitorId) {
    // TODO: Navigate to details page or show modal
    console.log(`View details for visitor: ${visitorId}`);
    showToast(`Viewing details for visitor ID: ${visitorId}`, 'info');
}

async function exportData(format) {
    // TODO: Implement export functionality
    console.log(`Exporting data as ${format}`);
    showToast(`Exporting as ${format.toUpperCase()}...`, 'success');
}

// ========== EVENT HANDLERS ==========
function handleRefresh() {
    fetchStats();
    fetchPendingRequests();
    fetchAllVisitors();
    fetchRecentActivity();
    showToast('Dashboard refreshed', 'success');
}

// ========== INITIALIZATION ==========
function init() {
    loadTheme();
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
    
    // User dropdown
    if (userAvatar) {
        userAvatar.addEventListener('click', () => {
            userDropdown.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (userAvatar && !userAvatar.contains(e.target) && userDropdown && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            setTheme(opt.dataset.theme);
        });
    });
    
    // Mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
    
    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }
    
    // Search and filter
    if (pendingSearch) {
        pendingSearch.addEventListener('input', renderPendingRequests);
    }
    if (visitorSearch) {
        visitorSearch.addEventListener('input', renderVisitorsTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderVisitorsTable);
    }
    
    // Export buttons
    if (exportCSV) {
        exportCSV.addEventListener('click', () => exportData('csv'));
    }
    if (exportPDF) {
        exportPDF.addEventListener('click', () => exportData('pdf'));
    }
    
    // Load all data
    fetchStats();
    fetchPendingRequests();
    fetchAllVisitors();
    fetchRecentActivity();
}

// Make functions global for onclick handlers
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.viewVisitorDetails = viewVisitorDetails;

init();