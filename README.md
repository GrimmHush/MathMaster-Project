# 🎮 MathMaster

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white)

MathMaster is an interactive, gamified web application designed to teach arithmetic and reduce math anxiety in students. By dynamically adapting its UI and difficulty based on the user's age, the platform provides a highly personalized and engaging educational experience.

*Developed as a final year academic project for Strathmore University.*

---

## ✨ Key Features

* **🎭 Adaptive Theme Engine:** The UI dynamically shifts between a bright, visual-heavy "Rookie" mode (ages 6-10) and a high-contrast, neon "Pro Circuit" mode (ages 11-14+) based on user demographics.
* **🧠 Dynamic Math Heuristics:** Problems are generated in real-time based on the player's current level and age group, ensuring endless, non-repetitive gameplay.
* **🏆 Gamification System:** Features XP tracking, leveling, daily streaks, and an achievement trophy system to foster intrinsic motivation.
* **📊 Mistake Review Dashboard:** Automatically logs incorrect answers and generates targeted practice sessions to reinforce learning.
* **🔒 Secure Authentication:** Implements JWT for session management and Bcrypt for secure password hashing.
* **⚡ State Persistence:** Utilizes Zustand for sub-millisecond UI updates, keeping the global state synchronized between the game arena and the dashboard.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, Next.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL 15
* **State Management:** Zustand
* **Security:** JSON Web Tokens (JWT), Bcrypt

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v20 or higher)
* PostgreSQL installed and running
* `npm` or `pnpm`

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/MathMaster-Project.git](https://github.com/yourusername/MathMaster.git)
cd MathMaster

### 2. Environment Variables
Create a .env file in the root directory and add your local configuration. (Do not commit this file!)
Code snippet

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mathmaster_db

# Security
JWT_SECRET=your_super_secret_key_here
PORT=4000

### 3. Database Setup
Ensure PostgreSQL is running, then execute the schema file to create the necessary tables:
psql -U postgres -d mathmaster_db -f server/db/schema.sql

### 4. Install Dependencies
Install packages for both the client and the server:
```bash

npm install
cd server && npm install
cd ..

### 5. Run the Development Servers

Start the backend API and the Next.js frontend concurrently:
```bash

# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend
npm run dev

The application will be available at http://localhost:3000.

# 📂 Project Structure
MathMaster/
├── app/                  # Next.js App Router (Pages & Layouts)
├── components/           # Reusable React UI components (Auth, Dashboard, Game)
├── config/               # Game rules and age-bracket configurations
├── lib/                  # Utility engines (Math logic, Audio context)
├── server/               # Node.js/Express Backend
│   ├── db/               # PostgreSQL connection pool and SQL schemas
│   ├── routes/           # API endpoints (Auth, Game sync)
│   └── utils/            # JWT and security helpers
├── store/                # Zustand global state slices
└── tailwind.config.ts    # Custom theme and styling configurations
