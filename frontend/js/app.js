/**
 * ====================================================================
 * CONTAINERIZING A COLLEGE PORTAL - FRONTEND APPLICATION LOGIC
 * IBM Academic Project Submission
 * Features:
 *   - Dedicated Page Routing (Home, Login, Register, Dashboards)
 *   - Dynamic Student & Faculty Profile Switcher (Change Students/Faculty)
 *   - Live Docker Container Telemetry Monitoring
 *   - Interactive Attendance, Grading, Timetable, Exams & Notices
 * ====================================================================
 */

// --- Global Application State ---
// Attendance override requests (faculty requesting to mark another faculty's subject)
if (!window.AppState) {
  // Initialized below
}

const AppState = {
  theme: localStorage.getItem('apex_theme') || 'light',
  currentPage: 'home',      // 'home' | 'login' | 'register' | 'dashboard'
  currentUser: JSON.parse(localStorage.getItem('apex_user') || 'null'),
  currentRole: 'student',   // 'student' | 'faculty' | 'parent' | 'admin'
  currentDashTab: 'overview',
  activeNotificationFilter: 'all',
  activeFacCourse: 'CS601',
  todayAttendance: JSON.parse(localStorage.getItem('apex_today_attendance') || '{}'),
  attendanceOverrides: JSON.parse(localStorage.getItem('apex_attendance_overrides') || '[]'),
  courses: [],
  events: [],
  announcements: [],
  // Pre-seeded 10 students — always available even before API loads
  students: [
    { id: 1, user_id: 1,  full_name: 'Alex Chen',       email: 'alex.chen@apex.edu',  roll_number: 'APX-2022-CS-084', department: 'Computer Science & Cloud Computing',      semester: 6, overall_attendance: 88.4, cgpa: 8.92, mentor_name: 'Dr. Robert Vance',    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 2, user_id: 4,  full_name: 'Sophia Martinez', email: 'sophia.m@apex.edu',   roll_number: 'APX-2022-CS-091', department: 'Computer Science & Cloud Computing',      semester: 6, overall_attendance: 94.0, cgpa: 9.35, mentor_name: 'Dr. Robert Vance',    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 3, user_id: 5,  full_name: 'David Kim',       email: 'david.k@apex.edu',   roll_number: 'APX-2022-CS-104', department: 'Artificial Intelligence & Data Science', semester: 6, overall_attendance: 82.5, cgpa: 8.41, mentor_name: 'Prof. Anita Sharma',  avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 4, user_id: 6,  full_name: 'Aisha Patel',     email: 'aisha.p@apex.edu',   roll_number: 'APX-2023-CS-022', department: 'Computer Science & Cloud Computing',      semester: 4, overall_attendance: 91.2, cgpa: 8.78, mentor_name: 'Dr. Kenneth Cole',   avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 5, user_id: 7,  full_name: 'Lucas Silva',     email: 'lucas.s@apex.edu',   roll_number: 'APX-2022-ECE-044', department: 'Electronics & Communication',           semester: 6, overall_attendance: 76.0, cgpa: 7.65, mentor_name: 'Dr. Sarah Connor',   avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 6, user_id: 11, full_name: 'Marcus Vance',    email: 'marcus.v@apex.edu',  roll_number: 'APX-2022-CS-112', department: 'Computer Science & Cloud Computing',      semester: 6, overall_attendance: 64.5, cgpa: 6.80, mentor_name: 'Dr. Robert Vance',    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80', status: 'Academic Warning' },
    { id: 7, user_id: 12, full_name: 'Daniel Craig',    email: 'daniel.c@apex.edu',  roll_number: 'APX-2022-CS-118', department: 'Computer Science & Cloud Computing',      semester: 6, overall_attendance: 78.0, cgpa: 5.20, mentor_name: 'Prof. Anita Sharma',  avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80', status: 'Academic Warning' },
    { id: 8, user_id: 13, full_name: 'Maya Lin',        email: 'maya.l@apex.edu',    roll_number: 'APX-2022-CS-125', department: 'Computer Science & Cloud Computing',      semester: 6, overall_attendance: 85.0, cgpa: 7.90, mentor_name: 'Dr. Kenneth Cole',   avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 9, user_id: 14, full_name: 'Rohan Gupta',     email: 'rohan.g@apex.edu',   roll_number: 'APX-2022-CS-130', department: 'Artificial Intelligence & Data Science', semester: 6, overall_attendance: 89.0, cgpa: 8.85, mentor_name: 'Dr. Rajesh Iyer',   avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', status: 'Active' },
    { id: 10, user_id: 15, full_name: 'Priya Nair',     email: 'priya.n@apex.edu',   roll_number: 'APX-2022-CS-135', department: 'Computer Science & Cloud Computing',      semester: 6, overall_attendance: 86.5, cgpa: 8.10, mentor_name: 'Dr. Robert Vance',    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', status: 'Active' }
  ],
  // Pre-seeded 10 parents linked to each student
  parents: [
    { id: 1, user_id: 10, student_id: 1, full_name: 'Robert Chen Sr.',  email: 'robert.chen.parent@gmail.com', phone: '+1 (555) 234-8901', relationship: 'Father', occupation: 'Cloud Solutions Architect', student_name: 'Alex Chen', student_roll: 'APX-2022-CS-084', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' },
    { id: 2, user_id: null, student_id: 2, full_name: 'Carmen Martinez', email: 'carmen.m.parent@gmail.com',  phone: '+1 (555) 345-6789', relationship: 'Mother', occupation: 'Pediatrician', student_name: 'Sophia Martinez', student_roll: 'APX-2022-CS-091', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80' },
    { id: 3, user_id: null, student_id: 3, full_name: 'Jin Kim',         email: 'jin.kim.parent@gmail.com',   phone: '+1 (555) 456-7890', relationship: 'Father', occupation: 'Financial Analyst', student_name: 'David Kim', student_roll: 'APX-2022-CS-104', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
    { id: 4, user_id: null, student_id: 4, full_name: 'Sunita Patel',    email: 'sunita.p.parent@gmail.com',  phone: '+1 (555) 567-8901', relationship: 'Mother', occupation: 'High School Principal', student_name: 'Aisha Patel', student_roll: 'APX-2023-CS-022', avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80' },
    { id: 5, user_id: null, student_id: 5, full_name: 'Carlos Silva',    email: 'carlos.s.parent@gmail.com',  phone: '+1 (555) 678-9012', relationship: 'Father', occupation: 'Civil Engineer', student_name: 'Lucas Silva', student_roll: 'APX-2022-ECE-044', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
    { id: 6, user_id: null, student_id: 6, full_name: 'George Vance',     email: 'george.vance.parent@gmail.com', phone: '+1 (555) 789-0123', relationship: 'Father', occupation: 'Business Executive', student_name: 'Marcus Vance', student_roll: 'APX-2022-CS-112', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' },
    { id: 7, user_id: null, student_id: 7, full_name: 'Arthur Craig',    email: 'arthur.c.parent@gmail.com',  phone: '+1 (555) 890-1234', relationship: 'Father', occupation: 'Operations Manager', student_name: 'Daniel Craig', student_roll: 'APX-2022-CS-118', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' },
    { id: 8, user_id: null, student_id: 8, full_name: 'Wei Lin',         email: 'wei.lin.parent@gmail.com',   phone: '+1 (555) 901-2345', relationship: 'Mother', occupation: 'Architect', student_name: 'Maya Lin', student_roll: 'APX-2022-CS-125', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
    { id: 9, user_id: null, student_id: 9, full_name: 'Suresh Gupta',    email: 'suresh.g.parent@gmail.com',  phone: '+1 (555) 012-3456', relationship: 'Father', occupation: 'Senior Consultant', student_name: 'Rohan Gupta', student_roll: 'APX-2022-CS-130', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
    { id: 10, user_id: null, student_id: 10, full_name: 'Latha Nair',     email: 'latha.n.parent@gmail.com',   phone: '+1 (555) 123-4567', relationship: 'Mother', occupation: 'Professor', student_name: 'Priya Nair', student_roll: 'APX-2022-CS-135', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' }
  ],
  // Pre-seeded faculty — always available
  faculty: [
    { id: 1, user_id: 2,  full_name: 'Dr. Robert Vance',    email: 'robert.vance@apex.edu', employee_id: 'FAC-CS-109', department: 'Computer Science & Cloud Computing', designation: 'Professor & Cloud Lead',    specialization: 'Distributed Systems & Docker Containerization', cabin_location: 'IBM Center of Excellence, Room 402', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', courses: ['CS601','CS604'], courses_count: 2 },
    { id: 2, user_id: 8,  full_name: 'Prof. Anita Sharma',  email: 'anita.s@apex.edu',     employee_id: 'FAC-CS-114', department: 'Computer Science & Engineering',      designation: 'Associate Professor',       specialization: 'Full Stack Frameworks & Reactive Systems',     cabin_location: 'Block C, Room 310',                          avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80', courses: ['CS602'],         courses_count: 1 },
    { id: 3, user_id: 9,  full_name: 'Dr. Kenneth Cole',    email: 'kenneth.c@apex.edu',   employee_id: 'FAC-CS-098', department: 'Computer Science',                   designation: 'Assistant Professor',       specialization: 'Database Internals & Storage Sharding',        cabin_location: 'Block B, Room 204',                          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80', courses: ['CS603'],         courses_count: 1 },
    { id: 4, user_id: 16, full_name: 'Dr. Sarah Connor',    email: 'sarah.c@apex.edu',     employee_id: 'FAC-CS-122', department: 'Computer Science & Artificial Intel', designation: 'Associate Professor',       specialization: 'Deep Learning & Neural Architectures',          cabin_location: 'Block D, Room 108',                          avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', courses: ['CS605'],         courses_count: 1 },
    { id: 5, user_id: 17, full_name: 'Dr. Rajesh Iyer',     email: 'rajesh.i@apex.edu',    employee_id: 'FAC-CS-130', department: 'DevOps & Systems Engineering',        designation: 'Assistant Professor',       specialization: 'CI/CD Pipelines & Kubernetes Orchestration',    cabin_location: 'Block A, Room 201',                          avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', courses: ['CS607'],         courses_count: 1 }
  ],
  // Pre-seeded attendance for all 10 students
  attendance: [
    // Student 1: Alex Chen (Overall 88.4%)
    { student_id: 1, id: 1,  course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 39, percentage: 92.8 },
    { student_id: 1, id: 2,  course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 36, percentage: 90.0 },
    { student_id: 1, id: 3,  course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 33, percentage: 86.8 },
    { student_id: 1, id: 4,  course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 31, percentage: 86.1 },
    { student_id: 1, id: 5,  course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 34, percentage: 85.0 },

    // Student 2: Sophia Martinez (Overall 94.0%)
    { student_id: 2, id: 6,  course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 41, percentage: 97.6 },
    { student_id: 2, id: 7,  course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 38, percentage: 95.0 },
    { student_id: 2, id: 8,  course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 36, percentage: 94.7 },
    { student_id: 2, id: 9,  course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 34, percentage: 94.4 },
    { student_id: 2, id: 10, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 38, percentage: 95.0 },

    // Student 3: David Kim (Overall 82.5%)
    { student_id: 3, id: 11, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 35, percentage: 83.3 },
    { student_id: 3, id: 12, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 33, percentage: 82.5 },
    { student_id: 3, id: 13, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 31, percentage: 81.6 },
    { student_id: 3, id: 14, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 30, percentage: 83.3 },
    { student_id: 3, id: 15, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 35, percentage: 87.5 },

    // Student 4: Aisha Patel (Overall 91.2%)
    { student_id: 4, id: 16, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 38, percentage: 90.5 },
    { student_id: 4, id: 17, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 37, percentage: 92.5 },
    { student_id: 4, id: 18, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 34, percentage: 89.5 },
    { student_id: 4, id: 19, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 33, percentage: 91.7 },
    { student_id: 4, id: 20, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 37, percentage: 92.5 },

    // Student 5: Lucas Silva (Overall 76.0%)
    { student_id: 5, id: 21, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 32, percentage: 76.2 },
    { student_id: 5, id: 22, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 30, percentage: 75.0 },
    { student_id: 5, id: 23, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 29, percentage: 76.3 },
    { student_id: 5, id: 24, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 27, percentage: 75.0 },
    { student_id: 5, id: 25, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 31, percentage: 77.5 },

    // Student 6: Marcus Vance (Overall 64.5% - Academic Warning)
    { student_id: 6, id: 26, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 27, percentage: 64.3 },
    { student_id: 6, id: 27, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 25, percentage: 62.5 },
    { student_id: 6, id: 28, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 25, percentage: 65.8 },
    { student_id: 6, id: 29, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 23, percentage: 63.9 },
    { student_id: 6, id: 30, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 26, percentage: 65.0 },

    // Student 7: Daniel Craig (Overall 78.0%)
    { student_id: 7, id: 31, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 33, percentage: 78.6 },
    { student_id: 7, id: 32, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 31, percentage: 77.5 },
    { student_id: 7, id: 33, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 29, percentage: 76.3 },
    { student_id: 7, id: 34, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 28, percentage: 77.8 },
    { student_id: 7, id: 35, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 32, percentage: 80.0 },

    // Student 8: Maya Lin (Overall 85.0%)
    { student_id: 8, id: 36, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 36, percentage: 85.7 },
    { student_id: 8, id: 37, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 34, percentage: 85.0 },
    { student_id: 8, id: 38, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 32, percentage: 84.2 },
    { student_id: 8, id: 39, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 31, percentage: 86.1 },
    { student_id: 8, id: 40, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 34, percentage: 85.0 },

    // Student 9: Rohan Gupta (Overall 89.0%)
    { student_id: 9, id: 41, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 38, percentage: 90.5 },
    { student_id: 9, id: 42, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 35, percentage: 87.5 },
    { student_id: 9, id: 43, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 34, percentage: 89.5 },
    { student_id: 9, id: 44, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 32, percentage: 88.9 },
    { student_id: 9, id: 45, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 36, percentage: 90.0 },

    // Student 10: Priya Nair (Overall 86.5%)
    { student_id: 10, id: 46, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          total_classes: 42, attended_classes: 36, percentage: 85.7 },
    { student_id: 10, id: 47, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              total_classes: 40, attended_classes: 35, percentage: 87.5 },
    { student_id: 10, id: 48, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  total_classes: 38, attended_classes: 33, percentage: 86.8 },
    { student_id: 10, id: 49, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            total_classes: 36, attended_classes: 31, percentage: 86.1 },
    { student_id: 10, id: 50, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  total_classes: 40, attended_classes: 34, percentage: 85.0 }
  ],
  // Pre-seeded marks for all 10 students across all 5 courses
  marks: [
    // Student 1: Alex Chen (CGPA: 8.92)
    { student_id: 1, id: 1,  course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 29.0, midterm: 48.0, assignment: 19.5, total: 96.5, grade: 'A+' },
    { student_id: 1, id: 2,  course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 27.5, midterm: 44.0, assignment: 18.0, total: 89.5, grade: 'A'  },
    { student_id: 1, id: 3,  course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 28.0, midterm: 46.5, assignment: 19.0, total: 93.5, grade: 'A+' },
    { student_id: 1, id: 4,  course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 26.0, midterm: 43.0, assignment: 17.5, total: 86.5, grade: 'A'  },
    { student_id: 1, id: 5,  course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 28.5, midterm: 45.0, assignment: 18.5, total: 92.0, grade: 'A+' },

    // Student 2: Sophia Martinez (CGPA: 9.35 - Class Topper)
    { student_id: 2, id: 6,  course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 30.0, midterm: 49.0, assignment: 20.0, total: 99.0, grade: 'A+' },
    { student_id: 2, id: 7,  course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 29.5, midterm: 48.5, assignment: 19.5, total: 97.5, grade: 'A+' },
    { student_id: 2, id: 8,  course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 28.5, midterm: 47.0, assignment: 19.0, total: 94.5, grade: 'A+' },
    { student_id: 2, id: 9,  course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 29.0, midterm: 48.0, assignment: 19.5, total: 96.5, grade: 'A+' },
    { student_id: 2, id: 10, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 29.5, midterm: 49.0, assignment: 20.0, total: 98.5, grade: 'A+' },

    // Student 3: David Kim (CGPA: 8.41)
    { student_id: 3, id: 11, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 25.0, midterm: 41.0, assignment: 17.0, total: 83.0, grade: 'A' },
    { student_id: 3, id: 12, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 26.0, midterm: 42.5, assignment: 17.5, total: 86.0, grade: 'A' },
    { student_id: 3, id: 13, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 24.5, midterm: 40.0, assignment: 16.5, total: 81.0, grade: 'A' },
    { student_id: 3, id: 14, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 25.5, midterm: 41.5, assignment: 17.0, total: 84.0, grade: 'A' },
    { student_id: 3, id: 15, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 27.0, midterm: 43.5, assignment: 18.0, total: 88.5, grade: 'A' },

    // Student 4: Aisha Patel (CGPA: 8.78)
    { student_id: 4, id: 16, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 27.0, midterm: 44.0, assignment: 18.5, total: 89.5, grade: 'A' },
    { student_id: 4, id: 17, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 28.0, midterm: 45.5, assignment: 19.0, total: 92.5, grade: 'A+' },
    { student_id: 4, id: 18, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 26.5, midterm: 43.0, assignment: 18.0, total: 87.5, grade: 'A' },
    { student_id: 4, id: 19, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 27.5, midterm: 44.5, assignment: 18.5, total: 90.5, grade: 'A+' },
    { student_id: 4, id: 20, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 26.0, midterm: 42.0, assignment: 18.0, total: 86.0, grade: 'A' },

    // Student 5: Lucas Silva (CGPA: 7.65)
    { student_id: 5, id: 21, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 23.0, midterm: 37.0, assignment: 15.5, total: 75.5, grade: 'B+' },
    { student_id: 5, id: 22, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 24.0, midterm: 38.0, assignment: 16.0, total: 78.0, grade: 'B+' },
    { student_id: 5, id: 23, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 22.5, midterm: 36.5, assignment: 15.0, total: 74.0, grade: 'B' },
    { student_id: 5, id: 24, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 23.5, midterm: 38.0, assignment: 16.0, total: 77.5, grade: 'B+' },
    { student_id: 5, id: 25, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 24.5, midterm: 39.0, assignment: 16.5, total: 80.0, grade: 'A' },

    // Student 6: Marcus Vance (CGPA: 6.80)
    { student_id: 6, id: 26, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 18.0, midterm: 32.0, assignment: 14.0, total: 64.0, grade: 'C' },
    { student_id: 6, id: 27, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 19.5, midterm: 33.5, assignment: 14.5, total: 67.5, grade: 'C' },
    { student_id: 6, id: 28, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 20.0, midterm: 34.0, assignment: 15.0, total: 69.0, grade: 'C' },
    { student_id: 6, id: 29, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 19.0, midterm: 33.0, assignment: 15.0, total: 67.0, grade: 'C' },
    { student_id: 6, id: 30, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 21.0, midterm: 35.0, assignment: 15.5, total: 71.5, grade: 'B' },

    // Student 7: Daniel Craig (CGPA: 5.20 - Low Marks Warning)
    { student_id: 7, id: 31, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 12.0, midterm: 22.0, assignment: 10.0, total: 44.0, grade: 'F' },
    { student_id: 7, id: 32, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 14.0, midterm: 25.0, assignment: 11.5, total: 50.5, grade: 'D' },
    { student_id: 7, id: 33, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 13.5, midterm: 26.0, assignment: 11.0, total: 50.5, grade: 'D' },
    { student_id: 7, id: 34, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 15.0, midterm: 28.0, assignment: 12.0, total: 55.0, grade: 'D' },
    { student_id: 7, id: 35, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 16.0, midterm: 29.5, assignment: 13.0, total: 58.5, grade: 'C' },

    // Student 8: Maya Lin (CGPA: 7.90)
    { student_id: 8, id: 36, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 24.0, midterm: 39.0, assignment: 16.5, total: 79.5, grade: 'B+' },
    { student_id: 8, id: 37, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 25.0, midterm: 40.5, assignment: 17.0, total: 82.5, grade: 'A' },
    { student_id: 8, id: 38, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 23.5, midterm: 38.0, assignment: 16.0, total: 77.5, grade: 'B+' },
    { student_id: 8, id: 39, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 24.5, midterm: 39.5, assignment: 17.0, total: 81.0, grade: 'A' },
    { student_id: 8, id: 40, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 25.0, midterm: 41.0, assignment: 17.5, total: 83.5, grade: 'A' },

    // Student 9: Rohan Gupta (CGPA: 8.85)
    { student_id: 9, id: 41, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 27.5, midterm: 44.5, assignment: 18.5, total: 90.5, grade: 'A+' },
    { student_id: 9, id: 42, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 26.5, midterm: 43.5, assignment: 18.0, total: 88.0, grade: 'A' },
    { student_id: 9, id: 43, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 27.0, midterm: 44.0, assignment: 18.5, total: 89.5, grade: 'A' },
    { student_id: 9, id: 44, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 26.0, midterm: 43.0, assignment: 18.0, total: 87.0, grade: 'A' },
    { student_id: 9, id: 45, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 28.0, midterm: 46.0, assignment: 19.0, total: 93.0, grade: 'A+' },

    // Student 10: Priya Nair (CGPA: 8.10)
    { student_id: 10, id: 46, course_code: 'CS601', course_name: 'Cloud Computing & Microservices',          credits: 4, internal: 25.0, midterm: 40.5, assignment: 17.0, total: 82.5, grade: 'A' },
    { student_id: 10, id: 47, course_code: 'CS602', course_name: 'Full-Stack Web Architectures',              credits: 4, internal: 25.5, midterm: 41.0, assignment: 17.5, total: 84.0, grade: 'A' },
    { student_id: 10, id: 48, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage',  credits: 3, internal: 24.0, midterm: 39.5, assignment: 16.5, total: 80.0, grade: 'A' },
    { student_id: 10, id: 49, course_code: 'CS604', course_name: 'Container Security & DevSecOps',            credits: 3, internal: 24.5, midterm: 40.0, assignment: 17.0, total: 81.5, grade: 'A' },
    { student_id: 10, id: 50, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems',  credits: 4, internal: 26.0, midterm: 42.0, assignment: 17.5, total: 85.5, grade: 'A' }
  ],
  // Pre-seeded Leave Requests
  leaves: [
    { id: 1, student_id: 1, student_name: 'Alex Chen', roll_number: 'APX-2022-CS-084', leave_type: 'Medical', start_date: '2026-03-10', end_date: '2026-03-12', days_count: 3, reason: 'Viral infection with medical prescription', status: 'Approved', review_notes: 'Approved with hospital slip', reviewer_name: 'Dr. Robert Vance' },
    { id: 2, student_id: 6, student_name: 'Marcus Vance', roll_number: 'APX-2022-CS-112', leave_type: 'Family Emergency', start_date: '2026-03-18', end_date: '2026-03-20', days_count: 3, reason: 'Family medical travel', status: 'Pending', review_notes: null, reviewer_name: null },
    { id: 3, student_id: 3, student_name: 'David Kim', roll_number: 'APX-2022-CS-104', leave_type: 'Academic Event', start_date: '2026-03-25', end_date: '2026-03-26', days_count: 2, reason: 'IEEE Cloud Summit Hackathon', status: 'Approved', review_notes: 'Encouraged participation', reviewer_name: 'Prof. Anita Sharma' }
  ],
  // Pre-seeded Fee Records (All 10 Students)
  fees: [
    { id: 1, student_id: 1, student_name: 'Alex Chen', semester: 6, total_amount: 85000, paid_amount: 60000, due_amount: 25000, status: 'Partial', receipt_no: 'RCPT-2026-06-084', payment_date: '2026-01-15' },
    { id: 2, student_id: 2, student_name: 'Sophia Martinez', semester: 6, total_amount: 85000, paid_amount: 85000, due_amount: 0, status: 'Paid', receipt_no: 'RCPT-2026-06-091', payment_date: '2026-01-10' },
    { id: 3, student_id: 3, student_name: 'David Kim', semester: 6, total_amount: 85000, paid_amount: 85000, due_amount: 0, status: 'Paid', receipt_no: 'RCPT-2026-06-104', payment_date: '2026-01-12' },
    { id: 4, student_id: 4, student_name: 'Aisha Patel', semester: 4, total_amount: 85000, paid_amount: 85000, due_amount: 0, status: 'Paid', receipt_no: 'RCPT-2026-06-022', payment_date: '2026-01-14' },
    { id: 5, student_id: 5, student_name: 'Lucas Silva', semester: 6, total_amount: 85000, paid_amount: 50000, due_amount: 35000, status: 'Partial', receipt_no: 'RCPT-2026-06-044', payment_date: '2026-01-18' },
    { id: 6, student_id: 6, student_name: 'Marcus Vance', semester: 6, total_amount: 85000, paid_amount: 40000, due_amount: 45000, status: 'Overdue', receipt_no: 'RCPT-2026-06-112', payment_date: '2026-01-20' },
    { id: 7, student_id: 7, student_name: 'Daniel Craig', semester: 6, total_amount: 85000, paid_amount: 30000, due_amount: 55000, status: 'Overdue', receipt_no: 'RCPT-2026-06-118', payment_date: '2026-01-18' },
    { id: 8, student_id: 8, student_name: 'Maya Lin', semester: 6, total_amount: 85000, paid_amount: 85000, due_amount: 0, status: 'Paid', receipt_no: 'RCPT-2026-06-125', payment_date: '2026-01-11' },
    { id: 9, student_id: 9, student_name: 'Rohan Gupta', semester: 6, total_amount: 85000, paid_amount: 85000, due_amount: 0, status: 'Paid', receipt_no: 'RCPT-2026-06-130', payment_date: '2026-01-16' },
    { id: 10, student_id: 10, student_name: 'Priya Nair', semester: 6, total_amount: 85000, paid_amount: 85000, due_amount: 0, status: 'Paid', receipt_no: 'RCPT-2026-06-135', payment_date: '2026-01-19' }
  ],
  // Pre-seeded Complaints / Grievances
  complaints: [
    { id: 1, student_id: 1, student_name: 'Alex Chen', category: 'Hostel & Infrastructure', subject: 'Lab 4 Docker daemon socket permissions', description: 'Docker daemon connection refused on node 12 in Cloud Systems Lab.', status: 'Resolved', resolution_notes: 'Sudoers group updated for student sessions.', assigned_to: 'IT Systems Admin' },
    { id: 2, student_id: 6, student_name: 'Marcus Vance', category: 'Academic', subject: 'Attendance recount for CS601 lecture', description: 'Missed biometrics scan on March 3rd due to terminal reboot.', status: 'In Progress', resolution_notes: 'Faculty verification pending.', assigned_to: 'Dr. Robert Vance' }
  ],
  // Pre-seeded Certificate Requests
  certificates: [
    { id: 1, student_id: 1, student_name: 'Alex Chen', cert_type: 'Bonafide Certificate', purpose: 'Passport renewal & internship visa', status: 'Ready for Pickup', issue_date: '2026-03-02', serial_no: 'BONA-2026-084' },
    { id: 2, student_id: 2, student_name: 'Sophia Martinez', cert_type: 'Official Transcript', purpose: 'Higher studies application (MS Cloud)', status: 'Approved', issue_date: '2026-03-05', serial_no: 'TRNS-2026-091' },
    { id: 3, student_id: 6, student_name: 'Marcus Vance', cert_type: 'NOC for Internship', purpose: 'Summer off-campus internship', status: 'Pending Review', issue_date: null, serial_no: null }
  ],
  // Pre-seeded Placement Readiness
  placement: [
    { student_id: 1, student_name: 'Alex Chen', readiness_score: 92.5, tier: 'Tier 1 Dream (IBM / Google / Microsoft)', coding_score: 95.0, aptitude_score: 90.0, mock_interview_score: 92.5, offers_count: 2, target_role: 'Cloud Native Architect' },
    { student_id: 2, student_name: 'Sophia Martinez', readiness_score: 96.0, tier: 'Tier 1 Dream (IBM / Google / Microsoft)', coding_score: 98.0, aptitude_score: 94.0, mock_interview_score: 96.0, offers_count: 3, target_role: 'Distributed Systems Engineer' },
    { student_id: 6, student_name: 'Marcus Vance', readiness_score: 58.0, tier: 'Tier 3 Needs Skill Elevation', coding_score: 54.0, aptitude_score: 62.0, mock_interview_score: 58.0, offers_count: 0, target_role: 'DevOps Associate' }
  ],
  // Pre-seeded Smart Notifications
  notifications: [
    { id: 1, recipient_type: 'parent', recipient_id: 6, category: 'Attendance', priority: 'Urgent', title: '⚠️ LOW ATTENDANCE ALERT: Marcus Vance', message: 'Marcus Vance attendance in CS601 is 64.3% (Overall: 64.5%), which is below the mandatory 75% requirement. Immediate parental advisory requested.', is_read: false, created_at: '2026-03-09T10:15:00Z' },
    { id: 2, recipient_type: 'student', recipient_id: 6, category: 'Attendance', priority: 'Urgent', title: '⚠️ Academic Attendance Warning', message: 'Your attendance has dropped to 64.5%. You are at risk of debarment from final semester exams.', is_read: false, created_at: '2026-03-09T10:15:00Z' },
    { id: 3, recipient_type: 'parent', recipient_id: 7, category: 'Marks', priority: 'Urgent', title: '⚠️ Academic Alert: Low Internal Marks for Daniel Craig', message: 'Daniel Craig scored 12.0/30 in CS601 Cloud Computing internals. Remedial tutorials are scheduled.', is_read: false, created_at: '2026-03-08T14:30:00Z' },
    { id: 4, recipient_type: 'student', recipient_id: 1, category: 'Fees', priority: 'Normal', title: 'Fee Payment Acknowledged', message: 'Spring Semester 2026 tuition fee receipt #RCPT-2026-06-084 has been generated and settled.', is_read: true, created_at: '2026-03-05T09:00:00Z' },
    { id: 5, recipient_type: 'student', recipient_id: 1, category: 'Leave', priority: 'Normal', title: 'Medical Leave Approved', message: 'Your leave request for March 10-12 has been approved by Dr. Robert Vance.', is_read: true, created_at: '2026-03-06T11:20:00Z' }
  ],
  // Pre-seeded Container Auto-Healing System Events
  containerEvents: [
    { id: 1, tier: 'backend', event_type: 'recovery', status: 'restored', message: 'Self-healing engine restarted backend container and restored 200 OK health status.', timestamp: '2026-03-09 09:30:14' },
    { id: 2, tier: 'backend', event_type: 'health_check', status: 'failure_detected', message: 'Health probe failed: HTTP 503 Service Unavailable. Triggering auto-recovery...', timestamp: '2026-03-09 09:30:10' },
    { id: 3, tier: 'database', event_type: 'probe', status: 'healthy', message: 'pg_isready check passed. Active pool connections: 12/50.', timestamp: '2026-03-09 08:45:00' }
  ],
  timetable: [
    { id: 1, day: 'Monday', time: '09:00 AM - 10:30 AM', code: 'CS601', subject: 'Cloud Computing & Microservices', room: 'Lab 4 (IBM Suite)', instructor: 'Dr. Robert Vance' },
    { id: 2, day: 'Monday', time: '10:45 AM - 12:15 PM', code: 'CS602', subject: 'Full-Stack Web Architectures', room: 'Auditorium 2', instructor: 'Prof. Anita Sharma' },
    { id: 3, day: 'Tuesday', time: '09:00 AM - 10:30 AM', code: 'CS603', subject: 'Database Internals & Distributed Storage', room: 'Lecture Hall 102', instructor: 'Dr. Kenneth Cole' },
    { id: 4, day: 'Tuesday', time: '11:00 AM - 12:30 PM', code: 'CS604', subject: 'Container Security & DevSecOps', room: 'Cyber Lab 1', instructor: 'Dr. Robert Vance' },
    { id: 5, day: 'Wednesday', time: '09:00 AM - 11:00 AM', code: 'CS601', subject: 'Docker Hands-on Practicum', room: 'Cloud Lab 3', instructor: 'Dr. Robert Vance' },
    { id: 6, day: 'Thursday', time: '10:00 AM - 11:30 AM', code: 'CS605', subject: 'AI & Neural Systems', room: 'AI Research Lab', instructor: 'Dr. Sarah Connor' },
    { id: 7, day: 'Friday', time: '02:00 PM - 04:00 PM', code: 'CS602', subject: 'Full-Stack Project Mentoring', room: 'Innovation Center', instructor: 'Prof. Anita Sharma' }
  ],
  assignments: [
    { id: 1, student_id: 1, course_code: 'CS601', title: 'Lab 3: Dockerizing Multi-Tier Node & PostgreSQL App', due_date: '2026-09-18', max_score: 100, score: 98, status: 'Submitted', description: 'Write a Dockerfile and docker-compose.yml to spin up Express, static frontend, and PostgreSQL with volume persistence.' },
    { id: 2, student_id: 1, course_code: 'CS602', title: 'Project Milestone 2: REST API with Token Auth', due_date: '2026-09-24', max_score: 50, score: null, status: 'Pending', description: 'Implement role-based middleware for student, faculty, and admin roles with error handling.' },
    { id: 3, student_id: 1, course_code: 'CS604', title: 'Security Audit: Rootless Container Gating', due_date: '2026-09-30', max_score: 50, score: null, status: 'Pending', description: 'Scan images with Trivy and patch CVEs in alpine base layers.' },
    { id: 4, student_id: 1, course_code: 'CS603', title: 'Query Optimization & Indexing in PostgreSQL', due_date: '2026-10-05', max_score: 50, score: null, status: 'Pending', description: 'Analyze EXPLAIN ANALYZE traces on high-throughput university registration transactions.' }
  ],
  exams: [
    { id: 1, course_code: 'CS601', subject: 'Cloud Computing & Microservices', date: 'Oct 12, 2026', time: '10:00 AM - 01:00 PM', hall: 'Examination Hall A, Seat 42', status: 'Upcoming' },
    { id: 2, course_code: 'CS602', subject: 'Full-Stack Web Architectures', date: 'Oct 15, 2026', time: '10:00 AM - 01:00 PM', hall: 'Examination Hall B, Seat 18', status: 'Upcoming' },
    { id: 3, course_code: 'CS603', subject: 'Database Internals & Distributed Storage', date: 'Oct 19, 2026', time: '10:00 AM - 01:00 PM', hall: 'Examination Hall A, Seat 42', status: 'Upcoming' },
    { id: 4, course_code: 'CS604', subject: 'Container Security & DevSecOps', date: 'Oct 22, 2026', time: '10:00 AM - 01:00 PM', hall: 'Cyber Center, Seat 11', status: 'Upcoming' }
  ],
  containerStatus: {
    frontend: { status: 'Running', port: '3000:80', memory_mb: 28.4, cpu_percent: 0.8 },
    backend: { status: 'Running', port: '5000:5000', memory_mb: 64.2, cpu_percent: 1.4 },
    database: { status: 'Connected', port: '5432:5432', memory_mb: 112.6, cpu_percent: 2.1 }
  }
};
window.AppState = AppState;

// Pre-seed sample override request if none exist
if (AppState.attendanceOverrides.length === 0) {
  AppState.attendanceOverrides.push({
    id: 1,
    student_id: 6,
    student_name: 'Marcus Vance',
    student_roll: 'APX-2022-CS-112',
    faculty_id: 1,
    faculty_name: 'Dr. Robert Vance',
    course_code: 'CS601',
    course_name: 'Cloud Computing & Microservices',
    current_percentage: 64.5,
    requested_percentage: 75.0,
    reason: 'Approved Medical Certificate / Hospitalization Leave Adjustment (Waiver to 75% cutoff)',
    status: 'Pending',
    requested_at: '2026-09-15 11:30'
  });
  try { localStorage.setItem('apex_attendance_overrides', JSON.stringify(AppState.attendanceOverrides)); } catch (_) {}
}

const API_BASE = '/api';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTypingAnimation();
  initScrollAnimations();
  initNavbarBehavior();
  loadInitialData();
  startContainerTelemetryPolling();
  initRouting();

  // Restore user session if saved
  if (AppState.currentUser) {
    AppState.currentRole = AppState.currentUser.role;
    updateNavbarAuth(AppState.currentUser);
  }

  // Dismiss Preloader
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('loaded');
  }, 500);
});

// ====================================================================
// PAGE ROUTING SYSTEM (SWITCHING TO DEDICATED PAGES)
// ====================================================================
function initRouting() {
  window.addEventListener('hashchange', handleHashRoute);
  if (window.location.hash) {
    handleHashRoute();
  }
}

function handleHashRoute() {
  const rawHash = window.location.hash.replace('#', '').trim();
  if (!rawHash) {
    navigateTo('home');
    return;
  }
  const parts = rawHash.split('/');
  const page = parts[0].toLowerCase();
  const subParam = parts[1];

  if (['student', 'student-portal', 'student_portal'].includes(page)) {
    openPortal('student', subParam);
  } else if (['faculty', 'faculty-portal', 'faculty_portal'].includes(page)) {
    openPortal('faculty', subParam);
  } else if (['parent', 'parent-portal', 'parent_portal'].includes(page)) {
    openPortal('parent', subParam);
  } else if (['admin', 'admin-portal', 'admin_portal'].includes(page)) {
    openPortal('admin', subParam);
  } else if (page === 'login') {
    navigateTo('login', subParam);
  } else if (page === 'register') {
    navigateTo('register');
  } else if (page === 'dashboard') {
    navigateTo('dashboard', subParam);
  } else if (['about', 'architecture', 'courses', 'events', 'announcements', 'contact'].includes(page)) {
    navigateTo(page);
  } else {
    navigateTo('home');
  }
}

// Global 1-Click Direct Academic Portal Opener
function openPortal(role = 'student', tab = null) {
  const normalizedRole = role.toLowerCase().replace('-portal', '').replace('_portal', '');

  let chosenProfile = null;
  if (normalizedRole === 'student') {
    chosenProfile = (AppState.currentUser && AppState.currentUser.role === 'student' && AppState.currentUser.profile)
      ? AppState.currentUser.profile
      : (AppState.students && AppState.students.length > 0 ? AppState.students[0] : null);
  } else if (normalizedRole === 'faculty') {
    chosenProfile = (AppState.currentUser && AppState.currentUser.role === 'faculty' && AppState.currentUser.profile)
      ? AppState.currentUser.profile
      : (AppState.faculty && AppState.faculty.length > 0 ? AppState.faculty[0] : null);
  } else if (normalizedRole === 'parent') {
    chosenProfile = (AppState.currentUser && AppState.currentUser.role === 'parent' && AppState.currentUser.profile)
      ? AppState.currentUser.profile
      : (AppState.parents && AppState.parents.length > 0 ? AppState.parents[0] : null);
  } else if (normalizedRole === 'admin') {
    chosenProfile = {
      id: 99,
      full_name: 'Dr. Elena Rostova',
      email: 'admin@apex.edu',
      role: 'admin',
      designation: 'Chief Systems Architect & Dean'
    };
  }

  const activeUser = {
    id: chosenProfile ? (chosenProfile.user_id || chosenProfile.id || 1) : 1,
    role: normalizedRole,
    full_name: chosenProfile ? chosenProfile.full_name : (normalizedRole === 'student' ? 'Alex Chen' : normalizedRole === 'faculty' ? 'Dr. Robert Vance' : normalizedRole === 'parent' ? 'Robert Chen Sr.' : 'Dr. Elena Rostova'),
    email: chosenProfile ? chosenProfile.email : `${normalizedRole}@apex.edu`,
    avatar_url: chosenProfile && chosenProfile.avatar_url ? chosenProfile.avatar_url : (normalizedRole === 'student' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' : normalizedRole === 'faculty' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' : normalizedRole === 'parent' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'),
    profile: chosenProfile
  };

  AppState.currentUser = activeUser;
  AppState.currentRole = normalizedRole;
  localStorage.setItem('apex_user', JSON.stringify(activeUser));

  updateNavbarAuth(activeUser);

  // Hide all page views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
    view.style.display = 'none';
  });

  AppState.currentPage = 'dashboard';
  const dashView = document.getElementById('dashboardView');
  if (dashView) {
    dashView.style.display = 'block';
    dashView.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderRoleDashboard(normalizedRole, tab);
  }

  updatePortalSwitcherUI(normalizedRole);
  updateNavbarActive(`${normalizedRole} portal`);
  showToast(`Switched to ${capitalize(normalizedRole)} Portal`, 'info');
}
window.openPortal = openPortal;

function updatePortalSwitcherUI(role) {
  const norm = (role || 'student').toLowerCase().replace('-portal', '').replace('_portal', '');
  const pillMap = {
    student: 'portalPillStudent',
    faculty: 'portalPillFaculty',
    parent: 'portalPillParent',
    admin: 'portalPillAdmin'
  };
  Object.keys(pillMap).forEach(k => {
    const btn = document.getElementById(pillMap[k]);
    if (btn) {
      if (k === norm) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
}
window.updatePortalSwitcherUI = updatePortalSwitcherUI;

function navigateTo(targetPage, param) {
  // Direct portal navigation support
  if (['student', 'student_portal', 'faculty', 'faculty_portal', 'parent', 'parent_portal', 'admin', 'admin_portal'].includes(targetPage)) {
    openPortal(targetPage, param);
    return;
  }

  // Hide all page views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
    view.style.display = 'none';
  });

  const sections = ['home', 'about', 'architecture', 'courses', 'events', 'announcements', 'contact'];

  if (sections.includes(targetPage)) {
    AppState.currentPage = 'home';
    const landing = document.getElementById('landingView');
    if (landing) {
      landing.style.display = 'block';
      landing.classList.add('active');
    }
    updateNavbarActive(targetPage);

    if (targetPage !== 'home') {
      setTimeout(() => {
        const sec = document.getElementById(targetPage);
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  // Dedicated Login Page
  if (targetPage === 'login') {
    AppState.currentPage = 'login';
    const loginView = document.getElementById('loginView');
    if (loginView) {
      loginView.style.display = 'block';
      loginView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      selectLoginRole(param || 'student');
    }
    return;
  }

  // Dedicated Registration Page
  if (targetPage === 'register') {
    AppState.currentPage = 'register';
    const regView = document.getElementById('registerView');
    if (regView) {
      regView.style.display = 'block';
      regView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  // Dedicated Dashboard View
  if (targetPage === 'dashboard') {
    if (!AppState.currentUser) {
      openPortal('student', param);
      return;
    }

    AppState.currentPage = 'dashboard';
    const dashView = document.getElementById('dashboardView');
    if (dashView) {
      dashView.style.display = 'block';
      dashView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderRoleDashboard(AppState.currentRole, param);
    }
    return;
  }
}

function updateNavbarActive(sectionName) {
  if (!sectionName) return;
  const target = String(sectionName).toLowerCase().trim();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (!link || !link.classList) return;
    link.classList.remove('active');
    const linkText = (link.textContent || '').toLowerCase().trim();
    if (linkText && target && (linkText === target || linkText.includes(target) || target.includes(linkText))) {
      link.classList.add('active');
    }
  });
}

function navigateToClusterStatus() {
  if (AppState.currentUser && AppState.currentUser.role === 'admin') {
    navigateTo('dashboard', 'telemetry');
  } else {
    navigateTo('login', 'admin');
    showToast('Sign in as Administrator to inspect live cluster telemetry.', 'info');
  }
}

// ====================================================================
// DEDICATED LOGIN & REGISTRATION WITH PROFILE PICKERS
// ====================================================================
function selectLoginRole(role) {
  const roleInput = document.getElementById('loginActiveRole');
  if (roleInput) roleInput.value = role;

  // Update button active state
  document.querySelectorAll('.role-segment-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`roleBtn${capitalize(role)}`);
  if (activeBtn) activeBtn.classList.add('active');

  const descElem = document.getElementById('roleDescText');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPass');
  const studentPicker = document.getElementById('studentPickerGroup');
  const facultyPicker = document.getElementById('facultyPickerGroup');
  const parentPicker = document.getElementById('parentPickerGroup');

  if (role === 'student') {
    if (studentPicker) studentPicker.style.display = 'block';
    if (facultyPicker) facultyPicker.style.display = 'none';
    if (parentPicker) parentPicker.style.display = 'none';
    if (descElem) descElem.textContent = 'Access attendance records, course grades, weekly timetable, and assignment submissions.';
    const stdSelect = document.getElementById('loginStudentSelect');
    if (emailInput && stdSelect) emailInput.value = stdSelect.value;
    if (passInput) passInput.value = 'password123';
  } else if (role === 'faculty') {
    if (studentPicker) studentPicker.style.display = 'none';
    if (facultyPicker) facultyPicker.style.display = 'block';
    if (parentPicker) parentPicker.style.display = 'none';
    if (descElem) descElem.textContent = 'Manage student attendance rosters, enter midterm marks, and upload course assignments.';
    const facSelect = document.getElementById('loginFacultySelect');
    if (emailInput && facSelect) emailInput.value = facSelect.value;
    if (passInput) passInput.value = 'password123';
  } else if (role === 'parent') {
    if (studentPicker) studentPicker.style.display = 'none';
    if (facultyPicker) facultyPicker.style.display = 'none';
    if (parentPicker) parentPicker.style.display = 'block';
    if (descElem) descElem.textContent = 'Monitor child attendance rate, exam report cards, pending fee dues, and urgent academic alerts.';
    const prtSelect = document.getElementById('loginParentSelect');
    if (emailInput && prtSelect) emailInput.value = prtSelect.value;
    if (passInput) passInput.value = 'password123';
  } else if (role === 'admin') {
    if (studentPicker) studentPicker.style.display = 'none';
    if (facultyPicker) facultyPicker.style.display = 'none';
    if (parentPicker) parentPicker.style.display = 'none';
    if (descElem) descElem.textContent = 'Monitor live container cluster telemetry (Frontend, Backend, Database) and student directories.';
    if (emailInput) emailInput.value = 'admin';
    if (passInput) passInput.value = 'password123';
  }

  // Synchronize role and reset currentDashTab for clean portal activation
  AppState.currentRole = role;
  if (role === 'student') AppState.currentDashTab = 'overview';
  else if (role === 'faculty') AppState.currentDashTab = 'attendance';
  else if (role === 'parent') AppState.currentDashTab = 'child_overview';
  else if (role === 'admin') AppState.currentDashTab = 'telemetry';

  const errBox = document.getElementById('loginErrorMsg');
  if (errBox) errBox.style.display = 'none';
}

function onLoginStudentSelect(email) {
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) emailInput.value = email;
}

function onLoginFacultySelect(email) {
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) emailInput.value = email;
}

function onLoginParentSelect(email) {
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) emailInput.value = email;
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fa-solid fa-eye';
  }
}

async function handleDedicatedLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  const role = document.getElementById('loginActiveRole').value;
  const errBox = document.getElementById('loginErrorMsg');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (!username || !password) {
    if (errBox) {
      errBox.textContent = 'Please enter both username/email and password.';
      errBox.style.display = 'block';
    }
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying Credentials...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    const json = await res.json();

    if (json.success) {
      const userWithToken = { ...json.user, token: json.token };
      AppState.currentUser = userWithToken;
      AppState.currentRole = json.user.role;
      if (json.user.role === 'student') AppState.currentDashTab = 'overview';
      else if (json.user.role === 'faculty') AppState.currentDashTab = 'attendance';
      else if (json.user.role === 'parent') AppState.currentDashTab = 'child_overview';
      else if (json.user.role === 'admin') AppState.currentDashTab = 'telemetry';
      localStorage.setItem('apex_user', JSON.stringify(userWithToken));
      updateNavbarAuth(json.user);
      showToast(`Welcome, ${json.user.full_name}!`, 'success');
      navigateTo('dashboard');
    } else {
      if (errBox) {
        errBox.textContent = json.message || 'Invalid credentials. Please verify your login details.';
        errBox.style.display = 'block';
      }
    }
  } catch (err) {
    // Fallback simulation
    let chosenProfile = null;
    if (role === 'student') {
      chosenProfile = AppState.students.find(s => s.email === username || s.roll_number === username) || AppState.students[0];
    } else if (role === 'faculty') {
      chosenProfile = AppState.faculty.find(f => f.email === username || f.employee_id === username) || AppState.faculty[0];
    } else if (role === 'parent') {
      chosenProfile = AppState.parents.find(p => p.email === username || p.student_roll === username || (username === 'parent' && p.id === 1)) || AppState.parents[0];
    }

    const fallbackUser = {
      role,
      full_name: chosenProfile ? chosenProfile.full_name : (role === 'student' ? 'Alex Chen' : role === 'faculty' ? 'Dr. Robert Vance' : role === 'parent' ? 'Robert Chen Sr.' : 'Dr. Elena Rostova'),
      email: chosenProfile ? chosenProfile.email : `${role}@apex.edu`,
      avatar_url: chosenProfile && chosenProfile.avatar_url ? chosenProfile.avatar_url : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      profile: chosenProfile
    };

    AppState.currentUser = fallbackUser;
    AppState.currentRole = role;
    if (role === 'student') AppState.currentDashTab = 'overview';
    else if (role === 'faculty') AppState.currentDashTab = 'attendance';
    else if (role === 'parent') AppState.currentDashTab = 'child_overview';
    else if (role === 'admin') AppState.currentDashTab = 'telemetry';
    localStorage.setItem('apex_user', JSON.stringify(fallbackUser));
    updateNavbarAuth(fallbackUser);
    showToast(`Welcome, ${fallbackUser.full_name}!`, 'success');
    navigateTo('dashboard');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Dashboard';
  }
}

async function handleDedicatedRegisterSubmit(e) {
  e.preventDefault();
  const full_name = document.getElementById('regFullname').value.trim();
  const email = document.getElementById('regEmailAddr').value.trim();
  const role = document.getElementById('regRoleChoice').value;
  const department = document.getElementById('regDeptChoice').value;
  const pass1 = document.getElementById('regPass1').value;
  const pass2 = document.getElementById('regPass2').value;
  const errBox = document.getElementById('registerErrorMsg');

  if (pass1 !== pass2) {
    if (errBox) {
      errBox.textContent = 'Passwords do not match. Please re-enter identical passwords.';
      errBox.style.display = 'block';
    }
    return;
  }

  if (pass1.length < 6) {
    if (errBox) {
      errBox.textContent = 'Password must be at least 6 characters in length.';
      errBox.style.display = 'block';
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, role, department, password: pass1 })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Account created successfully! You can now sign in.', 'success');
      navigateTo('login', role);
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPass').value = pass1;
    } else {
      if (errBox) {
        errBox.textContent = json.message || 'Registration failed.';
        errBox.style.display = 'block';
      }
    }
  } catch (err) {
    showToast('Registration submitted. You can now log in.', 'success');
    navigateTo('login', role);
  }
}

function updateNavbarAuth(user) {
  const authNav = document.getElementById('authNavButtons');
  if (!authNav) return;

  if (user) {
    authNav.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="navigateTo('dashboard')">
        <i class="fa-solid fa-gauge-high"></i> Dashboard (${capitalize(user.role)})
      </button>
      <button class="btn btn-secondary btn-sm" onclick="handleLogout()" title="Sign Out">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    `;
  } else {
    authNav.innerHTML = `
      <button class="btn btn-primary btn-sm" id="navLoginBtn" onclick="navigateTo('login')">
        <i class="fa-solid fa-right-to-bracket"></i> Login
      </button>
    `;
  }
}

function handleLogout() {
  AppState.currentUser = null;
  localStorage.removeItem('apex_user');
  updateNavbarAuth(null);
  showToast('You have been signed out.', 'info');
  navigateTo('home');
}

// ====================================================================
// DYNAMIC PROFILE SWITCHER (CHANGE STUDENTS OR FACULTY)
// ====================================================================
function populateDashboardProfileSwitcher(role) {
  const switcherBox = document.getElementById('dashSwitcherBox');
  const select = document.getElementById('dashProfileSelect');
  const label = document.getElementById('dashSwitcherLabel');
  if (!select || !switcherBox) return;

  if (role === 'student') {
    switcherBox.style.display = 'block';
    if (label) label.innerHTML = '<i class="fa-solid fa-arrows-rotate text-primary"></i> Change Student Profile:';
    
    select.innerHTML = AppState.students.map(s => {
      const isSelected = (AppState.currentUser && AppState.currentUser.profile && (AppState.currentUser.profile.id === s.id || AppState.currentUser.profile.email === s.email));
      return `<option value="${s.id}" ${isSelected ? 'selected' : ''}>${s.full_name} (${s.roll_number})</option>`;
    }).join('');
  } else if (role === 'faculty') {
    switcherBox.style.display = 'block';
    if (label) label.innerHTML = '<i class="fa-solid fa-arrows-rotate text-primary"></i> Change Faculty Profile:';
    
    select.innerHTML = AppState.faculty.map(f => {
      const isSelected = (AppState.currentUser && AppState.currentUser.profile && (AppState.currentUser.profile.id === f.id || AppState.currentUser.profile.email === f.email));
      return `<option value="${f.id}" ${isSelected ? 'selected' : ''}>${f.full_name} (${f.designation})</option>`;
    }).join('');
  } else if (role === 'parent') {
    switcherBox.style.display = 'block';
    if (label) label.innerHTML = '<i class="fa-solid fa-arrows-rotate text-primary"></i> Change Parent Account:';
    
    select.innerHTML = AppState.parents.map(p => {
      const isSelected = (AppState.currentUser && AppState.currentUser.profile && (AppState.currentUser.profile.id === p.id || AppState.currentUser.profile.email === p.email));
      return `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${p.full_name} (${p.relationship} of ${p.student_name})</option>`;
    }).join('');
  } else {
    switcherBox.style.display = 'none';
  }
}

function handleDashProfileChange(val) {
  const id = parseInt(val, 10);
  // Use currentUser.role as the canonical source of truth
  const activeRole = (AppState.currentUser && AppState.currentUser.role) || AppState.currentRole;

  if (activeRole === 'student') {
    const student = AppState.students.find(s => s.id === id || s.email === val);
    if (!student) {
      showToast('Student profile not found.', 'warning');
      return;
    }
    AppState.currentUser.profile = student;
    AppState.currentUser.full_name = student.full_name;
    AppState.currentUser.email = student.email;
    AppState.currentUser.avatar_url = student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
    AppState.currentRole = 'student';
    localStorage.setItem('apex_user', JSON.stringify(AppState.currentUser));

    // Update sidebar profile card
    const avatar = document.getElementById('dashAvatar');
    const name   = document.getElementById('dashUserName');
    if (avatar) avatar.src = AppState.currentUser.avatar_url;
    if (name)   name.textContent = student.full_name;

    // Sync sidebar dropdown selection
    const sidebarSelect = document.getElementById('dashProfileSelect');
    if (sidebarSelect) sidebarSelect.value = student.id;

    renderStudentMainStage(AppState.currentDashTab || 'overview');
    showToast(`Switched to student profile: ${student.full_name}`, 'success');

  } else if (activeRole === 'faculty') {
    const faculty = AppState.faculty.find(f => f.id === id || f.email === val);
    if (!faculty) {
      showToast('Faculty profile not found.', 'warning');
      return;
    }
    AppState.currentUser.profile = faculty;
    AppState.currentUser.full_name = faculty.full_name;
    AppState.currentUser.email = faculty.email;
    AppState.currentUser.avatar_url = faculty.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80';
    AppState.currentRole = 'faculty';
    localStorage.setItem('apex_user', JSON.stringify(AppState.currentUser));

    // Update sidebar profile card
    const avatar = document.getElementById('dashAvatar');
    const name   = document.getElementById('dashUserName');
    if (avatar) avatar.src = AppState.currentUser.avatar_url;
    if (name)   name.textContent = faculty.full_name;

    // Sync sidebar dropdown selection
    const sidebarSelect = document.getElementById('dashProfileSelect');
    if (sidebarSelect) sidebarSelect.value = faculty.id;

    AppState.currentDashTab = 'attendance';
    renderFacultyMainStage('attendance');
    showToast(`Switched to faculty profile: ${faculty.full_name}`, 'success');

  } else if (activeRole === 'parent') {
    const parent = AppState.parents.find(p => p.id === id || p.email === val);
    if (!parent) {
      showToast('Parent account not found.', 'warning');
      return;
    }
    AppState.currentUser.profile = parent;
    AppState.currentUser.full_name = parent.full_name;
    AppState.currentUser.email = parent.email;
    AppState.currentUser.avatar_url = parent.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80';
    AppState.currentRole = 'parent';
    localStorage.setItem('apex_user', JSON.stringify(AppState.currentUser));

    // Update sidebar profile card
    const avatar = document.getElementById('dashAvatar');
    const name   = document.getElementById('dashUserName');
    if (avatar) avatar.src = AppState.currentUser.avatar_url;
    if (name)   name.textContent = parent.full_name;

    // Sync sidebar dropdown selection
    const sidebarSelect = document.getElementById('dashProfileSelect');
    if (sidebarSelect) sidebarSelect.value = parent.id;

    AppState.currentDashTab = 'child_overview';
    renderParentMainStage('child_overview');
    showToast(`Switched to parent account: ${parent.full_name}`, 'success');
  }
}

// ====================================================================
// DASHBOARD VIEW & SUB-TAB SWITCHING
// ====================================================================
const ROLE_TABS = {
  student: { defaultTab: 'overview', tabs: ['overview', 'student_risk', 'marks', 'timetable', 'assignments', 'student_placement', 'student_leaves', 'student_fees', 'student_complaints', 'student_certificates', 'exams'] },
  faculty: { defaultTab: 'attendance', tabs: ['attendance', 'grading', 'fac_risk', 'fac_workload', 'fac_leaves', 'courses', 'fac_students', 'announcements'] },
  parent: { defaultTab: 'child_overview', tabs: ['child_overview', 'child_attendance', 'child_marks', 'child_fees', 'child_leaves', 'child_exams'] },
  admin: { defaultTab: 'telemetry', tabs: ['telemetry', 'admin_intel', 'admin_ops', 'students', 'faculty', 'announcements'] }
};

function renderRoleDashboard(role, defaultTab) {
  const user = AppState.currentUser || { full_name: 'Alex Chen', role: 'student', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' };

  // Update sidebar profile card
  const avatar = document.getElementById('dashAvatar');
  const name = document.getElementById('dashUserName');
  const roleElem = document.getElementById('dashUserRole');

  if (avatar) avatar.src = user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
  if (name) name.textContent = user.full_name;
  if (roleElem) roleElem.textContent = user.role.toUpperCase();

  // Populate dynamic profile switcher in sidebar
  populateDashboardProfileSwitcher(role);

  // Validate active tab strictly for the given role
  const config = ROLE_TABS[role] || ROLE_TABS.student;
  const activeTab = (defaultTab && config.tabs.includes(defaultTab)) ? defaultTab : config.defaultTab;
  AppState.currentDashTab = activeTab;

  // Populate Sidebar Navigation Menu
  const menu = document.getElementById('dashNavMenu');
  if (!menu) return;

  // Synchronize Universal Portal Switcher Header Bar
  updatePortalSwitcherUI(role);

  if (role === 'student') {
    menu.innerHTML = `
      <li class="dash-nav-item ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview" onclick="switchDashboardTab('overview')">
        <i class="fa-solid fa-chart-pie"></i> Academic Overview
      </li>
      <li class="dash-nav-item ${activeTab === 'student_risk' ? 'active' : ''}" data-tab="student_risk" onclick="switchDashboardTab('student_risk')">
        <i class="fa-solid fa-brain" style="color: var(--accent-cyan);"></i> AI Risk Prediction
      </li>
      <li class="dash-nav-item ${activeTab === 'marks' ? 'active' : ''}" data-tab="marks" onclick="switchDashboardTab('marks')">
        <i class="fa-solid fa-award"></i> Grades & Marks
      </li>
      <li class="dash-nav-item ${activeTab === 'timetable' ? 'active' : ''}" data-tab="timetable" onclick="switchDashboardTab('timetable')">
        <i class="fa-solid fa-calendar-days"></i> Weekly Timetable
      </li>
      <li class="dash-nav-item ${activeTab === 'assignments' ? 'active' : ''}" data-tab="assignments" onclick="switchDashboardTab('assignments')">
        <i class="fa-solid fa-file-signature"></i> Assignments
      </li>
      <li class="dash-nav-item ${activeTab === 'student_placement' ? 'active' : ''}" data-tab="student_placement" onclick="switchDashboardTab('student_placement')">
        <i class="fa-solid fa-briefcase" style="color: #6929c4;"></i> Placement Readiness
      </li>
      <li class="dash-nav-item ${activeTab === 'student_leaves' ? 'active' : ''}" data-tab="student_leaves" onclick="switchDashboardTab('student_leaves')">
        <i class="fa-solid fa-plane-departure" style="color: var(--ibm-teal-40);"></i> Digital Leaves
      </li>
      <li class="dash-nav-item ${activeTab === 'student_fees' ? 'active' : ''}" data-tab="student_fees" onclick="switchDashboardTab('student_fees')">
        <i class="fa-solid fa-file-invoice-dollar" style="color: var(--status-success);"></i> Fee Records & Dues
      </li>
      <li class="dash-nav-item ${activeTab === 'student_complaints' ? 'active' : ''}" data-tab="student_complaints" onclick="switchDashboardTab('student_complaints')">
        <i class="fa-solid fa-headset" style="color: #ff8389;"></i> Grievance Helpdesk
      </li>
      <li class="dash-nav-item ${activeTab === 'student_certificates' ? 'active' : ''}" data-tab="student_certificates" onclick="switchDashboardTab('student_certificates')">
        <i class="fa-solid fa-stamp" style="color: #11d3f3;"></i> Certificate Requests
      </li>
      <li class="dash-nav-item ${activeTab === 'exams' ? 'active' : ''}" data-tab="exams" onclick="switchDashboardTab('exams')">
        <i class="fa-solid fa-id-card"></i> Examination Ticket
      </li>
    `;
    renderStudentMainStage(activeTab);
  } else if (role === 'faculty') {
    menu.innerHTML = `
      <li class="dash-nav-item ${activeTab === 'attendance' ? 'active' : ''}" data-tab="attendance" onclick="switchDashboardTab('attendance')">
        <i class="fa-solid fa-clipboard-user"></i> Mark Attendance
      </li>
      <li class="dash-nav-item ${activeTab === 'grading' ? 'active' : ''}" data-tab="grading" onclick="switchDashboardTab('grading')">
        <i class="fa-solid fa-pen-ruler"></i> Enter Marks & GPA
      </li>
      <li class="dash-nav-item ${activeTab === 'fac_risk' ? 'active' : ''}" data-tab="fac_risk" onclick="switchDashboardTab('fac_risk')">
        <i class="fa-solid fa-triangle-exclamation" style="color: #da1e28;"></i> AI Risk Matrix
      </li>
      <li class="dash-nav-item ${activeTab === 'fac_workload' ? 'active' : ''}" data-tab="fac_workload" onclick="switchDashboardTab('fac_workload')">
        <i class="fa-solid fa-gauge" style="color: var(--ibm-blue-60);"></i> Faculty Workload
      </li>
      <li class="dash-nav-item ${activeTab === 'fac_leaves' ? 'active' : ''}" data-tab="fac_leaves" onclick="switchDashboardTab('fac_leaves')">
        <i class="fa-solid fa-envelope-open-text" style="color: var(--ibm-teal-40);"></i> Review Student Leaves
      </li>
      <li class="dash-nav-item ${activeTab === 'courses' ? 'active' : ''}" data-tab="courses" onclick="switchDashboardTab('courses')">
        <i class="fa-solid fa-book-open"></i> Courses & Uploads
      </li>
      <li class="dash-nav-item ${activeTab === 'fac_students' ? 'active' : ''}" data-tab="fac_students" onclick="switchDashboardTab('fac_students')">
        <i class="fa-solid fa-user-graduate"></i> Manage Students
      </li>
      <li class="dash-nav-item ${activeTab === 'announcements' ? 'active' : ''}" data-tab="announcements" onclick="switchDashboardTab('announcements')">
        <i class="fa-solid fa-bullhorn"></i> Post Notices
      </li>
    `;
    renderFacultyMainStage(activeTab);
  } else if (role === 'parent') {
    menu.innerHTML = `
      <li class="dash-nav-item ${activeTab === 'child_overview' ? 'active' : ''}" data-tab="child_overview" onclick="switchDashboardTab('child_overview')">
        <i class="fa-solid fa-house-chimney-user"></i> Ward Academic Overview
      </li>
      <li class="dash-nav-item ${activeTab === 'child_attendance' ? 'active' : ''}" data-tab="child_attendance" onclick="switchDashboardTab('child_attendance')">
        <i class="fa-solid fa-clipboard-check"></i> Attendance Breakdown
      </li>
      <li class="dash-nav-item ${activeTab === 'child_marks' ? 'active' : ''}" data-tab="child_marks" onclick="switchDashboardTab('child_marks')">
        <i class="fa-solid fa-award"></i> Grades & Progress Report
      </li>
      <li class="dash-nav-item ${activeTab === 'child_fees' ? 'active' : ''}" data-tab="child_fees" onclick="switchDashboardTab('child_fees')">
        <i class="fa-solid fa-file-invoice-dollar" style="color: var(--status-success);"></i> Fee Status & Receipts
      </li>
      <li class="dash-nav-item ${activeTab === 'child_leaves' ? 'active' : ''}" data-tab="child_leaves" onclick="switchDashboardTab('child_leaves')">
        <i class="fa-solid fa-calendar-minus"></i> Ward Leave History
      </li>
      <li class="dash-nav-item ${activeTab === 'child_exams' ? 'active' : ''}" data-tab="child_exams" onclick="switchDashboardTab('child_exams')">
        <i class="fa-solid fa-id-card"></i> Examination Timetable
      </li>
    `;
    renderParentMainStage(activeTab);
  } else if (role === 'admin') {
    menu.innerHTML = `
      <li class="dash-nav-item ${activeTab === 'telemetry' ? 'active' : ''}" data-tab="telemetry" onclick="switchDashboardTab('telemetry')">
        <i class="fa-solid fa-server"></i> Container Telemetry & Auto-Healing
      </li>
      <li class="dash-nav-item ${activeTab === 'admin_intel' ? 'active' : ''}" data-tab="admin_intel" onclick="switchDashboardTab('admin_intel')">
        <i class="fa-solid fa-brain" style="color: var(--accent-cyan);"></i> AI Academic Intelligence
      </li>
      <li class="dash-nav-item ${activeTab === 'admin_ops' ? 'active' : ''}" data-tab="admin_ops" onclick="switchDashboardTab('admin_ops')">
        <i class="fa-solid fa-list-check" style="color: var(--ibm-teal-40);"></i> Operations Hub
      </li>
      <li class="dash-nav-item ${activeTab === 'students' ? 'active' : ''}" data-tab="students" onclick="switchDashboardTab('students')">
        <i class="fa-solid fa-user-graduate"></i> Manage Students
      </li>
      <li class="dash-nav-item ${activeTab === 'faculty' ? 'active' : ''}" data-tab="faculty" onclick="switchDashboardTab('faculty')">
        <i class="fa-solid fa-chalkboard-user"></i> Faculty Staff Roster
      </li>
      <li class="dash-nav-item ${activeTab === 'announcements' ? 'active' : ''}" data-tab="announcements" onclick="switchDashboardTab('announcements')">
        <i class="fa-solid fa-newspaper"></i> Notice Manager
      </li>
    `;
    renderAdminMainStage(activeTab);
  }

  // Synchronize Mobile Horizontal Pill Strip
  updateMobilePillStrip(menu, activeTab);
}

function updateMobilePillStrip(menuElement, activeTab) {
  const strip = document.getElementById('dashMobilePillStrip');
  const triggerLabel = document.getElementById('dashMobileCurrentTabName');
  if (!strip || !menuElement) return;

  const items = menuElement.querySelectorAll('.dash-nav-item');
  let pillsHtml = '';
  items.forEach(item => {
    const tab = item.getAttribute('data-tab');
    const label = item.textContent.trim();
    const icon = item.querySelector('i')?.className || 'fa-solid fa-circle';
    const isActive = (tab === activeTab);
    if (isActive && triggerLabel) {
      triggerLabel.textContent = label;
    }
    pillsHtml += `
      <button type="button" class="dash-mobile-pill ${isActive ? 'active' : ''}" data-tab="${tab}" onclick="switchDashboardTab('${tab}')">
        <i class="${icon}"></i> <span>${label}</span>
      </button>
    `;
  });
  strip.innerHTML = pillsHtml;
}

function toggleDashMobileSidebar() {
  const sidebar = document.getElementById('dashSidebar');
  const backdrop = document.getElementById('dashSidebarBackdrop');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('mobile-open');
  if (isOpen) {
    closeDashMobileSidebar();
  } else {
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeDashMobileSidebar() {
  const sidebar = document.getElementById('dashSidebar');
  const backdrop = document.getElementById('dashSidebarBackdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function switchDashboardTab(tabId) {
  closeDashMobileSidebar();

  let targetPane = document.getElementById(`pane_${tabId}`);
  let resolvedTabId = tabId;

  // Graceful fallback: if requested pane does not exist in current stage, use first available pane
  if (!targetPane) {
    targetPane = document.querySelector('.dash-tab-pane');
    if (targetPane && targetPane.id) {
      resolvedTabId = targetPane.id.replace('pane_', '');
    }
  }

  AppState.currentDashTab = resolvedTabId;

  document.querySelectorAll('.dash-nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-tab') === resolvedTabId) {
      item.classList.add('active');
      const triggerLabel = document.getElementById('dashMobileCurrentTabName');
      if (triggerLabel) triggerLabel.textContent = item.textContent.trim();
    }
  });

  document.querySelectorAll('.dash-mobile-pill').forEach(pill => {
    pill.classList.remove('active');
    if (pill.getAttribute('data-tab') === resolvedTabId) {
      pill.classList.add('active');
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  document.querySelectorAll('.dash-tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  if (targetPane) {
    targetPane.classList.add('active');
  }
}

// --------------------------------------------------------------------
// STUDENT DASHBOARD MAIN STAGE
// --------------------------------------------------------------------
function renderStudentMainStage(initialTab) {
  const main = document.getElementById('dashMainContent');
  if (!main) return;

  try {
    const studentValidTabs = ['overview', 'student_risk', 'marks', 'timetable', 'assignments', 'student_placement', 'student_leaves', 'student_fees', 'student_complaints', 'student_certificates', 'exams'];
    const activeTab = (initialTab && studentValidTabs.includes(initialTab)) ? initialTab : 'overview';

    const std = (AppState.currentUser && AppState.currentUser.profile) || (AppState.students && AppState.students[0]) || {
      id: 1,
      full_name: 'Alex Chen',
      roll_number: 'APX-2022-CS-084',
      department: 'Computer Science & Cloud Computing',
      semester: 6,
      overall_attendance: 88.4,
      cgpa: 8.92,
      mentor_name: 'Dr. Robert Vance'
    };
    std.id = std.id || 1;
    std.full_name = std.full_name || 'Alex Chen';
    std.roll_number = std.roll_number || 'APX-2022-CS-084';
    std.department = std.department || 'Computer Science & Cloud Computing';
    std.mentor_name = std.mentor_name || 'Dr. Robert Vance';
    std.overall_attendance = (std.overall_attendance !== undefined && std.overall_attendance !== null) ? Number(std.overall_attendance) : 88.4;
    std.cgpa = (std.cgpa !== undefined && std.cgpa !== null) ? Number(std.cgpa) : 8.92;
    std.semester = std.semester || 6;

    // Safe collections with verified fallbacks
    const allStudents = (Array.isArray(AppState.students) && AppState.students.length > 0) ? AppState.students : [std];
    const allAtt = (Array.isArray(AppState.attendance) && AppState.attendance.length > 0) ? AppState.attendance : [];
    const allMarks = (Array.isArray(AppState.marks) && AppState.marks.length > 0) ? AppState.marks : [];
    const allLeaves = (Array.isArray(AppState.leaves) && AppState.leaves.length > 0) ? AppState.leaves : [];
    const allFees = (Array.isArray(AppState.fees) && AppState.fees.length > 0) ? AppState.fees : [];
    const allComplaints = (Array.isArray(AppState.complaints) && AppState.complaints.length > 0) ? AppState.complaints : [];
    const allCerts = (Array.isArray(AppState.certificates) && AppState.certificates.length > 0) ? AppState.certificates : [];
    const allPlacement = (Array.isArray(AppState.placement) && AppState.placement.length > 0) ? AppState.placement : [];
    const allTimetable = (Array.isArray(AppState.timetable) && AppState.timetable.length > 0) ? AppState.timetable : [
      { id: 1, day: 'Monday', time: '09:00 AM - 10:30 AM', code: 'CS601', subject: 'Cloud Computing & Microservices', room: 'Lab 4 (IBM Suite)', instructor: 'Dr. Robert Vance' },
      { id: 2, day: 'Monday', time: '10:45 AM - 12:15 PM', code: 'CS602', subject: 'Full-Stack Web Architectures', room: 'Auditorium 2', instructor: 'Prof. Anita Sharma' },
      { id: 3, day: 'Tuesday', time: '09:00 AM - 10:30 AM', code: 'CS603', subject: 'Database Internals & Distributed Storage', room: 'Lecture Hall 102', instructor: 'Dr. Kenneth Cole' },
      { id: 4, day: 'Tuesday', time: '11:00 AM - 12:30 PM', code: 'CS604', subject: 'Container Security & DevSecOps', room: 'Cyber Lab 1', instructor: 'Dr. Robert Vance' },
      { id: 5, day: 'Wednesday', time: '09:00 AM - 11:00 AM', code: 'CS601', subject: 'Docker Hands-on Practicum', room: 'Cloud Lab 3', instructor: 'Dr. Robert Vance' }
    ];
    const allAssignments = (Array.isArray(AppState.assignments) && AppState.assignments.length > 0) ? AppState.assignments : [
      { id: 1, student_id: std.id, course_code: 'CS601', title: 'Lab 3: Dockerizing Multi-Tier Node & PostgreSQL App', due_date: '2026-09-18', max_score: 100, score: 98, status: 'Submitted', description: 'Write a Dockerfile and docker-compose.yml to spin up Express, static frontend, and PostgreSQL with volume persistence.' },
      { id: 2, student_id: std.id, course_code: 'CS602', title: 'Project Milestone 2: REST API with Token Auth', due_date: '2026-09-24', max_score: 50, score: null, status: 'Pending', description: 'Implement role-based middleware for student, faculty, and admin roles with error handling.' },
      { id: 3, student_id: std.id, course_code: 'CS604', title: 'Security Audit: Rootless Container Gating', due_date: '2026-09-30', max_score: 50, score: null, status: 'Pending', description: 'Scan images with Trivy and patch CVEs in alpine base layers.' }
    ];
    const allExams = (Array.isArray(AppState.exams) && AppState.exams.length > 0) ? AppState.exams : [
      { id: 1, course_code: 'CS601', subject: 'Cloud Computing & Microservices', date: 'Oct 12, 2026', time: '10:00 AM - 01:00 PM', hall: 'Examination Hall A, Seat 42', status: 'Upcoming' },
      { id: 2, course_code: 'CS602', subject: 'Full-Stack Web Architectures', date: 'Oct 15, 2026', time: '10:00 AM - 01:00 PM', hall: 'Examination Hall B, Seat 18', status: 'Upcoming' },
      { id: 3, course_code: 'CS603', subject: 'Database Internals & Distributed Storage', date: 'Oct 19, 2026', time: '10:00 AM - 01:00 PM', hall: 'Examination Hall A, Seat 42', status: 'Upcoming' }
    ];

    // Filter attendance and marks for active student
    const studentAttendance = allAtt.filter(a => a.student_id === std.id);
    const studentMarks = allMarks.filter(m => m.student_id === std.id);
    const displayAttendance = studentAttendance.length > 0 ? studentAttendance : (allAtt.slice(0, 5).length > 0 ? allAtt.slice(0, 5) : [
      { student_id: std.id, id: 1, course_code: 'CS601', course_name: 'Cloud Computing & Microservices', total_classes: 42, attended_classes: 39, percentage: 92.8 },
      { student_id: std.id, id: 2, course_code: 'CS602', course_name: 'Full-Stack Web Architectures', total_classes: 40, attended_classes: 36, percentage: 90.0 },
      { student_id: std.id, id: 3, course_code: 'CS603', course_name: 'Database Internals & Distributed Storage', total_classes: 38, attended_classes: 33, percentage: 86.8 },
      { student_id: std.id, id: 4, course_code: 'CS604', course_name: 'Container Security & DevSecOps', total_classes: 36, attended_classes: 31, percentage: 86.1 },
      { student_id: std.id, id: 5, course_code: 'CS605', course_name: 'Artificial Intelligence & Neural Systems', total_classes: 40, attended_classes: 34, percentage: 85.0 }
    ]);
    const displayMarks = studentMarks.length > 0 ? studentMarks : (allMarks.slice(0, 5).length > 0 ? allMarks.slice(0, 5) : [
      { student_id: std.id, id: 1, course_code: 'CS601', internal: 28.0, midterm: 46.5, total: 92.5, grade: 'A+' },
      { student_id: std.id, id: 2, course_code: 'CS602', internal: 27.5, midterm: 45.0, total: 90.0, grade: 'A+' },
      { student_id: std.id, id: 3, course_code: 'CS603', internal: 26.0, midterm: 42.5, total: 86.5, grade: 'A' },
      { student_id: std.id, id: 4, course_code: 'CS604', internal: 27.0, midterm: 44.0, total: 88.0, grade: 'A' },
      { student_id: std.id, id: 5, course_code: 'CS605', internal: 26.5, midterm: 43.0, total: 87.0, grade: 'A' }
    ]);

    const studentLeaves = allLeaves.filter(l => l.student_id === std.id);
    const displayLeaves = studentLeaves.length > 0 ? studentLeaves : allLeaves;

    const studentFee = getStudentFees(std.id);

    const studentComplaints = allComplaints.filter(c => c.student_id === std.id);
    const displayComplaints = studentComplaints.length > 0 ? studentComplaints : allComplaints;

    const studentCerts = allCerts.filter(c => c.student_id === std.id);
    const displayCerts = studentCerts.length > 0 ? studentCerts : allCerts;

    const studentPlacement = allPlacement.find(p => p.student_id === std.id) || {
      readiness_score: std.cgpa > 8.5 ? 92.5 : std.cgpa > 7.5 ? 78.0 : 58.0,
      tier: std.cgpa > 8.5 ? 'Tier 1 Dream (IBM / Google / Microsoft)' : std.cgpa > 7.5 ? 'Tier 2 Core Engineering' : 'Tier 3 Skill Elevation',
      coding_score: std.cgpa > 8.5 ? 94.0 : 72.0,
      aptitude_score: std.cgpa > 8.5 ? 90.0 : 75.0,
      mock_interview_score: std.cgpa > 8.5 ? 92.0 : 70.0,
      offers_count: std.cgpa > 8.5 ? 2 : 0,
      target_role: 'Cloud Native Developer'
    };

    // Compute student risk score dynamically
    let computedRiskScore = 15;
    let computedRiskLevel = 'LOW';
    let riskReasons = [];
    if (std.overall_attendance < 75) {
      computedRiskScore += 45;
      riskReasons.push(`Critical Attendance Deficiency: Overall rate (${std.overall_attendance}%) falls below statutory 75% cutoff`);
    }
    if (std.cgpa < 6.0) {
      computedRiskScore += 35;
      riskReasons.push(`Severe Academic Alert: Cumulative CGPA (${std.cgpa}) indicates critical grading risk`);
    } else if (std.cgpa < 7.5) {
      computedRiskScore += 15;
      riskReasons.push(`Moderate Concern: CGPA (${std.cgpa}) requires consistent improvement`);
    }
    computedRiskScore = Math.min(96, computedRiskScore);
    if (computedRiskScore >= 65) computedRiskLevel = 'HIGH';
    else if (computedRiskScore >= 35) computedRiskLevel = 'MEDIUM';
    else computedRiskLevel = 'LOW';

    main.innerHTML = `
      <!-- Topbar with Student Switcher -->
      <div class="dash-topbar">
        <div class="dash-title-group">
          <h2>Student Academic Portal</h2>
          <p>Viewing Record for <strong>${std.full_name}</strong> • ${std.department} (Sem ${std.semester})</p>
        </div>
        <div class="dash-actions-group">
          <!-- Prominent Topbar Student Switcher -->
          <div style="display: flex; align-items: center; gap: 0.6rem; background: var(--bg-secondary); padding: 0.4rem 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <label style="font-size: 0.82rem; font-weight: 700; white-space: nowrap; color: var(--text-muted);">
              <i class="fa-solid fa-arrows-rotate text-primary"></i> Change Student:
            </label>
            <select class="form-control" style="font-weight: 700; padding: 0.3rem 0.6rem; font-size: 0.85rem; max-width: 260px;" onchange="handleDashProfileChange(this.value)">
              ${allStudents.map(s => `
                <option value="${s.id}" ${s.id === std.id ? 'selected' : ''}>${s.full_name} (${s.roll_number || 'ID:' + s.id})</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

    <!-- SUB-TAB 1: ACADEMIC OVERVIEW -->
    <div class="dash-tab-pane ${activeTab === 'overview' ? 'active' : ''}" id="pane_overview">
      <div class="dash-cards-grid">
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Overall Attendance</span>
            <div class="dash-card-icon" style="background: rgba(36, 161, 72, 0.15); color: var(--status-success);"><i class="fa-solid fa-chart-line"></i></div>
          </div>
          <div class="dash-card-value">${std.overall_attendance}%</div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${std.overall_attendance}%;"></div></div>
          <div class="dash-card-sub" style="color: var(--status-success);"><i class="fa-solid fa-circle-check"></i> Eligible for Final Exams (>75%)</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Cumulative CGPA</span>
            <div class="dash-card-icon" style="background: rgba(15, 98, 254, 0.15); color: var(--ibm-blue-60);"><i class="fa-solid fa-graduation-cap"></i></div>
          </div>
          <div class="dash-card-value">${std.cgpa} <span style="font-size: 1rem; color: var(--text-muted);">/ 10.0</span></div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${(std.cgpa / 10) * 100}%; background: linear-gradient(90deg, #0f62fe, #33b1ff);"></div></div>
          <div class="dash-card-sub"><i class="fa-solid fa-award text-primary"></i> Department Ranking: Honors</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Semester Credits</span>
            <div class="dash-card-icon" style="background: rgba(0, 157, 154, 0.15); color: var(--ibm-teal-40);"><i class="fa-solid fa-book-bookmark"></i></div>
          </div>
          <div class="dash-card-value">18 <span style="font-size: 1rem; color: var(--text-muted);">Credits</span></div>
          <div class="dash-card-sub"><i class="fa-solid fa-layer-group"></i> Active Course Enrolment</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Faculty Mentor</span>
            <div class="dash-card-icon" style="background: rgba(17, 211, 243, 0.15); color: var(--accent-cyan);"><i class="fa-solid fa-user-tie"></i></div>
          </div>
          <div class="dash-card-value" style="font-size: 1.35rem; margin-top: 0.3rem;">${std.mentor_name}</div>
          <div class="dash-card-sub"><i class="fa-solid fa-envelope"></i> Department of ${(std.department || 'Computer Science').split('&')[0]}</div>
        </div>
      </div>

      <!-- Quick Schedule Preview -->
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;">
          <h3 style="font-size: 1.2rem; font-weight: 800;"><i class="fa-solid fa-calendar-day text-primary"></i> Next Lectures for ${std.full_name}</h3>
          <button class="btn btn-outline btn-sm" onclick="switchDashboardTab('timetable')">View Complete Timetable →</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Time</th><th>Subject</th><th>Room</th><th>Faculty</th></tr>
            </thead>
            <tbody>
              ${allTimetable.slice(0, 3).map(t => `
                <tr>
                  <td><code>${t.time}</code></td>
                  <td><strong>${t.code}</strong> - ${t.subject}</td>
                  <td><span style="background: var(--bg-tertiary); padding: 0.2rem 0.5rem; border-radius: 4px;">${t.room}</span></td>
                  <td>${t.instructor}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 2: TIMETABLE -->
    <div class="dash-tab-pane ${activeTab === 'timetable' ? 'active' : ''}" id="pane_timetable">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4rem; flex-wrap: wrap; gap: 1rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-calendar-check text-primary"></i> Weekly Timetable for ${std.full_name}</h3>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">${std.department} • Sem ${std.semester}</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Day</th><th>Time Slot</th><th>Course Code & Subject</th><th>Room / Venue</th><th>Faculty Lead</th></tr>
            </thead>
            <tbody>
              ${allTimetable.map(t => `
                <tr>
                  <td><strong>${t.day}</strong></td>
                  <td><code>${t.time}</code></td>
                  <td><strong>${t.code}</strong> - ${t.subject}</td>
                  <td><span style="background: var(--bg-tertiary); padding: 0.2rem 0.5rem; border-radius: 4px;">${t.room}</span></td>
                  <td>${t.instructor}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 3: GRADES & MARKS -->
    <div class="dash-tab-pane ${activeTab === 'marks' ? 'active' : ''}" id="pane_marks">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.8rem;">
        <div class="timetable-card">
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1.2rem;">Attendance Records: ${std.full_name}</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Code</th><th>Course</th><th>Attended</th><th>Rate</th></tr></thead>
              <tbody>
                ${displayAttendance.map(a => `
                  <tr>
                    <td><code>${a.course_code}</code></td>
                    <td>${a.course_name}</td>
                    <td>${a.attended_classes} / ${a.total_classes}</td>
                    <td><span class="tier-status status-running">${a.percentage}%</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="timetable-card">
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1.2rem;">Internal & Midterm Grades: ${std.full_name}</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead><tr><th>Code</th><th>Internal</th><th>Midterm</th><th>Total</th><th>Grade</th></tr></thead>
              <tbody>
                ${displayMarks.map(m => `
                  <tr>
                    <td><code>${m.course_code}</code></td>
                    <td>${m.internal}/30</td>
                    <td>${m.midterm}/50</td>
                    <td><strong>${m.total}/100</strong></td>
                    <td><strong style="color: var(--accent-primary);">${m.grade}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 4: ASSIGNMENTS -->
    <div class="dash-tab-pane ${activeTab === 'assignments' ? 'active' : ''}" id="pane_assignments">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-file-lines text-primary"></i> Course Deliverables: ${std.full_name}</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Course</th><th>Assignment Title</th><th>Deadline</th><th>Max Score</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${allAssignments.map(assign => `
                <tr>
                  <td><code>${assign.course_code}</code></td>
                  <td><strong>${assign.title}</strong><div style="font-size: 0.8rem; color: var(--text-muted);">${assign.description}</div></td>
                  <td>${assign.due_date}</td>
                  <td>${assign.max_score} pts</td>
                  <td><span class="tier-status ${assign.status === 'Submitted' ? 'status-running' : 'status-restarting'}">${assign.status}</span></td>
                  <td>
                    ${assign.status === 'Submitted'
                      ? `<button class="btn btn-secondary btn-sm" disabled><i class="fa-solid fa-check-double"></i> Submitted</button>`
                      : `<button class="btn btn-primary btn-sm" onclick="submitStudentAssignment(${assign.id})"><i class="fa-solid fa-upload"></i> Submit Now</button>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 5: EXAMS & DIGITAL HALL TICKET -->
    <div class="dash-tab-pane ${activeTab === 'exams' ? 'active' : ''}" id="pane_exams">
      <div class="hall-ticket-card">
        <div class="hall-ticket-header">
          <div class="hall-ticket-logo-block">
            <div class="brand-icon-wrapper" style="width: 50px; height: 50px; font-size: 1.5rem;"><i class="fa-solid fa-graduation-cap"></i></div>
            <div>
              <h3 style="font-size: 1.35rem; font-weight: 800;">Apex Institute of Technology</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Spring 2026 End-Semester Digital Hall Ticket</p>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="window.print()">
            <i class="fa-solid fa-print"></i> Print Hall Ticket
          </button>
        </div>

        <div class="hall-ticket-meta-grid">
          <div><strong style="color: var(--text-muted); font-size: 0.8rem;">CANDIDATE NAME:</strong><div><strong>${std.full_name}</strong></div></div>
          <div><strong style="color: var(--text-muted); font-size: 0.8rem;">REGISTRATION / ROLL NO:</strong><div><code>${std.roll_number}</code></div></div>
          <div><strong style="color: var(--text-muted); font-size: 0.8rem;">DEPARTMENT:</strong><div>${std.department} (Semester ${std.semester})</div></div>
          <div><strong style="color: var(--text-muted); font-size: 0.8rem;">EXAMINATION VENUE:</strong><div>Examination Hall A, Seat ${std.id * 10 + 2}</div></div>
        </div>

        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.8rem;">Registered Examination Schedule</h4>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Code</th><th>Subject Name</th><th>Exam Date</th><th>Time Slot</th></tr></thead>
            <tbody>
              ${allExams.map(ex => `
                <tr>
                  <td><code>${ex.course_code}</code></td>
                  <td><strong>${ex.subject}</strong></td>
                  <td>${ex.date}</td>
                  <td>${ex.time}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 6: AI STUDENT RISK PREDICTION -->
    <div class="dash-tab-pane ${activeTab === 'student_risk' ? 'active' : ''}" id="pane_student_risk">
      <div class="dash-cards-grid">
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">AI Predicted Risk Level</span>
            <div class="dash-card-icon" style="background: ${computedRiskLevel === 'HIGH' ? 'rgba(218, 30, 40, 0.15)' : computedRiskLevel === 'MEDIUM' ? 'rgba(241, 194, 27, 0.15)' : 'rgba(36, 161, 72, 0.15)'}; color: ${computedRiskLevel === 'HIGH' ? 'var(--status-danger)' : computedRiskLevel === 'MEDIUM' ? 'var(--status-warning)' : 'var(--status-success)'};">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div style="display: flex; align-items: baseline; gap: 0.8rem; margin: 0.4rem 0;">
            <span class="dash-card-value" style="color: ${computedRiskLevel === 'HIGH' ? 'var(--status-danger)' : computedRiskLevel === 'MEDIUM' ? '#d89b00' : 'var(--status-success)'};">${computedRiskScore}%</span>
            <span class="risk-badge ${computedRiskLevel.toLowerCase()}">${computedRiskLevel} RISK</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-fill" style="width: ${computedRiskScore}%; background: ${computedRiskLevel === 'HIGH' ? 'linear-gradient(90deg, #da1e28, #ff8389)' : computedRiskLevel === 'MEDIUM' ? 'linear-gradient(90deg, #f1c21b, #fddc69)' : 'linear-gradient(90deg, #24a148, #6fdc8c)'};"></div>
          </div>
          <div class="dash-card-sub" style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem;">
            Multivariate Bayesian Assessment Model
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Attendance Risk Factor</span>
            <div class="dash-card-icon" style="background: rgba(15, 98, 254, 0.15); color: var(--ibm-blue-60);"><i class="fa-solid fa-clipboard-check"></i></div>
          </div>
          <div class="dash-card-value">${std.overall_attendance}%</div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${std.overall_attendance}%;"></div></div>
          <div class="dash-card-sub" style="color: ${std.overall_attendance >= 75 ? 'var(--status-success)' : 'var(--status-danger)'};">
            <i class="fa-solid ${std.overall_attendance >= 75 ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${std.overall_attendance >= 75 ? 'Satisfies 75% Requirement' : 'CRITICAL: Debarment Risk (<75%)'}
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Academic Score Factor</span>
            <div class="dash-card-icon" style="background: rgba(105, 41, 196, 0.15); color: #6929c4;"><i class="fa-solid fa-award"></i></div>
          </div>
          <div class="dash-card-value">${std.cgpa} <span style="font-size: 0.9rem; color: var(--text-muted);">CGPA</span></div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${(std.cgpa / 10) * 100}%; background: #6929c4;"></div></div>
          <div class="dash-card-sub" style="color: ${std.cgpa >= 7.0 ? 'var(--status-success)' : 'var(--status-warning)'};">
            <i class="fa-solid ${std.cgpa >= 7.0 ? 'fa-circle-check' : 'fa-circle-info'}"></i> ${std.cgpa >= 7.0 ? 'Consistent Performance' : 'Remedial Tutorial Recommended'}
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title">Faculty Mentor</span>
            <div class="dash-card-icon" style="background: rgba(17, 211, 243, 0.15); color: var(--accent-cyan);"><i class="fa-solid fa-user-doctor"></i></div>
          </div>
          <div class="dash-card-value" style="font-size: 1.25rem; margin-top: 0.2rem;">${std.mentor_name}</div>
          <div class="dash-card-sub" style="margin-top: 0.4rem;">
            <button class="btn btn-outline btn-sm" style="width: 100%; font-size: 0.78rem;" onclick="showToast('Consultation request sent to ' + '${std.mentor_name}', 'success')">
              <i class="fa-solid fa-calendar-plus"></i> Schedule Mentoring
            </button>
          </div>
        </div>
      </div>

      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;">
          <i class="fa-solid fa-microchip text-primary"></i> AI Risk Model Insights & Interventions
        </h3>

        ${computedRiskLevel === 'HIGH' ? `
          <div style="background: rgba(218, 30, 40, 0.1); border-left: 4px solid var(--status-danger); padding: 1rem 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; font-weight: 800; color: var(--status-danger); margin-bottom: 0.3rem;">
              <i class="fa-solid fa-bell"></i> HIGH RISK ADVISORY ACTIVE
            </div>
            <p style="margin: 0; font-size: 0.9rem;">This profile exhibits significant variance in required performance metrics. Automated notifications have been dispatched to registered parental contacts.</p>
          </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--text-primary);">
              <i class="fa-solid fa-magnifying-glass-chart text-primary"></i> Contributing Factor Breakdown
            </h4>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">
              ${riskReasons.length > 0 ? riskReasons.map(r => `
                <li style="display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.88rem; background: var(--bg-secondary); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                  <i class="fa-solid fa-circle-exclamation" style="color: var(--status-danger); margin-top: 2px;"></i>
                  <span>${r}</span>
                </li>
              `).join('') : `
                <li style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; color: var(--status-success); background: var(--bg-secondary); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
                  <i class="fa-solid fa-circle-check"></i>
                  <span>All academic metrics meet or exceed institutional excellence standards.</span>
                </li>
              `}
            </ul>
          </div>

          <div>
            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--text-primary);">
              <i class="fa-solid fa-wand-magic-sparkles text-primary"></i> Actionable AI Recommendations
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <div style="background: var(--bg-secondary); padding: 0.7rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.88rem;">
                <strong><i class="fa-solid fa-calendar-check text-primary"></i> Remedial Attendance:</strong> Attend 4 mandatory remedial sessions in Cloud Computing (CS601) to cross the 75% cutoff.
              </div>
              <div style="background: var(--bg-secondary); padding: 0.7rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.88rem;">
                <strong><i class="fa-solid fa-book-open text-primary"></i> Peer Study Circle:</strong> Enrolled in Friday Docker Containerization review lab led by Dr. Robert Vance.
              </div>
              <div style="background: var(--bg-secondary); padding: 0.7rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.88rem;">
                <strong><i class="fa-solid fa-code text-primary"></i> Continuous Assessment:</strong> Submit Assignment 2 (Microservice Decoupling) before Friday 11:59 PM.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 7: PLACEMENT READINESS -->
    <div class="dash-tab-pane ${activeTab === 'student_placement' ? 'active' : ''}" id="pane_student_placement">
      <div class="dash-cards-grid">
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Placement Readiness Index</span><div class="dash-card-icon" style="background: rgba(105, 41, 196, 0.15); color: #6929c4;"><i class="fa-solid fa-briefcase"></i></div></div>
          <div class="dash-card-value">${studentPlacement.readiness_score}%</div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${studentPlacement.readiness_score}%; background: #6929c4;"></div></div>
          <div class="dash-card-sub" style="color: #6929c4; font-weight: 700;">${studentPlacement.tier}</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Coding Assessment</span><div class="dash-card-icon" style="background: rgba(15, 98, 254, 0.15); color: var(--ibm-blue-60);"><i class="fa-solid fa-code"></i></div></div>
          <div class="dash-card-value">${studentPlacement.coding_score} <span style="font-size: 1rem; color: var(--text-muted);">/ 100</span></div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${studentPlacement.coding_score}%;"></div></div>
          <div class="dash-card-sub"><i class="fa-solid fa-layer-group"></i> DSA & System Design Qualified</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Aptitude & Reasoning</span><div class="dash-card-icon" style="background: rgba(0, 157, 154, 0.15); color: var(--ibm-teal-40);"><i class="fa-solid fa-brain"></i></div></div>
          <div class="dash-card-value">${studentPlacement.aptitude_score} <span style="font-size: 1rem; color: var(--text-muted);">/ 100</span></div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${studentPlacement.aptitude_score}%; background: var(--ibm-teal-40);"></div></div>
          <div class="dash-card-sub"><i class="fa-solid fa-circle-check text-primary"></i> Tier 1 Standard Met</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Mock Technical Interviews</span><div class="dash-card-icon" style="background: rgba(36, 161, 72, 0.15); color: var(--status-success);"><i class="fa-solid fa-user-tie"></i></div></div>
          <div class="dash-card-value">${studentPlacement.mock_interview_score} <span style="font-size: 1rem; color: var(--text-muted);">/ 100</span></div>
          <div class="progress-bar-container"><div class="progress-fill" style="width: ${studentPlacement.mock_interview_score}%; background: var(--status-success);"></div></div>
          <div class="dash-card-sub"><i class="fa-solid fa-award"></i> Active Offers: <strong>${studentPlacement.offers_count}</strong></div>
        </div>
      </div>

      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: gap; gap: 1rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-building-columns text-primary"></i> Upcoming Campus Placement Drives</h3>
          <span class="badge badge-primary">2026 Graduating Batch</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Recruiter</th><th>Role</th><th>Package (CTC)</th><th>Drive Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>IBM India Pvt Ltd</strong></td>
                <td>Cloud Native Developer (Docker & K8s)</td>
                <td>18.5 LPA</td>
                <td>March 24, 2026</td>
                <td><span class="tier-status status-running"><i class="fa-solid fa-circle-check"></i> Eligible & Shortlisted</span></td>
                <td><button class="btn btn-primary btn-sm" onclick="showToast('Application confirmed for IBM Campus Drive!', 'success')"><i class="fa-solid fa-paper-plane"></i> View Hall Ticket</button></td>
              </tr>
              <tr>
                <td><strong>Red Hat OpenShift</strong></td>
                <td>Platform Reliability Engineer</td>
                <td>16.0 LPA</td>
                <td>April 02, 2026</td>
                <td><span class="tier-status status-running"><i class="fa-solid fa-circle-check"></i> Eligible</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="showToast('Registered for Red Hat assessment.', 'info')">Register</button></td>
              </tr>
              <tr>
                <td><strong>Amazon Web Services</strong></td>
                <td>Solutions Architect Associate</td>
                <td>24.0 LPA</td>
                <td>April 15, 2026</td>
                <td><span class="tier-status" style="background: rgba(105,41,196,0.15); color: #6929c4;">Registration Open</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="showToast('Applied for AWS Preliminary Round.', 'success')">Apply Now</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 8: DIGITAL LEAVE MANAGEMENT -->
    <div class="dash-tab-pane ${activeTab === 'student_leaves' ? 'active' : ''}" id="pane_student_leaves">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-plane-departure text-primary"></i> Digital Leave Management</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Apply for academic, medical, or duty leaves with multi-tier digital tracking and automatic parental synchronization.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openModal('applyLeaveModal')">
            <i class="fa-solid fa-plus"></i> Apply for Leave
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Type</th><th>Duration</th><th>Days</th><th>Reason</th><th>Status</th><th>Reviewer Remarks</th></tr>
            </thead>
            <tbody>
              ${displayLeaves.map(l => `
                <tr>
                  <td>#LV-${l.id}</td>
                  <td><strong>${l.leave_type}</strong></td>
                  <td><code>${l.start_date}</code> $\to$ <code>${l.end_date}</code></td>
                  <td>${l.days_count} days</td>
                  <td>${l.reason}</td>
                  <td>
                    <span class="tier-status ${l.status === 'Approved' ? 'status-running' : l.status === 'Rejected' ? 'status-restarting' : ''}" style="${l.status === 'Pending' ? 'background: rgba(241,194,27,0.15); color: #d89b00;' : ''}">
                      ${l.status}
                    </span>
                  </td>
                  <td style="font-size: 0.85rem; color: var(--text-muted);">${l.review_notes || (l.status === 'Pending' ? 'Pending Faculty Review' : '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 9: FEES & DUES -->
    <div class="dash-tab-pane ${activeTab === 'student_fees' ? 'active' : ''}" id="pane_student_fees">
      <div class="dash-cards-grid">
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Semester Fee</span><div class="dash-card-icon" style="background: rgba(15, 98, 254, 0.15); color: var(--ibm-blue-60);"><i class="fa-solid fa-coins"></i></div></div>
          <div class="dash-card-value">$${Number(studentFee.total_amount || 0).toLocaleString()}</div>
          <div class="dash-card-sub">Semester ${studentFee.semester || std.semester || 6} Institutional Dues</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Amount Paid</span><div class="dash-card-icon" style="background: rgba(36, 161, 72, 0.15); color: var(--status-success);"><i class="fa-solid fa-circle-check"></i></div></div>
          <div class="dash-card-value" style="color: var(--status-success);">$${Number(studentFee.paid_amount || 0).toLocaleString()}</div>
          <div class="dash-card-sub">Settled via NetBanking / Card</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Outstanding Balance</span><div class="dash-card-icon" style="background: ${Number(studentFee.due_amount || 0) > 0 ? 'rgba(218, 30, 40, 0.15)' : 'rgba(36, 161, 72, 0.15)'}; color: ${Number(studentFee.due_amount || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'};"><i class="fa-solid fa-receipt"></i></div></div>
          <div class="dash-card-value" style="color: ${Number(studentFee.due_amount || 0) > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">$${Number(studentFee.due_amount || 0).toLocaleString()}</div>
          <div class="dash-card-sub">${Number(studentFee.due_amount || 0) > 0 ? 'Due by March 31, 2026' : 'No Outstanding Dues'}</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Official Receipt</span><div class="dash-card-icon" style="background: rgba(17, 211, 243, 0.15); color: var(--accent-cyan);"><i class="fa-solid fa-stamp"></i></div></div>
          <div class="dash-card-value" style="font-size: 1.1rem; font-family: var(--font-mono); margin-top: 0.3rem;">${studentFee.receipt_no || `RCPT-2026-06-${std.id}`}</div>
          <div class="dash-card-sub" style="margin-top: 0.4rem;">
            ${Number(studentFee.due_amount || 0) > 0 ? `
              <button class="btn btn-primary btn-sm" style="width: 100%; font-size: 0.8rem;" onclick="handlePayFeeDemo(${studentFee.id || std.id})">
                <i class="fa-solid fa-credit-card"></i> Pay Remaining Dues
              </button>
            ` : `
              <button class="btn btn-outline btn-sm" style="width: 100%; font-size: 0.8rem;" onclick="window.print()">
                <i class="fa-solid fa-print"></i> Print Receipt
              </button>
            `}
          </div>
        </div>
      </div>

      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-file-invoice-dollar text-primary"></i> Fee Structure Itemization</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Fee Category</th><th>Description</th><th>Institutional Share</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td><strong>Tuition & Instruction</strong></td><td>Semester 6 Cloud Native Curriculum & Lecture Credits</td><td>$8,000.00</td><td><span class="tier-status status-running">Paid</span></td></tr>
              <tr><td><strong>Cloud Computing Lab Infrastructure</strong></td><td>Docker Cluster & Microservice Pod Allocations</td><td>$2,500.00</td><td><span class="tier-status status-running">Paid</span></td></tr>
              <tr><td><strong>Examination & Assessment</strong></td><td>Semester End Examinations & Digital Hall Ticket</td><td>$1,000.00</td><td><span class="tier-status ${studentFee.due_amount === 0 ? 'status-running' : 'status-restarting'}">${studentFee.due_amount === 0 ? 'Paid' : 'Pending'}</span></td></tr>
              <tr><td><strong>Digital Library & Research Resources</strong></td><td>IEEE / ACM Digital Library Institutional Access</td><td>$1,000.00</td><td><span class="tier-status ${studentFee.due_amount === 0 ? 'status-running' : 'status-restarting'}">${studentFee.due_amount === 0 ? 'Paid' : 'Pending'}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 10: COMPLAINTS & GRIEVANCE REDRESSAL -->
    <div class="dash-tab-pane ${activeTab === 'student_complaints' ? 'active' : ''}" id="pane_student_complaints">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-headset text-primary"></i> Grievance & Helpdesk Tracker</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Raise academic, infrastructure, hostel, or fee issues with SLA-backed tracking.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openModal('submitComplaintModal')">
            <i class="fa-solid fa-plus"></i> File New Grievance
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Ticket #</th><th>Category</th><th>Subject</th><th>Assigned To</th><th>Status</th><th>Resolution Notes</th></tr></thead>
            <tbody>
              ${displayComplaints.map(c => `
                <tr>
                  <td><code>#TKT-${c.id}</code></td>
                  <td><strong>${c.category}</strong></td>
                  <td>${c.subject}</td>
                  <td>${c.assigned_to || 'Dean Office'}</td>
                  <td><span class="tier-status ${c.status === 'Resolved' ? 'status-running' : 'status-restarting'}">${c.status}</span></td>
                  <td style="font-size: 0.85rem; color: var(--text-muted);">${c.resolution_notes || 'Investigation in progress'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 11: CERTIFICATE REQUESTS -->
    <div class="dash-tab-pane ${activeTab === 'student_certificates' ? 'active' : ''}" id="pane_student_certificates">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-stamp text-primary"></i> University Certificates Hub</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Request certified institutional letters, bonafide certificates, transcripts, and internship NOCs.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openModal('requestCertificateModal')">
            <i class="fa-solid fa-plus"></i> Request Certificate
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Request ID</th><th>Certificate Type</th><th>Purpose</th><th>Status</th><th>Serial Number</th><th>Action</th></tr></thead>
            <tbody>
              ${displayCerts.map(cert => `
                <tr>
                  <td><code>#REQ-${cert.id}</code></td>
                  <td><strong>${cert.cert_type}</strong></td>
                  <td>${cert.purpose}</td>
                  <td><span class="tier-status ${cert.status === 'Ready for Pickup' || cert.status === 'Approved' ? 'status-running' : 'status-restarting'}">${cert.status}</span></td>
                  <td><code>${cert.serial_no || 'In Generation'}</code></td>
                  <td>
                    ${cert.status === 'Ready for Pickup' || cert.status === 'Approved' ? `
                      <button class="btn btn-outline btn-sm" onclick="downloadCertificate(${cert.id})">
                        <i class="fa-solid fa-file-arrow-down"></i> Download PDF
                      </button>
                    ` : `
                      <span style="font-size: 0.82rem; color: var(--text-muted);"><i class="fa-solid fa-clock"></i> In Verification</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

    // Force-activate the correct pane and sidebar highlight after every render
    switchDashboardTab(activeTab);
    requestAnimationFrame(() => switchDashboardTab(activeTab));
  } catch (err) {
    console.error('[StudentPortal] Unexpected rendering notice:', err);
    switchDashboardTab(activeTab);
  }
}

// --------------------------------------------------------------------
// FACULTY DASHBOARD MAIN STAGE
// --------------------------------------------------------------------
function renderFacultyMainStage(initialTab) {
  const main = document.getElementById('dashMainContent');
  if (!main) return;

  const facValidTabs = ['attendance', 'grading', 'fac_risk', 'fac_workload', 'fac_leaves', 'courses', 'fac_students', 'announcements'];
  const activeTab = (initialTab && facValidTabs.includes(initialTab)) ? initialTab : 'attendance';

  const fac = (AppState.currentUser && AppState.currentUser.profile) || AppState.faculty[0] || {
    id: 1,
    full_name: 'Dr. Robert Vance',
    employee_id: 'FAC-CS-109',
    department: 'Computer Science & Cloud Computing',
    designation: 'Professor & Cloud Lead',
    specialization: 'Distributed Systems & Docker Containerization',
    cabin_location: 'IBM Center of Excellence, Room 402',
    courses: ['CS601', 'CS604']
  };

  const assignedCourses = AppState.courses.filter(c => (fac.courses || []).includes(c.course_code) || (c.instructor && c.instructor.includes(fac.full_name)));

  // Faculty teaches 2 subjects! Default to CS601 and CS604
  const facCourseCodes = (fac.courses && fac.courses.length > 0) ? fac.courses : ['CS601', 'CS604'];
  if (!facCourseCodes.includes(AppState.activeFacCourse)) {
    AppState.activeFacCourse = facCourseCodes[0] || 'CS601';
  }
  const activeCourseCode = AppState.activeFacCourse;

  const getCourseMeta = (code) => {
    if (code === 'CS601') return { code: 'CS601', name: 'Cloud Computing & Microservices', icon: 'fa-cloud' };
    if (code === 'CS604') return { code: 'CS604', name: 'Container Security & DevSecOps', icon: 'fa-shield-halved' };
    const found = AppState.courses.find(c => c.course_code === code);
    return found ? { code, name: found.course_name, icon: 'fa-book-open' } : { code, name: code, icon: 'fa-book-open' };
  };
  const activeCourseMeta = getCourseMeta(activeCourseCode);

  main.innerHTML = `
    <!-- Topbar with Faculty Switcher -->
    <div class="dash-topbar">
      <div class="dash-title-group">
        <h2>Faculty Management Portal</h2>
        <p>Logged in as <strong>${fac.full_name}</strong> • ${fac.designation} (${fac.department})</p>
      </div>
      <div class="dash-actions-group">
        <!-- Prominent Topbar Faculty Switcher -->
        <div style="display: flex; align-items: center; gap: 0.6rem; background: var(--bg-secondary); padding: 0.4rem 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <label style="font-size: 0.82rem; font-weight: 700; white-space: nowrap; color: var(--text-muted);">
            <i class="fa-solid fa-arrows-rotate text-primary"></i> Change Faculty:
          </label>
          <select class="form-control" style="font-weight: 700; padding: 0.3rem 0.6rem; font-size: 0.85rem; max-width: 280px;" onchange="handleDashProfileChange(this.value)">
            ${AppState.faculty.map(f => `
              <option value="${f.id}" ${f.id === fac.id ? 'selected' : ''}>${f.full_name} (${f.designation})</option>
            `).join('')}
          </select>
        </div>

        <button class="btn btn-secondary btn-sm" onclick="openModal('announcementModal')">
          <i class="fa-solid fa-bullhorn"></i> Post Notice
        </button>
        <button class="btn btn-secondary btn-sm" onclick="openModal('assignmentModal')">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Assignment
        </button>
      </div>
    </div>

    <!-- SUB-TAB 1: ATTENDANCE -->
    <div class="dash-tab-pane ${activeTab === 'attendance' ? 'active' : ''}" id="pane_attendance">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-clipboard-user text-primary"></i> Mark Student Attendance</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Instructor: <strong>${fac.full_name}</strong> • Mark daily attendance below (Present increases %, Absent reduces %). If wrong, click to change or reset it.
            </p>
          </div>
          <span class="tier-status status-running"><i class="fa-solid fa-check-circle"></i> Live Attendance Roster</span>
        </div>

        <!-- 2-SUBJECT SWITCHER BAR -->
        <div class="fac-course-switcher-bar">
          <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary); display:flex; align-items:center; gap:0.5rem;">
            <i class="fa-solid fa-graduation-cap text-primary"></i>
            <span>Select Teaching Subject:</span>
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            ${facCourseCodes.map(code => {
              const meta = getCourseMeta(code);
              const isSel = code === activeCourseCode;
              return `
                <button type="button" class="subject-pill-btn ${isSel ? 'active' : ''}" onclick="switchFacAttCourse('${code}')">
                  <i class="fa-solid ${meta.icon}"></i>
                  <strong>${code}</strong>: ${meta.name}
                </button>
              `;
            }).join('')}
          </div>
          <div style="margin-left:auto; display:flex; gap:0.6rem; align-items:center;">
            <span class="badge badge-primary"><i class="fa-solid fa-chalkboard"></i> Active: ${activeCourseCode}</span>
          </div>
        </div>

        <!-- Course Summary Stat Strip -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.4rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); padding:0.8rem 1.2rem; border-radius:var(--radius-md);">
            <span style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Active Subject</span>
            <div style="font-size:1.1rem; font-weight:800; color:var(--accent-primary); margin-top:0.2rem;">${activeCourseCode}</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">${activeCourseMeta.name}</div>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); padding:0.8rem 1.2rem; border-radius:var(--radius-md);">
            <span style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Total Enrolled</span>
            <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin-top:0.2rem;">${AppState.students.length} Students</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Semester 6 Regular Roster</div>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); padding:0.8rem 1.2rem; border-radius:var(--radius-md);">
            <span style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Average Subject Attendance</span>
            <div style="font-size:1.1rem; font-weight:800; color:var(--status-success); margin-top:0.2rem;">
              ${(() => {
                const subAtts = AppState.attendance.filter(a => a.course_code === activeCourseCode);
                return subAtts.length > 0 ? (subAtts.reduce((sum, a) => sum + a.percentage, 0) / subAtts.length).toFixed(1) + '%' : '85.2%';
              })()}
            </div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">Statutory Cutoff: &ge; 75%</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Roll Number</th>
                <th>Student Full Name</th>
                <th>Dept</th>
                <th>${activeCourseCode} Attendance %</th>
                <th>Mark Today's Session</th>
                <th>Attendance % Override (Admin Permission)</th>
              </tr>
            </thead>
            <tbody id="facAttTableBody">
              ${AppState.students.map((s, idx) => {
                let attRecord = AppState.attendance.find(a => a.student_id === s.id && a.course_code === activeCourseCode);
                if (!attRecord) {
                  attRecord = {
                    id: Date.now() + s.id,
                    student_id: s.id,
                    course_code: activeCourseCode,
                    course_name: activeCourseMeta.name,
                    total_classes: 40,
                    attended_classes: Math.round((s.overall_attendance / 100) * 40),
                    percentage: s.overall_attendance
                  };
                  AppState.attendance.push(attRecord);
                }

                const todayKey = `${activeCourseCode}_${s.id}`;
                const todayMark = AppState.todayAttendance ? AppState.todayAttendance[todayKey] : null;

                // Check override permission granted by Admin
                const isOverrideApproved = (s._overrideGranted && s._overrideGranted[activeCourseCode] === true) ||
                  AppState.attendanceOverrides.some(o => o.student_id === s.id && o.course_code === activeCourseCode && o.status === 'Approved');
                const pendingOverride = AppState.attendanceOverrides.find(o => o.student_id === s.id && o.course_code === activeCourseCode && o.status === 'Pending');

                const attColor = attRecord.percentage < 75 ? '#da1e28' : attRecord.percentage < 85 ? 'var(--status-warning)' : 'var(--status-success)';

                return `
                  <tr id="facAttRow_${s.id}">
                    <td style="color:var(--text-muted);font-weight:600;">${idx + 1}</td>
                    <td><code>${s.roll_number}</code></td>
                    <td>
                      <div style="display:flex;align-items:center;gap:0.6rem;">
                        <img src="${s.avatar_url}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'">
                        <div>
                          <strong>${s.full_name}</strong>
                          <div style="font-size:0.75rem; color:var(--text-muted);">Sem ${s.semester}</div>
                        </div>
                      </div>
                    </td>
                    <td style="font-size:0.8rem;color:var(--text-muted);">${(s.department || 'Computer Science').split('&')[0].trim()}</td>
                    <td>
                      <div id="attCell_${s.id}_${activeCourseCode}">
                        <span id="attPctDisplay_${s.id}_${activeCourseCode}" style="font-weight:800; font-size:1.05rem; color:${attColor};">${attRecord.percentage}%</span>
                        <div id="attClassesDisplay_${s.id}_${activeCourseCode}" style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">
                          ${attRecord.attended_classes}/${attRecord.total_classes} classes
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="attendance-toggle-group">
                        <button type="button" class="att-btn ${todayMark === 'Present' ? 'active-present' : ''}" id="attBtnP_${s.id}_${activeCourseCode}" onclick="markStudentSession(${s.id}, '${activeCourseCode}', true)" title="Mark Present (Increases attendance %)">
                          <i class="fa-solid fa-check"></i> Present
                        </button>
                        <button type="button" class="att-btn ${todayMark === 'Absent' ? 'active-absent' : ''}" id="attBtnA_${s.id}_${activeCourseCode}" onclick="markStudentSession(${s.id}, '${activeCourseCode}', false)" title="Mark Absent (Reduces attendance %)">
                          <i class="fa-solid fa-xmark"></i> Absent
                        </button>
                        ${todayMark ? `
                          <button type="button" class="att-reset-btn" onclick="resetStudentSession(${s.id}, '${activeCourseCode}')" title="Change / Reset today's mark if marked wrong">
                            <i class="fa-solid fa-rotate-left"></i>
                          </button>
                        ` : ''}
                      </div>
                    </td>
                    <td>
                      ${isOverrideApproved ? `
                        <div class="direct-override-box">
                          <span style="font-size:0.75rem; font-weight:700; color:var(--status-success); white-space:nowrap;"><i class="fa-solid fa-unlock"></i> Permission Granted</span>
                          <div style="display:flex; align-items:center; gap:0.3rem; margin-top:2px;">
                            <input type="number" id="customPctInput_${s.id}_${activeCourseCode}" value="${attRecord.percentage}" min="0" max="100" step="0.1" class="form-control" style="width:68px; padding:2px 6px; font-size:0.82rem; font-weight:700; height:28px;">
                            <button type="button" class="btn btn-primary btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="saveCustomPercentage(${s.id}, '${activeCourseCode}')" title="Directly set attendance %">Set %</button>
                          </div>
                        </div>
                      ` : pendingOverride ? `
                        <span class="tier-status status-restarting" style="font-size:0.75rem;" title="Request submitted to Administrator"><i class="fa-solid fa-clock"></i> Override Pending Admin (${pendingOverride.requested_percentage}%)</span>
                      ` : `
                        <button type="button" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:3px 10px;" onclick="openFacultyOverrideModal(${s.id}, '${s.full_name.replace(/'/g, "\\'")}', '${s.roll_number}', '${activeCourseCode}', ${attRecord.percentage})">
                          <i class="fa-solid fa-lock"></i> Request % Override
                        </button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 2: GRADING -->
    <div class="dash-tab-pane ${activeTab === 'grading' ? 'active' : ''}" id="pane_grading">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.4rem;"><i class="fa-solid fa-pen-ruler text-primary"></i> Student Marks & GPA Management</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem;">Evaluator: <strong>${fac.full_name}</strong>. Edit scores below to compute updated totals and letter grades in real time.</p>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Student Name</th><th>Course</th><th>Internal (30)</th><th>Midterm (50)</th><th>Assignment (20)</th><th>Total (100)</th><th>Grade</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${AppState.marks.map(m => {
                const stdRecord = AppState.students.find(s => s.id === m.student_id) || AppState.students[0];
                return `
                  <tr>
                    <td><strong>${stdRecord.full_name}</strong> (<code>${stdRecord.roll_number}</code>)</td>
                    <td><code>${m.course_code}</code></td>
                    <td><input type="number" step="0.5" id="mark_int_${m.id}" value="${m.internal}" style="width: 70px;" class="form-control"></td>
                    <td><input type="number" step="0.5" id="mark_mid_${m.id}" value="${m.midterm}" style="width: 70px;" class="form-control"></td>
                    <td><input type="number" step="0.5" id="mark_ass_${m.id}" value="${m.assignment}" style="width: 70px;" class="form-control"></td>
                    <td><strong id="mark_tot_${m.id}">${m.total}</strong></td>
                    <td><strong id="mark_grd_${m.id}" style="color: var(--accent-primary);">${m.grade}</strong></td>
                    <td><button class="btn btn-primary btn-sm" onclick="saveGradeChange(${m.id})"><i class="fa-solid fa-floppy-disk"></i> Save</button></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 3: COURSES & UPLOADS -->
    <div class="dash-tab-pane ${activeTab === 'courses' ? 'active' : ''}" id="pane_courses">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800;">Courses Assigned to ${fac.full_name}</h3>
          <button class="btn btn-primary btn-sm" onclick="openModal('assignmentModal')"><i class="fa-solid fa-plus"></i> Upload Deliverable</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Code</th><th>Course Title</th><th>Credits</th><th>Enrolled</th><th>Action</th></tr></thead>
            <tbody>
              ${assignedCourses.map(c => `
                <tr>
                  <td><code>${c.course_code}</code></td>
                  <td><strong>${c.course_name}</strong></td>
                  <td>${c.credits} Credits</td>
                  <td>${c.enrolled} Students</td>
                  <td><button class="btn btn-outline btn-sm" onclick="openModal('assignmentModal')">Upload Tasks</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 4: MANAGE STUDENTS (FACULTY) -->
    <div class="dash-tab-pane ${activeTab === 'fac_students' ? 'active' : ''}" id="pane_fac_students">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-user-graduate text-primary"></i> Student Roster Management</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Add, edit or remove students enrolled in your courses.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openModal('addStudentModal')">
            <i class="fa-solid fa-user-plus"></i> Enroll New Student
          </button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Roll No</th><th>Full Name</th><th>Department</th><th>Semester</th><th>CGPA</th><th>Attendance</th><th>Actions</th></tr>
            </thead>
            <tbody id="facStudentTableBody">
              ${AppState.students.map(s => `
                <tr id="facStdRow_${s.id}">
                  <td><code>${s.roll_number}</code></td>
                  <td><strong>${s.full_name}</strong></td>
                  <td>${s.department}</td>
                  <td>Sem ${s.semester}</td>
                  <td><strong>${s.cgpa}</strong></td>
                  <td><span class="tier-status status-running">${s.overall_attendance}%</span></td>
                  <td style="display:flex; gap:0.4rem;">
                    <button class="btn btn-outline btn-sm" title="Edit Student" onclick="openEditStudent(${s.id})">
                      <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-secondary btn-sm" title="Delete Student" style="color:var(--status-danger);" onclick="deleteFacultyStudent(${s.id})">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 5: ANNOUNCEMENTS -->
    <div class="dash-tab-pane ${activeTab === 'announcements' ? 'active' : ''}" id="pane_announcements">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800;">Notices Posted by ${fac.full_name}</h3>
          <button class="btn btn-primary btn-sm" onclick="openModal('announcementModal')"><i class="fa-solid fa-bullhorn"></i> New Notice</button>
        </div>
        <div class="announcements-list">
          ${AppState.announcements.slice(0, 3).map(a => `
            <div class="announcement-item">
              <div class="ann-top-row">
                <div class="ann-title-wrap">
                  <span class="ann-priority-badge priority-${a.priority}">${a.priority}</span>
                  <h4 class="ann-title">${a.title}</h4>
                </div>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${a.date_posted}</span>
              </div>
              <p class="ann-content">${a.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- SUB-TAB 6: AI RISK MATRIX -->
    <div class="dash-tab-pane ${activeTab === 'fac_risk' ? 'active' : ''}" id="pane_fac_risk">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.4rem;"><i class="fa-solid fa-triangle-exclamation" style="color: #da1e28;"></i> AI Academic Risk Matrix</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.4rem;">Students flagged by the AI engine for attendance drops or low internal marks requiring immediate faculty intervention.</p>
        <div class="dash-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 1.4rem;">
          <div class="dash-card" style="border-left: 4px solid var(--status-danger);">
            <div class="dash-card-header"><span class="dash-card-title">Critical Risk</span><div class="dash-card-icon" style="background: rgba(218,30,40,0.1); color: #da1e28;"><i class="fa-solid fa-circle-exclamation"></i></div></div>
            <div class="dash-card-value" style="color: #da1e28;">${AppState.students.filter(s => s.overall_attendance < 70).length}</div>
            <div class="dash-card-sub">Attendance < 70%</div>
          </div>
          <div class="dash-card" style="border-left: 4px solid var(--status-warning);">
            <div class="dash-card-header"><span class="dash-card-title">Moderate Risk</span><div class="dash-card-icon" style="background: rgba(241,194,27,0.1); color: var(--status-warning);"><i class="fa-solid fa-triangle-exclamation"></i></div></div>
            <div class="dash-card-value" style="color: var(--status-warning);">${AppState.students.filter(s => s.overall_attendance >= 70 && s.overall_attendance < 80).length}</div>
            <div class="dash-card-sub">Attendance 70–80%</div>
          </div>
          <div class="dash-card" style="border-left: 4px solid var(--status-success);">
            <div class="dash-card-header"><span class="dash-card-title">Safe</span><div class="dash-card-icon" style="background: rgba(36,161,72,0.1); color: var(--status-success);"><i class="fa-solid fa-shield-halved"></i></div></div>
            <div class="dash-card-value" style="color: var(--status-success);">${AppState.students.filter(s => s.overall_attendance >= 80).length}</div>
            <div class="dash-card-sub">Attendance ≥ 80%</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Roll No</th><th>CGPA</th><th>Attendance</th><th>Status</th><th>Risk Level</th></tr></thead>
            <tbody>
              ${AppState.students.map(s => {
                const risk = s.overall_attendance < 70 ? 'Critical' : s.overall_attendance < 80 ? 'Moderate' : 'Low';
                const riskColor = risk === 'Critical' ? '#da1e28' : risk === 'Moderate' ? 'var(--status-warning)' : 'var(--status-success)';
                return `<tr>
                  <td><strong>${s.full_name}</strong></td>
                  <td><code>${s.roll_number}</code></td>
                  <td><strong>${s.cgpa}</strong></td>
                  <td><span class="tier-status" style="background:${s.overall_attendance < 75 ? 'rgba(218,30,40,0.12)' : 'rgba(36,161,72,0.12)'}; color:${s.overall_attendance < 75 ? '#da1e28' : 'var(--status-success)'};">${s.overall_attendance}%</span></td>
                  <td>${s.status}</td>
                  <td><span style="font-weight:700; color:${riskColor}; background:rgba(0,0,0,0.06); padding: 3px 10px; border-radius: 30px; font-size:0.8rem;">${risk}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 7: FACULTY WORKLOAD -->
    <div class="dash-tab-pane ${activeTab === 'fac_workload' ? 'active' : ''}" id="pane_fac_workload">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.4rem;"><i class="fa-solid fa-gauge" style="color: var(--ibm-blue-60);"></i> Faculty Workload Summary</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.4rem;">Workload metrics for all faculty members based on courses assigned, total student count, and teaching hours.</p>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Faculty Member</th><th>Designation</th><th>Courses Assigned</th><th>Students</th><th>Weekly Hours</th><th>Load Status</th></tr></thead>
            <tbody>
              ${AppState.faculty.map(f => {
                const courseCount = f.courses_count || f.courses.length;
                const hours = courseCount * 3;
                const load = hours > 9 ? 'Heavy' : hours >= 6 ? 'Moderate' : 'Light';
                const loadColor = load === 'Heavy' ? '#da1e28' : load === 'Moderate' ? 'var(--status-warning)' : 'var(--status-success)';
                return `<tr>
                  <td><strong>${f.full_name}</strong></td>
                  <td>${f.designation}</td>
                  <td>${courseCount} Course${courseCount > 1 ? 's' : ''}</td>
                  <td>${courseCount * 38} Students</td>
                  <td>${hours} hrs/week</td>
                  <td><span style="font-weight:700; color:${loadColor}; background:rgba(0,0,0,0.06); padding: 3px 10px; border-radius: 30px; font-size:0.8rem;">${load}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 8: REVIEW STUDENT LEAVES -->
    <div class="dash-tab-pane ${activeTab === 'fac_leaves' ? 'active' : ''}" id="pane_fac_leaves">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.4rem;"><i class="fa-solid fa-envelope-open-text" style="color: var(--ibm-teal-40);"></i> Student Leave Applications</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.4rem;">Review and respond to pending leave requests submitted by students in your courses.</p>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Leave Type</th><th>Duration</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${AppState.leaves.map(l => {
                const statusColor = l.status === 'Approved' ? 'var(--status-success)' : l.status === 'Pending' ? 'var(--status-warning)' : '#da1e28';
                return `<tr>
                  <td><strong>${l.student_name}</strong><br><code style="font-size:0.75rem;">${l.roll_number}</code></td>
                  <td>${l.leave_type}</td>
                  <td>${l.start_date} → ${l.end_date}<br><small style="color:var(--text-muted);">${l.days_count} Day${l.days_count > 1 ? 's' : ''}</small></td>
                  <td style="max-width:200px; font-size:0.85rem;">${l.reason}</td>
                  <td><span style="font-weight:700; color:${statusColor};">${l.status}</span></td>
                  <td>
                    ${l.status === 'Pending' ? `
                    <div style="display:flex; gap:0.4rem;">
                      <button class="btn btn-primary btn-sm" onclick="approveLeave(${l.id})"><i class="fa-solid fa-check"></i> Approve</button>
                      <button class="btn btn-secondary btn-sm" style="color:#da1e28;" onclick="rejectLeave(${l.id})"><i class="fa-solid fa-xmark"></i> Reject</button>
                    </div>` : `<span style="font-size:0.82rem; color:var(--text-muted);">${l.reviewer_name || '—'}</span>`}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  // Force-activate the correct pane and sidebar highlight after every render
  requestAnimationFrame(() => switchDashboardTab(activeTab));
}

// ====================================================================
// RESILIENT ACADEMIC & PROGRESS REPORT RETRIEVAL ENGINES
// ====================================================================
function getStudentMarks(studentId) {
  const marks = AppState.marks.filter(m => m.student_id === studentId);
  if (marks.length > 0) return marks;

  const student = AppState.students.find(s => s.id === studentId) || AppState.students[0];
  const cgpa = student ? parseFloat(student.cgpa || 8.0) : 8.0;
  const baseScale = (cgpa / 10.0);

  const defaultCourses = [
    { code: 'CS601', name: 'Cloud Computing & Microservices', credits: 4 },
    { code: 'CS602', name: 'Full-Stack Web Architectures', credits: 4 },
    { code: 'CS603', name: 'Database Internals & Distributed Storage', credits: 3 },
    { code: 'CS604', name: 'Container Security & DevSecOps', credits: 3 },
    { code: 'CS605', name: 'Artificial Intelligence & Neural Systems', credits: 4 }
  ];

  return defaultCourses.map((c, idx) => {
    const variance = ((idx % 3) - 1) * 2;
    const internal = Math.min(30, Math.max(12, Math.round((baseScale * 30 + variance * 0.3) * 10) / 10));
    const midterm = Math.min(50, Math.max(20, Math.round((baseScale * 50 + variance * 0.5) * 10) / 10));
    const assignment = Math.min(20, Math.max(10, Math.round((baseScale * 20 + variance * 0.2) * 10) / 10));
    const total = parseFloat((internal + midterm + assignment).toFixed(1));
    const grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B+' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'D' : 'F';
    return {
      student_id: studentId,
      id: 100 + studentId * 10 + idx,
      course_code: c.code,
      course_name: c.name,
      credits: c.credits,
      internal,
      midterm,
      assignment,
      total,
      grade
    };
  });
}

function getStudentAttendance(studentId) {
  const att = AppState.attendance.filter(a => a.student_id === studentId);
  if (att.length > 0) return att;

  const student = AppState.students.find(s => s.id === studentId) || AppState.students[0];
  const overall = student ? parseFloat(student.overall_attendance || 85) : 85;

  const defaultCourses = [
    { code: 'CS601', name: 'Cloud Computing & Microservices', total: 42 },
    { code: 'CS602', name: 'Full-Stack Web Architectures', total: 40 },
    { code: 'CS603', name: 'Database Internals & Distributed Storage', total: 38 },
    { code: 'CS604', name: 'Container Security & DevSecOps', total: 36 },
    { code: 'CS605', name: 'Artificial Intelligence & Neural Systems', total: 40 }
  ];

  return defaultCourses.map((c, idx) => {
    const variance = ((idx % 3) - 1) * 2.5;
    const pct = Math.min(100, Math.max(50, Math.round((overall + variance) * 10) / 10));
    const attended = Math.round((pct / 100) * c.total);
    return {
      student_id: studentId,
      id: 200 + studentId * 10 + idx,
      course_code: c.code,
      course_name: c.name,
      total_classes: c.total,
      attended_classes: attended,
      percentage: pct
    };
  });
}

function getStudentFees(studentId) {
  const fee = AppState.fees.find(f => f.student_id === studentId);
  if (fee) {
    const total = Number(fee.total_fee !== undefined ? fee.total_fee : (fee.total_amount !== undefined ? fee.total_amount : 85000)) || 85000;
    const paid = Number(fee.paid_amount !== undefined ? fee.paid_amount : 0);
    const due = Number(fee.pending_amount !== undefined ? fee.pending_amount : (fee.due_amount !== undefined ? fee.due_amount : (total - paid))) || 0;
    return {
      ...fee,
      total_amount: total,
      paid_amount: paid,
      due_amount: due,
      pending_amount: due,
      status: fee.status || (due === 0 ? 'Paid' : 'Partial'),
      receipt_no: fee.receipt_no || `RCPT-2026-06-${String(studentId).padStart(3, '0')}`
    };
  }
  const student = AppState.students.find(s => s.id === studentId);
  const total = 85000;
  const isOverdue = student && (student.status === 'Academic Warning' || student.overall_attendance < 75);
  const paid = isOverdue ? 40000 : 85000;
  const due = total - paid;
  return {
    id: 50 + studentId,
    student_id: studentId,
    semester: student ? student.semester : 6,
    total_amount: total,
    paid_amount: paid,
    due_amount: due,
    pending_amount: due,
    status: due === 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Overdue'),
    receipt_no: `RCPT-2026-06-${String(studentId).padStart(3, '0')}`,
    payment_date: '2026-01-15'
  };
}

// --------------------------------------------------------------------
// PARENT DASHBOARD MAIN STAGE
// --------------------------------------------------------------------
function renderParentMainStage(initialTab) {
  const main = document.getElementById('dashMainContent');
  if (!main) return;

  const parentProfile = (AppState.currentUser && AppState.currentUser.profile) || AppState.parents[0];
  const child = AppState.students.find(s => s.id === parentProfile.student_id) || AppState.students[0];
  const childAttendance = getStudentAttendance(child.id);
  const childMarks = getStudentMarks(child.id);
  const childFees = getStudentFees(child.id);
  const childLeaves = AppState.leaves.filter(l => l.student_id === child.id);
  const avgAtt = childAttendance.length > 0
    ? (childAttendance.reduce((s, a) => s + a.percentage, 0) / childAttendance.length).toFixed(1)
    : child.overall_attendance;
  const parentNotifications = AppState.notifications.filter(n => n.recipient_type === 'parent' && (n.recipient_id === parentProfile.id || n.recipient_id === child.id));

  const totalCredits = childMarks.reduce((sum, m) => sum + (m.credits || 4), 0);
  const totalMarksObtained = childMarks.reduce((sum, m) => sum + m.total, 0).toFixed(1);
  const maxMarksPossible = childMarks.length * 100;
  const avgScore = childMarks.length > 0 ? (childMarks.reduce((sum, m) => sum + m.total, 0) / childMarks.length).toFixed(1) : (child.cgpa * 9.5).toFixed(1);

  const attRisk = parseFloat(avgAtt) < 75 ? 'Critical' : parseFloat(avgAtt) < 85 ? 'Moderate' : 'Good';
  const attRiskColor = attRisk === 'Critical' ? '#da1e28' : attRisk === 'Moderate' ? 'var(--status-warning)' : 'var(--status-success)';

  main.innerHTML = `
    <!-- Topbar -->
    <div class="dash-topbar">
      <div class="dash-title-group">
        <h2>Parent / Guardian Portal</h2>
        <p>Monitoring academic profile of <strong>${child.full_name}</strong> · ${child.roll_number}</p>
      </div>
      <div class="dash-actions-group">
        <div style="display: flex; align-items: center; gap: 0.6rem; background: var(--bg-secondary); padding: 0.4rem 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <label style="font-size: 0.82rem; font-weight: 700; white-space: nowrap; color: var(--text-muted);">
            <i class="fa-solid fa-arrows-rotate text-primary"></i> Switch Child:
          </label>
          <select class="form-control" style="font-weight: 700; padding: 0.3rem 0.6rem; font-size: 0.85rem; max-width: 280px;" onchange="handleDashProfileChange(this.value)">
            ${AppState.parents.map(p => {
              const s = AppState.students.find(st => st.id === p.student_id);
              return `<option value="${p.id}" ${p.id === parentProfile.id ? 'selected' : ''}>${p.full_name} → ${s ? s.full_name : 'Student'}</option>`;
            }).join('')}
          </select>
        </div>
        ${parentNotifications.length > 0 ? `
        <div style="background: rgba(218,30,40,0.1); border: 1px solid rgba(218,30,40,0.3); color: #da1e28; padding: 0.4rem 0.8rem; border-radius: var(--radius-md); font-size: 0.83rem; font-weight: 700;">
          <i class="fa-solid fa-bell fa-shake"></i> ${parentNotifications.filter(n => !n.is_read).length} Alert${parentNotifications.filter(n => !n.is_read).length !== 1 ? 's' : ''}
        </div>` : ''}
      </div>
    </div>

    <!-- SUB-TAB 1: CHILD OVERVIEW -->
    <div class="dash-tab-pane ${initialTab === 'child_overview' ? 'active' : ''}" id="pane_child_overview">
      <!-- KPI Cards -->
      <div class="dash-cards-grid">
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Attendance Rate</span><div class="dash-card-icon" style="background: rgba(15,98,254,0.12); color: var(--ibm-blue-60);"><i class="fa-solid fa-clipboard-check"></i></div></div>
          <div class="dash-card-value" style="color:${attRiskColor};">${avgAtt}%</div>
          <div class="dash-card-sub" style="color:${attRiskColor};"><i class="fa-solid fa-circle-dot"></i> ${attRisk} Status</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Current CGPA</span><div class="dash-card-icon" style="background: rgba(0,157,154,0.12); color: var(--ibm-teal-40);"><i class="fa-solid fa-graduation-cap"></i></div></div>
          <div class="dash-card-value">${child.cgpa}</div>
          <div class="dash-card-sub">Semester ${child.semester || 6} · ${(child.department || 'Computer Science').split('&')[0].trim()}</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Fee Status</span><div class="dash-card-icon" style="background: rgba(36,161,72,0.12); color: var(--status-success);"><i class="fa-solid fa-file-invoice-dollar"></i></div></div>
          <div class="dash-card-value" style="color: ${childFees.status === 'Paid' ? 'var(--status-success)' : childFees.status === 'Partial' ? 'var(--status-warning)' : '#da1e28'};">${childFees.status}</div>
          <div class="dash-card-sub">Due: ₹${Number(childFees.due_amount || 0).toLocaleString()}</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Pending Alerts</span><div class="dash-card-icon" style="background: rgba(218,30,40,0.12); color: #da1e28;"><i class="fa-solid fa-bell"></i></div></div>
          <div class="dash-card-value" style="color: ${parentNotifications.filter(n=>!n.is_read).length > 0 ? '#da1e28' : 'var(--status-success)'};">${parentNotifications.filter(n=>!n.is_read).length}</div>
          <div class="dash-card-sub">Unread Notifications</div>
        </div>
      </div>

      <!-- Child Profile + Alerts Combined Card -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; flex-wrap: wrap;">
        <!-- Child Profile -->
        <div class="timetable-card">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-id-card text-primary"></i> Ward Academic Profile</h3>
          <div style="display: flex; gap: 1.2rem; align-items: flex-start;">
            <img src="${child.avatar_url}" alt="${child.full_name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-primary);">
            <div>
              <p style="font-size: 1.15rem; font-weight: 800; margin: 0;">${child.full_name}</p>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.2rem 0;"><code>${child.roll_number}</code></p>
              <p style="font-size: 0.85rem; margin: 0.3rem 0;">${child.department}</p>
              <p style="font-size: 0.82rem; margin: 0.2rem 0; color: var(--text-muted);">Mentor: <strong>${child.mentor_name}</strong></p>
              <span class="tier-status ${child.status === 'Active' ? 'status-running' : 'status-stopped'}" style="margin-top: 0.4rem; display: inline-block;">${child.status}</span>
            </div>
          </div>
          <hr style="border-color: var(--border-subtle); margin: 1rem 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
            <div style="font-size: 0.83rem;"><span style="color: var(--text-muted);">Semester:</span> <strong>Sem ${child.semester}</strong></div>
            <div style="font-size: 0.83rem;"><span style="color: var(--text-muted);">Guardian:</span> <strong>${parentProfile.full_name}</strong></div>
            <div style="font-size: 0.83rem;"><span style="color: var(--text-muted);">Relation:</span> <strong>${parentProfile.relationship}</strong></div>
            <div style="font-size: 0.83rem;"><span style="color: var(--text-muted);">Phone:</span> <strong>${parentProfile.phone}</strong></div>
          </div>
        </div>

        <!-- Parent Notifications -->
        <div class="timetable-card">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-bell" style="color: #da1e28;"></i> Academic Alerts</h3>
          ${parentNotifications.length === 0
            ? `<div style="text-align: center; padding: 1.5rem; color: var(--text-muted);"><i class="fa-solid fa-circle-check" style="font-size: 2rem; color: var(--status-success);"></i><p style="margin-top: 0.5rem;">No urgent alerts. Your ward is on track!</p></div>`
            : parentNotifications.map(n => `
              <div style="border-left: 3px solid ${n.priority === 'Urgent' ? '#da1e28' : 'var(--accent-primary)'}; padding: 0.7rem 1rem; margin-bottom: 0.8rem; background: var(--bg-secondary); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: ${n.priority === 'Urgent' ? '#da1e28' : 'var(--ibm-blue-60)'}; text-transform: uppercase;">${n.priority} · ${n.category}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${(n.created_at || new Date().toISOString()).split('T')[0]}</span>
                </div>
                <p style="font-weight: 700; font-size: 0.88rem; margin: 0;">${n.title}</p>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.3rem 0 0;">${n.message}</p>
              </div>`).join('')
          }
        </div>
      </div>
    </div>

    <!-- SUB-TAB 2: ATTENDANCE BREAKDOWN -->
    <div class="dash-tab-pane ${initialTab === 'child_attendance' ? 'active' : ''}" id="pane_child_attendance">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-clipboard-check text-primary"></i> ${child.full_name}'s Attendance Breakdown</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Course-wise attendance record for Semester ${child.semester}</p>
          </div>
          <span class="tier-status" style="background:${parseFloat(avgAtt) < 75 ? 'rgba(218,30,40,0.12)' : 'rgba(36,161,72,0.12)'}; color:${parseFloat(avgAtt) < 75 ? '#da1e28' : 'var(--status-success)'}; font-size:1rem; padding: 0.4rem 1rem;">Overall: ${avgAtt}%</span>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Course Code</th><th>Course Name</th><th>Classes Held</th><th>Attended</th><th>Attendance %</th><th>Status</th></tr></thead>
            <tbody>
              ${childAttendance.map(a => {
                const color = a.percentage >= 85 ? 'var(--status-success)' : a.percentage >= 75 ? 'var(--status-warning)' : '#da1e28';
                const label = a.percentage >= 85 ? 'Good' : a.percentage >= 75 ? 'Warning' : 'Debarment Risk';
                return `<tr>
                  <td><code>${a.course_code}</code></td>
                  <td>${a.course_name}</td>
                  <td>${a.total_classes}</td>
                  <td>${a.attended_classes}</td>
                  <td><strong style="color:${color};">${a.percentage}%</strong></td>
                  <td><span style="font-weight:700; color:${color}; background:rgba(0,0,0,0.06); padding:3px 10px; border-radius:30px; font-size:0.8rem;">${label}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 3: GRADES & PROGRESS REPORT -->
    <div class="dash-tab-pane ${initialTab === 'child_marks' ? 'active' : ''}" id="pane_child_marks">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0;"><i class="fa-solid fa-award text-primary"></i> ${child.full_name}'s Progress Report</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0;">Semester ${child.semester} Official Academic Grade Card · ${child.department}</p>
          </div>
          <div style="display: flex; gap: 0.6rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="window.print()" title="Print or save as PDF">
              <i class="fa-solid fa-print"></i> Print Grade Sheet
            </button>
            <button class="btn btn-primary btn-sm" onclick="showToast('Official encrypted grade report downloaded.', 'success')">
              <i class="fa-solid fa-file-pdf"></i> Download PDF
            </button>
          </div>
        </div>

        <!-- Academic Performance Highlights Grid -->
        <div class="dash-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-bottom: 1.5rem;">
          <div class="dash-card">
            <div class="dash-card-header"><span class="dash-card-title">Cumulative GPA</span><div class="dash-card-icon" style="background: rgba(15,98,254,0.12); color: var(--ibm-blue-60);"><i class="fa-solid fa-graduation-cap"></i></div></div>
            <div class="dash-card-value" style="color: ${parseFloat(child.cgpa) >= 8.5 ? 'var(--status-success)' : parseFloat(child.cgpa) >= 7.0 ? 'var(--ibm-blue-60)' : '#da1e28'};">${child.cgpa}</div>
            <div class="dash-card-sub">${parseFloat(child.cgpa) >= 9.0 ? 'Honors / Distinction' : parseFloat(child.cgpa) >= 8.0 ? 'First Class' : parseFloat(child.cgpa) >= 6.5 ? 'Second Class' : 'Remedial Advisory'}</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-header"><span class="dash-card-title">Enrolled Credits</span><div class="dash-card-icon" style="background: rgba(0,157,154,0.12); color: var(--ibm-teal-40);"><i class="fa-solid fa-book-bookmark"></i></div></div>
            <div class="dash-card-value">${totalCredits}</div>
            <div class="dash-card-sub">${childMarks.length} Core Subjects</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-header"><span class="dash-card-title">Average Score</span><div class="dash-card-icon" style="background: rgba(36,161,72,0.12); color: var(--status-success);"><i class="fa-solid fa-chart-line"></i></div></div>
            <div class="dash-card-value">${avgScore}%</div>
            <div class="dash-card-sub">Agg: ${totalMarksObtained} / ${maxMarksPossible}</div>
          </div>
          <div class="dash-card">
            <div class="dash-card-header"><span class="dash-card-title">Academic Standing</span><div class="dash-card-icon" style="background: ${child.status === 'Active' ? 'rgba(36,161,72,0.12)' : 'rgba(218,30,40,0.12)'}; color: ${child.status === 'Active' ? 'var(--status-success)' : '#da1e28'};"><i class="fa-solid fa-shield-halved"></i></div></div>
            <div class="dash-card-value" style="font-size: 1.15rem; color: ${child.status === 'Active' ? 'var(--status-success)' : '#da1e28'};">${child.status}</div>
            <div class="dash-card-sub">Mentor: ${child.mentor_name ? child.mentor_name.split(' ').slice(-1)[0] : 'Advisor'}</div>
          </div>
        </div>

        <!-- Course Marks Breakdown Table -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Internal (30)</th>
                <th>Midterm (50)</th>
                <th>Assignment (20)</th>
                <th>Total (100)</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${childMarks.map(m => {
                const gradeColor = m.grade === 'A+' ? 'var(--status-success)' : m.grade === 'A' ? 'var(--ibm-teal-40)' : (m.grade === 'B+' || m.grade === 'B') ? 'var(--ibm-blue-60)' : m.grade === 'C' ? 'var(--status-warning)' : '#da1e28';
                const statusBadge = m.total >= 90 ? 'Outstanding' : m.total >= 80 ? 'Excellent' : m.total >= 70 ? 'Very Good' : m.total >= 60 ? 'Good' : m.total >= 50 ? 'Pass' : 'Remedial Required';
                const statusBg = m.total >= 75 ? 'rgba(36,161,72,0.1)' : m.total >= 50 ? 'rgba(15,98,254,0.1)' : 'rgba(218,30,40,0.1)';
                return `<tr>
                  <td><code style="font-weight:700;">${m.course_code}</code></td>
                  <td style="font-weight:600;">${m.course_name}</td>
                  <td><span style="background:var(--bg-secondary); border:1px solid var(--border-subtle); padding:2px 8px; border-radius:4px; font-size:0.8rem; font-weight:700;">${m.credits || 4} Cr</span></td>
                  <td><strong>${m.internal}</strong> <small style="color:var(--text-muted);">/ 30</small></td>
                  <td><strong>${m.midterm}</strong> <small style="color:var(--text-muted);">/ 50</small></td>
                  <td><strong>${m.assignment}</strong> <small style="color:var(--text-muted);">/ 20</small></td>
                  <td><strong style="font-size:1.05rem;">${m.total}</strong> <small style="color:var(--text-muted);">/ 100</small></td>
                  <td><span style="font-weight:800; font-size:1rem; color:${gradeColor}; background:rgba(0,0,0,0.06); padding:4px 12px; border-radius:20px;">${m.grade}</span></td>
                  <td><span style="font-size:0.8rem; font-weight:700; color:${gradeColor}; background:${statusBg}; padding:3px 8px; border-radius:4px;">${statusBadge}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Academic Advisor Note Card -->
        <div style="margin-top: 1.5rem; background: var(--bg-secondary); border-left: 4px solid var(--accent-primary); padding: 1rem 1.4rem; border-radius: 0 var(--radius-md) var(--radius-md) 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-weight: 800; font-size: 0.92rem;"><i class="fa-solid fa-comment-dots text-primary"></i> Faculty Mentor Advisory Note</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Assigned Mentor: <strong>${child.mentor_name}</strong></span>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted); margin: 0; line-height: 1.5;">
            ${parseFloat(child.cgpa) >= 8.5
              ? `${child.full_name} is performing exceptionally well across all subjects with an outstanding CGPA of ${child.cgpa}. Eligible for Honors Degree track and IBM Cloud research fellowship nominations.`
              : parseFloat(child.cgpa) >= 7.0
              ? `${child.full_name} maintains good academic standing (CGPA: ${child.cgpa}). Continuous participation in laboratory assessments and microservice development projects is commended.`
              : `Academic alert: ${child.full_name}'s scores indicate need for guided assistance and mandatory attendance at Friday remedial tutorials. Please coordinate with ${child.mentor_name} for personal mentorship.`}
          </p>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 4: FEE STATUS -->
    <div class="dash-tab-pane ${initialTab === 'child_fees' ? 'active' : ''}" id="pane_child_fees">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-file-invoice-dollar" style="color: var(--status-success);"></i> Fee Status & Payment Details</h3>
        <div class="dash-cards-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 1.5rem;">
          <div class="dash-card"><div class="dash-card-header"><span class="dash-card-title">Total Fee</span></div><div class="dash-card-value">₹${Number(childFees.total_amount || 0).toLocaleString()}</div><div class="dash-card-sub">Sem ${childFees.semester || child.semester || 6}</div></div>
          <div class="dash-card"><div class="dash-card-header"><span class="dash-card-title">Amount Paid</span></div><div class="dash-card-value" style="color:var(--status-success);">₹${Number(childFees.paid_amount || 0).toLocaleString()}</div></div>
          <div class="dash-card"><div class="dash-card-header"><span class="dash-card-title">Amount Due</span></div><div class="dash-card-value" style="color:${Number(childFees.due_amount || 0) > 0 ? '#da1e28' : 'var(--status-success)'};">₹${Number(childFees.due_amount || 0).toLocaleString()}</div></div>
          <div class="dash-card"><div class="dash-card-header"><span class="dash-card-title">Status</span></div><div class="dash-card-value" style="color:${childFees.status === 'Paid' ? 'var(--status-success)' : '#da1e28'};">${childFees.status}</div></div>
        </div>
        ${childFees.receipt_no ? `
        <div style="background: var(--bg-secondary); padding: 1rem 1.4rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
            <div><span style="color:var(--text-muted); font-size:0.83rem;">Receipt Number</span><p style="font-weight:700;"><code>${childFees.receipt_no}</code></p></div>
            <div><span style="color:var(--text-muted); font-size:0.83rem;">Payment Date</span><p style="font-weight:700;">${childFees.payment_date}</p></div>
            <div><span style="color:var(--text-muted); font-size:0.83rem;">Student</span><p style="font-weight:700;">${child.full_name}</p></div>
            <div><span style="color:var(--text-muted); font-size:0.83rem;">Roll Number</span><p style="font-weight:700;"><code>${child.roll_number}</code></p></div>
          </div>
        </div>` : `<p style="color: var(--text-muted);">No payment receipt available yet.</p>`}
      </div>
    </div>

    <!-- SUB-TAB 5: WARD LEAVE HISTORY -->
    <div class="dash-tab-pane ${initialTab === 'child_leaves' ? 'active' : ''}" id="pane_child_leaves">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-calendar-minus" style="color: var(--ibm-teal-40);"></i> Leave History — ${child.full_name}</h3>
        ${childLeaves.length === 0
          ? `<div style="text-align: center; padding: 2.5rem; color: var(--text-muted);"><i class="fa-solid fa-calendar-check" style="font-size: 2.5rem; color: var(--ibm-teal-40);"></i><p style="margin-top: 0.7rem;">No leave applications on record for this student.</p></div>`
          : `<div class="table-responsive">
              <table class="data-table">
                <thead><tr><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Reviewed By</th></tr></thead>
                <tbody>
                  ${childLeaves.map(l => {
                    const color = l.status === 'Approved' ? 'var(--status-success)' : l.status === 'Pending' ? 'var(--status-warning)' : '#da1e28';
                    return `<tr>
                      <td><strong>${l.leave_type}</strong></td>
                      <td>${l.start_date}</td>
                      <td>${l.end_date}</td>
                      <td>${l.days_count} day${l.days_count > 1 ? 's' : ''}</td>
                      <td style="font-size:0.84rem; max-width:200px;">${l.reason}</td>
                      <td><span style="font-weight:700; color:${color};">${l.status}</span></td>
                      <td style="font-size:0.83rem; color:var(--text-muted);">${l.reviewer_name || 'Awaiting'}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`
        }
      </div>
    </div>

    <!-- SUB-TAB 6: EXAMINATION TIMETABLE -->
    <div class="dash-tab-pane ${initialTab === 'child_exams' ? 'active' : ''}" id="pane_child_exams">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;"><i class="fa-solid fa-id-card text-primary"></i> Semester Examination Schedule</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.4rem;">End-semester examination timetable for <strong>${child.full_name}</strong> (${child.roll_number}), Semester ${child.semester}.</p>
        ${AppState.exams.length > 0
          ? `<div class="table-responsive"><table class="data-table"><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Hall</th><th>Status</th></tr></thead><tbody>${AppState.exams.map(e => `<tr><td><strong>${e.subject_name || e.course_name}</strong></td><td>${e.exam_date}</td><td>${e.exam_time || '10:00 AM'}</td><td>${e.hall || 'TBA'}</td><td><span class="tier-status status-running">Scheduled</span></td></tr>`).join('')}</tbody></table></div>`
          : `<div style="display: grid; gap: 0.8rem;">
              ${childAttendance.map((a, i) => {
                const examDates = ['2026-05-06', '2026-05-08', '2026-05-10', '2026-05-13', '2026-05-15'];
                const halls = ['Block A - Hall 101', 'Block B - Hall 201', 'Block C - Hall 301', 'Block A - Hall 102', 'Block D - Hall 401'];
                return `<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.2rem; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div>
                    <p style="font-weight: 700; margin: 0;"><code>${a.course_code}</code> — ${a.course_name}</p>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.2rem 0 0;">${halls[i % halls.length]}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="font-weight: 700; color: var(--accent-primary); margin: 0;">${examDates[i % examDates.length]}</p>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.2rem 0 0;">10:00 AM – 1:00 PM</p>
                  </div>
                </div>`;
              }).join('')}
            </div>`
        }
      </div>
    </div>
  `;

  // Force-activate the correct pane and sidebar highlight after every render
  const parentValidTabs = ['child_overview', 'child_attendance', 'child_marks', 'child_fees', 'child_leaves', 'child_exams'];
  const activeParentTab = (initialTab && parentValidTabs.includes(initialTab)) ? initialTab : 'child_overview';
  requestAnimationFrame(() => switchDashboardTab(activeParentTab));
}

// --------------------------------------------------------------------
// ADMIN DASHBOARD MAIN STAGE
// --------------------------------------------------------------------
function renderAdminMainStage(initialTab) {
  const main = document.getElementById('dashMainContent');
  if (!main) return;

  main.innerHTML = `
    <!-- Topbar -->
    <div class="dash-topbar">
      <div class="dash-title-group">
        <h2>System Administration & Infrastructure</h2>
        <p>Cluster Telemetry, Docker Orchestration & University Directory</p>
      </div>
      <div class="dash-actions-group">
        <button class="btn btn-secondary btn-sm" onclick="openModal('announcementModal')">
          <i class="fa-solid fa-bullhorn"></i> New Announcement
        </button>
        <button class="btn btn-primary btn-sm" onclick="openModal('addStudentModal')">
          <i class="fa-solid fa-user-plus"></i> Enroll Student
        </button>
      </div>
    </div>

    <!-- SUB-TAB 1: TELEMETRY (CONTAINER STATUS) -->
    <div class="dash-tab-pane ${initialTab === 'telemetry' ? 'active' : ''}" id="pane_telemetry">
      <div class="dash-cards-grid">
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Enrolled Students</span><div class="dash-card-icon" style="background: rgba(15, 98, 254, 0.15); color: var(--ibm-blue-60);"><i class="fa-solid fa-user-graduate"></i></div></div>
          <div class="dash-card-value">5,420</div>
          <div class="dash-card-sub"><i class="fa-solid fa-arrow-up text-primary"></i> +180 this semester</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Active Faculty</span><div class="dash-card-icon" style="background: rgba(0, 157, 154, 0.15); color: var(--ibm-teal-40);"><i class="fa-solid fa-chalkboard-user"></i></div></div>
          <div class="dash-card-value">264</div>
          <div class="dash-card-sub">12 Academic Depts</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Total Courses</span><div class="dash-card-icon" style="background: rgba(51, 177, 255, 0.15); color: var(--accent-cyan);"><i class="fa-solid fa-book-open"></i></div></div>
          <div class="dash-card-value">58</div>
          <div class="dash-card-sub">Accredited Degrees</div>
        </div>

        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Cluster Uptime</span><div class="dash-card-icon" style="background: rgba(36, 161, 72, 0.15); color: var(--status-success);"><i class="fa-solid fa-heart-pulse"></i></div></div>
          <div class="dash-card-value" style="color: var(--status-success);">99.98%</div>
          <div class="dash-card-sub">Health Check Verified</div>
        </div>
      </div>

      <!-- Dedicated Live Container Cluster Status Panel -->
      <div class="telemetry-panel">
        <div class="telemetry-header">
          <div class="telemetry-title">
            <i class="fa-brands fa-docker text-primary" style="font-size: 1.6rem;"></i>
            <span>Live Container Cluster Status</span>
          </div>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-outline btn-sm" onclick="pingContainerHealth()">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh Telemetry
            </button>
            <button class="btn btn-cyan btn-sm" onclick="simulateContainerAction('backend', 'restart')">
              <i class="fa-solid fa-triangle-exclamation"></i> Simulate Container Failover
            </button>
          </div>
        </div>
        <div class="telemetry-grid" id="adminTelemetryBoxes">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>

    <!-- SUB-TAB 2: MANAGE STUDENTS -->
    <div class="dash-tab-pane ${initialTab === 'students' ? 'active' : ''}" id="pane_students">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; flex-wrap: gap; gap: 1rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800;"><i class="fa-solid fa-users-gear text-primary"></i> Registered Students Directory</h3>
          <input type="text" placeholder="Filter by name or roll number..." class="form-control" style="max-width: 280px;" oninput="filterAdminStudents(this.value)">
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Roll No</th><th>Full Name</th><th>Email</th><th>Department</th><th>CGPA</th><th>Attendance</th><th>Action</th></tr>
            </thead>
            <tbody id="adminStudentTableBody">
              ${AppState.students.map(s => `
                <tr id="stdRow_${s.id}">
                  <td>#${s.id}</td>
                  <td><code>${s.roll_number}</code></td>
                  <td><strong>${s.full_name}</strong></td>
                  <td>${s.email}</td>
                  <td>${s.department}</td>
                  <td>${s.cgpa}</td>
                  <td><span class="tier-status status-running">${s.overall_attendance}%</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" style="color: var(--status-danger);" onclick="deleteStudent(${s.id})">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 3: MANAGE FACULTY -->
    <div class="dash-tab-pane ${initialTab === 'faculty' ? 'active' : ''}" id="pane_faculty">
      <div class="timetable-card">
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1.2rem;">Faculty Members Directory</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Emp ID</th><th>Faculty Name</th><th>Designation</th><th>Department</th><th>Cabin</th></tr></thead>
            <tbody>
              ${AppState.faculty.map(f => `
                <tr>
                  <td><code>${f.employee_id}</code></td>
                  <td><strong>${f.full_name}</strong></td>
                  <td>${f.designation}</td>
                  <td>${f.department}</td>
                  <td>${f.cabin_location}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 4: ANNOUNCEMENTS -->
    <div class="dash-tab-pane ${initialTab === 'announcements' ? 'active' : ''}" id="pane_announcements">
      <div class="timetable-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 800;">Manage Campus Notices</h3>
          <button class="btn btn-primary btn-sm" onclick="openModal('announcementModal')"><i class="fa-solid fa-bullhorn"></i> New Announcement</button>
        </div>
        <div class="announcements-list">
          ${AppState.announcements.map(a => `
            <div class="announcement-item" id="ann_item_${a.id}">
              <div class="ann-top-row">
                <div class="ann-title-wrap">
                  <span class="ann-priority-badge priority-${a.priority}">${a.priority}</span>
                  <h4 class="ann-title">${a.title}</h4>
                </div>
                <button class="btn btn-secondary btn-sm" style="color: var(--status-danger);" onclick="deleteAnnouncementItem(${a.id})">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <p class="ann-content">${a.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- SUB-TAB 5: AI ACADEMIC INTELLIGENCE -->
    <div class="dash-tab-pane ${initialTab === 'admin_intel' ? 'active' : ''}" id="pane_admin_intel">
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.3rem;"><i class="fa-solid fa-brain" style="color: var(--accent-cyan);"></i> AI Academic Intelligence Engine</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Real-time AI-driven analytics across student performance, attendance trends, placement readiness, and departmental health.</p>
      </div>

      <!-- Risk Summary KPIs -->
      <div class="dash-cards-grid" style="margin-bottom: 1.5rem;">
        <div class="dash-card" style="border-left: 4px solid #da1e28;">
          <div class="dash-card-header"><span class="dash-card-title">Critical Risk Students</span><div class="dash-card-icon" style="background:rgba(218,30,40,0.1);color:#da1e28;"><i class="fa-solid fa-circle-exclamation"></i></div></div>
          <div class="dash-card-value" style="color:#da1e28;">${AppState.students.filter(s => s.overall_attendance < 70 || s.cgpa < 5.5).length}</div>
          <div class="dash-card-sub">Attendance &lt;70% or CGPA &lt;5.5</div>
        </div>
        <div class="dash-card" style="border-left: 4px solid var(--status-warning);">
          <div class="dash-card-header"><span class="dash-card-title">At-Risk Students</span><div class="dash-card-icon" style="background:rgba(241,194,27,0.1);color:var(--status-warning);"><i class="fa-solid fa-triangle-exclamation"></i></div></div>
          <div class="dash-card-value" style="color:var(--status-warning);">${AppState.students.filter(s => (s.overall_attendance >= 70 && s.overall_attendance < 80) || (s.cgpa >= 5.5 && s.cgpa < 6.5)).length}</div>
          <div class="dash-card-sub">Attendance 70–80% or CGPA 5.5–6.5</div>
        </div>
        <div class="dash-card" style="border-left: 4px solid var(--status-success);">
          <div class="dash-card-header"><span class="dash-card-title">Performing Well</span><div class="dash-card-icon" style="background:rgba(36,161,72,0.1);color:var(--status-success);"><i class="fa-solid fa-shield-check"></i></div></div>
          <div class="dash-card-value" style="color:var(--status-success);">${AppState.students.filter(s => s.overall_attendance >= 80 && s.cgpa >= 7.0).length}</div>
          <div class="dash-card-sub">Attendance ≥80% and CGPA ≥7.0</div>
        </div>
        <div class="dash-card" style="border-left: 4px solid #6929c4;">
          <div class="dash-card-header"><span class="dash-card-title">Placement Ready</span><div class="dash-card-icon" style="background:rgba(105,41,196,0.1);color:#6929c4;"><i class="fa-solid fa-briefcase"></i></div></div>
          <div class="dash-card-value" style="color:#6929c4;">${AppState.placement.filter(p => p.readiness_score >= 80).length}</div>
          <div class="dash-card-sub">Score ≥80 (Tier 1 Ready)</div>
        </div>
      </div>

      <!-- AI Risk Student Matrix -->
      <div class="timetable-card" style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem;"><i class="fa-solid fa-table-list text-primary"></i> Full Student Risk Matrix</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Dept</th><th>Attendance</th><th>CGPA</th><th>Placement Score</th><th>Risk Level</th><th>AI Recommendation</th></tr></thead>
            <tbody>
              ${AppState.students.map(s => {
                const placement = AppState.placement.find(p => p.student_id === s.id);
                const placementScore = placement ? placement.readiness_score : 'N/A';
                const risk = s.overall_attendance < 70 || s.cgpa < 5.5 ? 'Critical'
                           : s.overall_attendance < 80 || s.cgpa < 6.5 ? 'At Risk'
                           : 'Safe';
                const riskColor = risk === 'Critical' ? '#da1e28' : risk === 'At Risk' ? 'var(--status-warning)' : 'var(--status-success)';
                const recs = risk === 'Critical' ? 'Immediate remedial counselling + parental notification' :
                             risk === 'At Risk' ? 'Weekly mentor check-in + attendance monitoring' : 'Maintain current trajectory';
                return `<tr>
                  <td><strong>${s.full_name}</strong><br><code style="font-size:0.74rem;">${s.roll_number}</code></td>
                  <td style="font-size:0.82rem;">${s.department.split('&')[0].trim()}</td>
                  <td><span style="font-weight:700; color:${s.overall_attendance<75?'#da1e28':'var(--status-success)'}">${s.overall_attendance}%</span></td>
                  <td><strong>${s.cgpa}</strong></td>
                  <td>${placementScore !== 'N/A' ? `<strong style="color:${placementScore>=80?'var(--status-success)':placementScore>=60?'var(--status-warning)':'#da1e28'}">${placementScore}</strong>` : '<span style="color:var(--text-muted);">—</span>'}</td>
                  <td><span style="font-weight:700; color:${riskColor}; background:rgba(0,0,0,0.06); padding:3px 10px; border-radius:30px; font-size:0.79rem;">${risk}</span></td>
                  <td style="font-size:0.82rem; color:var(--text-muted);">${recs}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Placement Intelligence -->
      <div class="timetable-card">
        <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem;"><i class="fa-solid fa-briefcase" style="color:#6929c4;"></i> Placement Readiness Intelligence</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Target Role</th><th>Coding</th><th>Aptitude</th><th>Interview</th><th>Overall Score</th><th>Tier</th><th>Offers</th></tr></thead>
            <tbody>
              ${AppState.placement.map(p => {
                const tier = p.tier || 'Tier 2 Core Engineering';
                const tierColor = tier.includes('Tier 1') ? 'var(--status-success)' : tier.includes('Tier 2') ? 'var(--ibm-blue-60)' : 'var(--status-warning)';
                return `<tr>
                  <td><strong>${p.student_name}</strong></td>
                  <td style="font-size:0.83rem;">${p.target_role}</td>
                  <td>${p.coding_score}</td>
                  <td>${p.aptitude_score}</td>
                  <td>${p.mock_interview_score}</td>
                  <td><strong style="color:${p.readiness_score>=80?'var(--status-success)':p.readiness_score>=60?'var(--status-warning)':'#da1e28'}">${p.readiness_score}</strong></td>
                  <td style="font-size:0.8rem; color:${tierColor}; font-weight:700;">${tier.split('(')[0].trim()}</td>
                  <td><strong>${p.offers_count}</strong></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SUB-TAB 6: OPERATIONS HUB -->
    <div class="dash-tab-pane ${initialTab === 'admin_ops' ? 'active' : ''}" id="pane_admin_ops">
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.3rem;"><i class="fa-solid fa-list-check" style="color: var(--ibm-teal-40);"></i> Operations Hub</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Manage fee overdue alerts, certificate approvals, attendance override requests, and campus-wide operational controls.</p>
      </div>

      <!-- Ops KPI Cards -->
      <div class="dash-cards-grid" style="margin-bottom: 1.5rem;">
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Fee Overdue</span><div class="dash-card-icon" style="background:rgba(218,30,40,0.1);color:#da1e28;"><i class="fa-solid fa-file-invoice-dollar"></i></div></div>
          <div class="dash-card-value" style="color:#da1e28;">${AppState.fees.filter(f=>f.status==='Overdue'||f.status==='Partial').length}</div>
          <div class="dash-card-sub">Students with dues</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Pending Certs</span><div class="dash-card-icon" style="background:rgba(15,98,254,0.1);color:var(--ibm-blue-60);"><i class="fa-solid fa-stamp"></i></div></div>
          <div class="dash-card-value">${AppState.certificates.filter(c=>c.status==='Pending Review').length}</div>
          <div class="dash-card-sub">Awaiting review</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Leave Requests</span><div class="dash-card-icon" style="background:rgba(0,157,154,0.1);color:var(--ibm-teal-40);"><i class="fa-solid fa-calendar-minus"></i></div></div>
          <div class="dash-card-value">${AppState.leaves.filter(l=>l.status==='Pending').length}</div>
          <div class="dash-card-sub">Pending approval</div>
        </div>
        <div class="dash-card">
          <div class="dash-card-header"><span class="dash-card-title">Att. Overrides</span><div class="dash-card-icon" style="background:rgba(241,194,27,0.1);color:var(--status-warning);"><i class="fa-solid fa-key"></i></div></div>
          <div class="dash-card-value" style="color:var(--status-warning);" id="overrideCountBadge">${AppState.attendanceOverrides.filter(o=>o.status==='Pending').length}</div>
          <div class="dash-card-sub">Faculty override requests</div>
        </div>
      </div>

      <!-- Attendance Override Access — Admin Control Panel -->
      <div class="timetable-card" style="margin-bottom: 1.5rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:0.8rem;">
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; margin:0;"><i class="fa-solid fa-key" style="color:var(--status-warning);"></i> Attendance Override Access Control</h3>
            <p style="font-size:0.82rem; color:var(--text-muted); margin:0.3rem 0 0;">Grant or revoke faculty permission to mark attendance for students outside their assigned subjects.</p>
          </div>
          <span class="tier-status status-restarting">${AppState.attendanceOverrides.filter(o=>o.status==='Pending').length} Pending Requests</span>
        </div>

        <!-- Admin: Direct Grant Form -->
        <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1rem 1.2rem; margin-bottom:1.2rem;">
          <p style="font-weight:700; font-size:0.9rem; margin:0 0 0.8rem;"><i class="fa-solid fa-shield-halved" style="color:var(--ibm-blue-60);"></i> Admin: Grant Override Directly</p>
          <div style="display:flex; gap:0.8rem; align-items:flex-end; flex-wrap:wrap;">
            <div style="flex:1; min-width:150px;">
              <label style="font-size:0.78rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Select Faculty</label>
              <select id="overrideFacultySelect" class="form-control" style="font-size:0.85rem;">
                ${AppState.faculty.map(f => `<option value="${f.id}" data-name="${f.full_name}">${f.full_name}</option>`).join('')}
              </select>
            </div>
            <div style="flex:1; min-width:150px;">
              <label style="font-size:0.78rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Select Student</label>
              <select id="overrideStudentSelect" class="form-control" style="font-size:0.85rem;">
                ${AppState.students.map(s => `<option value="${s.id}" data-name="${s.full_name}">${s.full_name} (${s.roll_number})</option>`).join('')}
              </select>
            </div>
            <div style="width:170px;">
              <label style="font-size:0.78rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Subject</label>
              <select id="overrideCourseSelect" class="form-control" style="font-size:0.85rem;">
                <option value="CS601">CS601: Cloud Computing</option>
                <option value="CS604">CS604: Container Security</option>
              </select>
            </div>
            <div style="width:105px;">
              <label style="font-size:0.78rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Target %</label>
              <input type="number" id="overrideTargetPctAdmin" class="form-control" value="75.0" min="0" max="100" step="0.1" style="font-size:0.85rem; font-weight:700;">
            </div>
            <div style="flex:1; min-width:140px;">
              <label style="font-size:0.78rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Reason</label>
              <input type="text" id="overrideReasonInput" class="form-control" placeholder="e.g. Dean's Special Sanction" style="font-size:0.85rem;">
            </div>
            <button class="btn btn-primary" style="white-space:nowrap;" onclick="adminGrantOverride()">
              <i class="fa-solid fa-unlock"></i> Grant Permission
            </button>
          </div>
        </div>

        <!-- Override Records Table -->
        ${AppState.attendanceOverrides.length === 0
          ? `<div style="text-align:center; padding:1.5rem; color:var(--text-muted);"><i class="fa-solid fa-circle-info" style="font-size:1.8rem; opacity:0.4;"></i><p style="margin-top:0.5rem;">No override records yet. Use the form above to grant access, or faculty can request from their dashboard.</p></div>`
          : `<div class="table-responsive"><table class="data-table">
              <thead><tr><th>Faculty</th><th>Student</th><th>Subject</th><th>Current %</th><th>Requested %</th><th>Reason</th><th>Requested At</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${AppState.attendanceOverrides.map(o => {
                  const sc = o.status==='Approved'?'var(--status-success)':o.status==='Rejected'?'#da1e28':'var(--status-warning)';
                  return `<tr id="override_${o.id}">
                    <td><strong>${o.faculty_name}</strong></td>
                    <td><strong>${o.student_name}</strong><br><code style="font-size:0.75rem;">${o.student_roll || ''}</code></td>
                    <td><span class="badge badge-primary">${o.course_code || 'CS601'}</span></td>
                    <td><span style="font-weight:700; color:${(o.current_percentage||0)<75?'#da1e28':'var(--status-success)'}">${o.current_percentage !== undefined ? o.current_percentage + '%' : '—'}</span></td>
                    <td><strong style="color:var(--status-success); font-size:1.02rem;">${o.requested_percentage !== undefined ? o.requested_percentage + '%' : '—'}</strong></td>
                    <td style="font-size:0.82rem; color:var(--text-muted); max-width:220px;">${o.reason}</td>
                    <td style="font-size:0.82rem; color:var(--text-muted);">${o.requested_at}</td>
                    <td><span style="font-weight:700; color:${sc}; background:rgba(0,0,0,0.06); padding:2px 10px; border-radius:20px; font-size:0.78rem;">${o.status}</span></td>
                    <td>
                      ${o.status === 'Pending' ? `
                      <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-primary btn-sm" onclick="approveAttendanceOverride(${o.id})"><i class="fa-solid fa-check"></i> Grant Permission</button>
                        <button class="btn btn-secondary btn-sm" style="color:#da1e28;" onclick="rejectAttendanceOverride(${o.id})"><i class="fa-solid fa-xmark"></i> Reject</button>
                      </div>` : o.status === 'Approved' ? `
                      <button class="btn btn-secondary btn-sm" style="color:#da1e28; font-size:0.78rem;" onclick="revokeAttendanceOverride(${o.id})"><i class="fa-solid fa-ban"></i> Revoke</button>` : `<span style="font-size:0.82rem; color:var(--text-muted);">—</span>`}
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table></div>`
        }
      </div>

      <!-- Fee Status Overview -->
      <div class="timetable-card" style="margin-bottom:1.5rem;">
        <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:1rem;"><i class="fa-solid fa-file-invoice-dollar" style="color:var(--status-success);"></i> Fee Collection Status</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Semester</th><th>Total Fee</th><th>Paid</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              ${AppState.fees.map(f => {
                const total = Number(f.total_fee !== undefined ? f.total_fee : (f.total_amount !== undefined ? f.total_amount : 85000)) || 85000;
                const paid = Number(f.paid_amount !== undefined ? f.paid_amount : 0);
                const due = Number(f.pending_amount !== undefined ? f.pending_amount : (f.due_amount !== undefined ? f.due_amount : (total - paid))) || 0;
                const name = f.student_name || `Student #${f.student_id || f.id || 1}`;
                const sc = f.status === 'Paid' ? 'var(--status-success)' : f.status === 'Overdue' ? '#da1e28' : 'var(--status-warning)';
                return `<tr>
                  <td><strong>${name}</strong></td>
                  <td>Sem ${f.semester || 6}</td>
                  <td>₹${total.toLocaleString()}</td>
                  <td>₹${paid.toLocaleString()}</td>
                  <td><strong style="color:${due > 0 ? '#da1e28' : 'var(--status-success)'};">₹${due.toLocaleString()}</strong></td>
                  <td><span style="font-weight:700;color:${sc};">${f.status || (due === 0 ? 'Paid' : 'Partial')}</span></td>
                  <td>${due > 0 ? `<button class="btn btn-outline btn-sm" onclick="showToast('Fee reminder sent to ${name}','success')"><i class="fa-solid fa-paper-plane"></i> Send Reminder</button>` : `<span style="color:var(--text-muted);font-size:0.82rem;">—</span>`}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Certificate Requests -->
      <div class="timetable-card">
        <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:1rem;"><i class="fa-solid fa-stamp text-primary"></i> Certificate Request Management</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Certificate Type</th><th>Purpose</th><th>Status</th><th>Serial No</th><th>Action</th></tr></thead>
            <tbody>
              ${AppState.certificates.map(c => {
                const sc = c.status==='Ready for Pickup'||c.status==='Approved'?'var(--status-success)':c.status==='Pending Review'?'var(--status-warning)':'#da1e28';
                return `<tr>
                  <td><strong>${c.student_name}</strong></td>
                  <td>${c.cert_type}</td>
                  <td style="font-size:0.83rem;">${c.purpose}</td>
                  <td><span style="font-weight:700;color:${sc};">${c.status}</span></td>
                  <td><code>${c.serial_no||'Pending'}</code></td>
                  <td>${c.status==='Pending Review'?`
                    <div style="display:flex;gap:0.4rem;">
                      <button class="btn btn-primary btn-sm" onclick="approveCertificate(${c.id})"><i class="fa-solid fa-check"></i> Approve</button>
                    </div>`:c.status==='Approved'||c.status==='Ready for Pickup'?`<span style="color:var(--text-muted);font-size:0.82rem;">Issued</span>`:`<span style="color:var(--text-muted);font-size:0.82rem;">—</span>`}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  renderAdminTelemetryBoxes(AppState.containerStatus);

  // Force-activate the correct pane and sidebar highlight after every render
  const adminValidTabs = ['telemetry', 'admin_intel', 'admin_ops', 'students', 'faculty', 'announcements'];
  const activeAdminTab = (initialTab && adminValidTabs.includes(initialTab)) ? initialTab : 'telemetry';
  requestAnimationFrame(() => switchDashboardTab(activeAdminTab));
}

// --------------------------------------------------------------------
// CONTAINER TELEMETRY & ACTIONS
// --------------------------------------------------------------------
function renderAdminTelemetryBoxes(statusData) {
  const container = document.getElementById('adminTelemetryBoxes');
  if (!container) return;

  const fe = statusData.frontend;
  const be = statusData.backend;
  const db = statusData.database;

  container.innerHTML = `
    <div class="telemetry-box">
      <div class="telemetry-box-head">
        <div class="telemetry-box-title"><i class="fa-brands fa-html5 text-primary"></i> Frontend Container</div>
        <span class="tier-status ${fe.status === 'Running' ? 'status-running' : 'status-restarting'}">
          <i class="fa-solid fa-circle-check"></i> ${fe.status}
        </span>
      </div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Container Name:</span><span class="telemetry-data-val">college_portal_frontend</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Port:</span><span class="telemetry-data-val">${fe.port || '3000 -> 80'}</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Image:</span><span class="telemetry-data-val">nginx:alpine</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">RAM Usage:</span><span class="telemetry-data-val">${fe.memory_mb || '28.4'} MB</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Health Probe:</span><span class="telemetry-data-val" style="color: var(--status-success);">200 OK (HTTP GET)</span></div>
      <div style="margin-top: 1rem;">
        <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="simulateContainerAction('frontend', 'health_probe')">
          <i class="fa-solid fa-stethoscope"></i> Probe Nginx
        </button>
      </div>
    </div>

    <div class="telemetry-box">
      <div class="telemetry-box-head">
        <div class="telemetry-box-title"><i class="fa-brands fa-node-js" style="color: var(--ibm-teal-40);"></i> Backend API Container</div>
        <span class="tier-status ${be.status === 'Running' ? 'status-running' : 'status-restarting'}">
          <i class="fa-solid fa-circle-check"></i> ${be.status}
        </span>
      </div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Container Name:</span><span class="telemetry-data-val">college_portal_backend</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Port:</span><span class="telemetry-data-val">${be.port || '5000:5000'}</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Image:</span><span class="telemetry-data-val">node:20-alpine</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">RAM Usage:</span><span class="telemetry-data-val">${be.memory_mb || '64.2'} MB</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Health Probe:</span><span class="telemetry-data-val" style="color: var(--status-success);">/api/health (200 OK)</span></div>
      <div style="margin-top: 1rem;">
        <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="simulateContainerAction('backend', 'restart')">
          <i class="fa-solid fa-rotate"></i> Restart Microservice
        </button>
      </div>
    </div>

    <div class="telemetry-box">
      <div class="telemetry-box-head">
        <div class="telemetry-box-title"><i class="fa-solid fa-database text-primary"></i> Database Container</div>
        <span class="tier-status ${db.status === 'Connected' ? 'status-running' : 'status-restarting'}">
          <i class="fa-solid fa-link"></i> ${db.status}
        </span>
      </div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Container Name:</span><span class="telemetry-data-val">college_portal_db</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Port:</span><span class="telemetry-data-val">${db.port || '5432:5432'}</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Engine:</span><span class="telemetry-data-val">postgres:16-alpine</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Volume:</span><span class="telemetry-data-val">college_portal_pgdata</span></div>
      <div class="telemetry-data-row"><span class="telemetry-data-label">Health Probe:</span><span class="telemetry-data-val" style="color: var(--status-success);">pg_isready (Healthy)</span></div>
      <div style="margin-top: 1rem;">
        <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="simulateContainerAction('database', 'health_probe')">
          <i class="fa-solid fa-network-wired"></i> Verify Connection Pool
        </button>
      </div>
    </div>
  `;
}

async function simulateContainerAction(tier, action) {
  try {
    showToast(`Initiating '${action}' on container [${tier}]...`, 'warning');
    const res = await fetch(`${API_BASE}/container/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, action })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      setTimeout(pingContainerHealth, 400);
      setTimeout(pingContainerHealth, 2200);
    }
  } catch (err) {
    showToast('Simulation completed locally.', 'info');
  }
}

async function submitStudentAssignment(assignId) {
  try {
    const res = await fetch(`${API_BASE}/assignments/${assignId}/submit`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      const target = AppState.assignments.find(a => a.id === assignId);
      if (target) target.status = 'Submitted';
      renderRoleDashboard('student', 'assignments');
    }
  } catch (err) {
    const target = AppState.assignments.find(a => a.id === assignId);
    if (target) target.status = 'Submitted';
    showToast('Assignment submitted successfully!', 'success');
    renderRoleDashboard('student', 'assignments');
  }
}

function markAttendance(studentIndex, isPresent, btnElem) {
  // Role guard: only faculty members are permitted to update attendance
  if (AppState.currentRole !== 'faculty') {
    showToast('Access denied. Only faculty members can update attendance.', 'error');
    return;
  }

  const parent = btnElem.parentElement;
  const btns = parent.querySelectorAll('.att-btn');
  btns.forEach(b => b.className = 'att-btn');

  if (isPresent) {
    btnElem.classList.add('active-present');
    showToast(`Marked ${AppState.students[studentIndex].full_name} as PRESENT`, 'success');
  } else {
    btnElem.classList.add('active-absent');
    showToast(`Marked ${AppState.students[studentIndex].full_name} as ABSENT`, 'warning');
  }

  // Retrieve stored token and send as Bearer for server-side role verification
  const storedUser = JSON.parse(localStorage.getItem('apex_user') || 'null');
  const token = storedUser && storedUser.token ? storedUser.token : '';

  fetch(`${API_BASE}/attendance/mark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ course_id: 1, attended: isPresent })
  }).then(res => {
    if (!res.ok && res.status === 403) {
      showToast('Server: Access denied. Only faculty can update attendance.', 'error');
    }
  }).catch(() => {});
}

async function saveGradeChange(markId) {
  const internal = parseFloat(document.getElementById(`mark_int_${markId}`).value);
  const midterm = parseFloat(document.getElementById(`mark_mid_${markId}`).value);
  const assignment = parseFloat(document.getElementById(`mark_ass_${markId}`).value);

  try {
    const res = await fetch(`${API_BASE}/marks/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: markId, internal, midterm, assignment })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById(`mark_tot_${markId}`).textContent = data.data.total;
      document.getElementById(`mark_grd_${markId}`).textContent = data.data.grade;
      showToast(`Marks updated for ID ${markId}. Grade: ${data.data.grade}`, 'success');
    }
  } catch (err) {
    const total = (internal + midterm + assignment).toFixed(1);
    const grade = total >= 90 ? 'A+' : total >= 80 ? 'A' : 'B';
    document.getElementById(`mark_tot_${markId}`).textContent = total;
    document.getElementById(`mark_grd_${markId}`).textContent = grade;
    showToast('Marks saved successfully.', 'success');
  }
}

function filterAdminStudents(query) {
  const q = query.toLowerCase();
  const rows = document.querySelectorAll('#adminStudentTableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
}

async function handleAddStudentSubmit(e) {
  e.preventDefault();
  const full_name = document.getElementById('newStdName').value;
  const email = document.getElementById('newStdEmail').value;
  const roll_number = document.getElementById('newStdRoll').value;
  const department = document.getElementById('newStdDept').value;
  const semester = document.getElementById('newStdSem').value;
  const cgpa = document.getElementById('newStdCgpa').value;

  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, roll_number, department, semester, cgpa })
    });
    const json = await res.json();
    if (json.success) {
      AppState.students.push(json.data);
    } else {
      // fallback: push locally
      AppState.students.push({ id: Date.now(), full_name, email, roll_number, department, semester: parseInt(semester), cgpa: parseFloat(cgpa), overall_attendance: 100.0, status: 'Active' });
    }
  } catch (err) {
    AppState.students.push({ id: Date.now(), full_name, email, roll_number, department, semester: parseInt(semester), cgpa: parseFloat(cgpa), overall_attendance: 100.0, status: 'Active' });
  }
  showToast(`Student ${full_name} enrolled successfully!`, 'success');
  closeModal('addStudentModal');
  document.getElementById('addStudentForm').reset();
  // Re-render whichever dashboard is active
  if (AppState.currentRole === 'faculty') {
    renderFacultyMainStage('fac_students');
  } else {
    renderRoleDashboard('admin', 'students');
  }
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you wish to delete this student record?')) return;
  try {
    await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
  } catch (_) {}
  AppState.students = AppState.students.filter(s => s.id !== id);
  const row = document.getElementById(`stdRow_${id}`);
  if (row) row.remove();
  showToast('Student record removed.', 'info');
}

// --- Faculty-specific delete (updates faculty roster pane) ---
async function deleteFacultyStudent(id) {
  if (!confirm('Remove this student from the roster?')) return;
  try {
    await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
  } catch (_) {}
  AppState.students = AppState.students.filter(s => s.id !== id);
  // Remove row from faculty table directly
  const row = document.getElementById(`facStdRow_${id}`);
  if (row) row.remove();
  // Also keep admin table in sync if visible
  const adminRow = document.getElementById(`stdRow_${id}`);
  if (adminRow) adminRow.remove();
  showToast('Student removed from roster.', 'info');
}

// --- Switch Active Course in Faculty Attendance ---
function switchFacAttCourse(courseCode) {
  AppState.activeFacCourse = courseCode;
  const courseMeta = courseCode === 'CS601' ? 'Cloud Computing & Microservices' : (courseCode === 'CS604' ? 'Container Security & DevSecOps' : courseCode);
  showToast(`Switched active subject to ${courseCode} (${courseMeta})`, 'info');
  renderFacultyMainStage('attendance');
}

// --- Approve / Reject Leave (Faculty) ---
function approveLeave(leaveId) {
  const leave = AppState.leaves.find(l => l.id === leaveId);
  if (!leave) return;
  leave.status = 'Approved';
  leave.reviewer_name = (AppState.currentUser && AppState.currentUser.full_name) || 'Faculty';
  leave.review_notes = 'Approved via Faculty Portal.';
  showToast(`Leave approved for ${leave.student_name}.`, 'success');
  renderFacultyMainStage('fac_leaves');
}

function rejectLeave(leaveId) {
  const leave = AppState.leaves.find(l => l.id === leaveId);
  if (!leave) return;
  leave.status = 'Rejected';
  leave.reviewer_name = (AppState.currentUser && AppState.currentUser.full_name) || 'Faculty';
  leave.review_notes = 'Rejected via Faculty Portal.';
  showToast(`Leave rejected for ${leave.student_name}.`, 'warning');
  renderFacultyMainStage('fac_leaves');
}

// --- Download Certificate (Student) ---
function downloadCertificate(certId) {
  const cert = AppState.certificates.find(c => c.id === certId);
  const std  = AppState.currentUser && AppState.currentUser.profile ? AppState.currentUser.profile : AppState.students[0];
  if (!cert) { showToast('Certificate not found.', 'warning'); return; }

  const issueDate = cert.issue_date || new Date().toISOString().split('T')[0];
  const html = `
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>${cert.cert_type} — ${cert.serial_no}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Montserrat:wght@700;900&display=swap');
      body { margin:0; padding:0; font-family:'EB Garamond',serif; background:#fff; color:#1a1a2e; }
      .cert-wrap { width:900px; margin:40px auto; padding:60px 70px; border:8px double #0f62fe; position:relative; box-sizing:border-box; }
      .cert-wrap::before { content:''; position:absolute; inset:10px; border:2px solid #0f62fe22; pointer-events:none; }
      .logo-row { display:flex; align-items:center; gap:16px; margin-bottom:24px; }
      .logo-circle { width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#0f62fe,#009d9a); display:flex; align-items:center; justify-content:center; }
      .logo-circle span { color:#fff; font-family:'Montserrat',sans-serif; font-weight:900; font-size:1.4rem; }
      .inst-name { font-family:'Montserrat',sans-serif; font-weight:900; font-size:1.3rem; color:#0f62fe; line-height:1.2; }
      .inst-sub  { font-size:0.82rem; color:#555; letter-spacing:0.05em; }
      hr { border:none; border-top:2px solid #0f62fe44; margin:20px 0; }
      .cert-title { text-align:center; font-family:'Montserrat',sans-serif; font-weight:900; font-size:2.4rem; color:#0f62fe; letter-spacing:0.04em; margin:10px 0 6px; }
      .cert-subtitle { text-align:center; font-size:1rem; color:#555; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:30px; }
      .cert-body { font-size:1.15rem; line-height:2; text-align:justify; }
      .cert-body strong { color:#0f62fe; }
      .serial { display:inline-block; background:#f4f8ff; border:1px solid #0f62fe44; border-radius:4px; padding:2px 12px; font-size:0.88rem; font-family:monospace; color:#0f62fe; }
      .sig-row { display:flex; justify-content:space-between; margin-top:60px; }
      .sig-box  { text-align:center; width:200px; }
      .sig-line { border-top:1.5px solid #333; margin:0 auto 6px; width:160px; }
      .sig-label{ font-size:0.82rem; color:#666; text-transform:uppercase; letter-spacing:0.08em; }
      .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-family:'Montserrat',sans-serif; font-size:6rem; font-weight:900; color:#0f62fe08; pointer-events:none; white-space:nowrap; z-index:0; }
      @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
    </style></head><body>
    <div class="cert-wrap">
      <div class="watermark">APEX UNIVERSITY</div>
      <div class="logo-row">
        <div class="logo-circle"><span>A</span></div>
        <div>
          <div class="inst-name">APEX UNIVERSITY OF TECHNOLOGY</div>
          <div class="inst-sub">IBM Center of Excellence · Cloud &amp; AI Research Division</div>
        </div>
      </div>
      <hr>
      <div class="cert-title">${cert.cert_type.toUpperCase()}</div>
      <div class="cert-subtitle">Certificate of Authentication</div>
      <hr>
      <div class="cert-body">
        <p>This is to certify that <strong>${std.full_name || cert.student_name}</strong>,
        bearing Roll Number <strong>${std.roll_number || '—'}</strong>, enrolled in the
        <strong>${std.department || 'Department of Computer Science &amp; Cloud Computing'}</strong>,
        Semester <strong>${std.semester || '6'}</strong>, is a bonafide student of this institution.</p>

        <p>This certificate has been issued for the purpose of: <strong>${cert.purpose}</strong>.</p>

        <p>This certificate is valid as of the issue date and bears the institutional seal of Apex University of Technology.</p>

        <p>Serial Number: <span class="serial">${cert.serial_no}</span> &nbsp;|&nbsp; Issue Date: <strong>${issueDate}</strong></p>
      </div>
      <div class="sig-row">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">Registrar</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">Head of Department</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">Vice Chancellor</div>
        </div>
      </div>
    </div>
    <script>window.onload=function(){ window.print(); }</script>
    </body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank', 'width=1000,height=750');
  if (!win) { showToast('Allow popups to download the certificate.', 'warning'); return; }
  showToast(`Certificate ${cert.serial_no} opened for download/print.`, 'success');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ====================================================================
// FACULTY ATTENDANCE SESSION MANAGEMENT (DYNAMIC CALCULATION)
// ====================================================================

/**
 * Mark student attendance for today's session in the active subject.
 * - Present: increases attendance percentage
 * - Absent: reduces attendance percentage
 * - If wrong: faculty can change it (Present <-> Absent) or reset it
 * - If unchanged: leaves it
 */
function markStudentSession(studentId, courseCode, isPresent) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const courseMeta = courseCode === 'CS601' ? 'Cloud Computing & Microservices' : (courseCode === 'CS604' ? 'Container Security & DevSecOps' : courseCode);

  let attRecord = AppState.attendance.find(a => a.student_id === studentId && a.course_code === courseCode);
  if (!attRecord) {
    attRecord = {
      id: Date.now() + studentId,
      student_id: studentId,
      course_code: courseCode,
      course_name: courseMeta,
      total_classes: 40,
      attended_classes: Math.round((student.overall_attendance / 100) * 40),
      percentage: student.overall_attendance
    };
    AppState.attendance.push(attRecord);
  }

  const todayKey = `${courseCode}_${studentId}`;
  AppState.todayAttendance = AppState.todayAttendance || {};
  const prevMark = AppState.todayAttendance[todayKey];
  const desiredMark = isPresent ? 'Present' : 'Absent';

  // If already marked with the same status, leave it unchanged
  if (prevMark === desiredMark) {
    showToast(`${student.full_name} is already marked ${desiredMark} in ${courseCode}.`, 'info');
    return;
  }

  const oldPct = attRecord.percentage;

  if (desiredMark === 'Present') {
    if (prevMark === 'Absent') {
      // Was marked wrong as Absent -> changing to Present: attended classes goes up, total classes remains same
      attRecord.attended_classes += 1;
    } else {
      // Fresh marking today -> both total and attended classes increment
      attRecord.total_classes += 1;
      attRecord.attended_classes += 1;
    }
    AppState.todayAttendance[todayKey] = 'Present';
  } else {
    // desiredMark === 'Absent'
    if (prevMark === 'Present') {
      // Was marked wrong as Present -> changing to Absent: attended classes decrements, total classes remains same
      attRecord.attended_classes = Math.max(0, attRecord.attended_classes - 1);
    } else {
      // Fresh marking today -> total classes increments, attended classes stays same
      attRecord.total_classes += 1;
    }
    AppState.todayAttendance[todayKey] = 'Absent';
  }

  // Recalculate percentage for this subject
  attRecord.percentage = Number(((attRecord.attended_classes / Math.max(1, attRecord.total_classes)) * 100).toFixed(1));

  // Recalculate student's overall attendance across all enrolled subjects
  const studentCourses = AppState.attendance.filter(a => a.student_id === studentId);
  if (studentCourses.length > 0) {
    student.overall_attendance = Number((studentCourses.reduce((sum, a) => sum + a.percentage, 0) / studentCourses.length).toFixed(1));
  }

  // Save to local storage for persistence across reloads
  try {
    localStorage.setItem('apex_attendance_today', JSON.stringify(AppState.todayAttendance));
    localStorage.setItem('apex_attendance_records', JSON.stringify(AppState.attendance));
    localStorage.setItem('apex_students', JSON.stringify(AppState.students));
  } catch (_) {}

  // Contextual feedback
  const changeNote = prevMark ? `Corrected to ${desiredMark}` : `Marked ${desiredMark}`;
  const dirNote = attRecord.percentage >= oldPct ? `increased from ${oldPct}% to ${attRecord.percentage}%` : `reduced from ${oldPct}% to ${attRecord.percentage}%`;
  const toastType = desiredMark === 'Present' ? 'success' : 'warning';
  showToast(`${student.full_name}: ${changeNote} in ${courseCode} (${dirNote})`, toastType);

  // Update Faculty Roster UI
  renderFacultyMainStage('attendance');
}

/**
 * Reset student's attendance for today's session back to unmarked if marked by mistake.
 */
function resetStudentSession(studentId, courseCode) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const todayKey = `${courseCode}_${studentId}`;
  AppState.todayAttendance = AppState.todayAttendance || {};
  const prevMark = AppState.todayAttendance[todayKey];
  if (!prevMark) return;

  let attRecord = AppState.attendance.find(a => a.student_id === studentId && a.course_code === courseCode);
  if (attRecord) {
    if (prevMark === 'Present') {
      attRecord.total_classes = Math.max(1, attRecord.total_classes - 1);
      attRecord.attended_classes = Math.max(0, attRecord.attended_classes - 1);
    } else if (prevMark === 'Absent') {
      attRecord.total_classes = Math.max(1, attRecord.total_classes - 1);
    }
    attRecord.percentage = Number(((attRecord.attended_classes / Math.max(1, attRecord.total_classes)) * 100).toFixed(1));
  }

  delete AppState.todayAttendance[todayKey];

  // Recalculate student's overall attendance
  const studentCourses = AppState.attendance.filter(a => a.student_id === studentId);
  if (studentCourses.length > 0) {
    student.overall_attendance = Number((studentCourses.reduce((sum, a) => sum + a.percentage, 0) / studentCourses.length).toFixed(1));
  }

  try {
    localStorage.setItem('apex_attendance_today', JSON.stringify(AppState.todayAttendance));
    localStorage.setItem('apex_attendance_records', JSON.stringify(AppState.attendance));
    localStorage.setItem('apex_students', JSON.stringify(AppState.students));
  } catch (_) {}

  showToast(`Today's attendance for ${student.full_name} in ${courseCode} has been reset.`, 'info');
  renderFacultyMainStage('attendance');
}

// ====================================================================
// ATTENDANCE PERCENTAGE OVERRIDE WORKFLOW (FACULTY -> ADMIN -> FACULTY)
// ====================================================================

/**
 * Open the faculty attendance percentage override modal.
 */
function openFacultyOverrideModal(studentId, studentName, rollNumber, courseCode, currentPct) {
  const courseMeta = courseCode === 'CS601' ? 'Cloud Computing & Microservices' : (courseCode === 'CS604' ? 'Container Security & DevSecOps' : courseCode);

  document.getElementById('overrideStudentId').value = studentId;
  document.getElementById('overrideCourseCode').value = courseCode;
  document.getElementById('overrideStudentName').value = `${studentName} (${rollNumber})`;
  document.getElementById('overrideCourseName').value = `${courseCode} — ${courseMeta}`;
  document.getElementById('overrideCurrentPct').value = `${currentPct}%`;

  // Recommend 75% cutoff or +5%
  const suggestedPct = currentPct < 75 ? 75.0 : Math.min(100, Number((currentPct + 5).toFixed(1)));
  document.getElementById('overrideTargetPct').value = suggestedPct;

  const reasonSel = document.getElementById('overrideReasonSelect');
  if (reasonSel) reasonSel.value = 'Approved Medical Certificate / Hospitalization Leave Adjustment';
  const reasonCustom = document.getElementById('overrideReasonCustom');
  if (reasonCustom) {
    reasonCustom.value = '';
    reasonCustom.style.display = 'none';
  }

  openModal('facultyOverrideModal');
}

function onOverrideReasonChange(val) {
  const customBox = document.getElementById('overrideReasonCustom');
  if (customBox) {
    customBox.style.display = val === 'Other' ? 'block' : 'none';
    if (val === 'Other') customBox.focus();
  }
}

/**
 * Submit override request from faculty to admin.
 */
function handleFacultyOverrideSubmit(e) {
  e.preventDefault();
  const studentId = parseInt(document.getElementById('overrideStudentId').value, 10);
  const courseCode = document.getElementById('overrideCourseCode').value;
  const targetPct = parseFloat(document.getElementById('overrideTargetPct').value);
  const reasonSel = document.getElementById('overrideReasonSelect').value;
  const reasonCustom = document.getElementById('overrideReasonCustom').value.trim();
  const reason = reasonSel === 'Other' ? (reasonCustom || 'Special faculty request') : reasonSel;

  if (isNaN(targetPct) || targetPct < 0 || targetPct > 100) {
    showToast('Please enter a valid attendance percentage between 0 and 100.', 'warning');
    return;
  }

  const student = AppState.students.find(s => s.id === studentId);
  const faculty = (AppState.currentUser && AppState.currentUser.profile) || AppState.faculty[0];

  // Check if a pending request already exists
  const existing = AppState.attendanceOverrides.find(
    o => o.student_id === studentId && o.course_code === courseCode && o.status === 'Pending'
  );
  if (existing) {
    showToast(`An override request for ${student ? student.full_name : 'this student'} in ${courseCode} is already pending admin review.`, 'warning');
    closeModal('facultyOverrideModal');
    return;
  }

  const curPctStr = document.getElementById('overrideCurrentPct').value.replace('%', '');
  const curPct = parseFloat(curPctStr) || 0;
  const newId = AppState.attendanceOverrides.length ? Math.max(...AppState.attendanceOverrides.map(o => o.id)) + 1 : 1;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const newReq = {
    id: newId,
    student_id: studentId,
    student_name: student ? student.full_name : 'Student',
    student_roll: student ? student.roll_number : '',
    faculty_id: faculty.id,
    faculty_name: faculty.full_name,
    course_code: courseCode,
    course_name: courseCode === 'CS601' ? 'Cloud Computing & Microservices' : (courseCode === 'CS604' ? 'Container Security & DevSecOps' : courseCode),
    current_percentage: curPct,
    requested_percentage: targetPct,
    reason: reason,
    status: 'Pending',
    requested_at: now
  };

  AppState.attendanceOverrides.push(newReq);

  // Send High Priority Notification to Administrator
  AppState.notifications.unshift({
    id: Date.now(),
    recipient_type: 'admin',
    recipient_id: 1,
    category: 'Attendance',
    priority: 'Urgent',
    title: `⚡ Attendance Override Request: ${newReq.student_name}`,
    message: `${faculty.full_name} requested ${courseCode} attendance adjustment to ${targetPct}% for ${newReq.student_name}. Admin approval required to grant faculty percentage control.`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  try {
    localStorage.setItem('apex_attendance_overrides', JSON.stringify(AppState.attendanceOverrides));
    localStorage.setItem('apex_notifications', JSON.stringify(AppState.notifications));
  } catch (_) {}

  closeModal('facultyOverrideModal');
  showToast(`Override request for ${newReq.student_name} (${courseCode}: ${targetPct}%) submitted to Admin.`, 'success');
  renderFacultyMainStage('attendance');
}

/**
 * Direct percentage setting by faculty once Admin grants access.
 */
function saveCustomPercentage(studentId, courseCode) {
  const input = document.getElementById(`customPctInput_${studentId}_${courseCode}`);
  if (!input) return;

  const newPct = parseFloat(input.value);
  if (isNaN(newPct) || newPct < 0 || newPct > 100) {
    showToast('Please enter a valid percentage between 0 and 100.', 'warning');
    return;
  }

  const student = AppState.students.find(s => s.id === studentId);
  let attRecord = AppState.attendance.find(a => a.student_id === studentId && a.course_code === courseCode);
  if (!attRecord) return;

  attRecord.percentage = Number(newPct.toFixed(1));
  attRecord.attended_classes = Math.round((attRecord.percentage / 100) * attRecord.total_classes);

  if (student) {
    const studentCourses = AppState.attendance.filter(a => a.student_id === studentId);
    if (studentCourses.length > 0) {
      student.overall_attendance = Number((studentCourses.reduce((sum, a) => sum + a.percentage, 0) / studentCourses.length).toFixed(1));
    }
  }

  try {
    localStorage.setItem('apex_attendance_records', JSON.stringify(AppState.attendance));
    localStorage.setItem('apex_students', JSON.stringify(AppState.students));
  } catch (_) {}

  showToast(`Attendance for ${student ? student.full_name : 'Student'} in ${courseCode} set to ${attRecord.percentage}%.`, 'success');
  renderFacultyMainStage('attendance');
}

/**
 * Admin: Approve attendance override request.
 * - Grants faculty direct permission to give attendance percentage
 * - Applies requested percentage immediately to student record
 * - Updates overall student attendance
 */
function approveAttendanceOverride(overrideId) {
  const req = AppState.attendanceOverrides.find(o => o.id === overrideId);
  if (!req) return;
  req.status = 'Approved';

  const cCode = req.course_code || 'CS601';
  const student = AppState.students.find(s => s.id === req.student_id);

  // 1. Grant override permission to faculty for this student and subject
  if (student) {
    if (typeof student._overrideGranted !== 'object' || student._overrideGranted === null) {
      student._overrideGranted = {};
    }
    student._overrideGranted[cCode] = true;
  }

  // 2. Apply the requested attendance percentage immediately
  let attRecord = AppState.attendance.find(a => a.student_id === req.student_id && a.course_code === cCode);
  if (!attRecord) {
    attRecord = {
      id: Date.now() + req.student_id,
      student_id: req.student_id,
      course_code: cCode,
      course_name: req.course_name || (cCode === 'CS601' ? 'Cloud Computing & Microservices' : 'Container Security & DevSecOps'),
      total_classes: 40,
      attended_classes: Math.round(((req.requested_percentage || 75) / 100) * 40),
      percentage: Number(req.requested_percentage || 75)
    };
    AppState.attendance.push(attRecord);
  } else if (req.requested_percentage !== undefined) {
    attRecord.percentage = Number(req.requested_percentage);
    attRecord.attended_classes = Math.round((attRecord.percentage / 100) * attRecord.total_classes);
  }

  // 3. Recalculate student overall attendance
  if (student) {
    const studentCourses = AppState.attendance.filter(a => a.student_id === student.id);
    if (studentCourses.length > 0) {
      student.overall_attendance = Number((studentCourses.reduce((sum, a) => sum + a.percentage, 0) / studentCourses.length).toFixed(1));
    }
  }

  // 4. Send notification back to faculty
  AppState.notifications.unshift({
    id: Date.now(),
    recipient_type: 'faculty',
    recipient_id: req.faculty_id || 1,
    category: 'Attendance',
    priority: 'High',
    title: `✅ Admin Access Granted: ${req.student_name}`,
    message: `Admin approved override for ${req.student_name} in ${cCode}. Percentage set to ${req.requested_percentage}% and direct override permission unlocked in Faculty Portal.`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  try {
    localStorage.setItem('apex_attendance_overrides', JSON.stringify(AppState.attendanceOverrides));
    localStorage.setItem('apex_attendance_records', JSON.stringify(AppState.attendance));
    localStorage.setItem('apex_students', JSON.stringify(AppState.students));
    localStorage.setItem('apex_notifications', JSON.stringify(AppState.notifications));
  } catch (_) {}

  showToast(`Override approved! ${req.student_name} (${cCode}) updated to ${req.requested_percentage}% and faculty permission granted.`, 'success');
  renderAdminMainStage('admin_ops');
}

/**
 * Admin: Reject Attendance Override
 */
function rejectAttendanceOverride(overrideId) {
  const req = AppState.attendanceOverrides.find(o => o.id === overrideId);
  if (!req) return;
  req.status = 'Rejected';

  AppState.notifications.unshift({
    id: Date.now(),
    recipient_type: 'faculty',
    recipient_id: req.faculty_id || 1,
    category: 'Attendance',
    priority: 'Normal',
    title: `❌ Attendance Override Declined: ${req.student_name}`,
    message: `Admin declined the attendance override request for ${req.student_name} in ${req.course_code || 'CS601'}.`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  try {
    localStorage.setItem('apex_attendance_overrides', JSON.stringify(AppState.attendanceOverrides));
    localStorage.setItem('apex_notifications', JSON.stringify(AppState.notifications));
  } catch (_) {}

  showToast(`Override request rejected for ${req.student_name}.`, 'warning');
  renderAdminMainStage('admin_ops');
}

/**
 * Admin: Grant Override Directly (without faculty request)
 */
function adminGrantOverride() {
  const facSel = document.getElementById('overrideFacultySelect');
  const stdSel = document.getElementById('overrideStudentSelect');
  const courseSel = document.getElementById('overrideCourseSelect');
  const pctInput = document.getElementById('overrideTargetPctAdmin');
  const reasonInput = document.getElementById('overrideReasonInput');
  if (!facSel || !stdSel) return;

  const facultyId = parseInt(facSel.value, 10);
  const studentId = parseInt(stdSel.value, 10);
  const courseCode = (courseSel && courseSel.value) || 'CS601';
  const targetPct = pctInput ? parseFloat(pctInput.value) : 75.0;
  const facultyName = facSel.options[facSel.selectedIndex].text.split('(')[0].trim();
  const studentName = stdSel.options[stdSel.selectedIndex].text.split('(')[0].trim();
  const reason = (reasonInput && reasonInput.value.trim()) || "Dean's Direct Administrative Authorization";

  const student = AppState.students.find(s => s.id === studentId);

  // 1. Grant permission flag
  if (student) {
    if (typeof student._overrideGranted !== 'object' || student._overrideGranted === null) {
      student._overrideGranted = {};
    }
    student._overrideGranted[courseCode] = true;
  }

  // 2. Update student attendance record
  let attRecord = AppState.attendance.find(a => a.student_id === studentId && a.course_code === courseCode);
  if (!attRecord) {
    attRecord = {
      id: Date.now() + studentId,
      student_id: studentId,
      course_code: courseCode,
      course_name: courseCode === 'CS601' ? 'Cloud Computing & Microservices' : 'Container Security & DevSecOps',
      total_classes: 40,
      attended_classes: Math.round((targetPct / 100) * 40),
      percentage: targetPct
    };
    AppState.attendance.push(attRecord);
  } else {
    attRecord.percentage = targetPct;
    attRecord.attended_classes = Math.round((targetPct / 100) * attRecord.total_classes);
  }

  // 3. Recalculate student overall attendance
  if (student) {
    const studentCourses = AppState.attendance.filter(a => a.student_id === student.id);
    if (studentCourses.length > 0) {
      student.overall_attendance = Number((studentCourses.reduce((sum, a) => sum + a.percentage, 0) / studentCourses.length).toFixed(1));
    }
  }

  const newId = AppState.attendanceOverrides.length
    ? Math.max(...AppState.attendanceOverrides.map(o => o.id)) + 1 : 1;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  AppState.attendanceOverrides.push({
    id: newId,
    student_id: studentId,
    student_name: studentName,
    student_roll: student ? student.roll_number : '',
    faculty_id: facultyId,
    faculty_name: facultyName,
    course_code: courseCode,
    course_name: courseCode === 'CS601' ? 'Cloud Computing & Microservices' : 'Container Security & DevSecOps',
    current_percentage: attRecord.percentage,
    requested_percentage: targetPct,
    reason,
    status: 'Approved',
    requested_at: now
  });

  // Notify faculty
  AppState.notifications.unshift({
    id: Date.now(),
    recipient_type: 'faculty',
    recipient_id: facultyId,
    category: 'Attendance',
    priority: 'High',
    title: `🛡️ Direct Override Granted: ${studentName}`,
    message: `Administrator granted permission to give attendance for ${studentName} in ${courseCode}. Set to ${targetPct}%.`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  try {
    localStorage.setItem('apex_attendance_overrides', JSON.stringify(AppState.attendanceOverrides));
    localStorage.setItem('apex_attendance_records', JSON.stringify(AppState.attendance));
    localStorage.setItem('apex_students', JSON.stringify(AppState.students));
    localStorage.setItem('apex_notifications', JSON.stringify(AppState.notifications));
  } catch (_) {}

  showToast(`Permission granted! ${facultyName} can now set attendance for ${studentName} in ${courseCode} (${targetPct}%).`, 'success');
  renderAdminMainStage('admin_ops');
}

/**
 * Admin: Revoke Attendance Override
 */
function revokeAttendanceOverride(overrideId) {
  const req = AppState.attendanceOverrides.find(o => o.id === overrideId);
  if (!req) return;
  req.status = 'Revoked';

  const student = AppState.students.find(s => s.id === req.student_id);
  if (student && student._overrideGranted) {
    student._overrideGranted[req.course_code || 'CS601'] = false;
  }

  try {
    localStorage.setItem('apex_attendance_overrides', JSON.stringify(AppState.attendanceOverrides));
    localStorage.setItem('apex_students', JSON.stringify(AppState.students));
  } catch (_) {}

  showToast(`Override permission for ${req.student_name} in ${req.course_code || 'CS601'} revoked.`, 'warning');
  renderAdminMainStage('admin_ops');
}

// --- Admin: Approve Certificate ---
function approveCertificate(certId) {
  const cert = AppState.certificates.find(c => c.id === certId);
  if (!cert) return;
  cert.status = 'Ready for Pickup';
  cert.issue_date = new Date().toISOString().split('T')[0];
  cert.serial_no = cert.serial_no || `CERT-${Date.now().toString().slice(-6)}`;
  showToast(`Certificate for ${cert.student_name} approved and ready.`, 'success');
  renderAdminMainStage('admin_ops');
}

// --- Edit Student (Faculty & Admin) ---
function openEditStudent(id) {
  const s = AppState.students.find(st => st.id === id);
  if (!s) return;
  document.getElementById('editStdId').value = s.id;
  document.getElementById('editStdName').value = s.full_name;
  document.getElementById('editStdEmail').value = s.email;
  document.getElementById('editStdRoll').value = s.roll_number;
  document.getElementById('editStdDept').value = s.department;
  document.getElementById('editStdSem').value = s.semester;
  document.getElementById('editStdCgpa').value = s.cgpa;
  openModal('editStudentModal');
}

function saveEditStudent(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('editStdId').value);
  const s = AppState.students.find(st => st.id === id);
  if (!s) return;
  s.full_name   = document.getElementById('editStdName').value;
  s.email       = document.getElementById('editStdEmail').value;
  s.roll_number = document.getElementById('editStdRoll').value;
  s.department  = document.getElementById('editStdDept').value;
  s.semester    = parseInt(document.getElementById('editStdSem').value);
  s.cgpa        = parseFloat(document.getElementById('editStdCgpa').value);
  showToast(`${s.full_name}'s record updated successfully.`, 'success');
  closeModal('editStudentModal');
  if (AppState.currentRole === 'faculty') {
    renderFacultyMainStage('fac_students');
  } else {
    renderRoleDashboard('admin', 'students');
  }
}

async function handleNewAnnouncementSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('annTitleInput').value;
  const category = document.getElementById('annCategoryInput').value;
  const priority = document.getElementById('annPriorityInput').value;
  const content = document.getElementById('annContentInput').value;

  try {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, priority, content })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Announcement published to campus board!', 'success');
      AppState.announcements.unshift(json.data);
      closeModal('announcementModal');
      renderAnnouncements(AppState.announcements);
      if (AppState.currentRole === 'admin') renderRoleDashboard('admin', 'announcements');
    }
  } catch (err) {
    showToast('Announcement published.', 'success');
    closeModal('announcementModal');
  }
}

async function deleteAnnouncementItem(id) {
  try {
    await fetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
    AppState.announcements = AppState.announcements.filter(a => a.id !== id);
    const item = document.getElementById(`ann_item_${id}`);
    if (item) item.remove();
    showToast('Announcement removed.', 'info');
  } catch (err) {
    AppState.announcements = AppState.announcements.filter(a => a.id !== id);
    const item = document.getElementById(`ann_item_${id}`);
    if (item) item.remove();
    showToast('Announcement removed.', 'info');
  }
}

async function handleNewAssignmentSubmit(e) {
  e.preventDefault();
  const course_code = document.getElementById('assignCourseSelect').value;
  const title = document.getElementById('assignTitle').value;
  const due_date = document.getElementById('assignDate').value;
  const max_score = document.getElementById('assignScore').value;
  const description = document.getElementById('assignDesc').value;

  try {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_code, title, due_date, max_score, description })
    });
    const json = await res.json();
    if (json.success) {
      showToast('New assignment uploaded!', 'success');
      AppState.assignments.push(json.data);
      closeModal('assignmentModal');
      if (AppState.currentRole === 'faculty') renderRoleDashboard('faculty', 'courses');
    }
  } catch (err) {
    showToast('Assignment uploaded successfully.', 'success');
    closeModal('assignmentModal');
  }
}

// ====================================================================
// INITIAL DATA & TELEMETRY
// ====================================================================
async function loadInitialData() {
  try {
    const safeFetchData = async (endpoint) => {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || (Array.isArray(json) ? json : null);
      } catch (_) {
        return null;
      }
    };

    const [
      cData, eData, aData, sData, fData, ttData, attData, mData, asData, exData
    ] = await Promise.all([
      safeFetchData('courses'),
      safeFetchData('events'),
      safeFetchData('announcements'),
      safeFetchData('students'),
      safeFetchData('faculty'),
      safeFetchData('timetable'),
      safeFetchData('attendance'),
      safeFetchData('marks'),
      safeFetchData('assignments'),
      safeFetchData('exams')
    ]);

    if (cData && cData.length > 0) AppState.courses = cData;
    if (eData && eData.length > 0) AppState.events = eData;
    if (aData && aData.length > 0) AppState.announcements = aData;
    if (ttData && ttData.length > 0) AppState.timetable = ttData;
    if (asData && asData.length > 0) AppState.assignments = asData;
    if (exData && exData.length > 0) AppState.exams = exData;

    if (sData && sData.length > 0) AppState.students = sData;
    if (fData && fData.length > 0) AppState.faculty = fData;
    if (attData && attData.length > 0) {
      const existingIds = new Set(attData.map(a => a.id));
      const mergedAtt = [...attData];
      AppState.attendance.forEach(a => {
        if (!existingIds.has(a.id)) mergedAtt.push(a);
      });
      AppState.attendance = mergedAtt;
    }
    if (mData && mData.length > 0) {
      const existingIds = new Set(mData.map(m => m.id));
      const mergedMarks = [...mData];
      AppState.marks.forEach(m => {
        if (!existingIds.has(m.id)) mergedMarks.push(m);
      });
      AppState.marks = mergedMarks;
    }

    // Sync fee and leave records in background if API is available
    try {
      const [feeRes, leaveRes] = await Promise.all([
        fetch(`${API_BASE}/fees`).catch(() => null),
        fetch(`${API_BASE}/leave`).catch(() => null)
      ]);
      if (feeRes && feeRes.ok) {
        const feeJson = await feeRes.json();
        if (feeJson.success && feeJson.data && feeJson.data.length > 0) {
          const normalizedFees = feeJson.data.map(f => {
            const st = AppState.students.find(s => s.id === f.student_id);
            const total = Number(f.total_fee !== undefined ? f.total_fee : (f.total_amount !== undefined ? f.total_amount : 85000)) || 85000;
            const paid = Number(f.paid_amount !== undefined ? f.paid_amount : 0);
            const due = Number(f.pending_amount !== undefined ? f.pending_amount : (f.due_amount !== undefined ? f.due_amount : (total - paid))) || 0;
            return {
              ...f,
              student_name: f.student_name || (st ? st.full_name : `Student #${f.student_id}`),
              total_amount: total,
              paid_amount: paid,
              due_amount: due,
              pending_amount: due,
              receipt_no: f.receipt_no || `RCPT-2026-06-${String(f.student_id || f.id || 1).padStart(3, '0')}`,
              semester: f.semester || (st ? st.semester : 6),
              status: f.status || (due === 0 ? 'Paid' : 'Partial')
            };
          });
          AppState.fees = normalizedFees;
        }
      }
      if (leaveRes && leaveRes.ok) {
        const leaveJson = await leaveRes.json();
        if (leaveJson.success && leaveJson.data && leaveJson.data.length > 0) {
          AppState.leaves = leaveJson.data;
        }
      }
    } catch (_) {}

    renderCourses(AppState.courses);
    renderEvents(AppState.events);
    renderAnnouncements(AppState.announcements);
    setupFilterListeners();

    // If dashboard is currently active, refresh it with the newly loaded data
    if (AppState.currentPage === 'dashboard' && AppState.currentUser) {
      renderRoleDashboard(AppState.currentRole, AppState.currentDashTab);
    }
  } catch (err) {
    console.warn('[Data] API loading notice.', err);
  }
}

function startContainerTelemetryPolling() {
  pingContainerHealth();
  setInterval(pingContainerHealth, 8000);
}

async function pingContainerHealth() {
  try {
    const res = await fetch(`${API_BASE}/container-status`);
    const json = await res.json();
    if (json.success && json.data) {
      AppState.containerStatus = json.data;
      updateTelemetryUI(json.data);
    }
  } catch (err) {
    // Graceful
  }
}

function updateTelemetryUI(statusData) {
  const probeTimeElem = document.getElementById('probeTime');
  if (probeTimeElem) probeTimeElem.textContent = new Date().toLocaleTimeString();

  const fe = statusData.frontend;
  const be = statusData.backend;
  const db = statusData.database;

  const feStatus = document.getElementById('statusFrontend');
  const beStatus = document.getElementById('statusBackend');
  const dbStatus = document.getElementById('statusDatabase');

  if (feStatus) {
    feStatus.className = `tier-status ${fe.status === 'Running' ? 'status-running' : 'status-restarting'}`;
    feStatus.innerHTML = `<i class="fa-solid fa-${fe.status === 'Running' ? 'circle-check' : 'spinner fa-spin'}"></i> <span>${fe.status}</span>`;
  }
  if (beStatus) {
    beStatus.className = `tier-status ${be.status === 'Running' ? 'status-running' : 'status-restarting'}`;
    beStatus.innerHTML = `<i class="fa-solid fa-${be.status === 'Running' ? 'circle-check' : 'spinner fa-spin'}"></i> <span>${be.status}</span>`;
  }
  if (dbStatus) {
    dbStatus.className = `tier-status ${db.status === 'Connected' ? 'status-running' : 'status-restarting'}`;
    dbStatus.innerHTML = `<i class="fa-solid fa-${db.status === 'Connected' ? 'link' : 'spinner fa-spin'}"></i> <span>${db.status}</span>`;
  }

  if (AppState.currentRole === 'admin' && AppState.currentPage === 'dashboard') {
    renderAdminTelemetryBoxes(statusData);
  }
}

// ====================================================================
// COURSES, EVENTS & NOTICES RENDERING
// ====================================================================
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  grid.innerHTML = courses.map(course => `
    <div class="course-card animate-on-scroll is-visible">
      <div class="course-thumb-box">
        <img src="${course.thumbnail}" alt="${course.course_name}" class="course-thumb-img" loading="lazy">
        <span class="course-badge">${course.course_code}</span>
        <span class="course-credits-badge">${course.credits} Credits</span>
      </div>
      <div class="course-body">
        <h3 class="course-title">${course.course_name}</h3>
        <p class="course-desc">${course.description}</p>
        <div class="course-footer">
          <div class="course-instructor">
            <i class="fa-solid fa-chalkboard-user text-primary"></i>
            <span>${course.instructor}</span>
          </div>
          <div><i class="fa-solid fa-users"></i> ${course.enrolled || 65} enrolled</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderEvents(events) {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  grid.innerHTML = events.map(evt => `
    <div class="event-card animate-on-scroll is-visible">
      <div class="event-img-wrap">
        <img src="${evt.image_url}" alt="${evt.title}" class="event-img" loading="lazy">
        <span class="event-cat-tag">${evt.category}</span>
      </div>
      <div class="event-body">
        <div class="event-date-row">
          <i class="fa-solid fa-calendar-days"></i>
          <span>${evt.date_string}</span>
        </div>
        <h3 class="event-title">${evt.title}</h3>
        <div class="event-venue">
          <i class="fa-solid fa-location-dot"></i>
          <span>${evt.venue}</span>
        </div>
        <p class="event-desc">${evt.description}</p>
        <div class="event-card-actions">
          <span class="event-count"><i class="fa-solid fa-user-check"></i> ${evt.registration_count} Registered</span>
          <button class="btn ${evt.registered ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleEventRegistration(${evt.id})">
            <i class="fa-solid ${evt.registered ? 'fa-check' : 'fa-ticket'}"></i>
            ${evt.registered ? 'Registered' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function toggleEventRegistration(eventId) {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, data.registered ? 'success' : 'info');
      const target = AppState.events.find(e => e.id === eventId);
      if (target) {
        target.registered = data.registered;
        target.registration_count = data.registration_count;
      }
      renderEvents(AppState.events);
    }
  } catch (err) {
    showToast('Registration updated.', 'success');
  }
}

function renderAnnouncements(announcements) {
  const list = document.getElementById('announcementsList');
  if (!list) return;

  if (announcements.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No notices posted in this category.</div>`;
    return;
  }

  list.innerHTML = announcements.map(ann => `
    <div class="announcement-item">
      <div class="ann-top-row">
        <div class="ann-title-wrap">
          <span class="ann-priority-badge priority-${ann.priority}">${ann.priority}</span>
          <h4 class="ann-title">${ann.title}</h4>
        </div>
        <div class="ann-meta">
          <span><i class="fa-solid fa-clock"></i> ${ann.date_posted}</span>
          <span><i class="fa-solid fa-user-tie"></i> ${ann.author}</span>
        </div>
      </div>
      <p class="ann-content">${ann.content}</p>
    </div>
  `).join('');
}

function setupFilterListeners() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      if (filter === 'all') {
        renderCourses(AppState.courses);
      } else if (filter === 'Cloud') {
        renderCourses(AppState.courses.filter(c => c.course_name.includes('Cloud') || c.course_name.includes('Container')));
      } else {
        renderCourses(AppState.courses.filter(c => c.department.includes(filter)));
      }
    });
  });

  const annBtns = document.querySelectorAll('.ann-tab-btn');
  annBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      annBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      try {
        const res = await fetch(`${API_BASE}/announcements?category=${cat}`);
        const json = await res.json();
        renderAnnouncements(json.data);
      } catch (e) {
        if (cat === 'all') {
          renderAnnouncements(AppState.announcements);
        } else {
          renderAnnouncements(AppState.announcements.filter(a => a.category.toLowerCase() === cat.toLowerCase()));
        }
      }
    });
  });
}

function handleInquirySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('inqName').value;
  showToast(`Thank you, ${name}! Your inquiry has been submitted.`, 'success');
  document.getElementById('inquiryForm').reset();
}

// ====================================================================
// GENERAL HELPERS & ANIMATIONS
// ====================================================================
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  updateThemeIcon();

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('apex_theme', AppState.theme);
      document.documentElement.setAttribute('data-theme', AppState.theme);
      updateThemeIcon();
      showToast(`Switched to ${AppState.theme} theme`, 'info');
    });
  }
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (AppState.theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
    icon.style.color = '#f1c21b';
  } else {
    icon.className = 'fa-solid fa-moon';
    icon.style.color = '';
  }
}

function initTypingAnimation() {
  const headingElem = document.getElementById('typedHeading');
  if (!headingElem) return;

  const titles = [
    'Containerizing a College Portal',
    'Orchestrated via Docker Compose',
    '3-Tier Decoupled Microservices',
    'PostgreSQL Persistent Storage'
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function typeStep() {
    const currentTitle = titles[titleIndex];
    if (isDeleting) {
      headingElem.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      headingElem.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 85;
    }

    if (!isDeleting && charIndex === currentTitle.length) {
      typingSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typingSpeed = 400;
    }

    setTimeout(typeStep, typingSpeed);
  }

  typeStep();
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach(c => animateCounter(c));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

function animateCounter(elem) {
  const target = parseInt(elem.getAttribute('data-target'), 10);
  if (isNaN(target)) return;
  const duration = 1600;
  const stepTime = 20;
  const increment = target / (duration / stepTime);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      elem.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      elem.textContent = Math.floor(current).toLocaleString();
    }
  }, stepTime);
}

function initNavbarBehavior() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
    });
  }
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'circle-check' : type === 'warning' ? 'triangle-exclamation' : type === 'danger' ? 'circle-xmark' : 'circle-info';
  toast.innerHTML = `<i class="fa-solid fa-${icon}" style="font-size: 1.1rem;"></i><div>${message}</div>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.35s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
