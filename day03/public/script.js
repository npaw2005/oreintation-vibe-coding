// --- UI Transitions ---
function showLogin() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function hideLogin() {
    document.getElementById('login-modal').classList.add('hidden');
}

// --- Rich Text Editor ---
function execCmd(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}

// --- API Calls ---

async function checkAuth() {
    const res = await fetch('/api/me');
    const data = await res.json();
    
    if (data.authenticated) {
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('display-username').textContent = `Hi, ${data.username}`;
        document.getElementById('submission-section').classList.remove('hidden');
    } else {
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('submission-section').classList.add('hidden');
    }
}

async function fetchIdeas() {
    const res = await fetch('/api/ideas');
    const ideas = await res.json();
    const list = document.getElementById('ideas-list');
    
    if (ideas.length === 0) {
        list.innerHTML = '<p class="text-muted">No ideas yet. Be the first to submit!</p>';
        return;
    }

    list.innerHTML = ideas.map(idea => `
        <div class="idea-item">
            <div class="idea-meta">
                <strong>${escapeHtml(idea.username)}</strong> • ${new Date(idea.created_at).toLocaleString()}
            </div>
            <div class="idea-content">${idea.content}</div>
        </div>
    `).join('');
}

async function submitIdea() {
    const editor = document.getElementById('editor');
    const content = editor.innerHTML;

    if (editor.innerText.trim().length < 5) {
        alert('Please write a bit more (min 5 characters).');
        return;
    }

    const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    if (res.ok) {
        editor.innerHTML = '';
        fetchIdeas();
    } else {
        const err = await res.json();
        alert(err.error || 'Failed to post idea.');
    }
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
}

// --- Utilities ---
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Event Listeners ---
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        hideLogin();
        checkAuth();
    } else {
        alert('Invalid credentials.');
    }
};

// Initial load
checkAuth();
fetchIdeas();
