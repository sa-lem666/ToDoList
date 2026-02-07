const API_URL = 'http://localhost:3000';


function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return '';
}

//Remove cookie using expired date
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

//Update UI based on status
function updateUI() {
    const token = getCookie('authToken');
    const isAuth = !!token;
    
    document.getElementById('auth-container').style.display = isAuth ? 'none' : 'block';
    document.getElementById('todo-container').style.display = isAuth ? 'block' : 'none';

    if (isAuth) fetchTodos();
}

//API call function
async function api(path, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('authToken')}`
        }
    };
    if (data) options.body = JSON.stringify(data);
    
    const res = await fetch(`${API_URL}${path}`, options);
    return res.json();
}

//Fetch and display todos
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    await api('/register', 'POST', Object.fromEntries(new FormData(e.target)));
    alert('Registered! Please login.');
};

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const res = await api('/login', 'POST', Object.fromEntries(new FormData(e.target)));
    if (res.token) {
        setCookie('authToken', res.token);
        updateUI();
    } else {
        alert(res.message || 'Login failed!'); //Alerts if given wrong credentials
    }
};

function logout() {
    deleteCookie('authToken');
    updateUI();
}

async function fetchTodos() {
    const todos = await api('/todos');
    const list = document.getElementById('todo-list');
    list.innerHTML = todos.map(t => `
        <li class="${t.completed ? 'done' : ''}">
            <strong>${t.title}</strong>: ${t.description}
            <button onclick="editTodoPrompt('${t._id}', '${t.title}', '${t.description}')">Edit</button>
            <button onclick="toggleStatus('${t._id}', ${!t.completed})">Toggle Complete</button>
            <button onclick="deleteTodo('${t._id}')">Delete</button>
        </li>
    `).join('');
}

//Operations for todos
document.getElementById('todo-form').onsubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const id = document.getElementById('todo-id').value;
    
    await api(id ? `/todos/${id}` : '/todos', id ? 'PUT' : 'POST', formData);
    e.target.reset();
    document.getElementById('todo-id').value = ''; 
    fetchTodos();
};

async function deleteTodo(id) {
    await api(`/todos/${id}`, 'DELETE');
    fetchTodos();
}

async function toggleStatus(id, completed) {
    await api(`/todos/${id}`, 'PUT', { completed });
    fetchTodos();
}

function editTodoPrompt(id, title, desc) {
    document.getElementById('todo-id').value = id;
    document.getElementById('todo-title').value = title;
    document.getElementById('todo-desc').value = desc;
}

updateUI();