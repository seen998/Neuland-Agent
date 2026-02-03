# AI Coaching Agent - Personal Vision

A professional AI coaching web application focused on Personal Vision and Personal Mastery, based on Peter Senge's framework. The application features bilingual support (English/German), password-protected content, and uses OpenRouter API for AI capabilities.

## Features

- 🤖 **AI Coaching**: Powered by DeepSeek models via OpenRouter API
- 🌍 **Bilingual**: Full support for English and German
- 🔒 **Session Isolation**: Each user has completely isolated chat sessions
- 🔐 **Password Protection**: Multi Minds tab secured with password (NeulandKI)
- 📝 **Streaming Responses**: Real-time AI response streaming
- ⚖️ **Model Comparison**: Side-by-side model comparison for testing
- 🎨 **Professional UI**: Clean white and orange (#f39200) design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, TypeScript
- **AI**: OpenRouter API (DeepSeek models)
- **Deployment**: Railway

## Quick Start

### Prerequisites

- Node.js 18+
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-coaching-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_api_key_here
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
ai-coaching-agent/
├── docs/                    # Documentation
│   ├── models-reference.md  # Peter Senge's research
│   ├── ai-persona.md       # AI coaching persona spec
│   └── technical-architecture.md
├── src/
│   ├── client/             # Frontend React app
│   │   ├── components/
│   │   ├── stores/         # Zustand state management
│   │   └── utils/
│   ├── server/             # Backend Express API
│   │   ├── routes/
│   │   ├── services/
│   │   └── constants/
│   └── shared/             # Shared TypeScript types
├── package.json
└── railway.json            # Railway deployment config
```

## API Endpoints

### Session Management
- `POST /api/session/create` - Create new session
- `GET /api/session/:id` - Get session data
- `PUT /api/session/:id` - Update session
- `DELETE /api/session/:id` - Delete session

### Chat
- `POST /api/chat/send` - Send message (streaming)
- `GET /api/chat/history/:sessionId/:tabId` - Get conversation history
- `DELETE /api/chat/history/:sessionId/:tabId` - Clear conversation

### Tabs
- `GET /api/tabs/available/:sessionId` - Get available tabs
- `POST /api/tabs/unlock` - Unlock tab with password

### Configuration
- `GET /api/config/models` - List available AI models
- `GET /api/config/app` - Get app configuration

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard:
   - `OPENROUTER_API_KEY`
   - `NODE_ENV=production`
   - `PORT=3000`
3. Deploy!

## AI Persona

The AI coach embodies Peter Senge's Personal Mastery framework with:
- Spacious pacing (one question at a time)
- Authentic listening (no fake mirroring)
- Emotional grounding with emojis
- Genuine curiosity-driven questions

See [`docs/ai-persona.md`](docs/ai-persona.md) for full specifications.

## Password

To unlock the "Multi Minds" tab:
- **Password**: `NeulandKI`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `SESSION_TIMEOUT_MS` | Session timeout | No (default: 3600000) |
| `MULTI_MINDS_PASSWORD` | Multi Minds password | No (default: NeulandKI) |

## License

MIT

## Credits

Based on Peter Senge's "The Fifth Discipline" - Personal Mastery framework.
