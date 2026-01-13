// App State
let currentUser = null;
let currentDate = new Date();
let currentQuestionIndex = 0;
let answers = {};
let visibleQuestions = [];

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authError = document.getElementById('auth-error');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initTabs();
    initDateSelector();
    initQuestionNav();
});

// ==================== AUTH ====================

function initAuth() {
    // Google Login
    document.getElementById('google-login').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
        } catch (error) {
            showAuthError(error.message);
        }
    });

    // Apple Login
    document.getElementById('apple-login').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            await auth.signInWithPopup(provider);
        } catch (error) {
            showAuthError(error.message);
        }
    });

    // Email Login
    document.getElementById('email-login').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!email || !password) { showAuthError('Preencha email e password'); return; }
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            showAuthError(translateError(error.code));
        }
    });

    // Email Signup
    document.getElementById('email-signup').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!email || !password) { showAuthError('Preencha email e password'); return; }
        if (password.length < 6) { showAuthError('Password deve ter pelo menos 6 caracteres'); return; }
        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            showAuthError(translateError(error.code));
        }
    });

    // Logout
    document.getElementById('logout').addEventListener('click', () => auth.signOut());

    // Auth State Observer
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            showScreen('app');
            loadTodayEntry();
        } else {
            showScreen('auth');
        }
    });
}

function showAuthError(message) {
    authError.textContent = message;
    setTimeout(() => authError.textContent = '', 5000);
}

function translateError(code) {
    const errors = {
        'auth/email-already-in-use': 'Este email já está registado',
        'auth/invalid-email': 'Email inválido',
        'auth/user-not-found': 'Utilizador não encontrado',
        'auth/wrong-password': 'Password incorreta',
        'auth/weak-password': 'Password demasiado fraca'
    };
    return errors[code] || 'Erro de autenticação';
}

function showScreen(screen) {
    authScreen.classList.toggle('active', screen === 'auth');
    appScreen.classList.toggle('active', screen === 'app');
}

// ==================== TABS ====================

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            if (tab.dataset.tab === 'history') loadHistory();
        });
    });
}

// ==================== DATE SELECTOR ====================

function initDateSelector() {
    updateDateDisplay();
    document.getElementById('prev-day').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
        loadTodayEntry();
    });
    document.getElementById('next-day').addEventListener('click', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (currentDate < tomorrow) {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay();
            loadTodayEntry();
        }
    });
}

function updateDateDisplay() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = currentDate.toLocaleDateString('pt-PT', options);
    document.getElementById('current-date').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const current = new Date(currentDate); current.setHours(0, 0, 0, 0);
    document.getElementById('next-day').disabled = current >= today;
}

function getDateKey(date) {
    return date.toISOString().split('T')[0];
}

// ==================== QUESTIONS ====================

function initQuestionNav() {
    document.getElementById('prev-question').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });
    document.getElementById('next-question').addEventListener('click', () => {
        if (currentQuestionIndex < visibleQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            saveEntry();
        }
    });
}

async function loadTodayEntry() {
    if (!currentUser) return;
    const dateKey = getDateKey(currentDate);
    try {
        const doc = await db.collection('users').doc(currentUser.uid)
            .collection('entries').doc(dateKey).get();
        if (doc.exists) {
            answers = doc.data().answers || {};
            updateEntryStatus(true);
        } else {
            answers = {};
            updateEntryStatus(false);
        }
        renderQuestions();
    } catch (error) {
        console.error('Error loading entry:', error);
        answers = {};
        renderQuestions();
    }
}

function updateEntryStatus(complete) {
    const status = document.getElementById('entry-status');
    if (complete) {
        status.className = 'complete';
        status.textContent = '✅ Registo completo';
    } else {
        status.className = 'incomplete';
        status.textContent = '📝 Registo por completar';
    }
}

function updateVisibleQuestions() {
    visibleQuestions = QUESTIONS.filter(q => {
        if (!q.condition) return true;
        const condValue = answers[q.condition.field];
        if (typeof q.condition.value === 'function') {
            return q.condition.value(condValue);
        }
        return condValue === q.condition.value;
    });
}

function renderQuestions() {
    updateVisibleQuestions();
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    visibleQuestions.forEach((q, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'question' + (index === 0 ? ' active' : '');
        questionEl.dataset.index = index;
        
        let inputHtml = '';
        
        if (q.type === 'choice') {
            inputHtml = `<div class="options">
                ${q.options.map(opt => `
                    <button class="option ${answers[q.id] === opt ? 'selected' : ''}" data-value="${opt}">
                        ${opt}
                    </button>
                `).join('')}
            </div>`;
        } else if (q.type === 'choice-multi') {
            const selected = answers[q.id] || [];
            inputHtml = `<div class="options multi">
                ${q.options.map(opt => `
                    <button class="option ${selected.includes(opt) ? 'selected' : ''}" data-value="${opt}">
                        ${opt}
                    </button>
                `).join('')}
            </div>`;
        } else if (q.type === 'time-picker') {
            const val = answers[q.id] || '12:00';
            const [h, m] = val.split(':');
            inputHtml = createTimePicker(q.id, parseInt(h) || 12, parseInt(m) || 0);
        } else if (q.type === 'duration-picker') {
            const val = parseInt(answers[q.id]) || 15;
            inputHtml = createDurationPicker(q.id, val);
        } else if (q.type === 'sleep-duration-picker') {
            const val = answers[q.id] || '7h 00min';
            const match = val.match(/(\d+)h?\s*(\d+)?/);
            const hours = match ? parseInt(match[1]) : 7;
            const mins = match ? parseInt(match[2] || 0) : 0;
            inputHtml = createSleepDurationPicker(q.id, hours, mins);
        } else if (q.type === 'text') {
            inputHtml = `<textarea class="text-input" rows="3" placeholder="Escreva aqui..." data-id="${q.id}">${answers[q.id] || ''}</textarea>`;
        }
        
        questionEl.innerHTML = `
            <div class="question-section">${q.section}</div>
            <h3 class="question-title">${q.title}</h3>
            ${q.subtitle ? `<p class="question-subtitle">${q.subtitle}</p>` : ''}
            ${inputHtml}
        `;
        
        container.appendChild(questionEl);
    });
    
    addQuestionListeners(container);
    
    currentQuestionIndex = 0;
    showQuestion(0);
    document.getElementById('question-nav').classList.remove('hidden');
}

function addQuestionListeners(container) {
    // Single choice options
    container.querySelectorAll('.options:not(.multi) .option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            const questionEl = e.target.closest('.question');
            const questionIndex = parseInt(questionEl.dataset.index);
            const question = visibleQuestions[questionIndex];
            questionEl.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            e.target.classList.add('selected');
            answers[question.id] = e.target.dataset.value;
            updateVisibleQuestions();
            setTimeout(() => {
                if (currentQuestionIndex < visibleQuestions.length - 1) {
                    currentQuestionIndex++;
                    showQuestion(currentQuestionIndex);
                } else {
                    saveEntry();
                }
            }, 300);
        });
    });
    
    // Multi choice options
    container.querySelectorAll('.options.multi .option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            const questionEl = e.target.closest('.question');
            const questionIndex = parseInt(questionEl.dataset.index);
            const question = visibleQuestions[questionIndex];
            
            e.target.classList.toggle('selected');
            
            const selected = [];
            questionEl.querySelectorAll('.option.selected').forEach(o => {
                selected.push(o.dataset.value);
            });
            answers[question.id] = selected;
        });
    });
    
    // Text inputs
    container.querySelectorAll('.text-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const questionEl = e.target.closest('.question');
            const questionIndex = parseInt(questionEl.dataset.index);
            const question = visibleQuestions[questionIndex];
            answers[question.id] = e.target.value;
        });
    });
    
    // Initialize all pickers
    container.querySelectorAll('.picker-container').forEach(picker => {
        initWheelPicker(picker);
    });
}

// ==================== WHEEL PICKERS (iPhone style) ====================

function createTimePicker(id, hours, minutes) {
    const hourOptions = Array.from({length: 24}, (_, i) => 
        `<div class="wheel-item ${i === hours ? 'selected' : ''}" data-value="${i}">${String(i).padStart(2, '0')}</div>`
    ).join('');
    
    const minOptions = Array.from({length: 12}, (_, i) => {
        const m = i * 5;
        return `<div class="wheel-item ${m === minutes || (minutes > m && minutes < m + 5) ? 'selected' : ''}" data-value="${m}">${String(m).padStart(2, '0')}</div>`;
    }).join('');
    
    return `
        <div class="picker-container" data-id="${id}" data-type="time">
            <div class="picker-display">
                <span class="picker-value">${String(hours).padStart(2, '0')}:${String(Math.floor(minutes/5)*5).padStart(2, '0')}</span>
            </div>
            <div class="wheel-picker-modal hidden">
                <div class="wheel-picker-content">
                    <div class="wheel-picker-header">
                        <button class="picker-cancel">Cancelar</button>
                        <button class="picker-done">OK</button>
                    </div>
                    <div class="wheel-picker" data-component="hours">
                        <div class="wheel-highlight"></div>
                        <div class="wheel-scroll">${hourOptions}</div>
                    </div>
                    <div class="wheel-separator">:</div>
                    <div class="wheel-picker" data-component="minutes">
                        <div class="wheel-highlight"></div>
                        <div class="wheel-scroll">${minOptions}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createDurationPicker(id, minutes) {
    const options = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180].map(m => 
        `<div class="wheel-item ${m === minutes ? 'selected' : ''}" data-value="${m}">${m} min</div>`
    ).join('');
    
    return `
        <div class="picker-container" data-id="${id}" data-type="duration">
            <div class="picker-display">
                <span class="picker-value">${minutes} min</span>
            </div>
            <div class="wheel-picker-modal hidden">
                <div class="wheel-picker-content single">
                    <div class="wheel-picker-header">
                        <button class="picker-cancel">Cancelar</button>
                        <button class="picker-done">OK</button>
                    </div>
                    <div class="wheel-picker" data-component="duration">
                        <div class="wheel-highlight"></div>
                        <div class="wheel-scroll">${options}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createSleepDurationPicker(id, hours, minutes) {
    const hourOptions = Array.from({length: 16}, (_, i) => 
        `<div class="wheel-item ${i === hours ? 'selected' : ''}" data-value="${i}">${i}h</div>`
    ).join('');
    
    const minOptions = [0, 15, 30, 45].map(m => 
        `<div class="wheel-item ${m === minutes ? 'selected' : ''}" data-value="${m}">${String(m).padStart(2, '0')}min</div>`
    ).join('');
    
    return `
        <div class="picker-container" data-id="${id}" data-type="sleep-duration">
            <div class="picker-display">
                <span class="picker-value">${hours}h ${String(minutes).padStart(2, '0')}min</span>
            </div>
            <div class="wheel-picker-modal hidden">
                <div class="wheel-picker-content">
                    <div class="wheel-picker-header">
                        <button class="picker-cancel">Cancelar</button>
                        <button class="picker-done">OK</button>
                    </div>
                    <div class="wheel-picker" data-component="hours">
                        <div class="wheel-highlight"></div>
                        <div class="wheel-scroll">${hourOptions}</div>
                    </div>
                    <div class="wheel-picker" data-component="minutes">
                        <div class="wheel-highlight"></div>
                        <div class="wheel-scroll">${minOptions}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initWheelPicker(container) {
    const display = container.querySelector('.picker-display');
    const modal = container.querySelector('.wheel-picker-modal');
    const cancel = container.querySelector('.picker-cancel');
    const done = container.querySelector('.picker-done');
    const type = container.dataset.type;
    const id = container.dataset.id;
    
    display.addEventListener('click', () => {
        modal.classList.remove('hidden');
        container.querySelectorAll('.wheel-scroll').forEach(scroll => {
            const selected = scroll.querySelector('.selected');
            if (selected) {
                scroll.scrollTop = selected.offsetTop - scroll.offsetHeight / 2 + selected.offsetHeight / 2;
            }
        });
    });
    
    cancel.addEventListener('click', () => modal.classList.add('hidden'));
    
    done.addEventListener('click', () => {
        let value;
        if (type === 'time') {
            const hours = getSelectedValue(container, 'hours');
            const mins = getSelectedValue(container, 'minutes');
            value = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
            display.querySelector('.picker-value').textContent = value;
        } else if (type === 'duration') {
            value = getSelectedValue(container, 'duration');
            display.querySelector('.picker-value').textContent = `${value} min`;
        } else if (type === 'sleep-duration') {
            const hours = getSelectedValue(container, 'hours');
            const mins = getSelectedValue(container, 'minutes');
            value = `${hours}h ${String(mins).padStart(2, '0')}min`;
            display.querySelector('.picker-value').textContent = value;
        }
        answers[id] = value;
        modal.classList.add('hidden');
    });
    
    container.querySelectorAll('.wheel-scroll').forEach(scroll => {
        scroll.addEventListener('scroll', debounce(() => {
            const items = scroll.querySelectorAll('.wheel-item');
            let closest = null;
            let closestDist = Infinity;
            const center = scroll.scrollTop + scroll.offsetHeight / 2;
            
            items.forEach(item => {
                const itemCenter = item.offsetTop + item.offsetHeight / 2;
                const dist = Math.abs(center - itemCenter);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = item;
                }
            });
            
            if (closest) {
                scroll.querySelectorAll('.wheel-item').forEach(i => i.classList.remove('selected'));
                closest.classList.add('selected');
            }
        }, 50));
    });
}

function getSelectedValue(container, component) {
    const scroll = container.querySelector(`[data-component="${component}"] .wheel-scroll`);
    const selected = scroll.querySelector('.selected');
    return selected ? parseInt(selected.dataset.value) : 0;
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

function showQuestion(index) {
    document.querySelectorAll('.question').forEach((q, i) => {
        q.classList.toggle('active', i === index);
    });
    document.getElementById('question-progress').textContent = `${index + 1} / ${visibleQuestions.length}`;
    document.getElementById('prev-question').disabled = index === 0;
    const nextBtn = document.getElementById('next-question');
    nextBtn.textContent = index === visibleQuestions.length - 1 ? '💾 Guardar' : 'Próxima →';
}

async function saveEntry() {
    if (!currentUser) return;
    const dateKey = getDateKey(currentDate);
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('entries').doc(dateKey).set({
                date: dateKey,
                answers: answers,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        updateEntryStatus(true);
        const btn = document.getElementById('next-question');
        btn.textContent = '✅ Guardado!';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = '💾 Guardar'; btn.disabled = false; }, 2000);
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Erro ao guardar. Tente novamente.');
    }
}

// ==================== HISTORY ====================

async function loadHistory() {
    if (!currentUser) return;
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p class="loading">A carregar...</p>';
    try {
        const snapshot = await db.collection('users').doc(currentUser.uid)
            .collection('entries').orderBy('date', 'desc').limit(30).get();
        
        if (snapshot.empty) {
            historyList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><p>Ainda não há registos.<br>Comece a registar o seu sono hoje!</p></div>`;
            return;
        }
        
        historyList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const dateObj = new Date(data.date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
            const a = data.answers || {};
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-date">${dateStr}</div>
                <div class="history-summary">
                    <span>😴 ${a.sono_total || '—'}</span>
                    <span>🛏️ ${a.deitou || '—'}</span>
                    <span>⏰ ${a.acordou || '—'}</span>
                    <span>${getEmoji(a.qualidade_noite)} ${a.qualidade_noite || '—'}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                currentDate = dateObj;
                updateDateDisplay();
                loadTodayEntry();
                document.querySelector('[data-tab="entry"]').click();
            });
            historyList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<p class="error">Erro ao carregar histórico</p>';
    }
}

function getEmoji(quality) {
    const emojis = { 'Muito mal': '😫', 'Mal': '😕', 'Razoavelmente': '😐', 'Bem': '🙂', 'Muito bem': '😊' };
    return emojis[quality] || '😐';
}

// ==================== EXPORT ====================

document.getElementById('export-data').addEventListener('click', async () => {
    if (!currentUser) return;
    try {
        const snapshot = await db.collection('users').doc(currentUser.uid)
            .collection('entries').orderBy('date', 'asc').get();
        const entries = [];
        snapshot.forEach(doc => entries.push(doc.data()));
        const headers = ['Data', ...QUESTIONS.map(q => q.title)];
        const rows = entries.map(e => [e.date, ...QUESTIONS.map(q => {
            const val = e.answers?.[q.id];
            return Array.isArray(val) ? val.join('; ') : (val || '');
        })]);
        const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diario-sono-${getDateKey(new Date())}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting:', error);
        alert('Erro ao exportar dados');
    }
});

// ==================== PWA ====================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed:', err));
}
