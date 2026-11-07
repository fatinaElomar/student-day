# EduTrack Pulse - Student Performance & Rewards Tracker with MongoDB Atlas

A monthly student performance, quiz gift reward evaluation, and trajectory tracker web application backed by **MongoDB Atlas**.

---

## 🚀 Features

- **MongoDB Atlas Integration**: Live cloud persistence for student profiles, monthly evaluations, quiz scores, and teacher remarks.
- **Multi-Quiz & Test System**: Add multiple quizzes, tests, or midterms per student for each month. The cumulative quiz percentage is calculated automatically across all tests (`total achieved / total max`).
- **Student Photos & Avatars**: Upload photos directly from your computer with automatic client-side compression, drag-and-drop support, image URLs, or pre-configured sample photos.
- **Pure Light Mode Experience**: Clean, modern high-contrast light theme with white cards, soft borders, and optimized readability.
- **Bilingual & Native RTL Support**: Full Arabic version with Cairo typography and dynamic RTL layout, toggled instantly with the header language switcher (`العربية` / `English`).
- **Clean Visitor Interface**: The "Viewer Mode" badge and "Admin Login" button are completely hidden from regular visitors for a clean public experience.
- **Discreet Admin Access**:
  - Click on the **EduTrack Pulse Brand Logo** in the header.
  - Or press `Ctrl + Shift + A` (or `Alt + A`).
  - Or visit `http://localhost:3000/#admin`.
  - Enter passcode: `admin123`.
- **Privacy & Role-Based Access Control**:
  - **Visitors**: Publicly view student cards, rankings, recognition badges, and gift winners. Academic Month switcher, numerical grades, exact scores, class averages, and Detailed Table View are hidden and protected (`🔒 Admin Only`).
  - **Admin Mode**: Full access to the Academic Month switcher, raw grades, multiple test entries, class averages, Detailed Table View, student CRUD, and exports.
- **Admin-Only Detailed Table**: Data table view is strictly reserved for administrators.
- **Student of the Month Spotlight**: Dynamic recognition with student photo badge based on monthly grade and consistency.
- **Gift Award Club**: Highlights students scoring $\ge 16\%$ on monthly quizzes with avatar badges.
- **Momentum Trajectory Tracker**: Analyzes month-over-month movement (*Moving Forward 📈*, *Going Back 📉*, or *Not Working ⚠️*).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

### 2. Install Dependencies
Open PowerShell or your command prompt in this directory and run:
```bash
npm install
```

This installs:
- `express` - Backend web server and REST API
- `mongoose` - MongoDB ODM and connection manager
- `cors` - Cross-Origin Resource Sharing middleware
- `dotenv` - Environment variable management

### 3. Environment Configuration
The database connection has already been configured in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://fatinaelomar3_db_user:YOmpA5DcqLfwd5I7@cluster0.owcwkq0.mongodb.net/edutrack?retryWrites=true&w=majority
ADMIN_PASSCODE=admin123
```

> **Note on MongoDB Atlas Network Access**:
> Ensure that your current IP address (or `0.0.0.0/0` for development access) is whitelisted in MongoDB Atlas under **Network Access** > **IP Access List**.

### 4. Run the Application
Start the Node.js server:
```bash
npm start
```

Then open your browser to:
[http://localhost:3000](http://localhost:3000)

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Returns backend health and MongoDB connection state |
| `GET` | `/api/students` | Retrieves all students from MongoDB Atlas |
| `POST` | `/api/students` | Creates a new student record in MongoDB |
| `PUT` | `/api/students/:id` | Updates an existing student's profile or monthly grades |
| `DELETE` | `/api/students/:id` | Removes a student record |
| `POST` | `/api/students/clear` | Clears all student records from MongoDB Atlas |

---

## 🗄️ Database Architecture

Data is stored in the `edutrack` database under the `students` collection:
```json
{
  "_id": "672...",
  "id": "stu_1730000000000",
  "name": "Sarah Ahmad",
  "studentCode": "STU-101",
  "gradeLevel": "Grade 10-A",
  "avatarColor": "indigo",
  "avatarUrl": "",
  "notes": "Passionate about STEM and robotics.",
  "records": {
    "2026-10": {
      "month": "2026-10",
      "quizScore": 20,
      "quizMax": 20,
      "quizPercent": 100.0,
      "overallScore": 97.5,
      "attendance": "Active",
      "remarks": "Outstanding performance in class."
    }
  },
  "createdAt": "2026-10-30T12:00:00.000Z",
  "updatedAt": "2026-10-30T12:00:00.000Z"
}
```
