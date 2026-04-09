# Development QR Code Setup

Since Next.js 16.1.6 doesn't have built-in QR code support yet, I've created a custom solution for easy mobile testing.

## Usage

Instead of running `npm run dev`, use:

```bash
npm run dev:qr
```

This will:
1. Start the Next.js development server
2. Display a QR code in your terminal
3. Show your local network URL

## How It Works

The script (`scripts/dev-with-qr.js`):
- Detects your local network IP address
- Starts the Next.js dev server
- Generates a QR code pointing to `http://YOUR_IP:3000`
- Displays it in the terminal for easy scanning

## Mobile Testing

1. Run `npm run dev:qr`
2. Scan the QR code with your phone's camera
3. Your phone will open the development site on your local network
4. Both devices must be on the same WiFi network

## Example Output

```
🚀 Starting Next.js development server...

📱 Scan this QR code to open on your mobile device:

█████████████████████████████
█████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄▄█ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ ▀█ █   █ ████
████ █▄▄▄█ █▀ █▀▀▄█ █▄▄▄█ ████
████▄▄▄▄▄▄▄█▄▀ ▀▄█ █▄▄▄▄▄▄████
████  ▀▀ ▀▄▄ ▄▀▀▄▄▄▄██▀▀█▄▄████
████▄██▄█▄▄█  ▀▄▀ ▄▄▄ ▀  ▀████
████ ▄▄▄▄▄ █▄ ▄ █ █▄█ ▄▄▀█████
████ █   █ █  ▄▀▄▄▄▄▄▄▄█ █████
████ █▄▄▄█ █ ▄▀ ▄▀▀▀█▀▀▀ █████
████▄▄▄▄▄▄▄█▄▄███▄▄▄█▄██▄▄████
█████████████████████████████
█████████████████████████████

🌐 Network URL: http://192.168.1.100:3000
```

## Troubleshooting

### QR Code Not Appearing

If the QR code doesn't show, the package might not be installed:

```bash
npm install --save-dev qrcode-terminal
```

### Can't Connect from Phone

Make sure:
1. Both devices are on the same WiFi network
2. Your firewall allows connections on port 3000
3. You're using the network URL (not localhost)

### Different Port

To use a different port:

```bash
PORT=4000 npm run dev:qr
```

## Regular Development

If you don't need the QR code, just use the regular command:

```bash
npm run dev
```

## Next.js Config

The `next.config.ts` has been updated with:
- `devIndicators.position: 'bottom-right'` - Shows build activity indicator

Note: The native `devQR` feature is not available in Next.js 16.1.6, which is why we created this custom solution.
