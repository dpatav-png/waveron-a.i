// ══════════════════════════════════════════════════════════════
// SCRIPT.JS - WAVERON A.I CODEBOT EDITION
// Created by Dhruv Patav & Jay Patil
// Version: 3.1.3 (Payment System Added)
// ══════════════════════════════════════════════════════════════

let currentChatId = null;
let chats = {};
let chatCounter = 0;
let dailyUsage = 0;
let limitResetTime = null;
let countdownInterval = null;
let currentPersonality = 'coder';
let currentTheme = 'dark';

let landingPageActive = true;
let freshStartOnReload = false;
let alwaysShowLanding = false;
let elements = {};

// ═══════════════════════════════════════════
// FINGERPRINT (for trial/payment tracking)
// ═══════════════════════════════════════════
function getFingerprint() {
    const stored = localStorage.getItem('waveron_fp');
    if (stored) return stored;
    const fp = 'fp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('waveron_fp', fp);
    return fp;
}
const FINGERPRINT = getFingerprint();

// ═══════════════════════════════════════════
// ACCESS GUARD - redirect if no access
// ═══════════════════════════════════════════
async function checkAccess() {
    try {
        const res = await fetch('/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fingerprint: FINGERPRINT })
        });
        const data = await res.json();
        if (!data.access) {
            window.location.href = '/';
        }
    } catch (e) {
        // If server unreachable, allow access (fail open)
        console.warn('Access check failed, allowing access.');
    }
}

function initElements() {
    elements = {
        landingPage: document.getElementById('landingPage'),
        appContainer: document.getElementById('appContainer'),
        startChatBtn: document.getElementById('startChatBtn'),
        openAppBtn: document.getElementById('openAppBtn'),
        exploreFeaturesBtn: document.getElementById('exploreFeaturesBtn'),
        newChatBtn: document.getElementById('newChatBtn'),
        freshStartBtn: document.getElementById('freshStartBtn'),
        sendBtn: document.getElementById('sendBtn'),
        userInput: document.getElementById('userInput'),
        messagesContainer: document.getElementById('messagesContainer'),
        chatContainer: document.getElementById('chatContainer'),
        welcomeScreen: document.getElementById('welcomeScreen'),
        chatHistory: document.getElementById('chatHistory'),
        searchInput: document.getElementById('searchInput'),
        clearChatBtn: document.getElementById('clearChatBtn'),
        downloadChatBtn: document.getElementById('downloadChatBtn'),
        chatTitle: document.getElementById('chatTitle'),
        sidebar: document.getElementById('sidebar'),
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        limitPopup: document.getElementById('limitPopup'),
        limitCount: document.getElementById('limitCount'),
        limitModal: document.getElementById('limitModal'),
        closeLimitModal: document.getElementById('closeLimitModal'),
        usageCounter: document.getElementById('usageCounter'),
        usageText: document.getElementById('usageText'),
        countdownTimer: document.getElementById('countdownTimer'),
        personalityOptions: document.getElementById('personalityOptions'),
        themeOptions: document.getElementById('themeOptions'),
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettings: document.getElementById('closeSettings'),
        voiceInputBtn: document.getElementById('voiceInputBtn'),
        voiceToggleBtn: document.getElementById('voiceToggleBtn'),
        voiceRecording: document.getElementById('voiceRecording'),
        stopRecordingBtn: document.getElementById('stopRecordingBtn'),
        promptsGrid: document.getElementById('promptsGrid'),
        particles: document.getElementById('particles'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        shortcutsModal: document.getElementById('shortcutsModal'),
        closeShortcuts: document.getElementById('closeShortcuts'),
        searchChatBtn: document.getElementById('searchChatBtn'),
        searchChatBar: document.getElementById('searchChatBar'),
        searchChatInput: document.getElementById('searchChatInput'),
        closeSearchChat: document.getElementById('closeSearchChat'),
        blockedModal: document.getElementById('blockedModal'),
        closeBlockedModal: document.getElementById('closeBlockedModal')
    };
}

async function init() {
    initElements();
    console.log('🚀 WAVERON A.I CODEBOT Starting...');

    // Check access before doing anything
    await checkAccess();

    loadSessionSettings();
    if (shouldFreshStart()) {
        performFreshStart(false);
    } else {
        loadChatsFromStorage();
    }
    loadDailyUsage();
    loadSettings();
    attachEventListeners();
    adjustTextareaHeight();
    updateUsageDisplay();
    checkLimitStatus();
    createParticles();
    initVoiceRecognition();
    initSettingsListeners();
    handleLandingPage();
    if (Object.keys(chats).length === 0) {
        createNewChat();
    } else {
        const chatIds = Object.keys(chats);
        loadChat(chatIds[chatIds.length - 1]);
    }
    console.log('✅ WAVERON A.I CodeBot Ready!');
}

function loadSessionSettings() {
    try {
        const savedFreshStart = localStorage.getItem('waveronAI_freshStartOnReload');
        const savedAlwaysLanding = localStorage.getItem('waveronAI_alwaysShowLanding');
        freshStartOnReload = savedFreshStart !== null ? savedFreshStart === 'true' : (CONFIG.FRESH_START_ON_RELOAD || false);
        alwaysShowLanding = savedAlwaysLanding !== null ? savedAlwaysLanding === 'true' : !CONFIG.REMEMBER_LANDING_PAGE;
        const freshStartToggle = document.getElementById('freshStartToggle');
        const alwaysLandingToggle = document.getElementById('alwaysLandingToggle');
        if (freshStartToggle) freshStartToggle.checked = freshStartOnReload;
        if (alwaysLandingToggle) alwaysLandingToggle.checked = alwaysShowLanding;
    } catch (e) {
        console.warn('Session settings load error:', e);
    }
}

function shouldFreshStart() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fresh') === 'true') return true;
    return freshStartOnReload || CONFIG.FRESH_START_ON_RELOAD;
}

function handleLandingPage() {
    if (alwaysShowLanding || CONFIG.REMEMBER_LANDING_PAGE === false) {
        showLandingPage();
        return;
    }
    const visited = localStorage.getItem('waveronAI_visited');
    if (visited === 'true') {
        showApp();
    } else {
        showLandingPage();
    }
}

function performFreshStart(showMessage = true) {
    chats = {};
    chatCounter = 0;
    currentChatId = null;
    localStorage.removeItem('waveronAI_chats');
    localStorage.removeItem('waveronAI_counter');
    localStorage.removeItem('waveronAI_visited');
    if (elements.messagesContainer) elements.messagesContainer.innerHTML = '';
    if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'flex';
    if (elements.chatTitle) elements.chatTitle.textContent = 'New Code Session';
    if (elements.chatHistory) elements.chatHistory.innerHTML = '';
    createNewChat();
    showLandingPage();
    if (showMessage) showToast('Fresh start! All sessions cleared.');
}

function showApp() {
    if (elements.landingPage) elements.landingPage.style.display = 'none';
    if (elements.appContainer) elements.appContainer.classList.add('active');
    landingPageActive = false;
    if (!alwaysShowLanding && CONFIG.REMEMBER_LANDING_PAGE !== false) {
        localStorage.setItem('waveronAI_visited', 'true');
    }
}

function showLandingPage() {
    if (elements.landingPage) elements.landingPage.style.display = 'block';
    if (elements.appContainer) elements.appContainer.classList.remove('active');
    landingPageActive = true;
}

function isBlockedTopic(message) {
    const lowerMessage = message.toLowerCase();
    for (let keyword of CONFIG.BLOCKED_KEYWORDS) {
        if (lowerMessage.includes(keyword.toLowerCase())) return true;
    }
    const blockedPatterns = [
        /who (is|was) the (president|prime minister|minister)/i,
        /what happened (today|yesterday|recently)/i,
        /latest (news|update|headlines)/i,
        /current (situation|status) (in|of)/i,
        /who won the (election|match|game|award)/i,
        /score of .* match/i,
        /price of (bitcoin|crypto|stock)/i,
        /weather (today|tomorrow|in)/i,
        /trending (on twitter|on social media)/i,
        /box office (collection|earnings)/i
    ];
    for (let pattern of blockedPatterns) {
        if (pattern.test(message)) return true;
    }
    return false;
}

function showBlockedModal() {
    if (elements.blockedModal) elements.blockedModal.classList.add('show');
}

function hideBlockedModal() {
    if (elements.blockedModal) elements.blockedModal.classList.remove('show');
}

function getBlockedResponse() {
    return "🚫 **Sorry, I can't help with that.**\n\nI am **WAVERON A.I**, built exclusively for **coders and developers**.\n\n❌ I cannot answer questions about:\n• Current affairs & news\n• Politics & elections\n• Sports scores & matches\n• Entertainment & celebrities\n• Weather & general knowledge\n\n✅ **I CAN help you with:**\n• Writing code in 50+ languages\n• Debugging & fixing errors\n• Algorithms & data structures\n• API development & system design\n• Database queries & optimization\n• Code reviews & best practices\n\n**Please ask a coding or development question! 💻**";
}

function createParticles() {
    if (!elements.particles) return;
    elements.particles.innerHTML = '';
    const count = CONFIG.PARTICLE_COUNT || 80;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 20 + 's';
        p.style.animationDuration = (15 + Math.random() * 15) + 's';
        const size = 2 + Math.random() * 4;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        elements.particles.appendChild(p);
    }
}

function initVoiceRecognition() { /* Voice disabled */ }
function startRecording() { }
function stopRecording() { }
function speakText(text) { /* Voice disabled */ }

function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
    localStorage.setItem('waveronAI_theme', theme);
}

function setPersonality(personality) {
    currentPersonality = personality;
    document.querySelectorAll('.personality-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-personality') === personality);
    });
    localStorage.setItem('waveronAI_personality', personality);
    const names = { coder: 'Code Generator', debugger: 'Debug Expert', architect: 'System Architect', mentor: 'Code Mentor', reviewer: 'Code Reviewer' };
    showToast('Mode: ' + (names[personality] || personality));
}

function getPersonalityPrompt() {
    const prompts = {
        coder: 'You are an expert code generator. Write clean, efficient, well-commented code. Always use proper code blocks with language tags. Briefly explain your code.',
        debugger: 'You are a debugging expert. Carefully analyze code, find bugs, explain the root cause clearly, and provide the corrected version.',
        architect: 'You are a system architect. Focus on software design patterns, architecture, scalability, and engineering best practices.',
        mentor: 'You are a coding mentor. Explain concepts clearly step-by-step, use simple language, provide examples, and encourage the learner.',
        reviewer: 'You are a senior code reviewer. Analyze code for bugs, security issues, performance problems, and bad practices. Give constructive feedback.'
    };
    return prompts[currentPersonality] || prompts.coder;
}

function loadSettings() {
    const savedTheme = localStorage.getItem('waveronAI_theme');
    if (savedTheme) setTheme(savedTheme);
    const savedPersonality = localStorage.getItem('waveronAI_personality');
    setPersonality(savedPersonality || 'coder');

}

function updateVoiceToggle() { }

function openSettings() {
    if (elements.settingsModal) elements.settingsModal.classList.add('show');
}

function closeSettingsModal() {
    if (elements.settingsModal) elements.settingsModal.classList.remove('show');
}

function initSettingsListeners() {
    const tempSlider = document.getElementById('temperatureSlider');
    const tempValue = document.getElementById('temperatureValue');
    if (tempSlider) {
        tempSlider.addEventListener('input', function () {
            const val = (this.value / 100).toFixed(1);
            if (tempValue) tempValue.textContent = val;
            CONFIG.TEMPERATURE = parseFloat(val);
        });
    }
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) modelSelect.addEventListener('change', function () { CONFIG.MODEL = this.value; showToast('Model: ' + this.value); });
    const maxTokensSelect = document.getElementById('maxTokensSelect');
    if (maxTokensSelect) maxTokensSelect.addEventListener('change', function () { CONFIG.MAX_TOKENS = parseInt(this.value); });
    const typingToggle = document.getElementById('typingEffectToggle');
    if (typingToggle) typingToggle.addEventListener('change', function () { CONFIG.ENABLE_TYPING_EFFECT = this.checked; });
    const particlesToggle = document.getElementById('particlesToggle');
    if (particlesToggle) particlesToggle.addEventListener('change', function () { if (elements.particles) elements.particles.style.display = this.checked ? 'block' : 'none'; });
    const freshStartToggle = document.getElementById('freshStartToggle');
    if (freshStartToggle) freshStartToggle.addEventListener('change', function () { freshStartOnReload = this.checked; localStorage.setItem('waveronAI_freshStartOnReload', this.checked); });
    const alwaysLandingToggle = document.getElementById('alwaysLandingToggle');
    if (alwaysLandingToggle) alwaysLandingToggle.addEventListener('change', function () { alwaysShowLanding = this.checked; localStorage.setItem('waveronAI_alwaysShowLanding', this.checked); });
    const clearDataBtn = document.getElementById('clearAllDataBtn');
    if (clearDataBtn) clearDataBtn.addEventListener('click', function () { if (confirm('Delete ALL sessions and settings?')) { localStorage.clear(); location.reload(); } });
}

function showToast(message) {
    if (elements.toastMessage && elements.toast) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.add('show');
        setTimeout(() => elements.toast.classList.remove('show'), 3000);
    }
}

function attachEventListeners() {
    if (elements.startChatBtn) elements.startChatBtn.addEventListener('click', showApp);
    if (elements.openAppBtn) elements.openAppBtn.addEventListener('click', showApp);
    if (elements.exploreFeaturesBtn) elements.exploreFeaturesBtn.addEventListener('click', () => { const f = document.getElementById('features'); if (f) f.scrollIntoView({ behavior: 'smooth' }); });
    if (elements.newChatBtn) elements.newChatBtn.addEventListener('click', createNewChat);
    if (elements.freshStartBtn) elements.freshStartBtn.addEventListener('click', () => { if (confirm('Start fresh?')) performFreshStart(true); });
    if (elements.sendBtn) elements.sendBtn.addEventListener('click', sendMessage);
    if (elements.clearChatBtn) elements.clearChatBtn.addEventListener('click', clearCurrentChat);
    if (elements.downloadChatBtn) elements.downloadChatBtn.addEventListener('click', downloadChat);
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', openSettings);
    if (elements.closeSettings) elements.closeSettings.addEventListener('click', closeSettingsModal);
    if (elements.closeBlockedModal) elements.closeBlockedModal.addEventListener('click', hideBlockedModal);
    if (elements.userInput) {
        elements.userInput.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
        elements.userInput.addEventListener('input', adjustTextareaHeight);
    }
    if (elements.searchInput) elements.searchInput.addEventListener('input', searchChats);
    if (elements.closeLimitModal) elements.closeLimitModal.addEventListener('click', () => { if (elements.limitModal) elements.limitModal.classList.remove('show'); });
    if (elements.limitPopup) elements.limitPopup.addEventListener('click', hideLimitWarning);
    if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', toggleSidebar);
    document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', () => setTheme(btn.getAttribute('data-theme'))));
    document.querySelectorAll('.personality-btn').forEach(btn => btn.addEventListener('click', () => setPersonality(btn.getAttribute('data-personality'))));

    document.querySelectorAll('.prompt-btn').forEach(btn => btn.addEventListener('click', () => { if (elements.userInput) { elements.userInput.value = btn.getAttribute('data-prompt'); adjustTextareaHeight(); elements.userInput.focus(); } }));
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (elements.shortcutsModal) elements.shortcutsModal.classList.remove('show');
            if (elements.settingsModal) elements.settingsModal.classList.remove('show');
            if (elements.blockedModal) elements.blockedModal.classList.remove('show');
        }
    });
    if (elements.closeShortcuts) elements.closeShortcuts.addEventListener('click', () => { if (elements.shortcutsModal) elements.shortcutsModal.classList.remove('show'); });
    if (elements.searchChatBtn) elements.searchChatBtn.addEventListener('click', toggleSearchChat);
    if (elements.closeSearchChat) elements.closeSearchChat.addEventListener('click', () => { if (elements.searchChatBar) elements.searchChatBar.classList.remove('show'); });
}

function toggleSearchChat() { if (elements.searchChatBar) elements.searchChatBar.classList.toggle('show'); }
function toggleSidebar() { if (elements.sidebar) elements.sidebar.classList.toggle('open'); }

function loadDailyUsage() {
    try {
        const savedUsage = localStorage.getItem('waveronAI_dailyUsage');
        const savedResetTime = localStorage.getItem('waveronAI_resetTime');
        if (savedUsage) dailyUsage = parseInt(savedUsage);
        if (savedResetTime) limitResetTime = parseInt(savedResetTime);
        if (limitResetTime && Date.now() >= limitResetTime) resetDailyLimit();
        if (!limitResetTime) setNewResetTime();
    } catch (e) { dailyUsage = 0; setNewResetTime(); }
}

function setNewResetTime() {
    limitResetTime = Date.now() + (CONFIG.RESET_HOURS * 60 * 60 * 1000);
    localStorage.setItem('waveronAI_resetTime', limitResetTime.toString());
}

function resetDailyLimit() { dailyUsage = 0; setNewResetTime(); saveDailyUsage(); updateUsageDisplay(); hideLimitModal(); }
function saveDailyUsage() { localStorage.setItem('waveronAI_dailyUsage', dailyUsage.toString()); localStorage.setItem('waveronAI_resetTime', limitResetTime.toString()); }
function getRemainingMessages() { return Math.max(0, CONFIG.DAILY_LIMIT - dailyUsage); }
function incrementUsage() { dailyUsage++; saveDailyUsage(); updateUsageDisplay(); checkLimitWarning(); }

function checkLimitStatus() {
    if (getRemainingMessages() <= 0) { showLimitModal(); startCountdown(); }
}

function checkLimitWarning() {
    const remaining = getRemainingMessages();
    if (remaining <= 0) { showLimitModal(); startCountdown(); }
    else if (remaining <= CONFIG.WARNING_THRESHOLD) { showLimitWarning(remaining); }
}

function updateUsageDisplay() {
    const remaining = getRemainingMessages();
    if (elements.usageText) elements.usageText.textContent = remaining + ' left';
    if (elements.usageCounter) {
        elements.usageCounter.classList.remove('warning', 'danger');
        if (remaining <= 0) { elements.usageCounter.classList.add('danger'); if (elements.usageText) elements.usageText.textContent = 'Limit reached'; }
        else if (remaining <= CONFIG.WARNING_THRESHOLD) { elements.usageCounter.classList.add(remaining <= 2 ? 'danger' : 'warning'); }
    }
}

function showLimitWarning(remaining) {
    if (elements.limitCount) elements.limitCount.textContent = remaining;
    if (elements.limitPopup) { elements.limitPopup.classList.add('show'); setTimeout(hideLimitWarning, 5000); }
}
function hideLimitWarning() { if (elements.limitPopup) elements.limitPopup.classList.remove('show'); }

function showLimitModal() {
    if (elements.limitModal) elements.limitModal.classList.add('show');
    if (elements.sendBtn) elements.sendBtn.disabled = true;
    if (elements.userInput) { elements.userInput.disabled = true; elements.userInput.placeholder = 'Daily limit reached.'; }
    startCountdown();
}

function hideLimitModal() {
    if (elements.limitModal) elements.limitModal.classList.remove('show');
    if (elements.sendBtn) elements.sendBtn.disabled = false;
    if (elements.userInput) { elements.userInput.disabled = false; elements.userInput.placeholder = 'Ask any coding question...'; }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    function updateCountdown() {
        const timeLeft = limitResetTime - Date.now();
        if (timeLeft <= 0) { resetDailyLimit(); return; }
        const h = Math.floor(timeLeft / 3600000), m = Math.floor((timeLeft % 3600000) / 60000), s = Math.floor((timeLeft % 60000) / 1000);
        if (elements.countdownTimer) elements.countdownTimer.textContent = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function createNewChat() {
    chatCounter++;
    const chatId = 'chat_' + Date.now() + '_' + chatCounter;
    const timestamp = new Date().toISOString();
    chats[chatId] = { id: chatId, title: 'New Code Session', messages: [], createdAt: timestamp, updatedAt: timestamp };
    currentChatId = chatId;
    if (elements.messagesContainer) elements.messagesContainer.innerHTML = '';
    if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'flex';
    if (elements.chatTitle) elements.chatTitle.textContent = 'New Code Session';
    renderChatHistory();
    saveChatsToStorage();
}

function loadChat(chatId) {
    if (!chats[chatId]) return;
    currentChatId = chatId;
    const chat = chats[chatId];
    if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
    if (elements.chatTitle) elements.chatTitle.textContent = chat.title;
    if (elements.messagesContainer) {
        elements.messagesContainer.innerHTML = '';
        chat.messages.forEach(msg => renderMessage(msg.role, msg.content, msg.timestamp, false));
    }
    renderChatHistory();
    scrollToBottom();
}

function clearCurrentChat() {
    if (!currentChatId) return;
    if (confirm('Clear this session?')) {
        chats[currentChatId].messages = [];
        chats[currentChatId].title = 'New Code Session';
        if (elements.messagesContainer) elements.messagesContainer.innerHTML = '';
        if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'flex';
        if (elements.chatTitle) elements.chatTitle.textContent = 'New Code Session';
        saveChatsToStorage();
        renderChatHistory();
    }
}

function deleteChat(chatId) {
    if (confirm('Delete this session?')) {
        delete chats[chatId];
        if (currentChatId === chatId) {
            const remaining = Object.keys(chats);
            remaining.length > 0 ? loadChat(remaining[remaining.length - 1]) : createNewChat();
        }
        saveChatsToStorage();
        renderChatHistory();
    }
}

async function sendMessage() {
    if (!elements.userInput) return;
    const message = elements.userInput.value.trim();
    if (!message) return;
    const remaining = getRemainingMessages();
    if (remaining <= 0) { showLimitModal(); return; }

    if (isBlockedTopic(message)) {
        if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
        const timestamp = new Date().toISOString();
        renderMessage('user', message, timestamp);
        chats[currentChatId].messages.push({ role: 'user', content: message, timestamp });
        elements.userInput.value = '';
        adjustTextareaHeight();
        setTimeout(() => {
            const blockedResponse = getBlockedResponse();
            const aiTimestamp = new Date().toISOString();
            renderMessage('assistant', blockedResponse, aiTimestamp);
            chats[currentChatId].messages.push({ role: 'assistant', content: blockedResponse, timestamp: aiTimestamp });
            saveChatsToStorage();
            scrollToBottom();
        }, 500);
        return;
    }

    if (elements.sendBtn) elements.sendBtn.disabled = true;
    if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
    const timestamp = new Date().toISOString();
    renderMessage('user', message, timestamp);

    if (chats[currentChatId].messages.length === 0) {
        const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
        chats[currentChatId].title = title;
        if (elements.chatTitle) elements.chatTitle.textContent = title;
        renderChatHistory();
    }

    chats[currentChatId].messages.push({ role: 'user', content: message, timestamp });
    elements.userInput.value = '';
    adjustTextareaHeight();
    const typingIndicator = showTypingIndicator();
    scrollToBottom();

    try {
        const response = await callGroqAPI();
        typingIndicator.remove();

        // If access denied by server, redirect to payment page
        if (response === 'ACCESS_DENIED') {
            window.location.href = '/';
            return;
        }

        incrementUsage();
        const aiTimestamp = new Date().toISOString();
        renderMessage('assistant', response, aiTimestamp);

        chats[currentChatId].messages.push({ role: 'assistant', content: response, timestamp: aiTimestamp });
        saveChatsToStorage();
    } catch (error) {
        console.error('API Error:', error);
        typingIndicator.remove();
        renderMessage('assistant', '❌ Error: ' + error.message, new Date().toISOString());
    }

    if (getRemainingMessages() > 0 && elements.sendBtn) elements.sendBtn.disabled = false;
    if (elements.userInput) elements.userInput.focus();
    scrollToBottom();
}

async function callGroqAPI() {
    const personalityPrompt = getPersonalityPrompt();
    const systemPrompt = 'You are WAVERON A.I, an expert coding assistant created by ' + CONFIG.FOUNDER_NAME + '. You ONLY help with coding, programming, debugging, algorithms, data structures, system design, databases, APIs, DevOps, and software development. MODE: ' + personalityPrompt + ' RULES: Never answer news, politics, current affairs, sports, weather, entertainment questions. Always use proper markdown code blocks with language tags.';

    const messages = [{ role: 'system', content: systemPrompt }];
    const history = chats[currentChatId]?.messages?.slice(-10) || [];
    history.forEach(msg => messages.push({ role: msg.role, content: msg.content }));

    const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages,
            temperature: CONFIG.TEMPERATURE,
            max_tokens: CONFIG.MAX_TOKENS,
            fingerprint: FINGERPRINT  // ← sent for server-side access check
        })
    });

    if (response.status === 403) return 'ACCESS_DENIED';

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API request failed');
    return data.choices[0].message.content;
}

function renderMessage(role, content, timestamp, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + role;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<span class="message-avatar-w">&lt;/&gt;</span>';
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMessage(content);
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = role === 'assistant'
        ? '<button class="message-action-btn copy-btn"><i class="fas fa-copy"></i> Copy</button>'
        : '<button class="message-action-btn copy-btn"><i class="fas fa-copy"></i></button>';
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = formatTime(timestamp);
    wrapper.appendChild(messageContent);
    wrapper.appendChild(actions);
    wrapper.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(wrapper);
    if (elements.messagesContainer) elements.messagesContainer.appendChild(messageDiv);
    const copyBtn = actions.querySelector('.copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(content); showToast('Copied!'); });

}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<div class="message-avatar"><span class="message-avatar-w">&lt;/&gt;</span></div><div class="message-wrapper"><div class="message-content"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>';
    if (elements.messagesContainer) elements.messagesContainer.appendChild(typingDiv);
    return typingDiv;
}

function renderChatHistory() {
    if (!elements.chatHistory) return;
    elements.chatHistory.innerHTML = '';
    const sorted = Object.values(chats).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    sorted.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item' + (chat.id === currentChatId ? ' active' : '');
        item.innerHTML = '<div><div class="history-item-text">' + escapeHtml(chat.title) + '</div><div class="history-item-date">' + formatDate(chat.updatedAt) + '</div></div><button class="delete-history-btn"><i class="fas fa-trash"></i></button>';
        item.addEventListener('click', e => { if (!e.target.closest('.delete-history-btn')) loadChat(chat.id); });
        item.querySelector('.delete-history-btn').addEventListener('click', e => { e.stopPropagation(); deleteChat(chat.id); });
        elements.chatHistory.appendChild(item);
    });
}

function searchChats() {
    if (!elements.searchInput || !elements.chatHistory) return;
    const term = elements.searchInput.value.toLowerCase();
    elements.chatHistory.querySelectorAll('.history-item').forEach(item => {
        const text = item.querySelector('.history-item-text')?.textContent.toLowerCase() || '';
        item.style.display = text.includes(term) ? 'flex' : 'none';
    });
}

function downloadChat() {
    if (!currentChatId || !chats[currentChatId]?.messages?.length) { showToast('No messages to download!'); return; }
    const chat = chats[currentChatId];
    let content = 'WAVERON A.I CodeBot Export\nSession: ' + chat.title + '\nDate: ' + new Date().toLocaleString() + '\n\n';
    chat.messages.forEach(msg => {
        content += '[' + formatTime(msg.timestamp) + '] ' + (msg.role === 'user' ? 'You' : 'WAVERON A.I') + ':\n' + msg.content + '\n\n---\n\n';
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'WAVERON_CodeBot_' + Date.now() + '.txt';
    a.click();
    showToast('Downloaded!');
}

function saveChatsToStorage() {
    try { localStorage.setItem('waveronAI_chats', JSON.stringify(chats)); localStorage.setItem('waveronAI_counter', chatCounter.toString()); }
    catch (e) { console.error('Save error:', e); }
}

function loadChatsFromStorage() {
    try {
        const saved = localStorage.getItem('waveronAI_chats');
        if (saved) chats = JSON.parse(saved);
        const counter = localStorage.getItem('waveronAI_counter');
        if (counter) chatCounter = parseInt(counter);
    } catch (e) { chats = {}; chatCounter = 0; }
}

function formatMessage(content) {
    let text = escapeHtml(content);
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => '<pre class="code-block" data-language="' + (lang || 'code') + '"><code>' + code + '</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function formatTime(timestamp) { return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
function formatDate(timestamp) {
    const diff = Date.now() - new Date(timestamp);
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
}
function adjustTextareaHeight() {
    if (elements.userInput) { elements.userInput.style.height = 'auto'; elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 150) + 'px'; }
}
function scrollToBottom() {
    setTimeout(() => { if (elements.chatContainer) elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight; }, 100);
}

document.addEventListener('DOMContentLoaded', init);
