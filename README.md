# Compass LK

Compass LK is a web-based travel planning system developed to help users explore destinations in Sri Lanka, organize travel itineraries, and manage personalized trip experiences through a user-friendly interface.

The system is designed as a full-stack web application that combines a static frontend with a Node.js/Express backend and a MySQL database. It supports user registration, authentication, itinerary planning, destination reviews, profile updates, and administrative moderation features.

## Project Overview

This project was developed as an aim of simplifying travel planning for users interested in discovering Sri Lanka’s cultural, scenic, and historical destinations. The platform provides a centralized digital experience for browsing destinations, managing trip schedules, and saving travel preferences.

## Objectives

- Provide a convenient platform for discovering tourist destinations in Sri Lanka
- Enable users to create and manage travel itineraries
- Support destination-based review and feedback collection
- Offer secure account registration and login through backend authentication
- Include administrative tools for managing user-generated content

## Key Features

- Destination browsing and detailed destination views
- Personalized itinerary creation and trip organization
- Calendar-based travel scheduling
- Secure signup/login system with password hashing
- User profile management, including profile image upload
- Review submission for destinations
- Admin dashboard support for recent reviews and statistics

## Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- MySQL
- bcryptjs
- Multer
- CORS

## System Architecture

The application follows a simple three-tier architecture:

1. Frontend layer for user interaction and page rendering
2. Backend API layer for authentication, business logic, and file handling
3. Database layer for persistent data storage

## Repository Structure

- `Front_end/` - Frontend pages, styling, and client-side scripts
- `Back_end/` - Backend API and server logic
- `Back_end/uploads/` - Uploaded user profile images and related media

## Installation and Setup

### Prerequisites

- Node.js
- MySQL Server
- Git

### Steps

1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

2. Install backend dependencies

```bash
cd Back_end
npm install
```

3. Create the required MySQL database

```sql
CREATE DATABASE compass_lk;
```

4. Configure environment variables if needed

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=compass_lk
```

5. Start the backend server

```bash
node index.js
```

6. Open the frontend pages from the `Front_end` directory in a browser.

## Running the Application

After starting the backend, the application can be accessed locally through the frontend HTML pages. The backend API is available at:

```bash
http://localhost:3000
```

## Admin Functionality

The backend includes role-based access control checks for administrative operations, allowing restricted admin-only API endpoints to be used for moderation and monitoring tasks.

## Limitations

- The current implementation is intended for local development and academic demonstration.
- Some configuration details such as database credentials and admin account setup may need to be adjusted for deployment.

## License

This project is licensed under the ISC License.


