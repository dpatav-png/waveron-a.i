// ══════════════════════════════════════════════════════════════
// SERVER.JS - WAVERON A.I CODEBOT
// Created by Mr. Dhruv Patav
// Features: 7-day free trial + ₹29/month unlock system
// ══════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════
// IN-MEMORY USER STORE
// ═══════════════════════════════════════════
const userStore = {};

const TRIAL_DAYS = 7;
const PAID_DAYS = 30;
const PAYMENT_PASSWORD = process.env.PAYMENT_PASSWORD || 'WAVERON29';

function getUser(fingerprint) {
    if (!userStore[fingerprint]) {
        userStore[fingerprint] = {
            trialStart: Date.now(),
            paid: false,
            paidUntil: null
        };
    }
    return userStore[fingerprint];
}

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════

// Entry point → payment/trial check page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Main app (after access confirmed)
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check access status
app.post('/api/status', (req, res) => {
    const { fingerprint } = req.body;
    if (!fingerprint) return res.json({ access: false, reason: 'no_fingerprint' });

    const user = getUser(fingerprint);
    const now = Date.now();

    if (user.paid && user.paidUntil && now < user.paidUntil) {
        const daysLeft = Math.ceil((user.paidUntil - now) / (1000 * 60 * 60 * 24));
        return res.json({ access: true, type: 'paid', daysLeft });
    }

    const trialEnd = user.trialStart + (TRIAL_DAYS * 24 * 60 * 60 * 1000);
    if (now < trialEnd) {
        const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        return res.json({ access: true, type: 'trial', daysLeft });
    }

    return res.json({ access: false, reason: 'trial_expired' });
});

// Unlock with payment password
app.post('/api/unlock', (req, res) => {
    const { fingerprint, password } = req.body;
    if (!fingerprint || !password) return res.json({ success: false, message: 'Missing data.' });

    if (password.trim().toUpperCase() !== PAYMENT_PASSWORD.toUpperCase()) {
        return res.json({ success: false, message: 'Wrong code. Pay ₹29 and contact Mr. Dhruv Patav for the correct code.' });
    }

    const user = getUser(fingerprint);
    user.paid = true;
    user.paidUntil = Date.now() + (PAID_DAYS * 24 * 60 * 60 * 1000);
    return res.json({ success: true, message: 'Access unlocked for 30 days! Welcome back.' });
});

// Chat API (protected)
app.post('/api/chat', async (req, res) => {
    const { fingerprint } = req.body;

    if (fingerprint) {
        const user = getUser(fingerprint);
        const now = Date.now();
        const trialEnd = user.trialStart + (TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const hasAccess = (now < trialEnd) || (user.paid && user.paidUntil && now < user.paidUntil);
        if (!hasAccess) return res.status(403).json({ error: { message: 'ACCESS_DENIED' } });
    }

    try {
        const { fingerprint: _fp, ...groqBody } = req.body;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify(groqBody)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: { message: 'Server error. Please try again.' } });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ WAVERON A.I running on port ${PORT}`));
