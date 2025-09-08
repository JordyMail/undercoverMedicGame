# Undercover Game

**Undercover Game** is a **multiplayer real-time browser-based game** that combines discussion, voting, elimination, and a final round challenge.
It runs with **Node.js (Express, Socket.IO)** on the backend and **HTML/CSS/JS** on the frontend.

---



## How to Run

### 1. Clone Repository

```bash
git clone https://github.com/username/undercover-game.git
cd undercover-game
```

### 2. Run with Docker

```bash
docker-compose up --build
```

### 3. Access the Application

* **Frontend**: [http://localhost:5000](http://localhost:5000)
* **Backend API/Socket**: [http://localhost:3000](http://localhost:3000)

---

## Gameplay Overview

1. **Create Room**

   * One player becomes the host and creates a room with their name.
   * The system generates a unique code (e.g., `ABCD12`).

2. **Join Room**

   * Other players join the room by entering their name and the room code.
   * Maximum of 10 players per room.

3. **Lobby**

   * All players appear in the lobby list.
   * The host clicks **Start Game** once at least 3 players have joined.

4. **Gameplay**

   * Roles are distributed automatically:

     * 6 players → **Main Diagnose**
     * 3 players → **Differential Diagnose**
     * 1 player → **Doctor Grey**
   * Diseases are privately assigned based on roles.

5. **Discussion & Elimination**

   * Players discuss.
   * A voting round eliminates one player → eliminated players become spectators.

6. **Final Round**

   * When only 3 players remain → enter the final round.
   * Each submits **Treatment & Innovation**.

7. **Spectator Voting**

   * Eliminated players vote for the finalist with the best answers.

8. **Results & Rewards**

   * All roles are revealed.
   * Winners receive digital titles (e.g., Diagnosis Division, Mastermind).

---

## Tech Stack

* **Backend**: Node.js, Express, Socket.IO
* **Frontend**: HTML, CSS, JavaScript, Socket.IO-client
* **Containerization**: Docker, Docker Compose

---

## Team

* **Developer**: Jordy Mail
* **Designer/UI**: Jordy Mail
* **Support**: Faculty of Medicine, President University

---
