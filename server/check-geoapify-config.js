/**
 * Geoapify API Configuration Checker
 * 
 * This script verifies that your Geoapify API integration is properly configured.
 * Run this script to check your setup before starting the server.
 * 
 * Usage: node check-geoapify-config.js
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

async function checkGeoapifyConfig() {
    log('\n═══════════════════════════════════════════════', 'blue');
    log('   Geoapify API Configuration Checker', 'blue');
    log('═══════════════════════════════════════════════\n', 'blue');

    let hasErrors = false;

    // Check 1: Environment variable exists
    logInfo('Checking environment variables...');
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
        logError('GEOAPIFY_API_KEY is not set in .env file');
        logWarning('Please add GEOAPIFY_API_KEY=your_key_here to server/.env');
        hasErrors = true;
    } else if (apiKey === 'YOUR_GEOAPIFY_API_KEY' || apiKey === 'your_geoapify_api_key_here') {
        logError('GEOAPIFY_API_KEY is still set to placeholder value');
        logWarning('Please replace with your actual Geoapify API key');
        logInfo('Get your key at: https://myprojects.geoapify.com/');
        hasErrors = true;
    } else {
        logSuccess('GEOAPIFY_API_KEY is set');
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

            // Check if it contains Geoapify references
            const content = fs.readFileSync(servicePath, 'utf8');
            if (content.includes('GeoapifyMapsService')) {
                logSuccess('Service file contains GeoapifyMapsService class');
            } else {
                logWarning('Service file may not be updated to use Geoapify API');
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
    if (apiKey && apiKey !== 'YOUR_GEOAPIFY_API_KEY' && apiKey !== 'your_geoapify_api_key_here') {
        logInfo('\nTesting Geoapify API connection...');

        try {
            // Test with New York coordinates
            const testLat = 40.7128;
            const testLon = -74.0060;
            const testRadius = 5000;

            const response = await axios.get(
                'https://api.geoapify.com/v2/places',
                {
                    params: {
                        categories: 'commercial.lawyer',
                        filter: `circle:${testLon},${testLat},${testRadius}`,
                        limit: 5,
                        apiKey: apiKey
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200) {
                logSuccess('Geoapify API connection successful');

                const resultCount = response.data.features?.length || 0;
                logInfo(`Found ${resultCount} results in test search`);

                if (resultCount > 0) {
                    logSuccess('API is returning results correctly');
                    const firstResult = response.data.features[0].properties;
                    logInfo(`Sample result: ${firstResult.name || firstResult.address_line1 || 'N/A'}`);
                } else {
                    logWarning('API connected but returned no results (this may be normal for the test location)');
                    logInfo('Try testing with a different location or broader category');
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    logError('API Key is invalid or unauthorized');
                    logWarning('Please check your API key at: https://myprojects.geoapify.com/');
                } else if (error.response.status === 429) {
                    logError('Rate limit exceeded');
                    logWarning('You have exceeded your API quota. Check your usage at the Geoapify dashboard.');
                } else {
                    logError(`API Error: ${error.response.status} - ${error.response.statusText}`);
                    if (error.response.data) {
                        logInfo(`Error details: ${JSON.stringify(error.response.data)}`);
                    }
                }
                hasErrors = true;
            } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                logError('Network error: Could not connect to Geoapify API');
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
            if (content.includes('geoapifyMapsService')) {
                logSuccess('Controller is using geoapifyMapsService');
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
        log('  • GEOAPIFY_API_GUIDE.md - Setup instructions', 'cyan');
        log('  • GEOAPIFY_QUICK_REFERENCE.md - API reference', 'cyan');
        log('  • README_GEOAPIFY.md - Quick start guide\n', 'cyan');
        process.exit(1);
    } else {
        logSuccess('All checks passed! Your Geoapify API integration is ready.');
        log('\nYou can now start the server with: npm start\n', 'green');
        log('Test the API with:', 'cyan');
        log('  curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"\n', 'cyan');
        process.exit(0);
    }
}

// Run the checks
checkGeoapifyConfig().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});
