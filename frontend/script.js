// API Configuration
const API_BASE = 'http://127.0.0.1:8000';
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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerTab').classList.add('active');
    }
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
            showMessage('Failed to create task', 'error');
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

// Helper function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}