const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Serve static assets (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Student Schema & Model
const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    studentCode: { type: String, default: '' },
    gradeLevel: { type: String, default: '' },
    avatarColor: { type: String, default: 'indigo' },
    avatarUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    records: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true,
    minimize: false
  }
);

const Student = mongoose.model('Student', studentSchema);

// Known legacy demo/fake student identifiers
const FAKE_DEMO_IDS = ['stu_1', 'stu_2', 'stu_3', 'stu_4', 'stu_5', 'stu_6'];
const FAKE_DEMO_NAMES = [
  'Maya Lin',
  'David Kim',
  'Lucas Rossi',
  'Elena Rostova',
  'Ethan Blake',
  'Sofia Al-Mansoor',
  'Zaid Al-Mansoor'
];

// Clean legacy demo / fake students from MongoDB Atlas
async function cleanDemoDataIfExists() {
  try {
    const result = await Student.deleteMany({
      $or: [
        { id: { $in: FAKE_DEMO_IDS } },
        { name: { $in: FAKE_DEMO_NAMES } }
      ]
    });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} legacy demo student record(s) from MongoDB Atlas.`);
    }
  } catch (err) {
    console.error('⚠️ Notice checking demo data:', err.message);
  }
}

// Connection State Tracking
let lastMongoError = null;
let isConnecting = false;

async function connectToMongo() {
  if (mongoose.connection.readyState === 1 || isConnecting) return;
  isConnecting = true;
  console.log('🔄 Connecting to MongoDB Atlas via Mongoose...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000
    });
    lastMongoError = null;
    isConnecting = false;
    console.log('🚀 Connected successfully to MongoDB Atlas cluster via Mongoose!');
    await cleanDemoDataIfExists();
  } catch (err) {
    isConnecting = false;
    lastMongoError = err.message;
    console.error('❌ Mongoose / MongoDB Atlas connection notice:', err.message);
    if (err.message.includes('SSL') || err.message.includes('whitelist') || err.message.includes('Could not connect')) {
      console.log('💡 TIP: Whitelist your IP (94.187.16.105 or 0.0.0.0/0) in MongoDB Atlas under Network Access.');
    }
  }
}

// Retry connection every 10 seconds if disconnected
setInterval(() => {
  if (mongoose.connection.readyState === 0) {
    connectToMongo();
  }
}, 10000);

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. Health & Connection Status
app.get('/api/status', (req, res) => {
  const stateCode = mongoose.connection.readyState;
  const isConnected = stateCode === 1;
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  res.json({
    status: 'ok',
    dbConnected: isConnected,
    dbState: stateNames[stateCode] || 'unknown',
    database: 'MongoDB Atlas',
    error: lastMongoError,
    ipHelp: '94.187.16.105'
  });
});

// 2. Get All Students (Excludes any fake/demo records)
app.get('/api/students', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Trigger a connection attempt
      connectToMongo();
      return res.status(503).json({
        success: false,
        error: 'Mongoose database is currently connecting. If this persists, whitelist your current IP (94.187.16.105 or 0.0.0.0/0) in MongoDB Atlas.',
        dbConnected: false,
        dbState: mongoose.connection.readyState
      });
    }

    const students = await Student.find({
      id: { $nin: FAKE_DEMO_IDS },
      name: { $nin: FAKE_DEMO_NAMES }
    }).sort({ name: 1 });
    res.json({ success: true, data: students });
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch students: ' + err.message });
  }
});

// 3. Create New Student
app.post('/api/students', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      connectToMongo();
      return res.status(503).json({ success: false, error: 'Database connecting, please try again in a moment.' });
    }

    const { name, studentCode, gradeLevel, avatarColor, avatarUrl, imageUrl, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Student name is required' });
    }

    const id = req.body.id || `stu_${Date.now()}`;
    const newStudent = new Student({
      id,
      name,
      studentCode: studentCode || '',
      gradeLevel: gradeLevel || '',
      avatarColor: avatarColor || 'indigo',
      avatarUrl: avatarUrl || imageUrl || '',
      notes: notes || '',
      records: req.body.records || {}
    });

    await newStudent.save();
    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    console.error('Error creating student:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Update Existing Student (Profile or Monthly Grades)
app.put('/api/students/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      connectToMongo();
      return res.status(503).json({ success: false, error: 'Database connecting, please try again in a moment.' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const updatedStudent = await Student.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updatedStudent });
  } catch (err) {
    console.error('Error updating student:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Delete Student
app.delete('/api/students/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      connectToMongo();
      return res.status(503).json({ success: false, error: 'Database connecting, please try again in a moment.' });
    }

    const { id } = req.params;
    const result = await Student.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Clear All Students (Permanent Admin Action)
app.post('/api/students/clear', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Student.deleteMany({});
    }
    res.json({ success: true, message: 'All student records cleared successfully', data: [] });
  } catch (err) {
    console.error('Error clearing students:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Reset / Purge Demo Records (Never seeds fake data)
app.post('/api/students/reset', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await cleanDemoDataIfExists();
      const students = await Student.find({
        id: { $nin: FAKE_DEMO_IDS },
        name: { $nin: FAKE_DEMO_NAMES }
      }).sort({ name: 1 });
      return res.json({ success: true, message: 'Demo records removed', data: students });
    }
    res.json({ success: true, message: 'Demo records removed (offline)', data: [] });
  } catch (err) {
    console.error('Error purging demo records:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback route to serve index.html for any standard request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================================
// SERVER BOOTSTRAP & DATABASE CONNECTION
// ============================================================================
console.log('🔄 Initializing EduTrack Pulse server...');

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎓 EduTrack Pulse server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  connectToMongo();
});
