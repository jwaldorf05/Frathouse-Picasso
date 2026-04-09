#!/usr/bin/env node

/**
 * Development server with QR code for mobile testing
 * Run with: npm run dev:qr
 */

const { spawn } = require('child_process');
const os = require('os');

// Get local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Generate QR code in terminal
function generateQRCode(url) {
  const qrcode = require('qrcode-terminal');
  console.log('\n📱 Scan this QR code to open on your mobile device:\n');
  qrcode.generate(url, { small: true }, (qr) => {
    console.log(qr);
  });
  console.log(`\n🌐 Network URL: ${url}\n`);
}

// Start Next.js dev server
const localIP = getLocalIP();
const port = process.env.PORT || 3000;
const networkURL = `http://${localIP}:${port}`;

console.log('🚀 Starting Next.js development server...\n');

const devServer = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
});

// Wait a bit for server to start, then show QR code
setTimeout(() => {
  try {
    generateQRCode(networkURL);
  } catch (error) {
    console.log('\n⚠️  QR code generation failed. Install qrcode-terminal:');
    console.log('   npm install --save-dev qrcode-terminal\n');
    console.log(`🌐 Network URL: ${networkURL}\n`);
  }
}, 3000);

devServer.on('close', (code) => {
  process.exit(code);
});
