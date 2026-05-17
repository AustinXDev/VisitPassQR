/**
 * Royal Academy QR Visitor System
 * Separate pages: Landing (Home), History, Settings
 * Data pulled from database - endpoints ready
 */

// ========== STATE ==========
let currentUser = {
    id: null,
    name: '',
    email: '',
    phone: '',
    idNumber: ''
};

let activeQR = null;
let visitHistory = [];
let pendingRequests = [];
let uploadedFile = null;

// ========== DOM ELEMENTS ==========
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const userDropdown = document.getElementById('userDropdown');
const userAvatar = document.getElementById('userAvatar');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

// Dashboard elements
const totalVisitsEl = document.getElementById('totalVisits');
const activeQRCountEl = document.getElementById('activeQRCount');
const pendingRequestsEl = document.getElementById('pendingRequests');
const completedVisitsEl = document.getElementById('completedVisits');
const qrStatusBadge = document.getElementById('qrStatusBadge');
const activeQRDisplay = document.getElementById('activeQRDisplay');
const requestForm = document.getElementById('requestForm');
const requestPassBtn = document.getElementById('requestPassBtn');
const requestBlockedMessage = document.getElementById('requestBlockedMessage');

// Form inputs
const visitorName = document.getElementById('visitorName');
const visitorIdNumber = document.getElementById('visitorIdNumber');
const visitorEmail = document.getElementById('visitorEmail');
const visitorPhone = document.getElementById('visitorPhone');
const visitorHost = document.getElementById('visitorHost');
const visitorDepartment = document.getElementById('visitorDepartment');
const visitDate = document.getElementById('visitDate');
const visitTime = document.getElementById('visitTime');
const visitReason = document.getElementById('visitReason');
const visitPurpose = document.getElementById('visitPurpose');

// ID Upload elements
const idUpload = document.getElementById('idUpload');
const idUploadArea = document.getElementById('idUploadArea');
const idUploadPlaceholder = document.getElementById('idUploadPlaceholder');
const idPreview = document.getElementById('idPreview');
const idPreviewImage = document.getElementById('idPreviewImage');
const idFileName = document.getElementById('idFileName');
const removeIdBtn = document.getElementById('removeIdBtn');
const verificationStatus = document.getElementById('verificationStatus');

// History elements
const historyList = document.getElementById('historyList');
const historySearch = document.getElementById('historySearch');
const historyFilter = document.getElementById('historyFilter');

// Settings elements
const themeOptions = document.querySelectorAll('.theme-option');
const emailNotif = document.getElementById('emailNotif');
const smsNotif = document.getElementById('smsNotif');

// ========== HELPER FUNCTIONS ==========
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#7c3aed';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(name) {
    if (!name) return 'S';
    return name.charAt(0).toUpperCase();
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
    localStorage.setItem('theme', theme);
    
    themeOptions.forEach(opt => {
        if (opt.dataset.theme === theme) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
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
    
    const titles = { landing: 'Home', history: 'Visit History', settings: 'Settings' };
    pageTitle.textContent = titles[pageId] || 'Home';
}

// ========== ID UPLOAD HANDLERS ==========
idUploadArea.addEventListener('click', () => {
    idUpload.click();
});

idUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }
        uploadedFile = file;
        idFileName.textContent = file.name;
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                idPreviewImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
        
        idUploadPlaceholder.style.display = 'none';
        idPreview.style.display = 'flex';
        verificationStatus.style.display = 'flex';
    }
});

removeIdBtn.addEventListener('click', () => {
    uploadedFile = null;
    idUpload.value = '';
    idUploadPlaceholder.style.display = 'block';
    idPreview.style.display = 'none';
    verificationStatus.style.display = 'none';
});

// ========== UPDATE DASHBOARD UI ==========
function updateDashboardUI() {
    const total = visitHistory.length + (activeQR ? 1 : 0) + pendingRequests.length;
    totalVisitsEl.textContent = total;
    activeQRCountEl.textContent = activeQR ? 1 : 0;
    pendingRequestsEl.textContent = pendingRequests.length;
    completedVisitsEl.textContent = visitHistory.filter(v => v.status === 'completed').length;
    
    if (activeQR && activeQR.status === 'active') {
        qrStatusBadge.textContent = 'Active ✓';
        qrStatusBadge.className = 'status-badge active';
        
        activeQRDisplay.innerHTML = `
            <div class="active-qr-card">
                <div class="qr-image">
                    <img src="${escapeHtml(activeQR.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=placeholder')}" alt="QR Code">
                </div>
                <div class="pass-info">
                    <p><i class="fas fa-user"></i> <strong>${escapeHtml(activeQR.visitorName)}</strong></p>
                    <p><i class="fas fa-id-card"></i> ID: ${escapeHtml(activeQR.idNumber || 'N/A')}</p>
                    <p><i class="fas fa-chalkboard-user"></i> Meeting: ${escapeHtml(activeQR.host)}</p>
                    <p><i class="fas fa-calendar-day"></i> ${formatDate(activeQR.date)} at ${activeQR.time}</p>
                    <p><i class="fas fa-comment"></i> ${escapeHtml(activeQR.reason)}</p>
                </div>
            </div>
        `;
        
        requestPassBtn.disabled = true;
        requestPassBtn.style.opacity = '0.5';
        requestPassBtn.style.cursor = 'not-allowed';
        requestBlockedMessage.style.display = 'flex';
    } else {
        qrStatusBadge.textContent = 'No active pass';
        qrStatusBadge.className = 'status-badge';
        
        activeQRDisplay.innerHTML = `
            <div class="empty-pass">
                <i class="fas fa-qrcode"></i>
                <p>No active QR pass</p>
                <small>Request a new pass below</small>
            </div>
        `;
        
        requestPassBtn.disabled = false;
        requestPassBtn.style.opacity = '1';
        requestPassBtn.style.cursor = 'pointer';
        requestBlockedMessage.style.display = 'none';
    }
}

// ========== RENDER HISTORY ==========
function renderHistory() {
    let filtered = [...visitHistory, ...pendingRequests];
    
    const searchTerm = historySearch.value.toLowerCase();
    const filterValue = historyFilter.value;
    
    filtered = filtered.filter(item => {
        const matchesSearch = (item.visitorName?.toLowerCase().includes(searchTerm) || 
                              item.host?.toLowerCase().includes(searchTerm) ||
                              item.reason?.toLowerCase().includes(searchTerm));
        const matchesFilter = filterValue === 'all' || item.status === filterValue;
        return matchesSearch && matchesFilter;
    });
    
    if (filtered.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>No visit history yet</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = filtered.map(item => {
        let statusClass = '';
        if (item.status === 'active') statusClass = 'active';
        else if (item.status === 'pending') statusClass = 'pending';
        else if (item.status === 'completed') statusClass = 'completed';
        else statusClass = 'expired';
        
        return `
            <div class="history-item">
                <div class="history-info">
                    <h4>${escapeHtml(item.visitorName)}</h4>
                    <p><i class="fas fa-chalkboard-user"></i> Meeting: ${escapeHtml(item.host)}</p>
                    <p><i class="fas fa-calendar-day"></i> ${formatDate(item.date)} at ${item.time}</p>
                    <p><i class="fas fa-comment"></i> ${escapeHtml(item.reason)}</p>
                </div>
                <span class="history-status ${statusClass}">${item.status.toUpperCase()}</span>
            </div>
        `;
    }).join('');
}

// ========== API CALLS (Replace with your endpoints) ==========

async function fetchUserProfile() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/user/profile');
    // const data = await response.json();
    // currentUser = data.user;
    // Update form fields
    
    console.log('API: GET /api/user/profile - Ready for integration');
}

async function fetchActiveQR() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/visitor/active');
    // const data = await response.json();
    // activeQR = data.qr;
    // updateDashboardUI();
    
    console.log('API: GET /api/visitor/active - Ready for integration');
    updateDashboardUI();
}

async function fetchHistory() {
    // TODO: Replace with actual API
    // const response = await fetch('/api/visitor/history');
    // const data = await response.json();
    // visitHistory = data.history;
    // pendingRequests = data.pending;
    // renderHistory();
    // updateDashboardUI();
    
    console.log('API: GET /api/visitor/history - Ready for integration');
    renderHistory();
    updateDashboardUI();
}

async function submitRequest(formData) {
    // TODO: Replace with actual API
    // const formDataToSend = new FormData();
    // formDataToSend.append('data', JSON.stringify(formData));
    // if (uploadedFile) formDataToSend.append('idImage', uploadedFile);
    // const response = await fetch('/api/visitor/request', {
    //     method: 'POST',
    //     body: formDataToSend
    // });
    // return await response.json();
    
    console.log('API: POST /api/visitor/request', formData);
    return { success: true, message: 'Request submitted successfully' };
}

// ========== EVENT HANDLERS ==========

async function handleSubmitRequest(event) {
    event.preventDefault();
    
    const host = visitorHost.value.trim();
    if (!host) {
        showToast('Please enter who you are meeting', 'error');
        return;
    }
    
    const date = visitDate.value;
    if (!date) {
        showToast('Please select visit date', 'error');
        return;
    }
    
    const time = visitTime.value;
    if (!time) {
        showToast('Please select visit time', 'error');
        return;
    }
    
    const reason = visitReason.value;
    if (!reason) {
        showToast('Please select a reason for visit', 'error');
        return;
    }
    
    if (!uploadedFile) {
        showToast('Please upload your school ID', 'error');
        return;
    }
    
    const formData = {
        name: visitorName.value,
        idNumber: visitorIdNumber.value,
        email: visitorEmail.value,
        phone: visitorPhone.value,
        host: host,
        department: visitorDepartment.value,
        date: date,
        time: time,
        reason: reason,
        purpose: visitPurpose.value,
        requestedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    requestPassBtn.disabled = true;
    requestPassBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        const result = await submitRequest(formData);
        if (result.success) {
            showToast('Request submitted successfully!', 'success');
            
            visitorHost.value = '';
            visitorDepartment.value = '';
            visitDate.value = '';
            visitTime.value = '';
            visitReason.value = '';
            visitPurpose.value = '';
            
            uploadedFile = null;
            idUpload.value = '';
            idUploadPlaceholder.style.display = 'block';
            idPreview.style.display = 'none';
            verificationStatus.style.display = 'none';
            
            await fetchActiveQR();
            await fetchHistory();
        } else {
            showToast(result.message || 'Failed to submit request', 'error');
        }
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
    } finally {
        requestPassBtn.disabled = false;
        requestPassBtn.innerHTML = '<i class="fas fa-qrcode"></i> Request School Pass';
    }
}

// ========== INITIALIZATION ==========
function init() {
    loadTheme();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (visitDate) visitDate.value = today;
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
    
    // User dropdown
    userAvatar.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.user-dropdown a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
            userDropdown.classList.remove('show');
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
    
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            setTheme(opt.dataset.theme);
        });
    });
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    requestForm.addEventListener('submit', handleSubmitRequest);
    
    historySearch.addEventListener('input', renderHistory);
    historyFilter.addEventListener('change', renderHistory);
    
    fetchUserProfile();
    fetchActiveQR();
    fetchHistory();
}

init();