// ══════════════════════════════════════════════════════════════
// CONFIG.JS - WAVERON A.I - CODEBOT EDITION
// Built for Coders & Developers
// Created by Dhruv Patav & Jay Patil
// Version: 3.1.1
// ══════════════════════════════════════════════════════════════

const CONFIG = {
    GROQ_API_KEY: '',
    API_ENDPOINT: '/api/chat',
    MODEL: 'llama-3.1-8b-instant',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,

    FOUNDER_NAME: 'Dhruv Patav & Jay Patil',
    AI_NAME: 'WAVERON A.I',
    AI_VERSION: '3.1.1',
    AI_TAGLINE: 'Built for Coders & Developers',
    AI_TYPE: 'CODEBOT',

    DAILY_LIMIT: 50,
    WARNING_THRESHOLD: 5,
    RESET_HOURS: 24,

    DEFAULT_THEME: 'dark',
    AVAILABLE_THEMES: ['dark', 'light', 'ocean', 'purple', 'midnight'],

    DEFAULT_PERSONALITY: 'coder',
    AVAILABLE_PERSONALITIES: ['coder', 'debugger', 'architect', 'mentor', 'reviewer'],

    TYPING_SPEED: 8,
    ENABLE_TYPING_EFFECT: true,

    ENABLE_VOICE_INPUT: false,
    ENABLE_VOICE_OUTPUT: false,
    VOICE_RATE: 1.0,
    VOICE_PITCH: 1.0,

    ENABLE_PARTICLES: true,
    PARTICLE_COUNT: 80,

    FRESH_START_ON_RELOAD: false,
    SHOW_FRESH_START_BUTTON: true,
    REMEMBER_LANDING_PAGE: false,
    CLEAR_CHAT_ON_NEW_SESSION: false,

    BLOCKED_KEYWORDS: [
        'news', 'current affairs', 'politics', 'election',
        'president', 'prime minister', 'war',
        'sports score', 'cricket', 'football',
        'celebrity', 'movie review', 'weather today'
    ]
};
