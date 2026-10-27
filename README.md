<div align="center">
  <div>
    <a href="https://boltchat1.netlify.app" target="_blank">
      <img src="https://github.com/user-attachments/assets/21bbd807-94c1-4f01-bd4e-94d88d72c216" alt="Project Image">
    </a>
  </div>
  <h1 align="center">BoltChat - Chat App</h1>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 💡 [Overview](#overview)
2. 👩‍💻 [Tech Stack](#tech-stack)
3. ✨ [Features](#features)
4. 📖 [Documentation](#documentation)
5. 📫 [Contribute](#contribute)
6. 🐛 [Issues](#issues)

## <a name="overview">💡 Overview</a>

BoltChat is a fast, simple real-time chat app with built-in AI summarization, powered by React, Spring Boot, and MongoDB.

## <a name="tech-stack">👩‍💻 Tech Stack</a>

- React
- Spring Boot
- MongoDB
- Redis
- Tailwind CSS
- WebSocket
- Google Gemini AI

## <a name="features">✨ Features</a>

- Enables real-time, bi-directional communication using WebSockets and the STOMP protocol.

- Integrates Google Gemini to summarize room conversations into key topics, decisions, and action items with one click.
  
- Allows users to create and enter specific channels for organized group discussions with zero sign-up required.
  
- Caches active room data for instant lookups, with an automatic fallback to MongoDB if Redis is offline.
  
- Utilizes MongoDB to handle high-frequency message storage and flexible document schemas.
  
- Features a responsive, auto-scrolling dashboard that displays new messages instantly without a page reload.

- Runs scheduled background jobs (@Scheduled) to automatically delete empty rooms and clean up old messages.

- Configured with Spring Profiles (dev / prod), centralized Global Exception Handling (@RestControllerAdvice), and structured SLF4J logging.

- Backed by comprehensive unit tests using JUnit 5 and Mockito covering controllers, services, and error handling.

## <a name="documentation">📖 Documentation</a>

[React](https://react.dev/)

[Spring Boot](https://docs.spring.io/spring-boot/index.html)

[MongoDB](https://www.mongodb.com/docs/)

[WebSocket & STOMP](https://spring.io/guides/gs/messaging-stomp-websocket/)

[Tailwind CSS](https://tailwindcss.com/docs)

[Redis](https://redis.io/)

[Google Gemini AI](https://ai.google.dev/)

## <a name="contribute">📫 Contribute</a>

Contributions are always welcome. Please follow these steps to contribute:

1. **Fork the repository.**
2. **Create a new branch** (`git checkout -b feature/your-feature-name`).
3. **Make your changes** and commit them (`git commit -m 'Add some feature'`).
4. **Push to the branch** (`git push origin feature/your-feature-name`).
5. **Open a pull request**.

Please make sure to update tests as appropriate.

## <a name="issues">🐛 Issues</a>

If you encounter any issues while using or setting up the project, please check the issues section to see if it has already been reported. If not, feel free to open a new issue detailing the problem.

When reporting an issue, please include:

- A clear and descriptive title.
- A detailed description of the problem.
- Steps to reproduce the issue.
- Any relevant logs or screenshots.
- The environment in which the issue occurs (OS, browser, Node.js version, etc.).
