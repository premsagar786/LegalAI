/**
 * TomTom API Configuration Checker
 * 
 * This script verifies that your TomTom API integration is properly configured.
 * Run this script to check your setup before starting the server.
 * 
 * Usage: node check-tomtom-config.js
 */

require('dotenv').config();
const axios = require('axios');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ ${message}`, 'cyan');
}

async function checkTomTomConfig() {
    log('\n═══════════════════════════════════════════════', 'blue');
    log('   TomTom API Configuration Checker', 'blue');
    log('═══════════════════════════════════════════════\n', 'blue');

    let hasErrors = false;

    // Check 1: Environment variable exists
    logInfo('Checking environment variables...');
    const apiKey = process.env.TOMTOM_API_KEY;

    if (!apiKey) {
        logError('TOMTOM_API_KEY is not set in .env file');
        logWarning('Please add TOMTOM_API_KEY=your_key_here to server/.env');
        hasErrors = true;
    } else if (apiKey === 'YOUR_TOMTOM_API_KEY_HERE' || apiKey === 'your_tomtom_api_key_here') {
        logError('TOMTOM_API_KEY is still set to placeholder value');
        logWarning('Please replace with your actual TomTom API key');
        logInfo('Get your key at: https://developer.tomtom.com/');
        hasErrors = true;
    } else {
        logSuccess('TOMTOM_API_KEY is set');
        logInfo(`Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    }

    // Check 2: Service file exists
    logInfo('\nChecking service file...');
    try {
        const fs = require('fs');
        const path = require('path');
        const servicePath = path.join(__dirname, 'src', 'services', 'googleMapsService.js');

        if (fs.existsSync(servicePath)) {
            logSuccess('Service file exists: src/services/googleMapsService.js');

            // Check if it contains TomTom references
            const content = fs.readFileSync(servicePath, 'utf8');
            if (content.includes('TomTomMapsService')) {
                logSuccess('Service file contains TomTomMapsService class');
            } else {
                logWarning('Service file may not be updated to use TomTom API');
            }
        } else {
            logError('Service file not found: src/services/googleMapsService.js');
            hasErrors = true;
        }
    } catch (error) {
        logError(`Error checking service file: ${error.message}`);
        hasErrors = true;
    }

    // Check 3: Test API connection (if key is valid)
    if (apiKey && apiKey !== 'YOUR_TOMTOM_API_KEY_HERE' && apiKey !== 'your_tomtom_api_key_here') {
        logInfo('\nTesting TomTom API connection...');

        try {
            // Test with New York coordinates
            const testLat = 40.7128;
            const testLon = -74.0060;
            const testRadius = 5000;

            const response = await axios.get(
                'https://api.tomtom.com/search/2/search/lawyer.json',
                {
                    params: {
                        key: apiKey,
                        lat: testLat,
                        lon: testLon,
                        radius: testRadius,
                        limit: 5,
                        categorySet: '7321',
                        language: 'en-US',
                        view: 'Unified'
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200) {
                logSuccess('TomTom API connection successful');

                const resultCount = response.data.results?.length || 0;
                logInfo(`Found ${resultCount} results in test search`);

                if (resultCount > 0) {
                    logSuccess('API is returning results correctly');
                    logInfo(`Sample result: ${response.data.results[0].poi?.name || 'N/A'}`);
                } else {
                    logWarning('API connected but returned no results (this may be normal for the test location)');
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    logError('API Key is invalid or unauthorized');
                    logWarning('Please check your API key at: https://developer.tomtom.com/user/me/apps');
                } else if (error.response.status === 429) {
                    logError('Rate limit exceeded');
                    logWarning('You have exceeded your API quota. Check your usage at the TomTom dashboard.');
                } else {
                    logError(`API Error: ${error.response.status} - ${error.response.statusText}`);
                    if (error.response.data) {
                        logInfo(`Error details: ${JSON.stringify(error.response.data)}`);
                    }
                }
                hasErrors = true;
            } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                logError('Network error: Could not connect to TomTom API');
                logWarning('Please check your internet connection');
                hasErrors = true;
            } else {
                logError(`Unexpected error: ${error.message}`);
                hasErrors = true;
            }
        }
    }

    // Check 4: Controller file
    logInfo('\nChecking controller file...');
    try {
        const fs = require('fs');
        const path = require('path');
        const controllerPath = path.join(__dirname, 'src', 'controllers', 'lawyerController.js');

        if (fs.existsSync(controllerPath)) {
            logSuccess('Controller file exists: src/controllers/lawyerController.js');

            const content = fs.readFileSync(controllerPath, 'utf8');
            if (content.includes('tomtomMapsService')) {
                logSuccess('Controller is using tomtomMapsService');
            } else if (content.includes('googleMapsService')) {
                logWarning('Controller still references googleMapsService (this is OK if the service file is updated)');
            }
        } else {
            logError('Controller file not found');
            hasErrors = true;
        }
    } catch (error) {
        logError(`Error checking controller file: ${error.message}`);
    }

    // Summary
    log('\n═══════════════════════════════════════════════', 'blue');
    if (hasErrors) {
        logError('Configuration check completed with errors');
        log('\nPlease fix the errors above before starting the server.', 'yellow');
        log('\nFor help, see:', 'cyan');
        log('  • TOMTOM_API_GUIDE.md - Setup instructions', 'cyan');
        log('  • TOMTOM_QUICK_REFERENCE.md - API reference', 'cyan');
        log('  • MIGRATION_SUMMARY.md - Migration details\n', 'cyan');
        process.exit(1);
    } else {
        logSuccess('All checks passed! Your TomTom API integration is ready.');
        log('\nYou can now start the server with: npm start\n', 'green');
        process.exit(0);
    }
}

// Run the checks
checkTomTomConfig().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});
