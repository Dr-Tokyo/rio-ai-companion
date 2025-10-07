# Rio Futaba AI Helper

An interactive AI study companion inspired by Rio Futaba from "Rascal Does Not Dream of Bunny Girl Senpai". Features voice interaction, animated 2D character, and cross-platform support.

## Features

- 🎤 **Voice Interaction**: Speech-to-text input and text-to-speech responses
- 🎨 **Animated Character**: Dynamic 2D Rio model with multiple expressions and smooth animations
- 📚 **Multi-Subject Help**: Science, History, Math, and English
- 🌐 **Cross-Platform**: Works on Web, iOS, Android, and Desktop (Ubuntu/macOS)
- 💬 **AI-Powered**: Uses Google Gemini for intelligent, personality-driven responses

## Running the App

### Web Browser (All Platforms)
Simply visit the deployed URL or run:
```bash
npm install
npm run dev
```

### Mobile (iOS/Android)

1. **Export to GitHub** via the button in Lovable
2. **Clone the repository** locally
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Add mobile platforms**:
   ```bash
   npx cap add ios      # For iOS (requires macOS + Xcode)
   npx cap add android  # For Android (requires Android Studio)
   ```
5. **Build the project**:
   ```bash
   npm run build
   ```
6. **Sync with native platforms**:
   ```bash
   npx cap sync
   ```
7. **Run on device/emulator**:
   ```bash
   npx cap run ios      # For iOS
   npx cap run android  # For Android
   ```

### Desktop (Ubuntu/macOS)
The app works perfectly in any modern web browser (Chrome, Firefox, Safari, Edge).

For a native desktop experience, you can:
- Use Chrome/Edge's "Install App" feature (creates a desktop app)
- Or simply bookmark the URL for quick access

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Lovable Cloud (Supabase) with Edge Functions
- **AI**: Google Gemini 2.5 Flash (via Lovable AI Gateway)
- **Voice**: OpenAI Whisper (speech-to-text) + TTS (text-to-speech)
- **Mobile**: Capacitor

## Character States

Rio's animated model includes multiple states:
- **Idle**: Gentle breathing animation with subtle movement
- **Speaking**: Active pose when giving voice responses
- **Thinking**: Analytical pose while processing your question
- **Happy**: Occasional smile when responding positively

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- Capacitor (for mobile)
- Supabase Edge Functions
- OpenAI API (Whisper + TTS)
- Google Gemini AI

## Development

This project was built with [Lovable](https://lovable.dev) - the AI-powered app builder.

## License

MIT
