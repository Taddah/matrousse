# Matrousse 🎒

Matrousse is a comprehensive digital toolbox designed for teachers to streamline classroom management, parent communication, and administrative tasks. Built with privacy and efficiency in mind, it provides a suite of tools to manage daily school life.

## ✨ Features

### 🧭 Ma Classe (Classroom Management)
A central hub for managing your class:
-   **Student Management**: meaningful tracking of each student's progress and needs.
-   **Grading System**: Flexible assessment options including competency-based evaluation, traditional grades, and smiley systems.
-   **Journal & Tracking**: Pedagogical follow-up ("Le Relais") to ensure continuity and track student progress over time.
-   **Post-it System**: Quick access to essential info (Family contacts, Medical data, etc.) via a digital post-it interface.
-   **Attendance**: Quick tools for daily roll calls.

### 📅 Agenda (Parent-Teacher Meetings)
An intelligent scheduler for organizing meetings:
-   **Smart Scheduling**: Allows parents to book slots based on your availability.
-   **Invitation Tracking**: Keep track of sent invites and responses.

### ✒️ Appréciations (Report Cards)
AI-powered assistance for writing report card comments:
-   **AI Assistance**: Utilizes Mistral AI to draft personalized comments based on student performance.

### 🛠️ Utilities
-   **CSV Import**: Easily import student lists and data.
-   **Secure Sharing**: Share data with colleagues or parents using Zero-Knowledge encryption links.
-   **Privacy Focused**: Data is encrypted client-side where possible.

## 🚀 Tech Stack

-   **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com/)
-   **Database**: [Supabase](https://supabase.com/)
-   **AI**: [Mistral AI](https://mistral.ai/)
-   **Cryptography**: Web Crypto API

## 🛠️ Getting Started

### Prerequisites

-   Node.js (LTS recommended)
-   npm, pnpm, or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/matrousse.git
    cd matrousse
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add the necessary environment variables:
    ```env
    PUBLIC_SUPABASE_URL=your_supabase_url
    PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    MISTRAL_API_KEY=your_mistral_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Navigate to `http://localhost:5173` to start using Matrousse.


