# **MathMaster - Gamified Learning System**

## **Overview**

    MathMaster is an interactive, web-based arithmetic quiz game designed to improve arithmetic skills through gamification. It features adaptive difficulty, skill mastery analytics, and instant feedback. This project was developed using Object-Oriented Analysis and Design (OOAD) principles and follows the Modified Waterfall methodology.

## **Features**

    1. Adaptive Learning: Difficulty adjusts (Level 1-3) automatically based on user performance.

    2. Skill Mastery Analytics: Tracks accuracy specifically for Addition, Subtraction, Multiplication, and Division to identify learning gaps.

    Gamification:

        1. Streaks: Bonus points for consecutive correct answers.

        2. XP System: Experience points accumulation.

        3. Trophies: Unlockable badges (e.g., "On Fire", "Math King").

        4. Rewards: Confetti animations for high scores.

        5. Review System: A detailed "Mistake Review" panel shows exactly what the user got wrong and the correct answer.

        6. Accessibility: * Keyboard support (Keys 1-4 correspond to on-screen options).

            * Sound toggles for audio feedback.

        7 Visual Analytics: Interactive line charts using Chart.js to visualize progress over time.

## **Technical Architecture**

    *The system is built with a modular, object-oriented approach:

    File Structure

    MathMaster_Final_System/
    ├── index.html              # Main View (Glassmorphism UI)
    ├── css/
    │   └── style.css           # Modern Arcade Design & Animations
    ├── js/
    │   ├── Question.js         # Logic: Generates adaptive math problems
    │   ├── Game.js             # Logic: Manages state, scoretime, and skills
    │   └── main.js             # Controller: Handles DOM, Events, and Storage
    └── assets/
    ├── correct.mp3             # Audio feedback
    ├── wrong.mp3               # Audio feedback
    └── favicon.ico             # App Icon

## **Class Design**

    * Question Class: Encapsulates the logic for generating valid equations and intelligent distractors (wrong answers). Includes infinite-loop safety checks.

    * Game Class: Manages the game state machine, including score calculation, timer logic, streak tracking, and operator-specific statistics.

    * app Object (Controller): Handles user input, updates the DOM, manages LocalStorage persistence, and coordinates audio/visual effects.

## **Setup Instructions**

    1. Clone or Download: Ensure all files are placed in the folder structure shown above.

    2. Add Assets:

        * Place correct.mp3 and wrong.mp3 in the assets/ folder.
        * Place favicon.ico in the assets/ folder.

    3. Run Locally:

        * Option A: Open index.html directly in Chrome, Edge, or Firefox.

        * Option B (Recommended): Use the "Live Server" extension in VS Code to run a local development server.

## **Deployment**

    1. This project is optimized for GitHub Pages:

    2. Push the code to a GitHub repository.

    3. Go to Settings > Pages.

    4. Select the main branch as the source.

    5. The site will be live at https://[your-username].github.io/[repo-name]/.

## **Future Improvements**

    * Backend Integration: Connect to Node.js/Firebase for multi-user classroom support.

    * Social Features: Global leaderboards to compete with other students.

    * Teacher Dashboard: A dedicated view for instructors to monitor student progress.
