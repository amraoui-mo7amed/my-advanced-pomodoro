let timer;
let isRunning = false;
let projects = [];
let userData = { name: 'Mohamed', headline: 'Deep Work Mode', avatarUrl: '' };
let statistics = { totalSessions: 0, totalFocusTime: 0, recentActivity: [] };
let currentProject = null;
let timeLeft = 25 * 60;
let customTimerConfig = { work: 25, short: 5, long: 15, targetSessions: 4 };
let pendingAvatarUrl = '';

const timerDisplay = document.getElementById('timer-display');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');
const projectList = document.getElementById('project-list');
const addProjectBtn = document.getElementById('add-project-btn');
const modal = document.getElementById('modal-overlay');
const avatarFileInput = document.getElementById('avatar-file-input');
const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
const removeAvatarBtn = document.getElementById('remove-avatar-btn');

// Persistence Logic using the real File System DB via Electron IPC
async function init() {
    console.log("Initializing app...");
    try {
        if (!window.db) {
            console.error("window.db is not defined. Preload script might have failed.");
            return;
        }
        const data = await window.db.loadData();
        console.log("Loaded data:", data);
        projects = data.projects || [];
        userData = data.user || { name: 'Mohamed', headline: 'Deep Work Mode', avatarUrl: '' };
        statistics = data.statistics || { totalSessions: 0, totalFocusTime: 0, recentActivity: [] };
        customTimerConfig = data.customTimerConfig || { work: 25, short: 5, long: 15, targetSessions: 4 };
        
        updateProfileUI();
        updateStatsUI();
        renderActivity();

        if (projects.length > 0) {
            currentProject = projects[0];
            timeLeft = currentProject.settings.work * 60;
        } else {
            timeLeft = customTimerConfig.work * 60;
        }
        
        renderProjects();
        updateDisplay();
        
        // Setup listeners after elements are guaranteed to be in the DOM
        setupListeners();
        setupNavigation();
        setupCustomTimer();
    } catch (error) {
        console.error("Failed to load data:", error);
    }
}

async function saveAll() {
    await window.db.saveData({
        projects: projects,
        user: userData,
        statistics: statistics,
        customTimerConfig: customTimerConfig
    });
}

function updateStatsUI() {
    const totalSessionsEl = document.getElementById('stat-total-sessions');
    const totalTimeEl = document.getElementById('stat-total-time');
    const dailyGoalEl = document.getElementById('stat-daily-goal');

    if (totalSessionsEl) totalSessionsEl.textContent = statistics.totalSessions;
    if (totalTimeEl) {
        const hours = Math.floor(statistics.totalFocusTime / 60);
        const mins = statistics.totalFocusTime % 60;
        totalTimeEl.textContent = `${hours}h ${mins}m`;
    }
    if (dailyGoalEl) {
        const progress = Math.min(100, Math.round((statistics.totalSessions / customTimerConfig.targetSessions) * 100));
        dailyGoalEl.textContent = `${progress || 0}%`;
    }
}

function renderActivity() {
    const list = document.getElementById('activity-list');
    if (!list) return;
    list.innerHTML = '';
    
    const recent = statistics.recentActivity.slice(-5).reverse();
    recent.forEach(act => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <span>${act.projectName} - ${act.type}</span>
            <span>${act.date}</span>
        `;
        list.appendChild(li);
    });
}

function setupNavigation() {
    const navHome = document.getElementById('nav-home');
    const navTimer = document.getElementById('nav-timer');
    const dashView = document.getElementById('dashboard-view');
    const timerView = document.getElementById('timer-view');

    if (navHome) {
        navHome.onclick = () => {
            navHome.classList.add('active');
            navTimer.classList.remove('active');
            dashView.classList.remove('hidden');
            timerView.classList.add('hidden');
        };
    }

    if (navTimer) {
        navTimer.onclick = () => {
            navTimer.classList.add('active');
            navHome.classList.remove('active');
            dashView.classList.add('hidden');
            timerView.classList.remove('hidden');
        };
    }
}

function setupCustomTimer() {
    const workInp = document.getElementById('custom-work-min');
    const shortInp = document.getElementById('custom-short-min');
    const longInp = document.getElementById('custom-long-min');
    const sessInp = document.getElementById('custom-sessions');
    const applyBtn = document.getElementById('apply-custom-settings');

    if (workInp) workInp.value = customTimerConfig.work;
    if (shortInp) shortInp.value = customTimerConfig.short;
    if (longInp) longInp.value = customTimerConfig.long;
    if (sessInp) sessInp.value = customTimerConfig.targetSessions;

    if (applyBtn) {
        applyBtn.onclick = async () => {
            if (isRunning) {
                alert("Finish your current session before changing settings.");
                return;
            }
            customTimerConfig.work = parseInt(workInp.value);
            customTimerConfig.short = parseInt(shortInp.value);
            customTimerConfig.long = parseInt(longInp.value);
            customTimerConfig.targetSessions = parseInt(sessInp.value);
            
            timeLeft = customTimerConfig.work * 60;
            currentProject = null; // Switching to custom timer mode
            const activeProjNameEl = document.getElementById('active-project-name');
            if (activeProjNameEl) activeProjNameEl.textContent = "Custom Session";
            
            updateDisplay();
            updateStatsUI();
            await saveAll();
            alert("Settings Applied!");
        };
    }
}

function setupListeners() {
    console.log("Setting up listeners...");
    const addBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('modal-overlay');
    const profileTrigger = document.getElementById('profile-trigger');
    const profileModal = document.getElementById('profile-modal-overlay');
    
    if (addBtn) {
        addBtn.onclick = () => {
            if (projectModal) projectModal.classList.remove('hidden');
        };
    }
    
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            if (projectModal) projectModal.classList.add('hidden');
        };
    }

    if (profileTrigger) {
        profileTrigger.onclick = () => {
            pendingAvatarUrl = userData.avatarUrl;
            updateProfileUI();
            if (profileModal) profileModal.classList.remove('hidden');
        };
    }

    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    if (cancelProfileBtn) {
        cancelProfileBtn.onclick = () => {
            if (profileModal) profileModal.classList.add('hidden');
        };
    }

    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.onclick = async () => {
            const editName = document.getElementById('edit-name');
            const editHeadline = document.getElementById('edit-headline');
            userData.name = (editName ? editName.value : '') || 'User';
            userData.headline = (editHeadline ? editHeadline.value : '') || 'Focusing';
            userData.avatarUrl = pendingAvatarUrl;
            
            updateProfileUI();
            await saveAll();
            if (profileModal) profileModal.classList.add('hidden');
        };
    }

    if (uploadAvatarBtn) {
        uploadAvatarBtn.onclick = () => avatarFileInput.click();
    }

    if (avatarFileInput) {
        avatarFileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    pendingAvatarUrl = event.target.result;
                    const editChar = document.getElementById('edit-avatar-char');
                    const editImg = document.getElementById('edit-avatar-img');
                    if (editImg) {
                        editImg.src = pendingAvatarUrl;
                        editImg.classList.remove('hidden');
                    }
                    if (editChar) editChar.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.onclick = () => {
            pendingAvatarUrl = '';
            const editChar = document.getElementById('edit-avatar-char');
            const editImg = document.getElementById('edit-avatar-img');
            const editName = document.getElementById('edit-name');
            const modalChar = (editName ? editName.value.charAt(0).toUpperCase() : '') || 'U';
            
            if (editChar) {
                editChar.textContent = modalChar;
                editChar.classList.remove('hidden');
            }
            if (editImg) editImg.classList.add('hidden');
        };
    }

    const createBtn = document.getElementById('create-btn');
    if (createBtn) {
        createBtn.onclick = async () => {
            const nameEl = document.getElementById('proj-name');
            const iconEl = document.getElementById('proj-icon');
            const workEl = document.getElementById('work-min');
            const shortEl = document.getElementById('short-min');
            const longEl = document.getElementById('long-min');

            if (nameEl && nameEl.value) {
                const newProj = {
                    name: nameEl.value,
                    icon: iconEl ? iconEl.value : '📁',
                    settings: {
                        work: parseInt(workEl ? workEl.value : 25),
                        short: parseInt(shortEl ? shortEl.value : 5),
                        long: parseInt(longEl ? longEl.value : 15)
                    }
                };
                projects.push(newProj);
                await saveAll();
                
                currentProject = newProj;
                renderProjects();
                resetTimer();
                
                if (projectModal) projectModal.classList.add('hidden');
                nameEl.value = '';
            }
        };
    }

    const iconSelectorBtn = document.getElementById('icon-selector-btn');
    const iconModal = document.getElementById('icon-modal-overlay');
    if (iconSelectorBtn) {
        iconSelectorBtn.onclick = () => {
            if (iconModal) iconModal.classList.remove('hidden');
        };
    }

    const closeIconModalBtn = document.getElementById('close-icon-modal-btn');
    if (closeIconModalBtn) {
        closeIconModalBtn.onclick = () => {
            if (iconModal) iconModal.classList.add('hidden');
        };
    }

    if (toggleBtn) toggleBtn.onclick = toggleTimer;
}

function updateProfileUI() {
    const nameEl = document.getElementById('display-name');
    const headlineEl = document.getElementById('display-headline');
    if (nameEl) nameEl.textContent = userData.name;
    if (headlineEl) headlineEl.textContent = userData.headline;
    
    const displayChar = document.getElementById('display-avatar-char');
    const displayImg = document.getElementById('display-avatar-img');
    const editChar = document.getElementById('edit-avatar-char');
    const editImg = document.getElementById('edit-avatar-img');
    const modalChar = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

    if (userData.avatarUrl) {
        if (displayImg) {
            displayImg.src = userData.avatarUrl;
            displayImg.classList.remove('hidden');
        }
        if (displayChar) displayChar.classList.add('hidden');
        if (editImg) {
            editImg.src = userData.avatarUrl;
            editImg.classList.remove('hidden');
        }
        if (editChar) editChar.classList.add('hidden');
    } else {
        if (displayChar) {
            displayChar.textContent = modalChar;
            displayChar.classList.remove('hidden');
        }
        if (displayImg) displayImg.classList.add('hidden');
        if (editChar) {
            editChar.textContent = modalChar;
            editChar.classList.remove('hidden');
        }
        if (editImg) editImg.classList.add('hidden');
    }
    
    const editNameEl = document.getElementById('edit-name');
    const editHeadlineEl = document.getElementById('edit-headline');
    if (editNameEl) editNameEl.value = userData.name;
    if (editHeadlineEl) editHeadlineEl.value = userData.headline;
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (timerDisplay) timerDisplay.textContent = timeStr;
    
    const widgetTimer = document.getElementById('widget-timer-display');
    if (widgetTimer) widgetTimer.textContent = timeStr;
}

function toggleTimer() {
    if (isRunning) return;
    isRunning = true;
    if (toggleBtn) toggleBtn.classList.add('hidden');
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            if (toggleBtn) {
                toggleBtn.classList.remove('hidden');
                toggleBtn.textContent = 'START';
            }
            const type = document.querySelector('.tab.active').dataset.type;
            if (type === 'work') {
                statistics.totalSessions++;
                const duration = currentProject ? currentProject.settings.work : customTimerConfig.work;
                statistics.totalFocusTime += duration;
                statistics.recentActivity.push({
                    projectName: currentProject ? currentProject.name : "Custom Session",
                    type: "Work",
                    date: new Date().toLocaleDateString()
                });
                updateStatsUI();
                renderActivity();
                saveAll();
            }
            playSessionCompleteSound();
            showSessionCompleteNotification();
        }
    }, 1000);
}

function resetTimer() {
    if (isRunning) return;
    clearInterval(timer);
    isRunning = false;
    if (toggleBtn) {
        toggleBtn.classList.remove('hidden');
        toggleBtn.textContent = 'START';
    }
    if (currentProject) {
        timeLeft = currentProject.settings.work * 60;
    } else {
        timeLeft = customTimerConfig.work * 60;
    }
    updateDisplay();
}

function setSessionType(type) {
    const timerArea = document.getElementById('timer-area');
    const tabs = document.querySelectorAll('.tab');
    const shortBreakWidget = document.getElementById('short-break-widget');
    
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });

    if (type === 'short' && shortBreakWidget) {
        shortBreakWidget.classList.remove('hidden');
    } else if (shortBreakWidget) {
        shortBreakWidget.classList.add('hidden');
    }

    if (!isRunning) {
        const source = currentProject ? currentProject.settings : customTimerConfig;
        switch(type) {
            case 'work': timeLeft = source.work * 60; break;
            case 'short': timeLeft = source.short * 60; break;
            case 'long': timeLeft = source.long * 60; break;
        }
        updateDisplay();
    }

    if (timerArea) {
        switch(type) {
            case 'work': timerArea.style.backgroundColor = 'var(--work-bg)'; break;
            case 'short': timerArea.style.backgroundColor = 'var(--short-bg)'; break;
            case 'long': timerArea.style.backgroundColor = 'var(--long-bg)'; break;
        }
    }
}

function renderProjects() {
    if (!projectList) return;
    projectList.innerHTML = '';
    projects.forEach((proj, index) => {
        const li = document.createElement('li');
        if (currentProject && proj.name === currentProject.name) li.classList.add('active');
        const content = document.createElement('div');
        content.className = 'proj-item-content';
        content.innerHTML = `<span class="proj-icon">${proj.icon}</span><span class="proj-name">${proj.name}</span>`;
        li.appendChild(content);
        const del = document.createElement('button');
        del.textContent = '✕';
        del.className = 'delete-proj-btn';
        del.onclick = async (e) => {
            e.stopPropagation();
            if (isRunning && currentProject && currentProject.name === proj.name) {
                alert("You cannot delete a project while its session is running.");
                return;
            }
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
            if (isRunning) {
                alert("A session is already running.");
                return;
            }
            currentProject = proj;
            const activeProjNameEl = document.getElementById('active-project-name');
            if (activeProjNameEl) activeProjNameEl.textContent = proj.name;
            renderProjects();
            resetTimer();
        };
        projectList.appendChild(li);
    });
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
        if (isRunning) {
            alert("You cannot switch session types while the timer is running.");
            return;
        }
        setSessionType(tab.dataset.type);
    };
});

const availableIcons = [
    '📁', '💻', '📚', '🎨', '🚀', '🛠️', '📝', '🧠', '🎧', '⚡',
    '🎯', '🔥', '🌱', '🏗️', '🧪', '🎮', '🎬', '☕', '🍎', '🏃',
    '🧘', '🎸', '📷', '🌍', '💹', '🛠', '📅', '🔍', '⚙️', '💎'
];

function initIconGrid() {
    const iconGrid = document.getElementById('icon-grid');
    if (!iconGrid) return;
    iconGrid.innerHTML = '';
    availableIcons.forEach(icon => {
        const div = document.createElement('div');
        div.className = 'icon-item';
        div.textContent = icon;
        div.onclick = () => {
            const iconInput = document.getElementById('proj-icon');
            const iconSelectorBtn = document.getElementById('icon-selector-btn');
            if (iconInput) iconInput.value = icon;
            if (iconSelectorBtn) iconSelectorBtn.textContent = icon;
            const iconModal = document.getElementById('icon-modal-overlay');
            if (iconModal) iconModal.classList.add('hidden');
        };
        iconGrid.appendChild(div);
    });
}

function playSessionCompleteSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 1.5;
    const frequency = 880;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioCtx.currentTime + duration);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function showSessionCompleteNotification() {
    if (Notification.permission === "granted") {
        new Notification("Pomodoro Session Complete!", { body: "Time to take a break!" });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
    alert('Session Completed!');
}

// Start the app
initIconGrid();
window.addEventListener('load', init);
