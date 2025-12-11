# 🎓 StudyMate

**StudyMate** is your personal AI-powered study companion designed to help you organize content, learn faster, and study smarter.

![StudyMate Dashboard](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000)

## ✨ Features

- **📚 Subject Management**: Organize your studies by terms and subjects.
- **🔗 Resource Hub**: Save PDFs, YouTube videos, and Playlists in one place.
- **🤖 AI Tutor**: Chat with a Gemini-powered AI that understands your study context.
- **📝 Smart Notes**: Take rich-text notes while you study.
- **🎨 Modern UI**: value-focused design with glassmorphism and smooth animations.

## 🛠️ Tech Stack

### Client

- **Framework**: React + Vite
- **Styling**: Tailwind CSS + Headless UI
- **Icons**: Lucide React
- **State/Auth**: Supabase Auth

### Server

- **Runtime**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Utilities**: `youtubei.js`, `pdf-parse`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase Account
- Gemini API Key

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/harshagar12/StudyMate.git
    cd StudyMate
    ```

2.  **Setup Server**

    ```bash
    cd server
    npm install
    cp .env.example .env # Add your API keys
    npm run dev
    ```

3.  **Setup Client**
    ```bash
    cd client
    npm install
    cp .env.example .env # Add your Supabase keys
    npm run dev
    ```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
