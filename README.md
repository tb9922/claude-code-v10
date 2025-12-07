# TITAN PROTOCOL V10 - Sales Training App

A comprehensive sales training and call flow management application built with React, Vite, and Tailwind CSS.

## Features

### 🎯 Multi-Flow Call Management
- **Outbound Calls**: Complete cold calling flow from gatekeeper bypass to closing
- **Inbound Calls**: Qualification and conversion flow for incoming leads
- **Meeting Flow**: Omega protocol for face-to-face closing

### 🎮 Gamification System
- **XP & Ranking**: Earn experience points and progress through ranks (Rookie → SDR → Closer → Top Gun → Titan)
- **Streak Tracking**: Build momentum with consecutive successful transitions
- **Real-time Scoring**: Points awarded based on call quality and outcomes

### 🛡️ Defense Matrix
- **Objection Handling**: Pre-loaded responses for 30+ common objections across 6 categories:
  - Trust & Credibility
  - Money & Funding
  - Intent & Character
  - Price & Terms
  - Timing & Resistance
  - Hostility & Status
- **Editable Scripts**: Customize objection responses to match your style
- **Quick Access**: Keyboard shortcuts for instant objection lookup

### 🎨 Flow Editor
- **Visual Node Editor**: Drag-and-drop interface for customizing call flows
- **Custom Stages**: Add, edit, or remove stages in your sales process
- **Export/Import**: Save and load custom logic flows as JSON

### 💾 Persistence
- **Local Storage**: All progress, custom scripts, and edits saved automatically
- **Session Stats**: Track calls, meetings, and conversion rates

### ⌨️ Keyboard Shortcuts
- `1-4`: Quick select action buttons
- `Backspace`: Go back one stage
- `D`: Toggle Defense Matrix
- `R`: Random objection drill
- `Esc`: Close overlays

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173` when running the dev server.

## Project Structure

```
titan-protocol-v10/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles & Tailwind directives
├── index.html            # HTML entry point
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## Usage Guide

### Starting a Call
1. Choose your call type from the home screen (Outbound, Inbound, or Meeting)
2. Enter the prospect's name in the input field
3. Follow the scripted flow, selecting appropriate responses
4. Use the Defense Matrix when objections arise
5. Track your progress with the XP system

### Customizing Scripts
- Click the edit icon (pencil) on any stage to modify the script
- Changes are saved automatically to localStorage
- Use the reset icon to restore original scripts
- Scripts support HTML formatting for emphasis

### Using the Flow Editor
1. Click "FLOW EDITOR" from the home screen
2. Drag nodes to reposition them
3. Click a node to edit its properties in the sidebar
4. Add new stages with the "+ New Stage" button
5. Connect stages by editing transition options
6. Save your custom flow with "Save Logic"
7. Load previous flows with "Load JSON"

### Defense Matrix
- Press `D` during any call to open the full matrix
- Click any objection to see the scripted response
- Edit objections in real-time during calls
- Use "Edit Mode" to batch-edit multiple objections
- Reset to defaults with the refresh icon

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **LocalStorage API** - Data persistence

## License

This project is provided as-is for sales training purposes.

## Support

For issues or feature requests, please refer to the project repository.
