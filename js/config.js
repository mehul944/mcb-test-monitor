// Configuration and constants for MCB Test Monitor

const CONFIG = {
    // Application settings
    APP_NAME: 'MCB Test Monitor',
    VERSION: '1.0.0',
    
    // Test configuration defaults
    DEFAULT_MCB_RATING: '10A',
    DEFAULT_MCB_TYPE: 'C',
    DEFAULT_TEST_CURRENT: 100,
    DEFAULT_TEST_DURATION: 60,
    DEFAULT_NUM_OPERATIONS: 5,
    
    // Measurement ranges
    VOLTAGE_NOMINAL: 230, // Volts
    VOLTAGE_MIN: 200,
    VOLTAGE_MAX: 250,
    
    CURRENT_MAX: 500, // Amperes
    CURRENT_MIN: 10,
    
    TRIP_TIME_MIN: 5, // Milliseconds
    TRIP_TIME_MAX: 100,
    
    // Safety thresholds
    MAX_SAFE_CURRENT: 450,
    MAX_SAFE_VOLTAGE: 260,
    MIN_SAFE_VOLTAGE: 190,
    
    // Test states
    TEST_STATES: {
        READY: 'Ready',
        ARMED: 'Armed',
        RUNNING: 'Running',
        TRIPPED: 'Tripped',
        COMPLETE: 'Complete',
        FAULT: 'Fault'
    },
    
    // Result states
    RESULT_STATES: {
        READY: 'ready',
        PASS: 'pass',
        FAIL: 'fail',
        REVIEW: 'review'
    },
    
    // Waveform settings
    WAVEFORM: {
        SAMPLE_RATE: 1000, // Hz
        DURATION: 10000, // milliseconds
        GRID_POINTS: 1000
    },
    
    // Colors
    COLORS: {
        PRIMARY: '#2563eb',
        SUCCESS: '#22c55e',
        WARNING: '#f59e0b',
        DANGER: '#ef4444',
        CURRENT: '#ef4444',
        VOLTAGE: '#3b82f6',
        EVENT: '#f59e0b'
    }
};

// Global state management
const STATE = {
    isTestRunning: false,
    isTestPaused: false,
    currentTestId: 'TEST-2026-001',
    operationsCompleted: 0,
    totalOperations: 5,
    testStartTime: null,
    testElapsedTime: 0,
    
    // Current measurements
    measurements: {
        peakCurrent: 0,
        faultCurrent: 0,
        voltageBefore: 0,
        voltageDuring: 0,
        tripTime: 0,
        faultDuration: 0
    },
    
    // Test results
    results: {
        status: CONFIG.RESULT_STATES.READY,
        mcbOperation: false,
        tripTimeResult: null,
        interruptionResult: null,
        timestamp: null
    },
    
    // Waveform data
    waveformData: {
        current: [],
        voltage: [],
        time: [],
        tripEvent: null
    },
    
    // Safety status
    safety: {
        doorClosed: true,
        emergencyStopReleased: true,
        sensorsReady: true,
        controllerHealthy: true,
        overcurrentActive: true,
        interlockEngaged: true
    }
};

// Utility functions
const Utils = {
    formatNumber: (num, decimals = 2) => {
        return parseFloat(num.toFixed(decimals));
    },
    
    formatTime: (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    formatTimestamp: () => {
        return new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    },
    
    getRandomBetween: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    
    generateTestId: () => {
        const date = new Date();
        const timestamp = date.getTime().toString().slice(-6);
        return `TEST-${date.getFullYear()}-${timestamp}`;
    },
    
    updateElement: (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
};

// DOM helpers
const DOM = {
    get: (id) => document.getElementById(id),
    
    getAll: (selector) => document.querySelectorAll(selector),
    
    on: (id, event, callback) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, callback);
        }
    },
    
    onAll: (selector, event, callback) => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener(event, callback);
        });
    },
    
    addClass: (id, className) => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add(className);
        }
    },
    
    removeClass: (id, className) => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove(className);
        }
    },
    
    setAttr: (id, attr, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute(attr, value);
        }
    },
    
    removeAttr: (id, attr) => {
        const element = document.getElementById(id);
        if (element) {
            element.removeAttribute(attr);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, STATE, Utils, DOM };
}
