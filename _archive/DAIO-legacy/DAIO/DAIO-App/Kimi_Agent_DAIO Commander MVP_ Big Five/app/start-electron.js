#!/usr/bin/env node

/**
 * DAIO Commander - Electron Starter
 * 
 * Dieses Skript startet die DAIO Commander App im Electron-Modus.
 * Voraussetzung: npm install wurde ausgeführt
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.error('❌ Fehler: node_modules nicht gefunden.');
  console.log('Bitte führen Sie zuerst "npm install" aus.');
  process.exit(1);
}

// Check if dist exists, if not build first
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('📦 Build wird erstellt...');
  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true
  });
  
  build.on('close', (code) => {
    if (code === 0) {
      startElectron();
    } else {
      console.error('❌ Build fehlgeschlagen');
      process.exit(1);
    }
  });
} else {
  startElectron();
}

function startElectron() {
  console.log('🚀 Starte DAIO Commander...');
  console.log('');
  
  const electron = spawn('node', [
    path.join(__dirname, 'node_modules/electron/cli.js'),
    '.'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  electron.on('close', (code) => {
    process.exit(code);
  });
}
