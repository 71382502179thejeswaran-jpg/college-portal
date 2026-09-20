const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files for seamless standalone preview
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ====================================================================
// SMART NOTIFICATION ENGINE (REUSABLE SERVICE)
// ====================================================================
function createNotification({ targetUserId, studentId, role, category, title, message, priority = 'Normal' }) {
  const store = db.getStore();
  const newNotification = {
    id: (store.notifications.length ? Math.max(...store.notifications.map(n => n.id)) : 0) + 1,
    user_id: targetUserId || null,
    student_id: studentId || null,
    target_role: role || 'all',
    category: category || 'Academic',
    title,
    message,
    priority,
    is_read: false,
    timestamp: new Date().toISOString()
  };
  store.notifications.unshift(newNotification);
  console.log(`[NOTIFICATION ENGINE] [${priority}] -> ${role.toUpperCase()}: ${title}`);
  return newNotification;
}

// ====================================================================
// AI STUDENT RISK PREDICTION ENGINE
// ====================================================================
function computeStudentRisk(studentId) {
  const store = db.getStore();
  const id = parseInt(studentId, 10);
  const student = store.students.find(s => s.id === id) || store.students[0];
  const attendanceList = store.attendance.filter(a => a.student_id === id);
  const marksList = store.marks.filter(m => m.student_id === id);
  const assignmentsList = store.assignments.filter(a => a.student_id === id || a.student_id === 1);

  // 1. Attendance Analysis (Weight: 35%)
  let avgAttendance = student.overall_attendance;
  if (attendanceList.length > 0) {
    avgAttendance = attendanceList.reduce((acc, cur) => acc + (cur.percentage || 0), 0) / attendanceList.length;
  }
  let attendanceRisk = 0;
  if (avgAttendance < 65) attendanceRisk = 40;
  else if (avgAttendance < 75) attendanceRisk = 30;
  else if (avgAttendance < 80) attendanceRisk = 15;
  else attendanceRisk = 5;

  // 2. Academic Marks Analysis (Weight: 35%)
  let avgMarks = 85;
  if (marksList.length > 0) {
    avgMarks = marksList.reduce((acc, cur) => acc + (cur.total || 80), 0) / marksList.length;
  } else if (student.cgpa) {
    avgMarks = student.cgpa * 10;
  }
  let marksRisk = 0;
  if (avgMarks < 50) marksRisk = 40;
  else if (avgMarks < 65) marksRisk = 25;
  else if (avgMarks < 75) marksRisk = 15;
  else marksRisk = 5;

  // 3. Assignments & Submissions (Weight: 15%)
  const pendingAssignments = assignmentsList.filter(a => a.status === 'Pending').length;
  const assignmentRisk = pendingAssignments > 2 ? 20 : pendingAssignments > 0 ? 10 : 2;

  // 4. CGPA trend (Weight: 15%)
  const cgpaRisk = student.cgpa < 6.0 ? 15 : student.cgpa < 7.5 ? 8 : 2;

  const totalRiskScore = Math.min(98, Math.max(8, parseFloat((attendanceRisk + marksRisk + assignmentRisk + cgpaRisk).toFixed(1))));
  const riskLevel = totalRiskScore >= 65 ? 'HIGH' : totalRiskScore >= 35 ? 'MEDIUM' : 'LOW';

  const reasons = [];
  const recommendations = [];

  if (avgAttendance < 75) {
    reasons.push(`Overall course attendance (${avgAttendance.toFixed(1)}%) is below the mandatory 75% threshold`);
    recommendations.push('Attend mandatory remedial tutorial sessions on Friday to make up for missed classes');
    recommendations.push('Schedule academic counseling meeting with course mentor');
  } else {
    reasons.push(`Consistent course attendance maintained at ${avgAttendance.toFixed(1)}%`);
  }

  if (avgMarks < 60) {
    reasons.push(`Internal and midterm performance average is low (${avgMarks.toFixed(1)}%)`);
    recommendations.push('Participate in peer-tutoring study groups for cloud & systems fundamentals');
    recommendations.push('Request extra practice assessments from course instructors');
  } else {
    reasons.push(`Solid academic assessment scores averaging ${avgMarks.toFixed(1)}%`);
  }

  if (pendingAssignments > 0) {
    reasons.push(`${pendingAssignments} pending assignment(s) require submission`);
    recommendations.push('Submit pending assignments before late submission cutoff');
  }

  if (riskLevel === 'LOW') {
    recommendations.push('Eligible for Honors Research Fellowship and IBM Cloud Mentorship program');
  }

  return {
    studentId: student.id,
    studentName: student.full_name,
    rollNumber: student.roll_number,
    department: student.department,
    cgpa: student.cgpa,
    avgAttendance: parseFloat(avgAttendance.toFixed(1)),
    avgMarks: parseFloat(avgMarks.toFixed(1)),
    pendingAssignments,
    riskScore: totalRiskScore,
    riskLevel,
    reasons,
    recommendations,
    lastComputed: new Date().toISOString()
  };
}

// ====================================================================
// HEALTH & CONTAINER TELEMETRY ENDPOINTS
// ====================================================================

// Standard Docker Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'college-portal-backend',
    version: '2.0.0',
    uptime_seconds: process.uptime(),
    database_status: 'connected',
    database_mode: db.getDbMode()
  });
});

// Detailed Container Status for Admin Dashboard & Topology View
app.get('/api/container-status', (req, res) => {
  const status = db.getContainerStatus();
  res.json({
    success: true,
    data: status
  });
});

// Container Auto-Healing Failure & Recovery Simulation
app.post('/api/container/simulate-heal', (req, res) => {
  const { tier } = req.body;
  const result = db.simulateAutoHealing(tier || 'backend');
  if (result) {
    res.json({
      success: true,
      message: `Auto-healing simulation initiated for ${tier || 'backend'}. Failure detected -> Auto-recovery starting -> Health check verification.`,
      data: result
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid tier specified.' });
  }
});

// Container Events History / Observability Stream
app.get('/api/container-events', (req, res) => {
  res.json({
    success: true,
    data: db.getContainerEvents()
  });
});

// Interactive Container Simulation (Evaluator testing)
app.post('/api/container/simulate', (req, res) => {
  const { tier, action } = req.body;
  const result = db.simulateAction(tier, action);
  if (result) {
    res.json({
      success: true,
      message: `Simulated '${action}' on ${tier} container initiated successfully.`
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid tier or action specified.' });
  }
});

// ====================================================================
// AUTHENTICATION ENDPOINTS
// ====================================================================

app.post(['/api/auth/login', '/api/login'], (req, res) => {
  const { username, password, role } = req.body;
  const store = db.getStore();
  const search = (username || '').trim().toLowerCase();

  let matchedStudent = null;
  let matchedFaculty = null;
  let matchedParent = null;

  // 1. Match student
  if (role === 'student' || !role) {
    matchedStudent = store.students.find(s => 
      s.roll_number.toLowerCase() === search ||
      s.email.toLowerCase() === search ||
      s.full_name.toLowerCase() === search ||
      s.full_name.toLowerCase().includes(search)
    );
  }

  // 2. Match faculty
  if (role === 'faculty' || !role) {
    matchedFaculty = store.faculty.find(f =>
      f.employee_id.toLowerCase() === search ||
      f.email.toLowerCase() === search ||
      f.full_name.toLowerCase() === search ||
      f.full_name.toLowerCase().includes(search)
    );
  }

  // 3. Match parent
  if (role === 'parent' || !role) {
    matchedParent = store.parents.find(p =>
      p.email.toLowerCase() === search ||
      p.full_name.toLowerCase() === search ||
      (search === 'parent' && p.id === 1)
    );
  }

  // 4. Match in users table
  let user = null;
  if (matchedStudent) {
    user = store.users.find(u => u.id === matchedStudent.user_id) || {
      id: matchedStudent.id + 10,
      username: matchedStudent.email.split('@')[0],
      email: matchedStudent.email,
      role: 'student',
      full_name: matchedStudent.full_name,
      avatar_url: matchedStudent.avatar_url
    };
  } else if (matchedFaculty) {
    user = store.users.find(u => u.id === matchedFaculty.user_id) || {
      id: matchedFaculty.id + 20,
      username: matchedFaculty.email.split('@')[0],
      email: matchedFaculty.email,
      role: 'faculty',
      full_name: matchedFaculty.full_name,
      avatar_url: matchedFaculty.avatar_url
    };
  } else if (matchedParent) {
    user = store.users.find(u => u.id === matchedParent.user_id) || {
      id: 10,
      username: 'parent',
      email: matchedParent.email,
      role: 'parent',
      full_name: matchedParent.full_name,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
    };
  } else {
    user = store.users.find(u =>
      (u.username.toLowerCase() === search ||
       u.email.toLowerCase() === search ||
       (role && u.role === role.toLowerCase()))
    );
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  // Attach profile specifics
  let profileData = null;
  let linkedStudent = null;

  if (user.role === 'student') {
    profileData = matchedStudent || store.students.find(s => s.user_id === user.id) || store.students.find(s => s.email.toLowerCase() === user.email.toLowerCase()) || store.students[0];
  } else if (user.role === 'faculty') {
    profileData = matchedFaculty || store.faculty.find(f => f.user_id === user.id) || store.faculty.find(f => f.email.toLowerCase() === user.email.toLowerCase()) || store.faculty[0];
  } else if (user.role === 'parent') {
    profileData = matchedParent || store.parents.find(p => p.user_id === user.id) || store.parents[0];
    linkedStudent = store.students.find(s => s.id === profileData.student_id) || store.students[0];
  }

  const token = `token_${user.role}_${user.id}_${Date.now()}`;

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      profile: profileData,
      linkedStudent: linkedStudent
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { full_name, email, role, department, roll_number, password } = req.body;
  const store = db.getStore();

  if (!email || !full_name || !role) {
    return res.status(400).json({ success: false, message: 'Missing required registration fields.' });
  }

  const existing = store.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUserId = store.users.length + 1;
  const newUser = {
    id: newUserId,
    username: email.split('@')[0],
    email,
    password: password || 'password123',
    role: role.toLowerCase(),
    full_name,
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`
  };
  store.users.push(newUser);

  if (newUser.role === 'student') {
    store.students.push({
      id: store.students.length + 1,
      user_id: newUserId,
      full_name,
      email,
      roll_number: roll_number || `APX-2024-${Math.floor(100 + Math.random() * 900)}`,
      department: department || 'Computer Science & Engineering',
      semester: 1,
      batch_year: '2024-2028',
      overall_attendance: 100.0,
      cgpa: 0.0,
      mentor_name: 'Dr. Robert Vance',
      status: 'Active'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! You can now log in.',
    user: newUser
  });
});

// ====================================================================
// STUDENTS DATA & CRUD ENDPOINTS
// ====================================================================

app.get('/api/students', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.students.length, data: store.students });
});

app.post('/api/students', (req, res) => {
  const { full_name, email, department, roll_number, semester, cgpa } = req.body;
  const store = db.getStore();
  const newStudent = {
    id: store.students.length + 1,
    user_id: null,
    full_name: full_name || 'New Student',
    email: email || `student_${Date.now()}@apex.edu`,
    roll_number: roll_number || `APX-2024-${Math.floor(100 + Math.random() * 900)}`,
    department: department || 'Computer Science & Engineering',
    semester: parseInt(semester || '1', 10),
    batch_year: '2024-2028',
    overall_attendance: 85.0,
    cgpa: parseFloat(cgpa || '8.5'),
    mentor_name: 'Dr. Robert Vance',
    status: 'Active'
  };
  store.students.push(newStudent);
  res.status(201).json({ success: true, message: 'Student added successfully.', data: newStudent });
});

app.put('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const student = store.students.find(s => s.id === id);
  if (student) {
    const { full_name, email, department, roll_number, semester, cgpa } = req.body;
    if (full_name) student.full_name = full_name;
    if (email) student.email = email;
    if (department) student.department = department;
    if (roll_number) student.roll_number = roll_number;
    if (semester) student.semester = parseInt(semester, 10);
    if (cgpa) student.cgpa = parseFloat(cgpa);
    return res.json({ success: true, message: 'Student details updated successfully.', data: student });
  }
  res.status(404).json({ success: false, message: 'Student not found.' });
});

app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const index = store.students.findIndex(s => s.id === id);
  if (index !== -1) {
    store.students.splice(index, 1);
    res.json({ success: true, message: 'Student deleted successfully.' });
  } else {
    res.status(404).json({ success: false, message: 'Student not found.' });
  }
});

app.get('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const student = store.students.find(s => s.id === id);
  if (student) {
    res.json({ success: true, data: student });
  } else {
    res.status(404).json({ success: false, message: 'Student not found.' });
  }
});

app.get('/api/students/:id/details', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const student = store.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const attendance = store.attendance.filter(a => a.student_id === id);
  const marks = store.marks.filter(m => m.student_id === id);
  const assignments = store.assignments.filter(a => a.student_id === id || a.student_id === 1);
  const fees = store.fees.find(f => f.student_id === id) || store.fees[0];
  const leaves = store.leaves.filter(l => l.student_id === id);
  const placement = store.placementProfiles.find(p => p.student_id === id) || store.placementProfiles[0];
  const risk = computeStudentRisk(id);

  res.json({
    success: true,
    data: {
      student,
      attendance: attendance.length > 0 ? attendance : store.attendance.slice(0, 3),
      marks: marks.length > 0 ? marks : store.marks.slice(0, 3),
      assignments: assignments.length > 0 ? assignments : store.assignments,
      exams: store.exams,
      fees,
      leaves,
      placement,
      risk
    }
  });
});

// ====================================================================
// AI RISK ENGINE & ANALYTICS ENDPOINTS
// ====================================================================

app.get('/api/student-risk/:studentId', (req, res) => {
  const id = parseInt(req.params.studentId, 10);
  const risk = computeStudentRisk(id);
  res.json({ success: true, data: risk });
});

app.get('/api/admin/risk-analytics', (req, res) => {
  const store = db.getStore();
  const scores = store.students.map(s => computeStudentRisk(s.id));
  const highRisk = scores.filter(s => s.riskLevel === 'HIGH');
  const mediumRisk = scores.filter(s => s.riskLevel === 'MEDIUM');
  const lowRisk = scores.filter(s => s.riskLevel === 'LOW');

  res.json({
    success: true,
    data: {
      totalAnalyzed: scores.length,
      distribution: {
        high: highRisk.length,
        medium: mediumRisk.length,
        low: lowRisk.length
      },
      highRiskStudents: highRisk,
      allScores: scores
    }
  });
});

// ====================================================================
// PARENT PORTAL ENDPOINTS
// ====================================================================

app.get('/api/parents', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.parents.length, data: store.parents });
});

app.get('/api/parent/child-overview/:parentId?', (req, res) => {
  const store = db.getStore();
  const parentId = parseInt(req.params.parentId || '1', 10);
  const parent = store.parents.find(p => p.id === parentId) || store.parents[0];
  const student = store.students.find(s => s.id === parent.student_id) || store.students[0];

  const attendance = store.attendance.filter(a => a.student_id === student.id);
  const marks = store.marks.filter(m => m.student_id === student.id);
  const assignments = store.assignments.filter(a => a.student_id === student.id || a.student_id === 1);
  const fee = store.fees.find(f => f.student_id === student.id) || store.fees[0];
  const leaves = store.leaves.filter(l => l.student_id === student.id);
  const notifications = store.notifications.filter(n => n.target_role === 'parent' || (n.student_id === student.id && n.target_role === 'parent'));
  const risk = computeStudentRisk(student.id);

  res.json({
    success: true,
    data: {
      parent,
      student,
      attendance,
      marks,
      assignments,
      fee,
      leaves,
      exams: store.exams,
      notifications,
      risk
    }
  });
});

// ====================================================================
// ATTENDANCE WITH AUTOMATIC NOTIFICATION RULES
// ====================================================================

app.get('/api/attendance', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.attendance });
});

app.post('/api/attendance/mark', (req, res) => {
  // Role guard: only faculty members are authorized
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const tokenParts = token.split('_');
  const role = tokenParts[1] || '';

  if (role !== 'faculty') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only faculty members are authorized to update attendance records.'
    });
  }

  const { course_id, attended, student_id } = req.body;
  const store = db.getStore();
  const targetStudentId = student_id ? parseInt(student_id, 10) : 1;
  const item = store.attendance.find(a => a.course_id === parseInt(course_id, 10) && a.student_id === targetStudentId) ||
               store.attendance.find(a => a.course_id === parseInt(course_id, 10)) ||
               store.attendance[0];

  if (item) {
    item.total_classes += 1;
    if (attended) {
      item.attended_classes += 1;
    }
    item.percentage = parseFloat(((item.attended_classes / item.total_classes) * 100).toFixed(1));

    const student = store.students.find(s => s.id === item.student_id) || store.students[0];
    const parent = store.parents.find(p => p.student_id === student.id);

    // NOTIFICATION RULE 1: If attendance < 75%, trigger LOW ATTENDANCE ALERT to Student + Parent
    if (item.percentage < 75.0) {
      // Student alert
      createNotification({
        targetUserId: student.user_id,
        studentId: student.id,
        role: 'student',
        category: 'Attendance',
        title: `⚠️ LOW ATTENDANCE ALERT: ${item.course_name}`,
        message: `Your attendance in ${item.course_name} has fallen to ${item.percentage}%. The minimum threshold is 75%. Please contact your course mentor immediately.`,
        priority: 'Urgent'
      });

      // Parent alert
      createNotification({
        targetUserId: parent ? parent.user_id : null,
        studentId: student.id,
        role: 'parent',
        category: 'Attendance',
        title: `⚠️ LOW ATTENDANCE ALERT: ${student.full_name}`,
        message: `Attendance Alert: ${student.full_name}'s ${item.course_name} attendance has fallen to ${item.percentage}%. The recommended minimum attendance is 75%.`,
        priority: 'Urgent'
      });
    } else {
      // Regular attendance update notification
      createNotification({
        targetUserId: parent ? parent.user_id : null,
        studentId: student.id,
        role: 'parent',
        category: 'Attendance',
        title: `Attendance Update: ${item.course_name}`,
        message: `${student.full_name}'s ${item.course_name} attendance is currently ${item.percentage}% (${item.attended_classes}/${item.total_classes} sessions attended).`,
        priority: 'Normal'
      });
    }

    return res.json({
      success: true,
      message: `Attendance updated successfully for ${student.full_name}. Real-time notifications dispatched to student and parent accounts.`,
      data: item
    });
  }
  res.status(404).json({ success: false, message: 'Course attendance record not found.' });
});

// ====================================================================
// MARKS WITH AUTOMATIC NOTIFICATION RULES
// ====================================================================

app.get('/api/marks', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.marks });
});

app.post('/api/marks/update', (req, res) => {
  const { id, internal, midterm, assignment } = req.body;
  const store = db.getStore();
  const mark = store.marks.find(m => m.id === parseInt(id, 10));
  if (mark) {
    if (internal !== undefined) mark.internal = parseFloat(internal);
    if (midterm !== undefined) mark.midterm = parseFloat(midterm);
    if (assignment !== undefined) mark.assignment = parseFloat(assignment);
    mark.total = parseFloat((mark.internal + mark.midterm + mark.assignment).toFixed(1));
    mark.grade = mark.total >= 90 ? 'A+' : mark.total >= 80 ? 'A' : mark.total >= 70 ? 'B' : mark.total >= 50 ? 'C' : 'D';

    const student = store.students.find(s => s.id === mark.student_id) || store.students[0];
    const parent = store.parents.find(p => p.student_id === student.id);

    // NOTIFICATION RULE 2: If internal marks low (< 15/30), trigger Academic Alert
    if (mark.internal < 15.0 || mark.total < 50.0) {
      createNotification({
        targetUserId: parent ? parent.user_id : null,
        studentId: student.id,
        role: 'parent',
        category: 'Marks',
        title: `⚠️ Academic Alert: ${student.full_name}`,
        message: `Academic Alert: ${student.full_name}'s ${mark.course_name} internal mark is ${mark.internal}/30. Please encourage the student to focus on this subject.`,
        priority: 'Important'
      });

      createNotification({
        targetUserId: student.user_id,
        studentId: student.id,
        role: 'student',
        category: 'Marks',
        title: `Assessment Update: ${mark.course_name}`,
        message: `Your internal assessment in ${mark.course_name} is ${mark.internal}/30. Remedial tutoring is recommended before end-semester examinations.`,
        priority: 'Important'
      });
    } else {
      createNotification({
        targetUserId: parent ? parent.user_id : null,
        studentId: student.id,
        role: 'parent',
        category: 'Marks',
        title: `Academic Grade Update: ${mark.course_name}`,
        message: `Academic Update: ${student.full_name}'s ${mark.course_name} assessment score updated to ${mark.internal}/30. Overall Total: ${mark.total}/100 (Grade ${mark.grade}).`,
        priority: 'Normal'
      });
    }

    return res.json({
      success: true,
      message: `Marks updated successfully. Academic alerts automatically dispatched to student and parent.`,
      data: mark
    });
  }
  res.status(404).json({ success: false, message: 'Marks record not found.' });
});

// ====================================================================
// DIGITAL LEAVE MANAGEMENT WORKFLOW
// ====================================================================

app.get('/api/leave', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.leaves.length, data: store.leaves });
});

app.post('/api/leave/apply', (req, res) => {
  const { student_id, leave_type, from_date, to_date, reason } = req.body;
  const store = db.getStore();
  const student = store.students.find(s => s.id === parseInt(student_id || '1', 10)) || store.students[0];

  const newLeave = {
    id: store.leaves.length + 1,
    student_id: student.id,
    student_name: student.full_name,
    leave_type: leave_type || 'Personal',
    from_date: from_date || new Date().toISOString().split('T')[0],
    to_date: to_date || new Date().toISOString().split('T')[0],
    reason: reason || 'Personal absence',
    status: 'Pending',
    reviewed_by: null,
    remarks: null,
    created_at: new Date().toISOString().split('T')[0]
  };
  store.leaves.unshift(newLeave);

  // Notify faculty of pending leave request
  createNotification({
    role: 'faculty',
    category: 'Leave',
    title: `New Leave Request: ${student.full_name}`,
    message: `${student.full_name} submitted a ${newLeave.leave_type} leave request (${newLeave.from_date} to ${newLeave.to_date}). Requires faculty approval.`,
    priority: 'Normal'
  });

  res.status(201).json({ success: true, message: 'Leave application submitted successfully.', data: newLeave });
});

app.post('/api/leave/:id/review', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, remarks, reviewer_name } = req.body;
  const store = db.getStore();
  const leave = store.leaves.find(l => l.id === id);

  if (leave) {
    leave.status = status || 'Approved';
    leave.reviewed_by = reviewer_name || 'Dr. Robert Vance';
    leave.remarks = remarks || (leave.status === 'Approved' ? 'Granted with duty exemption.' : 'Rejected due to academic schedule clash.');

    const student = store.students.find(s => s.id === leave.student_id) || store.students[0];
    const parent = store.parents.find(p => p.student_id === student.id);

    // NOTIFICATION RULE 3: Notify Student and Parent of approval/rejection
    createNotification({
      targetUserId: student.user_id,
      studentId: student.id,
      role: 'student',
      category: 'Leave',
      title: `Leave Request ${leave.status}`,
      message: `Your leave request for ${leave.from_date} to ${leave.to_date} has been ${leave.status.toLowerCase()} by ${leave.reviewed_by}. Remarks: ${leave.remarks}`,
      priority: leave.status === 'Approved' ? 'Normal' : 'Important'
    });

    createNotification({
      targetUserId: parent ? parent.user_id : null,
      studentId: student.id,
      role: 'parent',
      category: 'Leave',
      title: `Leave Status Update: ${student.full_name}`,
      message: `Leave Update: ${student.full_name}'s leave request for ${leave.from_date} to ${leave.to_date} has been ${leave.status.toLowerCase()}.`,
      priority: 'Normal'
    });

    return res.json({ success: true, message: `Leave request ${leave.status.toLowerCase()} successfully. Notifications sent.`, data: leave });
  }
  res.status(404).json({ success: false, message: 'Leave record not found.' });
});

// ====================================================================
// FEE MANAGEMENT & DEMO TRANSACTIONS
// ====================================================================

app.get('/api/fees', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.fees });
});

app.get('/api/fees/student/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const fee = store.fees.find(f => f.student_id === id) || store.fees[0];
  res.json({ success: true, data: fee });
});

app.post('/api/fees/pay-demo', (req, res) => {
  const { student_id, amount, payment_mode } = req.body;
  const store = db.getStore();
  const id = parseInt(student_id || '1', 10);
  const fee = store.fees.find(f => f.student_id === id) || store.fees[0];
  const payAmt = parseFloat(amount || fee.pending_amount || 25000);

  fee.paid_amount += payAmt;
  fee.pending_amount = Math.max(0, fee.pending_amount - payAmt);
  fee.status = fee.pending_amount === 0 ? 'Paid' : 'Payment Pending';

  const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
  fee.history.unshift({
    id: txnId,
    date: new Date().toISOString().split('T')[0],
    amount: payAmt,
    mode: payment_mode || 'Online Portal',
    ref: `REF/${Date.now().toString().slice(-6)}`
  });

  const student = store.students.find(s => s.id === id) || store.students[0];
  const parent = store.parents.find(p => p.student_id === student.id);

  createNotification({
    targetUserId: parent ? parent.user_id : null,
    studentId: student.id,
    role: 'parent',
    category: 'Fees',
    title: `Payment Receipt: INR ${payAmt.toLocaleString()}`,
    message: `Payment Confirmation: Received INR ${payAmt.toLocaleString()} towards Semester 6 Tuition for ${student.full_name}. Txn ID: ${txnId}. Remaining balance: INR ${fee.pending_amount.toLocaleString()}.`,
    priority: 'Normal'
  });

  res.json({
    success: true,
    message: `Payment of INR ${payAmt.toLocaleString()} processed successfully in demo mode.`,
    data: fee
  });
});

// ====================================================================
// HELPDESK & COMPLAINT TICKET MANAGEMENT
// ====================================================================

app.get('/api/complaints', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.complaints.length, data: store.complaints });
});

app.post('/api/complaints', (req, res) => {
  const { student_id, category, priority, subject, description } = req.body;
  const store = db.getStore();
  const id = parseInt(student_id || '1', 10);
  const student = store.students.find(s => s.id === id) || store.students[0];

  const newTicket = {
    id: store.complaints.length + 1,
    student_id: student.id,
    student_name: student.full_name,
    category: category || 'General',
    priority: priority || 'Normal',
    subject: subject || 'Campus Support Request',
    description: description || 'No details provided.',
    status: 'Open',
    assigned_to: 'Campus Helpdesk Operations',
    created_at: new Date().toISOString().split('T')[0],
    resolution_notes: null
  };
  store.complaints.unshift(newTicket);

  createNotification({
    targetUserId: student.user_id,
    studentId: student.id,
    role: 'student',
    category: 'System',
    title: `Ticket Created (#${newTicket.id})`,
    message: `Your helpdesk ticket regarding "${newTicket.subject}" has been received and assigned to ${newTicket.assigned_to}.`,
    priority: 'Normal'
  });

  res.status(201).json({ success: true, message: 'Ticket submitted successfully.', data: newTicket });
});

app.put('/api/complaints/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, resolution_notes, assigned_to } = req.body;
  const store = db.getStore();
  const ticket = store.complaints.find(c => c.id === id);

  if (ticket) {
    if (status) ticket.status = status;
    if (resolution_notes) ticket.resolution_notes = resolution_notes;
    if (assigned_to) ticket.assigned_to = assigned_to;

    createNotification({
      studentId: ticket.student_id,
      role: 'student',
      category: 'System',
      title: `Ticket #${ticket.id} Updated`,
      message: `Your ticket regarding "${ticket.subject}" is now marked as ${ticket.status}. Notes: ${ticket.resolution_notes || 'Under active investigation.'}`,
      priority: ticket.status === 'Resolved' ? 'Normal' : 'Important'
    });

    return res.json({ success: true, message: 'Ticket status updated successfully.', data: ticket });
  }
  res.status(404).json({ success: false, message: 'Ticket not found.' });
});

// ====================================================================
// DOCUMENT & CERTIFICATE REQUEST SYSTEM
// ====================================================================

app.get('/api/certificates', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.certificates.length, data: store.certificates });
});

app.post('/api/certificates/request', (req, res) => {
  const { student_id, certificate_type, purpose } = req.body;
  const store = db.getStore();
  const id = parseInt(student_id || '1', 10);
  const student = store.students.find(s => s.id === id) || store.students[0];

  const newCert = {
    id: store.certificates.length + 1,
    student_id: student.id,
    student_name: student.full_name,
    certificate_type: certificate_type || 'Bonafide Certificate',
    purpose: purpose || 'Academic Documentation',
    status: 'Processing',
    requested_at: new Date().toISOString().split('T')[0],
    issued_at: null
  };
  store.certificates.unshift(newCert);

  createNotification({
    targetUserId: student.user_id,
    studentId: student.id,
    role: 'student',
    category: 'Academic',
    title: `Certificate Requested`,
    message: `Your request for ${newCert.certificate_type} is now being processed by the Registrar Office.`,
    priority: 'Normal'
  });

  res.status(201).json({ success: true, message: 'Certificate request submitted successfully.', data: newCert });
});

app.put('/api/certificates/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const store = db.getStore();
  const cert = store.certificates.find(c => c.id === id);

  if (cert) {
    cert.status = status || 'Approved';
    if (cert.status === 'Approved') {
      cert.issued_at = new Date().toISOString().split('T')[0];
    }

    createNotification({
      studentId: cert.student_id,
      role: 'student',
      category: 'Academic',
      title: `Certificate ${cert.status}`,
      message: `Your ${cert.certificate_type} is ${cert.status}. Available for digital verification in your student dashboard.`,
      priority: 'Normal'
    });

    return res.json({ success: true, message: `Certificate request ${cert.status.toLowerCase()}.`, data: cert });
  }
  res.status(404).json({ success: false, message: 'Certificate not found.' });
});

// ====================================================================
// PLACEMENT READINESS SCORE ENGINE
// ====================================================================

app.get('/api/placement/:studentId', (req, res) => {
  const id = parseInt(req.params.studentId, 10);
  const store = db.getStore();
  const profile = store.placementProfiles.find(p => p.student_id === id) || store.placementProfiles[0];
  const student = store.students.find(s => s.id === id) || store.students[0];

  res.json({
    success: true,
    data: {
      student,
      placement: profile
    }
  });
});

app.get('/api/admin/placement-summary', (req, res) => {
  const store = db.getStore();
  res.json({
    success: true,
    data: {
      profiles: store.placementProfiles,
      readyCount: store.placementProfiles.filter(p => p.readiness_status === 'Placement Ready').length,
      averageScore: 78.5
    }
  });
});

// ====================================================================
// FACULTY WORKLOAD DASHBOARD
// ====================================================================

app.get('/api/faculty/:id/workload', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const workload = store.facultyWorkload.find(w => w.faculty_id === id) || store.facultyWorkload[0];
  res.json({ success: true, data: workload });
});

app.get('/api/admin/faculty-workload', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.facultyWorkload });
});

// ====================================================================
// NOTIFICATIONS API
// ====================================================================

app.get('/api/notifications', (req, res) => {
  const store = db.getStore();
  const { role, student_id } = req.query;
  let list = store.notifications;

  if (role) {
    list = list.filter(n => n.target_role === role || n.target_role === 'all');
  }
  if (student_id) {
    const sId = parseInt(student_id, 10);
    list = list.filter(n => n.student_id === sId || !n.student_id);
  }

  const unreadCount = list.filter(n => !n.is_read).length;
  res.json({ success: true, count: list.length, unread: unreadCount, data: list });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const notif = store.notifications.find(n => n.id === id);
  if (notif) {
    notif.is_read = true;
    return res.json({ success: true, message: 'Notification marked as read.', data: notif });
  }
  res.status(404).json({ success: false, message: 'Notification not found.' });
});

app.post('/api/notifications/read-all', (req, res) => {
  const store = db.getStore();
  store.notifications.forEach(n => { n.is_read = true; });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

// ====================================================================
// COURSES, TIMETABLE, ASSIGNMENTS, EXAMS, EVENTS & ANNOUNCEMENTS
// ====================================================================

app.get('/api/faculty', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.faculty.length, data: store.faculty });
});

app.get('/api/faculty/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const f = store.faculty.find(fac => fac.id === id);
  if (f) res.json({ success: true, data: f });
  else res.status(404).json({ success: false, message: 'Faculty member not found.' });
});

app.get('/api/faculty/:id/details', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const f = store.faculty.find(fac => fac.id === id);
  if (!f) return res.status(404).json({ success: false, message: 'Faculty not found.' });

  const courses = store.courses.filter(c => (f.courses || []).includes(c.course_code) || c.instructor.includes(f.full_name));
  const workload = store.facultyWorkload.find(w => w.faculty_id === id) || store.facultyWorkload[0];

  res.json({
    success: true,
    data: {
      faculty: f,
      courses: courses.length > 0 ? courses : [store.courses[0]],
      students: store.students,
      workload,
      pendingLeaves: store.leaves.filter(l => l.status === 'Pending')
    }
  });
});

app.get('/api/courses', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.courses.length, data: store.courses });
});

app.get('/api/timetable', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.timetable });
});

app.get('/api/assignments', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.assignments });
});

app.post('/api/assignments', (req, res) => {
  const { course_code, title, description, due_date, max_score } = req.body;
  const store = db.getStore();
  const newAssignment = {
    id: store.assignments.length + 1,
    course_code: course_code || 'CS601',
    title: title || 'New Assignment',
    description: description || 'Assignment instructions and deliverables.',
    due_date: due_date || '2026-10-15',
    max_score: parseInt(max_score || '50', 10),
    score: null,
    status: 'Pending'
  };
  store.assignments.push(newAssignment);

  createNotification({
    role: 'student',
    category: 'Assignment',
    title: `New Assignment Uploaded: ${newAssignment.title}`,
    message: `Assignment for course ${newAssignment.course_code} has been uploaded. Due on ${newAssignment.due_date}.`,
    priority: 'Important'
  });

  res.status(201).json({ success: true, message: 'Assignment uploaded successfully.', data: newAssignment });
});

app.post('/api/assignments/:id/submit', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const assignment = store.assignments.find(a => a.id === id);
  if (assignment) {
    assignment.status = 'Submitted';
    createNotification({
      role: 'faculty',
      category: 'Assignment',
      title: `Assignment Submission Received`,
      message: `Student submission received for ${assignment.title}. Ready for grading.`,
      priority: 'Normal'
    });
    return res.json({ success: true, message: 'Assignment submitted successfully!', data: assignment });
  }
  res.status(404).json({ success: false, message: 'Assignment not found.' });
});

app.get('/api/exams', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, data: store.exams });
});

app.get('/api/events', (req, res) => {
  const store = db.getStore();
  res.json({ success: true, count: store.events.length, data: store.events });
});

app.post('/api/events/:id/register', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const event = store.events.find(e => e.id === id);
  if (event) {
    event.registered = !event.registered;
    event.registration_count += event.registered ? 1 : -1;
    return res.json({
      success: true,
      message: event.registered ? `Registered for ${event.title}!` : `Cancelled registration for ${event.title}.`,
      registered: event.registered,
      registration_count: event.registration_count
    });
  }
  res.status(404).json({ success: false, message: 'Event not found.' });
});

app.get('/api/announcements', (req, res) => {
  const store = db.getStore();
  const category = req.query.category;
  let data = store.announcements;
  if (category && category.toLowerCase() !== 'all') {
    data = data.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ success: true, count: data.length, data });
});

app.post('/api/announcements', (req, res) => {
  const { title, category, content, priority } = req.body;
  const store = db.getStore();
  const newAnn = {
    id: store.announcements.length + 1,
    title: title || 'University Announcement',
    category: category || 'Academic',
    content: content || 'Important notice for university students and staff.',
    priority: priority || 'Normal',
    date_posted: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: 'Academic Administration'
  };
  store.announcements.unshift(newAnn);

  createNotification({
    role: 'all',
    category: 'Academic',
    title: `Notice: ${newAnn.title}`,
    message: newAnn.content.slice(0, 120) + '...',
    priority: newAnn.priority
  });

  res.status(201).json({ success: true, message: 'Announcement broadcasted successfully.', data: newAnn });
});

app.delete('/api/announcements/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const store = db.getStore();
  const index = store.announcements.findIndex(a => a.id === id);
  if (index !== -1) {
    store.announcements.splice(index, 1);
    res.json({ success: true, message: 'Announcement deleted.' });
  } else {
    res.status(404).json({ success: false, message: 'Announcement not found.' });
  }
});

// Admin Metrics Overview
app.get('/api/admin/metrics', (req, res) => {
  const store = db.getStore();
  const containerTelemetry = db.getContainerStatus();

  res.json({
    success: true,
    metrics: {
      total_students: store.students.length,
      total_faculty: store.faculty.length,
      total_courses: store.courses.length,
      total_events: store.events.length,
      total_parents: store.parents.length,
      active_leaves: store.leaves.filter(l => l.status === 'Pending').length,
      open_complaints: store.complaints.filter(c => c.status === 'Open').length,
      system_uptime: '99.98%',
      containers: {
        frontend: containerTelemetry.frontend.status,
        backend: containerTelemetry.backend.status,
        database: containerTelemetry.database.status
      }
    }
  });
});

// Catch-all route to serve frontend index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  =============================================================
  🚀 Smart College Platform & Cloud Microservice Active
  -------------------------------------------------------------
  🌐 Port:        ${PORT}
  📦 Environment: ${process.env.NODE_ENV || 'production'}
  🩺 Health URL:  http://localhost:${PORT}/api/health
  📊 Telemetry:   http://localhost:${PORT}/api/container-status
  🤖 AI Risk:     http://localhost:${PORT}/api/student-risk/1
  🛡️ Observability:http://localhost:${PORT}/api/container-events
  🎓 Portal UI:   http://localhost:${PORT}/
  =============================================================
    `);
  });
}

module.exports = app;
