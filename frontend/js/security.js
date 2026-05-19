/**
 * Security Dashboard - Asian Institute of Technology and Education
 * QR code scanning, gate access management, visitor verification
 */

// ========== STATE ==========
let activeVisitors = [];
let todayVisits = [];
let isScanning = false;
let scanInterval = null;

// ========== DOM ELEMENTS ==========
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const userDropdown = document.getElementById('userDropdown');
const userAvatar = document.getElementById('userAvatar');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

// Scanner elements
const scannerArea = document.getElementById('scannerArea');
const scannerOverlay = document.getElementById('scannerOverlay');
const manualQrInput = document.getElementById('manualQrInput');
const verifyBtn = document.getElementById('verifyBtn');
const scanResult = document.getElementById('scanResult');

// Active visitors elements
const activeVisitorsList = document.getElementById('activeVisitorsList');
const activeCountBadge = document.getElementById('activeCountBadge');

// Today's visits elements
const todayVisitsList = document.getElementById('todayVisitsList');
const todaySearch = document.getElementById('todaySearch');

// Settings
const themeOptions = document.querySelectorAll('.theme-option');

// ========== HELPER FUNCTIONS ==========
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#10b981';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
    localStorage.setItem('securityTheme', theme);
    
    themeOptions.forEach(opt => {
        if (opt.dataset.theme === theme) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('securityTheme') || 'light';
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
        scan: 'QR Scanner', 
        active: 'Active Visitors', 
        today: 'Today\'s Visits', 
        settings: 'Settings' 
    };
    pageTitle.textContent = titles[pageId] || 'QR Scanner';
    
    // Stop scanning when leaving scan page
    if (pageId !== 'scan' && scanInterval) {
        stopScanning();
    } else if (pageId === 'scan') {
        startScanning();
    }
}

// ========== SCANNER SIMULATION ==========
function startScanning() {
    if (scanInterval) return;
    isScanning = true;
    if (scannerOverlay) scannerOverlay.style.display = 'block';
    
    // Simulate scanning - in production, this would use camera API
    scanInterval = setInterval(() => {
        if (isScanning) {
            // For demo purposes, simulate random scan every 8 seconds
            // In production, this would be replaced with actual QR scanner
        }
    }, 1000);
}

function stopScanning() {
    isScanning = false;
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (scannerOverlay) scannerOverlay.style.display = 'none';
}

async function verifyQRCode(qrValue) {
    if (!qrValue) {
        showToast('Please enter or scan a QR code', 'error');
        return;
    }
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/security/verify', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ qrCode: qrValue })
    // });
    // const result = await response.json();
    
    console.log(`API: POST /api/security/verify - QR: ${qrValue}`);
    
    // Mock verification - REMOVE in production
    const mockResult = {
        valid: true,
        visitor: {
            name: 'John Doe',
            idNumber: 'STU-2024-001',
            host: 'Prof. Maria Santos',
            purpose: 'Parent-Teacher Meeting',
            date: new Date().toISOString().split('T')[0],
            time: '10:00 AM',
            status: 'pending'
        }
    };
    
    displayScanResult(mockResult);
}

function displayScanResult(result) {
    if (!scanResult) return;
    
    if (result.valid) {
        scanResult.className = 'scan-result valid';
        scanResult.innerHTML = `
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <div style="flex: 1;">
                    <h3><i class="fas fa-check-circle"></i> Valid QR Code</h3>
                    <p><strong>Visitor:</strong> ${escapeHtml(result.visitor.name)}</p>
                    <p><strong>ID Number:</strong> ${escapeHtml(result.visitor.idNumber)}</p>
                    <p><strong>Meeting with:</strong> ${escapeHtml(result.visitor.host)}</p>
                    <p><strong>Purpose:</strong> ${escapeHtml(result.visitor.purpose)}</p>
                    <p><strong>Date:</strong> ${result.visitor.date} at ${result.visitor.time}</p>
                </div>
                <div>
                    <button class="btn-primary" onclick="grantAccess('${escapeHtml(result.visitor.id)}')">
                        <i class="fas fa-door-open"></i> Grant Access
                    </button>
                </div>
            </div>
        `;
    } else {
        scanResult.className = 'scan-result invalid';
        scanResult.innerHTML = `
            <div style="display: flex; gap: 1rem;">
                <i class="fas fa-times-circle" style="font-size: 2rem;"></i>
                <div>
                    <h3>Invalid QR Code</h3>
                    <p>${escapeHtml(result.message || 'This QR code is not valid or has expired.')}</p>
                </div>
            </div>
        `;
    }
    scanResult.style.display = 'block';
    
    // Auto hide after 10 seconds
    setTimeout(() => {
        if (scanResult) scanResult.style.display = 'none';
    }, 10000);
}

async function grantAccess(visitorId) {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/security/grant-access', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ visitorId })
    // });
    
    console.log(`API: POST /api/security/grant-access - Visitor: ${visitorId}`);
    showToast('Access granted successfully', 'success');
    scanResult.style.display = 'none';
    fetchActiveVisitors();
    fetchTodayVisits();
    
    if (manualQrInput) manualQrInput.value = '';
}

// ========== RENDER ACTIVE VISITORS ==========
function renderActiveVisitors() {
    if (!activeVisitorsList) return;
    
    if (activeVisitors.length === 0) {
        activeVisitorsList.innerHTML = '<div class="empty-state"><i class="fas fa-door-open"></i><p>No active visitors</p></div>';
        if (activeCountBadge) activeCountBadge.textContent = '0';
        return;
    }
    
    if (activeCountBadge) activeCountBadge.textContent = activeVisitors.length;
    
    activeVisitorsList.innerHTML = activeVisitors.map(visitor => `
        <div class="visitor-card">
            <div class="visitor-info">
                <p><strong>${escapeHtml(visitor.name)}</strong> (${escapeHtml(visitor.idNumber || 'N/A')})</p>
                <p><i class="fas fa-chalkboard-user"></i> Meeting: ${escapeHtml(visitor.host)}</p>
                <p><i class="fas fa-clock"></i> Checked in: ${formatTime(visitor.checkInTime)}</p>
            </div>
            <div>
                <span class="visitor-status status-active">Active</span>
                <button class="btn-checkout" onclick="checkoutVisitor('${visitor.id}')">
                    <i class="fas fa-sign-out-alt"></i> Check Out
                </button>
            </div>
        </div>
    `).join('');
}

async function checkoutVisitor(visitorId) {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/security/checkout', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ visitorId })
    // });
    
    console.log(`API: POST /api/security/checkout - Visitor: ${visitorId}`);
    showToast('Visitor checked out successfully', 'success');
    fetchActiveVisitors();
    fetchTodayVisits();
}

// ========== RENDER TODAY'S VISITS ==========
function renderTodayVisits() {
    if (!todayVisitsList) return;
    
    let filtered = [...todayVisits];
    const searchTerm = todaySearch ? todaySearch.value.toLowerCase() : '';
    
    if (searchTerm) {
        filtered = filtered.filter(v => 
            v.name.toLowerCase().includes(searchTerm) || 
            (v.idNumber && v.idNumber.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filtered.length === 0) {
        todayVisitsList.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No visits scheduled for today</p></div>';
        return;
    }
    
    todayVisitsList.innerHTML = filtered.map(visitor => `
        <div class="visitor-card">
            <div class="visitor-info">
                <p><strong>${escapeHtml(visitor.name)}</strong> (${escapeHtml(visitor.idNumber || 'N/A')})</p>
                <p><i class="fas fa-chalkboard-user"></i> Meeting: ${escapeHtml(visitor.host)}</p>
                <p><i class="fas fa-calendar"></i> ${visitor.date} at ${visitor.time}</p>
                <p><i class="fas fa-comment"></i> ${escapeHtml(visitor.purpose || visitor.reason)}</p>
            </div>
            <div>
                <span class="visitor-status ${visitor.status === 'active' ? 'status-active' : 'status-pending'}">
                    ${visitor.status === 'active' ? 'Checked In' : 'Scheduled'}
                </span>
            </div>
        </div>
    `).join('');
}

// ========== API CALLS (Replace with your endpoints) ==========

async function fetchActiveVisitors() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/security/active');
    // const data = await response.json();
    // activeVisitors = data.visitors;
    // renderActiveVisitors();
    
    console.log('API: GET /api/security/active - Ready for integration');
    activeVisitors = [];
    renderActiveVisitors();
}

async function fetchTodayVisits() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/security/today');
    // const data = await response.json();
    // todayVisits = data.visits;
    // renderTodayVisits();
    
    console.log('API: GET /api/security/today - Ready for integration');
    todayVisits = [];
    renderTodayVisits();
}

// ========== EVENT HANDLERS ==========
function handleVerify() {
    const qrValue = manualQrInput ? manualQrInput.value.trim() : '';
    verifyQRCode(qrValue);
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
    
    // Scanner buttons
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleVerify);
    }
    
    if (manualQrInput) {
        manualQrInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleVerify();
        });
    }
    
    // Today visits search
    if (todaySearch) {
        todaySearch.addEventListener('input', renderTodayVisits);
    }
    
    // Start scanning on load
    startScanning();
    
    // Load data
    fetchActiveVisitors();
    fetchTodayVisits();
}

// Make functions global for onclick handlers
window.grantAccess = grantAccess;
window.checkoutVisitor = checkoutVisitor;

init();