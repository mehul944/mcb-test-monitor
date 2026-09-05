# mcb-test-monitor
Automated MCB Short-Circuit Test System Monitoring Dashboard - SIH 2026

## Project Overview
A real-time monitoring dashboard for MCB (Miniature Circuit Breaker) short-circuit testing systems. This application provides automated tracking and visualization of test results for the Smart India Hackathon 2026.

## Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git (for cloning the repository)
- A local web server (optional, for better performance)

### Quick Start

#### Option 1: Direct File Opening
1. **Clone the repository:**
   ```bash
   git clone https://github.com/mehul944/mcb-test-monitor.git
   cd mcb-test-monitor
   ```

2. **Open in your browser:**
   - Simply open `index.html` directly in your web browser by double-clicking it, or
   - Right-click `index.html` → Open with → Choose your browser

#### Option 2: Using a Local Web Server (Recommended)
This method is recommended to avoid CORS issues and ensure better performance.

**Using Python:**
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

**Using Node.js (if you have http-server installed):**
```bash
npx http-server
```

**Using PHP:**
```bash
php -S localhost:8000
```

3. **Access the application:**
   - Open your browser and navigate to:
   - `http://localhost:8000` (or the port specified by your server)

### Project Structure
```
mcb-test-monitor/
├── index.html          # Main application file
├── js/                 # JavaScript files (functionality)
├── styles/             # CSS stylesheets
├── README.md           # This file
└── LICENSE             # MIT License
```

## Usage
1. Once opened in your browser, the monitoring dashboard will display the MCB test system status
2. View real-time test data and system metrics
3. Monitor test results and performance indicators

## Features
- Real-time MCB short-circuit test monitoring
- Interactive dashboard interface
- Automated test tracking
- Visual data representation

## Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript
- **Type:** Single Page Application (SPA)
- **License:** MIT

## Support
For issues, feature requests, or contributions, please visit the [GitHub Issues](https://github.com/mehul944/mcb-test-monitor/issues) page.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Status:** SIH 2026 Project
**Last Updated:** September 5, 2026