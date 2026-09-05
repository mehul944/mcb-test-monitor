// Main application initialization and event handling

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize waveform chart
    initWaveformChart();
    
    // Setup event listeners
    setupEventListeners();
    
    // Generate initial test ID
    STATE.currentTestId = Utils.generateTestId();
    Utils.updateElement('currentTestId', STATE.currentTestId);
}

function setupEventListeners() {
    // Test control buttons
    DOM.on('startTestBtn', 'click', startTest);
    DOM.on('pauseTestBtn', 'click', pauseTest);
    DOM.on('resetBtn', 'click', resetTest);
    DOM.on('emergencyStop', 'click', emergencyStop);
    
    // Waveform controls
    DOM.on('zoomIn', 'click', () => {
        if (waveformChart) waveformChart.zoomIn();
    });
    DOM.on('zoomOut', 'click', () => {
        if (waveformChart) waveformChart.zoomOut();
    });
    DOM.on('resetZoom', 'click', () => {
        if (waveformChart) waveformChart.resetZoom();
    });
    
    // Report buttons
    DOM.on('generatePdfBtn', 'click', generatePDFReport);
    DOM.on('exportCsvBtn', 'click', exportRawData);
    DOM.on('exportHistoryBtn', 'click', exportHistory);
    
    // Navigation
    DOM.onAll('.nav-item', 'click', handleNavigation);
    
    // Settings button
    DOM.on('settings-btn', 'click', () => {
        alert('Settings panel - Coming Soon');
    });
}

function handleNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    e.currentTarget.classList.add('active');
    
    // Get page name
    const pageName = e.currentTarget.getAttribute('data-page');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageId = `${pageName}-page`;
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
}

function generatePDFReport() {
    if (!STATE.results.status || STATE.results.status === CONFIG.RESULT_STATES.READY) {
        alert('No test results available to export.');
        return;
    }
    
    // Create PDF content
    const pdfContent = `
        MCB TEST MONITOR - TEST REPORT
        ==============================
        
        Test Information:
        - Test ID: ${STATE.currentTestId}
        - Date/Time: ${STATE.results.timestamp}
        - Status: ${STATE.results.status.toUpperCase()}
        
        MCB Configuration:
        - Rating: ${document.getElementById('mcbRating').value}
        - Type: ${document.getElementById('mcbType').value}
        - Test Current: ${document.getElementById('testCurrent').value} A
        - Operations: ${STATE.operationsCompleted} / ${STATE.totalOperations}
        
        Measurements:
        - Peak Current: ${STATE.measurements.peakCurrent} A
        - Fault Current: ${STATE.measurements.faultCurrent} kA
        - Voltage Before: ${STATE.measurements.voltageBefore} V
        - Voltage During: ${STATE.measurements.voltageDuring} V
        - Trip Time: ${STATE.measurements.tripTime} ms
        - Fault Duration: ${STATE.measurements.faultDuration} ms
        
        Test Results:
        - MCB Operation: ${STATE.results.mcbOperation ? 'Detected ✓' : 'Not Detected'}
        - Trip Time Result: ${STATE.results.tripTimeResult || 'N/A'}
        - Interruption Result: ${STATE.results.interruptionResult || 'N/A'}
        
        Operator Comments:
        ${document.getElementById('operatorComments').value || 'None'}
        
        Safety Status:
        - Door: ${STATE.safety.doorClosed ? 'Closed ✓' : 'Open'}
        - E-Stop: ${STATE.safety.emergencyStopReleased ? 'Released ✓' : 'Engaged'}
        - Sensors: ${STATE.safety.sensorsReady ? 'Ready ✓' : 'Not Ready'}
        - Controller: ${STATE.safety.controllerHealthy ? 'Healthy ✓' : 'Fault'}
        
        ==============================
        PROTOTYPE MODE - Scaled demonstration system
        Certified testing requires appropriate laboratory equipment
    `;
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${STATE.currentTestId}_report.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('Report generated and downloaded successfully!');
}

function exportRawData() {
    if (!STATE.waveformData.current || STATE.waveformData.current.length === 0) {
        alert('No waveform data available to export.');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Time(ms),Current(A),Voltage(V)\n';
    
    for (let i = 0; i < STATE.waveformData.current.length; i++) {
        const time = STATE.waveformData.time[i] || i;
        const current = STATE.waveformData.current[i] || 0;
        const voltage = STATE.waveformData.voltage[i] || 0;
        csvContent += `${time},${current},${voltage}\n`;
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${STATE.currentTestId}_raw_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('Raw data exported successfully!');
}

function exportHistory() {
    // Get all history table rows
    const rows = document.querySelectorAll('.history-table tbody tr');
    if (rows.length === 0) {
        alert('No history data to export.');
        return;
    }
    
    let csvContent = 'Test ID,Date,MCB Rating,Peak Current,Trip Time,Result,Operator\n';
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const testId = cells[0].textContent;
        const date = cells[1].textContent;
        const mcbRating = cells[2].textContent;
        const peakCurrent = cells[3].textContent;
        const tripTime = cells[4].textContent;
        const result = cells[5].textContent.trim();
        const operator = cells[6].textContent;
        
        csvContent += `"${testId}","${date}","${mcbRating}","${peakCurrent}","${tripTime}","${result}","${operator}"\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcb_test_history_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('History exported successfully!');
}

// Responsive design adjustment
window.addEventListener('resize', () => {
    if (waveformChart) {
        waveformChart.resizeCanvas();
    }
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden && STATE.isTestRunning) {
        // Optionally pause test when page is hidden
    }
});

console.log('MCB Test Monitor v' + CONFIG.VERSION + ' initialized successfully');