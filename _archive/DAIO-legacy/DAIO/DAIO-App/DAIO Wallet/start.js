#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const { join, dirname } = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader() {
    log('================================', colors.cyan);
    log('   DAIO Wallet - One Click Start', colors.cyan);
    log('================================', colors.cyan);
    log('');
}

function checkNode() {
    try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        log(`Node.js version: ${version}`, colors.green);
        return true;
    } catch (error) {
        log('ERROR: Node.js is not installed!', colors.red);
        log('Please download and install Node.js from https://nodejs.org/', colors.red);
        return false;
    }
}

function installDependencies(appDir) {
    return new Promise((resolve, reject) => {
        log('Installing dependencies...', colors.yellow);
        log('This may take a few minutes...', colors.yellow);
        log('');
        
        const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const install = spawn(npm, ['install'], {
            cwd: appDir,
            stdio: 'inherit'
        });
        
        install.on('close', (code) => {
            if (code === 0) {
                log('');
                log('Dependencies installed successfully!', colors.green);
                log('');
                resolve();
            } else {
                reject(new Error('Failed to install dependencies'));
            }
        });
        
        install.on('error', (error) => {
            reject(error);
        });
    });
}

function startServer(appDir) {
    return new Promise((resolve, reject) => {
        log('Starting DAIO Wallet on http://localhost:2111', colors.green);
        log('');
        log('Press CTRL+C to stop the server', colors.yellow);
        log('');
        
        const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const dev = spawn(npm, ['run', 'dev', '--', '--port', '2111', '--host', 'localhost'], {
            cwd: appDir,
            stdio: 'inherit'
        });
        
        dev.on('close', (code) => {
            if (code !== 0) {
                reject(new Error('Development server exited with error'));
            }
        });
        
        dev.on('error', (error) => {
            reject(error);
        });
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            log('\nShutting down...', colors.yellow);
            dev.kill();
            process.exit(0);
        });
    });
}

async function main() {
    logHeader();
    
    // Check Node.js
    if (!checkNode()) {
        process.exit(1);
    }
    
    log('');
    
    // Get app directory
    const scriptDir = dirname(process.argv[1]);
    const appDir = join(scriptDir, 'app');
    
    // Check if app directory exists
    if (!existsSync(appDir)) {
        log('ERROR: App directory not found!', colors.red);
        log('Please make sure you\'re in the correct directory.', colors.red);
        process.exit(1);
    }
    
    // Check if package.json exists
    const packageJson = join(appDir, 'package.json');
    if (!existsSync(packageJson)) {
        log('ERROR: package.json not found!', colors.red);
        log('Please make sure you\'re in the correct directory.', colors.red);
        process.exit(1);
    }
    
    // Check if node_modules exists
    const nodeModules = join(appDir, 'node_modules');
    if (!existsSync(nodeModules)) {
        try {
            await installDependencies(appDir);
        } catch (error) {
            log('ERROR: Failed to install dependencies!', colors.red);
            log('Please check your internet connection and try again.', colors.red);
            process.exit(1);
        }
    } else {
        log('Dependencies already installed.', colors.green);
        log('');
    }
    
    // Start the server
    try {
        await startServer(appDir);
    } catch (error) {
        log('ERROR: Failed to start the development server!', colors.red);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error(error);
        process.exit(1);
    });
}