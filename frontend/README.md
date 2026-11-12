
# VoiceInspect AI

AI-powered voice inspection and maintenance management system designed to simplify equipment inspections and automate maintenance ticket creation.

## Overview

VoiceInspect AI is a web-based maintenance inspection platform that allows users to record equipment issues using voice or manual input, manage inspection records, and track maintenance tickets through a centralized dashboard.

## Features

- **Voice Inspection** – Capture equipment issues using browser-based speech recognition.
- **Inspection Management** – Record equipment condition, location, and reported issues.
- **Automated Maintenance Tickets** – Generate maintenance tickets from inspection reports.
- **Ticket Management** – Track ticket status, priority, technician assignment, and closure.
- **Dashboard Analytics** – View inspection statistics and maintenance activity.
- **CSV Export** – Export inspection records for reporting.
- **REST API** – Backend APIs built using Spring Boot.
- **Responsive Dashboard** – Modern React-based user interface.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React

### Backend
- Java
- Spring Boot
- Spring Data JPA
- REST APIs
- Maven

### Database
- Configured through Spring Boot application properties

## Project Structure

```text
VoiceInspectAI/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
│
├── voiceinspect/
│   ├── src/
│   │   ├── main/java/com/voiceinspect/
│   │   └── main/resources/
│   ├── pom.xml
│   └── mvnw.cmd
│
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yashchouhandev03/VoiceInspectAI.git
cd VoiceInspectAI
```

### 2. Start the Backend

```bash
cd voiceinspect
mvnw.cmd spring-boot:run
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Future Enhancements

- AI-powered inspection analysis
- Predictive maintenance insights
- Advanced maintenance analytics
- Technician performance monitoring

## Developer

**Yash Chouhan**

GitHub: [yashchouhandev03](https://github.com/yashchouhandev03)

---

Developed as a maintenance automation and inspection management project.
