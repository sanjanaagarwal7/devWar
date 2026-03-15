# DevWar

A full-stack coding challenge platform built with Spring Boot (backend) and React + Vite (frontend).

## Features

- User authentication and registration
- Interactive coding challenges in React, Spring Boot, Node.js, and SQL
- Real-time code editor with Sandpack
- Battle mode for competitive coding
- Leaderboard and user ratings
- WebSocket-based chat and battle rooms

## Tech Stack

### Backend
- Java 25
- Spring Boot 4.0.3
- Spring Security with JWT
- Spring Data JPA with H2 database
- WebSocket support

### Frontend
- React 18
- Vite
- Tailwind CSS
- Sandpack for code editing
- Axios for API calls

## Getting Started

### Prerequisites
- Java 25+
- Node.js 18+
- Maven 3.6+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd devwar
```

2. Start the backend:
```bash
cd backend
./mvnw.cmd spring-boot:run
```

3. Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser

### Default Login
- Username: `player1`
- Password: `password`

## Project Structure

```
devwar/
├── backend/          # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/devwar/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── security/
│   │   │   ├── services/
│   │   │   └── websocket/
│   │   └── resources/
│   └── pom.xml
└── frontend/         # React application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    ├── package.json
    └── vite.config.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.