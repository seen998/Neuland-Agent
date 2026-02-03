# AI Coaching Agent - Project Plan

---

## Executive Summary

Building a professional AI coaching web application for Personal Vision and Personal Mastery, based on Peter Senge's framework. The application supports bilingual users (English/German), features password-protected content, and uses OpenRouter API for AI capabilities.

---

## Completed Work

### Documentation Created
1. ✅ [`docs/models-reference.md`](docs/models-reference.md) - Comprehensive research on Peter Senge's Fifth Discipline and Personal Mastery (9 sections, ~4,500 words)
2. ✅ [`docs/ai-persona.md`](docs/ai-persona.md) - Detailed AI coaching persona specification with bilingual support
3. ✅ [`docs/technical-architecture.md`](docs/technical-architecture.md) - Complete technical architecture with system diagrams, API specs, and deployment config

---

## Key Features

### User Experience
- **Onboarding**: Name and age collection popup on first visit
- **Language Selection**: English/German toggle at start and throughout
- **Personalized Space**: "{Name}'s Space" displayed in sidebar
- **Session Isolation**: Each user has completely isolated chat sessions

### Navigation Structure
```
Sidebar
├── [UserName]'s Space (header)
├── Tab 1: Self Exploration | Personal Master (UNLOCKED)
│   └── Full coaching functionality
├── Tab 2: Multi Minds (LOCKED 🔒)
│   └── Password protected (NeulandKI)
└── ⚙️ Settings Gear (bottom left)
    └── Password unlock dialog
```

### AI Features
- **Model Selection**: Switch between models during test phase
  - `tngtech/deepseek-r1t2-chimera:free`
  - `deepseek/deepseek-v3.2`
- **Side-by-Side Comparison**: Compare model outputs simultaneously
- **Coaching Persona**: Present Coach for Personal Vision
- **Conversation Threading**: Full context retention within session

---

## Technical Implementation Plan

### Phase 1: Project Setup
1. Initialize Vite + React + TypeScript project
2. Install dependencies (Tailwind, Express, Zustand, etc.)
3. Set up project folder structure
4. Configure TypeScript and build tools
5. Create environment configuration

### Phase 2: Backend API
1. Create Express server with TypeScript
2. Implement session management (UUID-based)
3. Build OpenRouter API integration
4. Create chat endpoints with conversation history
5. Implement tab unlock logic with password verification
6. Add health check endpoint

### Phase 3: Frontend Core
1. Set up React app with routing
2. Create Zustand store for state management
3. Implement language switching (i18n)
4. Build session initialization flow
5. Create API client for backend communication

### Phase 4: UI Components
1. Build main layout with sidebar and chat area
2. Create onboarding modal (name, age, language)
3. Implement tab navigation with lock/unlock states
4. Build settings gear with password dialog
5. Create chat interface (messages, input)
6. Implement model selector and comparison toggle

### Phase 5: AI Integration
1. Load persona prompts from documentation
2. Build message formatting for OpenRouter
3. Implement streaming or batched responses
4. Add conversation context management
5. Create side-by-side comparison view

### Phase 6: Polish & Deploy
1. Add loading states and error handling
2. Implement responsive design
3. Test conversation threading
4. Verify session isolation
5. Configure for Railway deployment
6. Deploy and test live

---

## File Structure

```
ai-coaching-agent/
├── docs/                          # Documentation
│   ├── models-reference.md        # Peter Senge research
│   ├── ai-persona.md             # AI persona spec
│   └── technical-architecture.md  # Tech architecture
├── plans/                         # Planning documents
│   └── project-plan.md           # This file
├── src/
│   ├── client/                    # Frontend
│   │   ├── components/
│   │   │   ├── ui/               # Button, Modal, Input, etc.
│   │   │   ├── chat/             # ChatMessage, ChatInput, ChatContainer
│   │   │   ├── sidebar/          # Sidebar, TabNavigation, UserHeader
│   │   │   └── onboarding/       # OnboardingModal, LanguageSelector
│   │   ├── hooks/                # useSession, useChat, useLanguage
│   │   ├── stores/               # appStore.ts
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/                # api.ts, constants.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── server/                    # Backend
│   │   ├── routes/               # session.ts, chat.ts, tabs.ts
│   │   ├── services/             # openrouter.ts, sessionManager.ts
│   │   ├── types/                # Server types
│   │   ├── middleware/           # cors.ts, rateLimit.ts
│   │   ├── constants/            # prompts.ts, config.ts
│   │   └── index.ts
│   └── shared/                    # Shared types
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── railway.json
```

---

## Critical Implementation Details

### Password Protection
- **Password**: `NeulandKI`
- **Location**: Gear icon bottom-left of sidebar
- **Behavior**: Modal dialog, server-side verification, session persistence

### Language Support
- **Languages**: English (en), German (de)
- **Selection**: Onboarding + persistent toggle
- **AI Response**: System prompt switches based on language

### Session Management
- **ID Generation**: UUID v4
- **Storage**: In-memory Map (server) + localStorage (client)
- **Isolation**: sessionId + tabId keys for conversations
- **Expiration**: Configurable timeout (default: 1 hour)

### OpenRouter Integration
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Models**: 
  - `tngtech/deepseek-r1t2-chimera:free`
  - `deepseek/deepseek-v3.2`
- **Temperature**: 0.7
- **Max Tokens**: 1000

### AI Persona Format
```
[EMOJI]

"Brief acknowledgment"

**Single genuine question**
```

Rules:
- One question per message
- Under 40 words per block
- Two line breaks between thoughts
- Emoji at top: 🌿 💫 🌊 ✨ 💛 🌀
- Questions in **bold**

---

## Deployment Checklist

- [ ] OpenRouter API key configured in Railway
- [ ] Environment variables set (PORT, NODE_ENV, SESSION_TIMEOUT)
- [ ] Health check endpoint responding
- [ ] Build completes successfully
- [ ] Static assets served correctly
- [ ] API routes accessible
- [ ] Session persistence working
- [ ] Language switching functional
- [ ] Password protection working
- [ ] Model comparison rendering

---

## Next Steps

1. **Review this plan** - Confirm all requirements captured
2. **Switch to Code mode** - Begin implementation
3. **Set up project** - Initialize repository and dependencies
4. **Build incrementally** - Follow the phases outlined above

---

## Questions for Confirmation

Before proceeding to implementation, please confirm:

1. **Is the password "NeulandKI" correct for Multi Minds unlock?**
2. **Should Multi Minds have a different AI persona, or is it just a placeholder for now?**
3. **Any specific styling preferences (colors, fonts) or use default dark theme?**
4. **Do you want streaming responses or batched (complete message at once)?**

---

*Plan Version: 1.0*
*Last Updated: 2026-02-03*
