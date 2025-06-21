# WebRTC Live Support Demo

A minimal browser-based live support system demonstrating WebRTC video streaming from customer to agent.

## Features

- **Agent Interface**: Create sessions, generate secure links, view live customer video
- **Customer Interface**: Mobile-friendly camera streaming
- **WebRTC**: Direct peer-to-peer video streaming
- **Session Management**: UUID-based temporary sessions (30min expiry)
- **Screenshot Capture**: Agent can capture screenshots from video feed

## Quick Start

### Local Development
```bash
npm install
npm start
```
Open http://localhost:3000 for agent interface

### Docker Deployment
```bash
docker build -t webrtc-demo .
docker run -p 3000:3000 webrtc-demo
```

## Usage

1. **Agent**: Enter customer name/phone → Click "Send Session Link"
2. **Customer**: Open the generated link → Allow camera access → Start session
3. **Agent**: View live video stream and capture screenshots

## Demo Flow

1. Agent creates session with customer details
2. System generates unique session URL (expires in 30 minutes)
3. Customer opens link on mobile device
4. Customer grants camera permission and starts streaming
5. Agent sees live one-way video feed
6. Agent can capture screenshots from the video

## Technical Stack

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: Vanilla HTML/JS
- **WebRTC**: Browser native APIs with Google STUN servers
- **Storage**: In-memory (sessions auto-expire)
- **Deployment**: Docker container ready

## Notes

- SMS sending is mocked (logs to console)
- No authentication required for demo
- Sessions expire automatically after 30 minutes
- Uses free STUN servers only
- Mobile-optimized customer interface