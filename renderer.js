let timer;
let isRunning = false;
let projects = [];
let currentProject = null;
let timeLeft = 25 * 60;

const timerDisplay = document.getElementById('timer-display');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');
const projectList = document.getElementById('project-list');
const addProjectBtn = document.getElementById('add-project-btn');
const modal = document.getElementById('modal-overlay');

// Persistence Logic using the real File System DB via Electron IPC
async function init() {
    projects = await window.db.loadProjects();
    if (projects.length > 0) {
        currentProject = projects[0];
        timeLeft = currentProject.settings.work * 60;
    }
    renderProjects();
    updateDisplay();
}

async function saveAll() {
    await window.db.saveProjects(projects);
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timer);
        toggleBtn.textContent = 'START';
    } else {
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timer);
                alert('Session Completed!');
            }
        }, 1000);
        toggleBtn.textContent = 'PAUSE';
    }
    isRunning = !isRunning;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    toggleBtn.textContent = 'START';
    if (currentProject) {
        timeLeft = currentProject.settings.work * 60;
    } else {
        timeLeft = 25 * 60;
    }
    updateDisplay();
}

function setSessionType(type) {
    const timerArea = document.getElementById('timer-area');
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });

    if (!currentProject) return;

    switch(type) {
        case 'work':
            timerArea.style.backgroundColor = 'var(--work-bg)';
            timeLeft = currentProject.settings.work * 60;
            break;
        case 'short':
            timerArea.style.backgroundColor = 'var(--short-bg)';
            timeLeft = currentProject.settings.short * 60;
            break;
        case 'long':
            timerArea.style.backgroundColor = 'var(--long-bg)';
            timeLeft = currentProject.settings.long * 60;
            break;
    }
    updateDisplay();
}

function renderProjects() {
    projectList.innerHTML = '';
    projects.forEach((proj, index) => {
        const li = document.createElement('li');
        if (currentProject && proj.name === currentProject.name) li.classList.add('active');
        li.innerHTML = `<span>${proj.icon} ${proj.name}</span>`;
        
        const del = document.createElement('button');
        del.textContent = '✕';
        del.className = 'delete-proj-btn';
        del.onclick = async (e) => {
            e.stopPropagation();
            projects.splice(index, 1);
            if (currentProject && currentProject.name === proj.name) {
                currentProject = projects.length > 0 ? projects[0] : null;
            }
            await saveAll();
            renderProjects();
            resetTimer();
        };
        li.appendChild(del);

        li.onclick = () => {
            currentProject = proj;
            document.getElementById('active-project-name').textContent = proj.name;
            renderProjects();
            resetTimer();
        };
        projectList.appendChild(li);
    });
    
    if (currentProject) {
        document.getElementById('active-project-name').textContent = currentProject.name;
    } else {
        document.getElementById('active-project-name').textContent = 'Create a project to start';
    }
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => setSessionType(tab.dataset.type);
});

toggleBtn.onclick = toggleTimer;
resetBtn.onclick = resetTimer;
addProjectBtn.onclick = () => modal.style.display = 'flex';
document.getElementById('cancel-btn').onclick = () => modal.style.display = 'none';

// Counter Helpers
window.increment = (id) => {
    const el = document.getElementById(id);
    el.value = parseInt(el.value) + 1;
};

window.decrement = (id) => {
    const el = document.getElementById(id);
    if (parseInt(el.value) > 1) {
        el.value = parseInt(el.value) - 1;
    }
};

document.getElementById('create-btn').onclick = async () => {
    const name = document.getElementById('proj-name').value;
    const icon = document.getElementById('proj-icon').value;
    const workMin = parseInt(document.getElementById('work-min').value);
    const shortMin = parseInt(document.getElementById('short-min').value);
    const longMin = parseInt(document.getElementById('long-min').value);

    if (name) {
        const newProj = {
            name,
            icon,
            settings: {
                work: workMin,
                short: shortMin,
                long: longMin
            }
        };
        projects.push(newProj);
        await saveAll();
        
        currentProject = newProj;
        renderProjects();
        resetTimer();
        
        modal.style.display = 'none';
        document.getElementById('proj-name').value = '';
    }
};

const iconSelectorBtn = document.getElementById('icon-selector-btn');
const iconModal = document.getElementById('icon-modal-overlay');
const iconGrid = document.getElementById('icon-grid');
const iconInput = document.getElementById('proj-icon');

const availableIcons = [
    '📁', '💻', '📚', '🎨', '🚀', '🛠️', '📝', '🧠', '🎧', '⚡',
    '🎯', '🔥', '🌱', '🏗️', '🧪', '🎮', '🎬', '☕', '🍎', '🏃',
    '🧘', '🎸', '📷', '🌍', '💹', '🛠', '📅', '🔍', '⚙️', '💎'
];

function initIconGrid() {
    iconGrid.innerHTML = '';
    availableIcons.forEach(icon => {
        const div = document.createElement('div');
        div.className = 'icon-item';
        div.textContent = icon;
        div.onclick = () => {
            iconInput.value = icon;
            iconSelectorBtn.textContent = icon;
            iconModal.style.display = 'none';
        };
        iconGrid.appendChild(div);
    });
}

iconSelectorBtn.onclick = () => {
    iconModal.style.display = 'flex';
};

document.getElementById('close-icon-modal-btn').onclick = () => {
    iconModal.style.display = 'none';
};

// Start the app
initIconGrid();
init();
