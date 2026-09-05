// Test simulation and real-time data generation

class TestSimulation {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.currentOperation = 0;
    }
    
    start(testDuration = 60000) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now() - this.pausedTime;
        this.currentOperation = 0;
        
        STATE.testStartTime = Date.now();
        STATE.isTestRunning = true;
        STATE.isTestPaused = false;
        
        updateTestStatus(CONFIG.TEST_STATES.ARMED);
        
        setTimeout(() => {
            updateTestStatus(CONFIG.TEST_STATES.RUNNING);
            this.simulateTest(testDuration);
        }, 500);
    }
    
    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        STATE.isTestPaused = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        updateTestStatus(CONFIG.TEST_STATES.ARMED);
    }
    
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        STATE.isTestPaused = false;
        this.pausedTime += Date.now() - this.startTime;
        
        updateTestStatus(CONFIG.TEST_STATES.RUNNING);
        this.simulateTest(60000 - STATE.testElapsedTime);
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        STATE.isTestRunning = false;
        STATE.isTestPaused = false;
    }
    
    simulateTest(testDuration) {
        const tripTime = Utils.getRandomBetween(2000, 4000);
        const waveData = generateWaveformData(testDuration, tripTime);
        
        STATE.waveformData.current = waveData.current;
        STATE.waveformData.voltage = waveData.voltage;
        STATE.waveformData.time = waveData.time;
        STATE.waveformData.tripEvent = tripTime;
        
        STATE.measurements.peakCurrent = Utils.formatNumber(waveData.peakCurrent);
        STATE.measurements.faultCurrent = Utils.formatNumber(waveData.peakCurrent / 1000, 2);
        STATE.measurements.voltageBefore = Utils.formatNumber(CONFIG.VOLTAGE_NOMINAL);
        STATE.measurements.voltageDuring = Utils.formatNumber(CONFIG.VOLTAGE_NOMINAL * 0.7);
        STATE.measurements.tripTime = Utils.formatNumber(tripTime + Utils.getRandomBetween(5, 15));
        STATE.measurements.faultDuration = Utils.formatNumber(tripTime + Utils.getRandomBetween(50, 150));
        
        updateMeasurements();
        waveformChart.redraw();
        
        // Simulate trip event
        setTimeout(() => {
            if (!this.isRunning || this.isPaused) return;
            
            updateTestStatus(CONFIG.TEST_STATES.TRIPPED);
            STATE.results.mcbOperation = true;
            STATE.results.tripTimeResult = STATE.measurements.tripTime + ' ms';
            STATE.results.interruptionResult = 'Success';
            STATE.results.timestamp = Utils.formatTimestamp();
            
            // Complete test after brief delay
            setTimeout(() => {
                if (!this.isRunning || this.isPaused) return;
                
                this.currentOperation++;
                
                if (this.currentOperation >= STATE.totalOperations) {
                    this.completeTest();
                } else {
                    // Reset for next operation
                    setTimeout(() => {
                        if (this.isRunning && !this.isPaused) {
                            this.simulateTest(testDuration);
                        }
                    }, 1500);
                }
            }, 800);
        }, tripTime);
        
        // Update progress
        this.updateProgress(testDuration);
    }
    
    updateProgress(duration) {
        const updateInterval = setInterval(() => {
            if (!this.isRunning || this.isPaused) {
                clearInterval(updateInterval);
                return;
            }
            
            STATE.testElapsedTime = Date.now() - STATE.testStartTime;
            const progress = Math.min((STATE.testElapsedTime / duration) * 100, 100);
            
            Utils.updateElement('progressValue', Math.floor(progress) + '%');
            Utils.updateElement('progressFill', '');
            document.getElementById('progressFill').style.width = progress + '%';
            Utils.updateElement('operationsCompleted', `${this.currentOperation} / ${STATE.totalOperations}`);
            Utils.updateElement('elapsedTime', Utils.formatTime(STATE.testElapsedTime));
            
            if (progress >= 100) {
                clearInterval(updateInterval);
            }
        }, 100);
    }
    
    completeTest() {
        this.stop();
        
        updateTestStatus(CONFIG.TEST_STATES.COMPLETE);
        STATE.results.status = CONFIG.RESULT_STATES.PASS;
        
        // Update result badge
        const resultStatus = document.getElementById('resultStatus');
        resultStatus.innerHTML = '<span class="result-badge pass">PASS</span>';
        
        // Enable report buttons
        document.getElementById('generatePdfBtn').disabled = false;
        document.getElementById('exportCsvBtn').disabled = false;
    }
}

const testSim = new TestSimulation();

function startTest() {
    // Validate safety interlocks
    if (!STATE.safety.doorClosed || !STATE.safety.emergencyStopReleased || !STATE.safety.sensorsReady) {
        alert('Safety interlock violated! Cannot start test.');
        return;
    }
    
    STATE.totalOperations = parseInt(document.getElementById('numOperations').value);
    STATE.operationsCompleted = 0;
    
    // Disable configuration controls
    document.querySelectorAll('.config-form input, .config-form select').forEach(el => {
        el.disabled = true;
    });
    
    document.getElementById('startTestBtn').disabled = true;
    document.getElementById('pauseTestBtn').disabled = false;
    document.getElementById('resetBtn').disabled = true;
    
    testSim.start(60000);
}

function pauseTest() {
    if (STATE.isTestRunning && !STATE.isTestPaused) {
        testSim.pause();
        document.getElementById('pauseTestBtn').textContent = 'Resume Test';
    } else if (STATE.isTestRunning && STATE.isTestPaused) {
        testSim.resume();
        document.getElementById('pauseTestBtn').textContent = 'Pause Test';
    }
}

function resetTest() {
    testSim.stop();
    
    // Reset UI
    document.getElementById('statusCircle').style.borderColor = CONFIG.COLORS.SUCCESS;
    document.getElementById('statusText').textContent = 'Ready';
    document.getElementById('statusText').style.color = '#86efac';
    
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressValue').textContent = '0%';
    document.getElementById('operationsCompleted').textContent = '0 / 5';
    document.getElementById('elapsedTime').textContent = '00:00';
    
    // Clear measurements
    document.getElementById('peakCurrent').textContent = '-- A';
    document.getElementById('faultCurrent').textContent = '-- kA';
    document.getElementById('voltageBefore').textContent = '-- V';
    document.getElementById('voltageDuring').textContent = '-- V';
    document.getElementById('tripTime').textContent = '-- ms';
    document.getElementById('faultDuration').textContent = '-- ms';
    
    // Clear results
    document.getElementById('mcbOperation').textContent = '-- Not Tested';
    document.getElementById('tripTimeResult').textContent = '-- Not Tested';
    document.getElementById('interruptionResult').textContent = '-- Not Tested';
    document.getElementById('resultStatus').innerHTML = '<span class="result-badge ready">READY</span>';
    
    // Enable configuration controls
    document.querySelectorAll('.config-form input, .config-form select').forEach(el => {
        el.disabled = false;
    });
    
    document.getElementById('startTestBtn').disabled = false;
    document.getElementById('pauseTestBtn').disabled = true;
    document.getElementById('pauseTestBtn').textContent = 'Pause Test';
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('generatePdfBtn').disabled = true;
    document.getElementById('exportCsvBtn').disabled = true;
    
    // Clear waveform
    STATE.waveformData = { current: [], voltage: [], time: [], tripEvent: null };
    waveformChart.redraw();
}

function emergencyStop() {
    testSim.stop();
    
    document.getElementById('statusCircle').style.borderColor = CONFIG.COLORS.DANGER;
    document.getElementById('statusText').textContent = 'STOPPED';
    document.getElementById('statusText').style.color = '#fca5a5';
    
    document.getElementById('startTestBtn').disabled = true;
    document.getElementById('pauseTestBtn').disabled = true;
    document.getElementById('resetBtn').disabled = false;
    
    alert('⚠️ EMERGENCY STOP activated! Test terminated.');
}

function updateTestStatus(status) {
    const circle = document.getElementById('statusCircle');
    const text = document.getElementById('statusText');
    
    text.textContent = status;
    
    switch(status) {
        case CONFIG.TEST_STATES.READY:
            circle.style.borderColor = CONFIG.COLORS.SUCCESS;
            text.style.color = '#86efac';
            break;
        case CONFIG.TEST_STATES.ARMED:
            circle.style.borderColor = CONFIG.COLORS.WARNING;
            text.style.color = '#fcd34d';
            break;
        case CONFIG.TEST_STATES.RUNNING:
            circle.style.borderColor = CONFIG.COLORS.INFO;
            text.style.color = '#06b6d4';
            break;
        case CONFIG.TEST_STATES.TRIPPED:
            circle.style.borderColor = CONFIG.COLORS.SUCCESS;
            text.style.color = '#86efac';
            break;
        case CONFIG.TEST_STATES.COMPLETE:
            circle.style.borderColor = CONFIG.COLORS.SUCCESS;
            text.style.color = '#86efac';
            break;
        case CONFIG.TEST_STATES.FAULT:
            circle.style.borderColor = CONFIG.COLORS.DANGER;
            text.style.color = '#fca5a5';
            break;
    }
}

function updateMeasurements() {
    document.getElementById('peakCurrent').textContent = STATE.measurements.peakCurrent + ' A';
    document.getElementById('faultCurrent').textContent = STATE.measurements.faultCurrent + ' kA';
    document.getElementById('voltageBefore').textContent = STATE.measurements.voltageBefore + ' V';
    document.getElementById('voltageDuring').textContent = STATE.measurements.voltageDuring + ' V';
    document.getElementById('tripTime').textContent = STATE.measurements.tripTime + ' ms';
    document.getElementById('faultDuration').textContent = STATE.measurements.faultDuration + ' ms';
    
    if (STATE.results.mcbOperation) {
        document.getElementById('mcbOperation').textContent = 'Detected ✓';
    }
    if (STATE.results.tripTimeResult) {
        document.getElementById('tripTimeResult').textContent = STATE.results.tripTimeResult;
    }
    if (STATE.results.interruptionResult) {
        document.getElementById('interruptionResult').textContent = STATE.results.interruptionResult;
    }
}