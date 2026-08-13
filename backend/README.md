# Exercise AI Backend API

Clean, modular Node.js & Express REST API for storing user accounts, completed workout sessions, MediaPipe posture analysis AI metrics, and calculating workout statistics with MongoDB Atlas.

---

## 🏗️ 1. Target Architecture

```text
Frontend / Camera (Next.js)
        |
        v
MediaPipe / AI Analysis (Browser JS)
        |
        | workout results (totalReps, correctReps, accuracy, duration, feedback)
        v
Express REST API (Node.js)
        |
        v
Mongoose ODM
        |
        v
MongoDB Atlas (Cloud Database)
        |
        v
Workout History & Analytics Dashboard
```

---

## 🚀 2. Requirements & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** database URI (free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

---

## 🛠️ 3. Installation & Running

### Step 1: Navigate to backend folder
```bash
cd backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and set your MongoDB Atlas connection string:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/exercise_ai?retryWrites=true&w=majority
```

### Step 4: Start the Server

- **Development Mode (with auto-reload via nodemon)**:
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📋 4. REST API Endpoints

| Method | Endpoint | Purpose | Description |
| ------ | -------- | ------- | ----------- |
| `GET` | `/` | Health check | Confirms backend server status |
| `POST` | `/api/users` | Create user | Registers a new user (`name`, `email`) |
| `GET` | `/api/users/:id` | Get user | Retrieves user profile by ID |
| `POST` | `/api/workouts` | Save workout | Saves completed MediaPipe AI workout results |
| `GET` | `/api/workouts/:userId` | Workout history | Retrieves all workouts for a user |
| `GET` | `/api/workouts/:userId/:workoutId` | Workout details | Retrieves detailed single workout |
| `GET` | `/api/stats/:userId` | Statistics | Calculates aggregate stats dynamically from DB |

---

## 💡 5. Example API Requests & Responses

### A. Health Check (`GET /`)
**Response (200 OK)**:
```json
{
  "message": "Exercise AI Backend is running"
}
```

### B. Create User (`POST /api/users`)
**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```
**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "66bc123456789abcdef01234",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2026-08-13T00:00:00.000Z"
  }
}
```

### C. Save Completed Workout (`POST /api/workouts`)
**Request Body**:
```json
{
  "userId": "66bc123456789abcdef01234",
  "exercise": "Squat",
  "totalReps": 20,
  "correctReps": 16,
  "incorrectReps": 4,
  "accuracy": 80,
  "duration": 60,
  "feedback": [
    "Knee position incorrect: 2 reps",
    "Back angle incorrect: 2 reps"
  ]
}
```
**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Workout session saved successfully",
  "workout": {
    "_id": "66bc987654321fedcba43210",
    "userId": "66bc123456789abcdef01234",
    "exercise": "Squat",
    "totalReps": 20,
    "correctReps": 16,
    "incorrectReps": 4,
    "accuracy": 80,
    "duration": 60,
    "feedback": [
      "Knee position incorrect: 2 reps",
      "Back angle incorrect: 2 reps"
    ],
    "createdAt": "2026-08-13T00:01:00.000Z"
  }
}
```

### D. Get Workout Statistics (`GET /api/stats/:userId`)
**Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "totalWorkouts": 12,
    "totalReps": 240,
    "correctReps": 205,
    "incorrectReps": 35,
    "averageAccuracy": 85.4,
    "mostPerformedExercise": "Squat"
  }
}
```

---

## 🔌 6. Frontend Integration

The frontend sends workout results to the backend automatically via `services/api.ts` when a recording session completes:

```javascript
import { sendWorkoutData } from '@/services/api';

sendWorkoutData({
  userId: 'default_user',
  exercise: 'Squat',
  totalReps: 20,
  correctReps: 16,
  incorrectReps: 4,
  accuracy: 80,
  duration: 60,
  feedback: ['Knee position incorrect']
});
```
