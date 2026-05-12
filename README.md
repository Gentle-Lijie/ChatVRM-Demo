# ChatVRM Demo

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)![Three.js](https://img.shields.io/badge/Three.js-r180-black?logo=three.js)![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)![License](https://img.shields.io/badge/License-MIT-blue)


A web-based chatbot demo featuring a 3D VRM character with facial expressions, powered by Vue 3, Three.js, and OpenAI-compatible APIs.

The VRM demo model (Unagirl) is from [uezo/ChatdollKit](https://github.com/uezo/ChatdollKit).

## Features

- 3D VRM character rendering with Three.js and @pixiv/three-vrm
- Real-time chat with streaming responses via OpenAI-compatible API
- Facial expressions triggered by AI-generated emotion tags
- Automatic blinking animation
- Talking mouth animation during response streaming
- Upload and switch VRM models through the UI (drag & drop supported)
- Custom API base URL, key, and model configuration with connection test
- Settings persisted in localStorage

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

Open http://localhost:5173, click the gear icon to configure your API settings, then start chatting.

## Configuration

Click the gear icon in the top-left corner to open the settings panel:

| Setting | Description | Default |
|---------|-------------|---------|
| Base URL | OpenAI-compatible API endpoint | `https://api.openai.com/v1` |
| API Key | Your API key | - |
| Model | Model name | `gpt-4o-mini` |
| System Prompt | Instructions for the AI assistant | Built-in prompt with emotion tag support |

Use the "Test Connection" button to verify your API configuration before chatting.

## Architecture

```
src/
  lib/                    # Framework-agnostic core
    viewer/               # Three.js scene, VRM loading
    expression/           # Emotion, blink, lip sync controllers
    chat/                 # OpenAI streaming API client
  composables/            # Vue composables bridging UI and core
  components/             # Vue components
    VRMViewer.vue         # 3D canvas
    ChatWindow.vue        # Chat messages + input
    SettingsPanel.vue     # API config + VRM upload
```

The Three.js and VRM logic lives in plain TypeScript classes under `src/lib/`, keeping it independent from Vue's reactivity system. Vue handles only the UI layer.

## Emotion Tags

The AI assistant can include emotion tags in responses to trigger facial expressions:

`[happy]`, `[sad]`, `[angry]`, `[relaxed]`, `[surprised]`, `[neutral]`

Example: `[happy] Nice to meet you! How can I help?`

## Tech Stack

- **Vue 3** + **TypeScript** + **Vite**
- **Three.js** + **@pixiv/three-vrm** for VRM rendering
- **OpenAI Chat Completions API** (streaming SSE)

## License

[MIT](./LICENSE)
