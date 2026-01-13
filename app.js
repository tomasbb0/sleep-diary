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

    // Email Login
    document.getElementById('email-login').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showAuthError('Preencha email e password');
            return;
        }
        
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
        
        if (!email || !password) {
            showAuthError('Preencha email e password');
            return;
        }
        
        if (password.length < 6) {
            showAuthError('Password deve ter pelo menos 6 caracteres');
            return;
        }
        
        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            showAuthError(translateError(error.code));
        }
    });

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
        auth.signOut();
    });

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
            
            if (tab.dataset.tab === 'history') {
                loadHistory();
            }
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
    
    // Disable next if today or future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    
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
        } else if (q.type === 'time') {
            inputHtml = `<input type="time" class="time-input" value="${answers[q.id] || ''}" data-id="${q.id}">`;
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
    
    // Add event listeners
    container.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            const questionEl = e.target.closest('.question');
            const questionIndex = parseInt(questionEl.dataset.index);
            const question = visibleQuestions[questionIndex];
            
            // Update selection
            questionEl.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            e.target.classList.add('selected');
            
            // Save answer
            answers[question.id] = e.target.dataset.value;
            
            // Check if this affects conditional questions
            updateVisibleQuestions();
            
            // Auto-advance after short delay
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
    
    container.querySelectorAll('.time-input, .text-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const questionEl = e.target.closest('.question');
            const questionIndex = parseInt(questionEl.dataset.index);
            const question = visibleQuestions[questionIndex];
            answers[question.id] = e.target.value;
        });
        
        input.addEventListener('blur', (e) => {
            const questionEl = e.target.closest('.question');
            const questionIndex = parseInt(questionEl.dataset.index);
            const question = visibleQuestions[questionIndex];
            answers[question.id] = e.target.value;
        });
    });
    
    currentQuestionIndex = 0;
    showQuestion(0);
    document.getElementById('question-nav').classList.remove('hidden');
}

function showQuestion(index) {
    document.querySelectorAll('.question').forEach((q, i) => {
        q.classList.toggle('active', i === index);
    });
    
    // Update progress
    document.getElementById('question-progress').textContent = 
        `${index + 1} / ${visibleQuestions.length}`;
    
    // Update buttons
    document.getElementById('prev-question').disabled = index === 0;
    
    const nextBtn = document.getElementById('next-question');
    if (index === visibleQuestions.length - 1) {
        nextBtn.textContent = '💾 Guardar';
    } else {
        nextBtn.textContent = 'Próxima →';
    }
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
        
        // Show success feedback
        const btn = document.getElementById('next-question');
        btn.textContent = '✅ Guardado!';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = '💾 Guardar';
            btn.disabled = false;
        }, 2000);
        
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
            .collection('entries')
            .orderBy('date', 'desc')
            .limit(30)
            .get();
        
        if (snapshot.empty) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>Ainda não há registos.<br>Comece a registar o seu sono hoje!</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const dateObj = new Date(data.date + 'T00:00:00');
            const dateStr = dateObj.toLocaleDateString('pt-PT', { 
                weekday: 'short', day: 'numeric', month: 'short' 
            });
            
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
    const emojis = {
        'Muito mal': '😫',
        'Mal': '😕',
        'Razoavelmente': '😐',
        'Bem': '🙂',
        'Muito bem': '😊'
    };
    return emojis[quality] || '😐';
}

// ==================== EXPORT ====================

document.getElementById('export-data').addEventListener('click', async () => {
    if (!currentUser) return;
    
    try {
        const snapshot = await db.collection('users').doc(currentUser.uid)
            .collection('entries')
            .orderBy('date', 'asc')
            .get();
        
        const entries = [];
        snapshot.forEach(doc => {
            entries.push(doc.data());
        });
        
        // Create CSV
        const headers = ['Data', ...QUESTIONS.map(q => q.title)];
        const rows = entries.map(e => {
            return [e.date, ...QUESTIONS.map(q => e.answers?.[q.id] || '')];
        });
        
        const csv = [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Download
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

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}
