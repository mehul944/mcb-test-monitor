// Waveform visualization and chart rendering

class WaveformChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.zoomLevel = 1;
        this.panOffset = 0;
        this.padding = 50;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.redraw();
    }
    
    clear() {
        this.ctx.fillStyle = '#0b1220';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = this.padding + (i * (this.width - 2 * this.padding) / 10);
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding);
            this.ctx.lineTo(x, this.height - this.padding);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = this.padding + (i * (this.height - 2 * this.padding) / 5);
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.width - this.padding, y);
            this.ctx.stroke();
        }
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '12px Arial';
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.height - this.padding);
        this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, this.height - this.padding);
        this.ctx.stroke();
        
        // X-axis label
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Time (ms)', this.width / 2, this.height - 10);
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(15, this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Current (A) / Voltage (V)', 0, 0);
        this.ctx.restore();
        
        // Scale labels
        this.ctx.textAlign = 'right';
        this.ctx.font = '10px Arial';
        
        // Time labels (0, 2.5, 5, 7.5, 10 seconds)
        for (let i = 0; i <= 4; i++) {
            const x = this.padding + (i * (this.width - 2 * this.padding) / 4);
            const time = (i * 2.5).toFixed(1);
            this.ctx.fillText(`${time}s`, x, this.height - this.padding + 15);
        }
        
        // Amplitude labels
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = this.height - this.padding - (i * (this.height - 2 * this.padding) / 4);
            const value = (i * 100).toFixed(0);
            this.ctx.fillText(value, this.padding - 10, y + 4);
        }
    }
    
    plotWaveform(label, data, color) {
        if (!data || data.length === 0) return;
        
        const graphWidth = this.width - 2 * this.padding;
        const graphHeight = this.height - 2 * this.padding;
        const maxDataPoints = Math.floor(graphWidth / this.zoomLevel);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const step = Math.max(1, Math.floor(data.length / maxDataPoints));
        let isFirstPoint = true;
        
        for (let i = 0; i < data.length; i += step) {
            const value = Math.min(Math.max(data[i], 0), 500);
            const normalizedValue = value / 500;
            
            const x = this.padding + ((i / data.length) * graphWidth);
            const y = (this.height - this.padding) - (normalizedValue * graphHeight);
            
            if (isFirstPoint) {
                this.ctx.moveTo(x, y);
                isFirstPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    drawTripEvent(tripPoint) {
        if (tripPoint === null || tripPoint === undefined) return;
        
        const graphWidth = this.width - 2 * this.padding;
        const x = this.padding + ((tripPoint / 1000) * graphWidth);
        
        this.ctx.strokeStyle = CONFIG.COLORS.EVENT;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.padding);
        this.ctx.lineTo(x, this.height - this.padding);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = CONFIG.COLORS.EVENT;
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.padding - 10);
        this.ctx.lineTo(x - 5, this.padding);
        this.ctx.lineTo(x + 5, this.padding);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    redraw() {
        this.clear();
        this.drawGrid();
        this.drawAxes();
        
        if (STATE.waveformData.current && STATE.waveformData.current.length > 0) {
            this.plotWaveform('Current', STATE.waveformData.current, CONFIG.COLORS.CURRENT);
        }
        
        if (STATE.waveformData.voltage && STATE.waveformData.voltage.length > 0) {
            this.plotWaveform('Voltage', STATE.waveformData.voltage, CONFIG.COLORS.VOLTAGE);
        }
        
        if (STATE.waveformData.tripEvent !== null) {
            this.drawTripEvent(STATE.waveformData.tripEvent);
        }
    }
    
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel * 1.5, 10);
        this.redraw();
    }
    
    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel / 1.5, 1);
        this.redraw();
    }
    
    resetZoom() {
        this.zoomLevel = 1;
        this.panOffset = 0;
        this.redraw();
    }
}

let waveformChart = null;

function initWaveformChart() {
    waveformChart = new WaveformChart('waveformChart');
}

function generateWaveformData(duration = 10000, tripTime = 3000) {
    const sampleRate = CONFIG.WAVEFORM.SAMPLE_RATE;
    const numSamples = (duration / 1000) * sampleRate;
    
    const current = [];
    const voltage = [];
    const time = [];
    
    let nominalVoltage = CONFIG.VOLTAGE_NOMINAL;
    let peakCurrent = 0;
    
    for (let i = 0; i < numSamples; i++) {
        const t = (i / sampleRate) * 1000;
        
        if (t < tripTime) {
            const nominalCurrent = 10 + Math.random() * 5;
            const voltageValue = nominalVoltage + (Math.random() - 0.5) * 2;
            
            current.push(nominalCurrent);
            voltage.push(voltageValue);
            time.push(t);
        } 
        else if (t < tripTime + 500) {
            const faultCurrent = 150 + Math.random() * 50;
            const voltageValue = (nominalVoltage * 0.7) + (Math.random() - 0.5) * 5;
            
            current.push(faultCurrent);
            voltage.push(Math.max(voltageValue, 0));
            time.push(t);
            peakCurrent = Math.max(peakCurrent, faultCurrent);
        } 
        else {
            current.push(0);
            voltage.push(nominalVoltage + (Math.random() - 0.5) * 2);
            time.push(t);
        }
    }
    
    return { current, voltage, time, peakCurrent };
}