
# VoiceInspect AI

**Voice-Based Equipment Inspection & Maintenance Management System**

VoiceInspect AI is a web-based application designed to simplify equipment inspections, record operational issues, and automate maintenance ticket management.

## Features

- Voice-based equipment inspection using browser speech recognition
- Manual inspection reporting
- Automated maintenance ticket creation
- Maintenance ticket priority and status tracking
- Technician assignment
- Dashboard statistics and analytics
- Inspection history management
- CSV export functionality
- REST API integration

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend |
| Vite | Development server |
| Java | Backend programming |
| Spring Boot | REST API |
| Spring Data JPA | Data persistence |
| Maven | Build management |
| CSS | UI styling |

## Project Structure

```text
VoiceInspectAI/
├── frontend/
│   ├── src/
│   └── package.json
├── voiceinspect/
│   ├── src/
│   └── pom.xml
└── README.md
```

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/yashchouhandev03/VoiceInspectAI.git
cd VoiceInspectAI
```

### Start Backend

```cmd
cd voiceinspect
mvnw.cmd spring-boot:run
```

### Start Frontend

Open another terminal:

```cmd
cd frontend
npm install
npm run dev
```

Open the localhost URL displayed by Vite.

## Developer

**Yash Chouhan**

GitHub: [yashchouhandev03](https://github.com/yashchouhandev03)

---

Built to improve inspection workflows and maintenance operations through automation.
