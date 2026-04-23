// API Configuration
const API_BASE = 'https://taskmanagementapp-production-4510.up.railway.app';
let authToken = localStorage.getItem('token');
let currentSkip = 0;
let currentLimit = 10;
let totalTasks = 0;

// Check if already logged in
if (authToken) {
    showTasksSection();
    loadTasks();
}

// Show/Hide Tabs
function showTab(tab) {
    // Hide all tabs
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else if (tab === 'register') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerTab').classList.add('active');
    }
}

// Show Forgot Password Form
function showForgotPassword() {
    // Hide all tabs
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('forgotPasswordForm').classList.remove('active');
    
    // Show forgot password form
    document.getElementById('forgotPasswordForm').classList.add('active');
}

// Show message toast
function showMessage(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Register User
async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            showTab('login');
            document.getElementById('regUsername').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
        } else {
            showMessage(data.detail || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Is the server running?', 'error');
    }
}

// Login User
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.access_token;
            localStorage.setItem('token', authToken);
            showMessage('Login successful!', 'success');
            showTasksSection();
            currentSkip = 0;
            loadTasks();
        } else {
            showMessage(data.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Is the server running?', 'error');
    }
}

// Forgot Password
async function forgotPassword() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        showMessage('Please enter your email', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Reset link sent! Check console for token', 'success');
            console.log('Reset token:', data.reset_token);
            console.log('Reset link:', data.reset_link);
        } else {
            showMessage(data.detail || 'Failed to send reset link', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    authToken = null;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('tasksSection').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// Show tasks section
function showTasksSection() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('tasksSection').style.display = 'block';
}

// Load tasks with pagination
async function loadTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '<div class="loading">Loading tasks...</div>';
    
    try {
        const url = `${API_BASE}/tasks/alltasks?skip=${currentSkip}&limit=${currentLimit}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayTasks(data.data);
            if (data.pagination) {
                totalTasks = data.pagination.total;
                updatePaginationUI(data.pagination);
            }
        } else if (response.status === 401) {
            tasksList.innerHTML = '<p>Session expired. Please login again.</p>';
            logout();
        } else {
            tasksList.innerHTML = '<p>Failed to load tasks</p>';
        }
    } catch (error) {
        tasksList.innerHTML = '<p>Network error loading tasks</p>';
    }
}

// Display tasks
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<p>✨ No tasks yet. Create your first task!</p>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-title ${task.completed ? 'completed' : ''}">
                ${escapeHtml(task.title)}
                <small style="color:#718096;">ID: ${task.id}</small>
            </div>
            <div class="task-description">${escapeHtml(task.description)}</div>
            <div class="task-datetime" style="font-size: 11px; color: #a0aec0; margin-bottom: 8px;">
                Created: ${formatDate(task.created_at)}
                ${task.updated_at ? ` | Updated: ${formatDate(task.updated_at)}` : ''}
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleComplete(${task.id}, ${!task.completed})">
                    ${task.completed ? '↺ Mark Incomplete' : '✓ Mark Complete'}
                </button>
                <button class="edit-btn" onclick="editTask(${task.id})">✎ Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString();
    } catch (e) {
        return dateString;
    }
}

// Update pagination UI
function updatePaginationUI(pagination) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    pageInfo.textContent = `Page ${pagination.current_page} of ${pagination.total_pages} (${totalTasks} tasks)`;
    prevBtn.disabled = pagination.previous_skip === null;
    nextBtn.disabled = pagination.next_skip === null;
}

// Pagination functions
function nextPage() {
    currentSkip += currentLimit;
    loadTasks();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

function prevPage() {
    currentSkip -= currentLimit;
    if (currentSkip < 0) currentSkip = 0;
    loadTasks();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

function changeLimit() {
    currentLimit = parseInt(document.getElementById('limitSelect').value);
    currentSkip = 0;
    loadTasks();
}

// Create task
async function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const completed = document.getElementById('taskCompleted').checked;
    
    if (!title.trim()) {
        showMessage('Please enter a task title', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, completed })
        });
        
        if (response.ok) {
            showMessage('Task created successfully!', 'success');
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDesc').value = '';
            document.getElementById('taskCompleted').checked = false;
            currentSkip = 0;
            loadTasks();
        } else {
            const data = await response.json();
            showMessage(data.detail || 'Failed to create task', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/tasks/task/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            showMessage('Task deleted!', 'success');
            loadTasks();
        } else {
            showMessage('Failed to delete', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Toggle complete status
async function toggleComplete(taskId, completed) {
    try {
        const getResponse = await fetch(`${API_BASE}/tasks/task/${taskId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const task = await getResponse.json();
        
        if (getResponse.ok && task.data) {
            await fetch(`${API_BASE}/tasks/task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: task.data.title,
                    description: task.data.description,
                    completed: completed
                })
            });
            loadTasks();
        }
    } catch (error) {
        showMessage('Error updating task', 'error');
    }
}

// Edit task
async function editTask(taskId) {
    const newTitle = prompt('Enter new title:');
    if (!newTitle) return;
    
    const newDescription = prompt('Enter new description:');
    
    try {
        const response = await fetch(`${API_BASE}/tasks/task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription || '',
                completed: false
            })
        });
        
        if (response.ok) {
            showMessage('Task updated!', 'success');
            loadTasks();
        } else {
            showMessage('Update failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}