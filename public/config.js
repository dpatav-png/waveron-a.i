// ══════════════════════════════════════════════════════════════
// CONFIG.JS - WAVERON A.I - CODEBOT EDITION
// Built for Coders & Developers
// Created by Mr. Dhruv Patav
// Version: 3.1.1 (API Fix Version)
// ══════════════════════════════════════════════════════════════

const CONFIG = {

    // ═══════════════════════════════════════════
    // 🔑 GROQ API SETTINGS
    // ═══════════════════════════════════════════
    
    GROQ_API_KEY: '',

    API_ENDPOINT: '/api/chat',

    MODEL: 'llama-3.1-8b-instant',

    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,

    // ═══════════════════════════════════════════
    // 👤 AI INFORMATION
    // ═══════════════════════════════════════════
    
    FOUNDER_NAME: 'Mr. Dhruv Patav',
    AI_NAME: 'WAVERON A.I',
    AI_VERSION: '3.1.1',
    AI_TAGLINE: 'Built for Coders & Developers',
    AI_TYPE: 'CODEBOT',

    // ═══════════════════════════════════════════
    // 📊 DAILY LIMIT SETTINGS
    // ═══════════════════════════════════════════
    
    DAILY_LIMIT: 50,
    WARNING_THRESHOLD: 5,
    RESET_HOURS: 24,

    // ═══════════════════════════════════════════
    // 🎨 THEME SETTINGS
    // ═══════════════════════════════════════════
    
    DEFAULT_THEME: 'dark',
    AVAILABLE_THEMES: ['dark', 'light', 'ocean', 'purple', 'midnight'],

    // ═══════════════════════════════════════════
    // 🎭 PERSONALITY SETTINGS
    // ═══════════════════════════════════════════
    
    DEFAULT_PERSONALITY: 'coder',
    AVAILABLE_PERSONALITIES: ['coder', 'debugger', 'architect', 'mentor', 'reviewer'],

    // ═══════════════════════════════════════════
    // ⌨️ TYPING SETTINGS
    // ═══════════════════════════════════════════
    
    TYPING_SPEED: 8,
    ENABLE_TYPING_EFFECT: true,

    // ═══════════════════════════════════════════
    // 🔊 VOICE SETTINGS
    // ═══════════════════════════════════════════
    
    ENABLE_VOICE_INPUT: true,
    ENABLE_VOICE_OUTPUT: true,
    VOICE_RATE: 1.0,
    VOICE_PITCH: 1.0,

    // ═══════════════════════════════════════════
    // 🎨 UI EFFECTS
    // ═══════════════════════════════════════════
    
    ENABLE_PARTICLES: true,
    PARTICLE_COUNT: 80,

    // ═══════════════════════════════════════════
    // 🔄 SESSION SETTINGS
    // ═══════════════════════════════════════════
    
    FRESH_START_ON_RELOAD: false,
    SHOW_FRESH_START_BUTTON: true,
    REMEMBER_LANDING_PAGE: false,
    CLEAR_CHAT_ON_NEW_SESSION: false,

    // ═══════════════════════════════════════════
    // 🚫 BLOCKED TOPICS (STRICT MODE)
    // ═══════════════════════════════════════════
    
    BLOCKED_KEYWORDS: [
        'news', 'current affairs', 'politics', 'election',
        'president', 'prime minister', 'war',
        'sports score', 'cricket', 'football',
        'celebrity', 'movie review', 'weather today'
    ]
};