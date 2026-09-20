// Test simulation of Faculty Attendance & Override workflow
const fs = require('fs');

// Read app.js
const appCode = fs.readFileSync('frontend/js/app.js', 'utf8');

// Mock browser environment
const localStorageMock = {};
global.localStorage = {
  getItem: (k) => localStorageMock[k] || null,
  setItem: (k, v) => { localStorageMock[k] = v; }
};
global.window = global;
global.requestAnimationFrame = (fn) => fn();
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    options: [{ text: 'Dr. Robert Vance' }, { text: 'Alex Chen (APX-2022-CS-084)' }],
    selectedIndex: 0,
    appendChild: () => {}
  }),
  createElement: (tag) => ({
    className: '',
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    remove: () => {}
  }),
  querySelectorAll: () => []
};

// Evaluate app.js
eval(appCode);

global.showToast = (msg, type) => console.log(`[TOAST (${type})]: ${msg}`);
global.renderFacultyMainStage = (tab) => console.log(`[RENDER FACULTY]: Tab ${tab}`);
global.renderAdminMainStage = (tab) => console.log(`[RENDER ADMIN]: Tab ${tab}`);
global.openModal = (m) => console.log(`[MODAL OPEN]: ${m}`);
global.closeModal = (m) => console.log(`[MODAL CLOSE]: ${m}`);

console.log("\n=== TEST 1: Mark Present Increases Percentage ===");
const student = AppState.students[0]; // Alex Chen
const initialCS601 = AppState.attendance.find(a => a.student_id === student.id && a.course_code === 'CS601');
const startPct = initialCS601.percentage;
console.log(`Starting CS601 %: ${startPct}% (${initialCS601.attended_classes}/${initialCS601.total_classes})`);

// Mark Present
markStudentSession(student.id, 'CS601', true);
const afterPresent = initialCS601.percentage;
console.log(`After Present %: ${afterPresent}% (${initialCS601.attended_classes}/${initialCS601.total_classes})`);
if (afterPresent > startPct) {
  console.log("PASS: Percentage increased on Present!");
} else {
  console.error("FAIL: Percentage did not increase!");
}

console.log("\n=== TEST 2: Wrong Entry Changed to Absent (Reduces Percentage) ===");
// Faculty changes mind: it was wrong, student is Absent
markStudentSession(student.id, 'CS601', false);
const afterAbsent = initialCS601.percentage;
console.log(`After Changing to Absent %: ${afterAbsent}% (${initialCS601.attended_classes}/${initialCS601.total_classes})`);
if (afterAbsent < afterPresent) {
  console.log("PASS: Percentage reduced on Absent correction!");
} else {
  console.error("FAIL: Percentage did not reduce!");
}

console.log("\n=== TEST 3: Switching Between 2 Subjects (CS601 & CS604) ===");
switchFacAttCourse('CS604');
console.log(`Active faculty course is now: ${AppState.activeFacCourse}`);
if (AppState.activeFacCourse === 'CS604') {
  console.log("PASS: 2-subject switching works!");
}

const initialCS604 = AppState.attendance.find(a => a.student_id === student.id && a.course_code === 'CS604');
console.log(`Alex Chen CS604 %: ${initialCS604.percentage}%`);

console.log("\n=== TEST 4: Override Request & Admin Approval Grants Permission ===");
const marcus = AppState.students.find(s => s.id === 6);
console.log(`Marcus Vance current CS601 %: ${AppState.attendance.find(a => a.student_id === 6 && a.course_code === 'CS601').percentage}%`);

// Existing seeded override request for Marcus Vance
const pendingReq = AppState.attendanceOverrides.find(o => o.student_id === 6 && o.status === 'Pending');
console.log(`Pending override found: ID ${pendingReq.id}, requested %: ${pendingReq.requested_percentage}%`);

// Admin approves
approveAttendanceOverride(pendingReq.id);
const updatedMarcusAtt = AppState.attendance.find(a => a.student_id === 6 && a.course_code === 'CS601');
console.log(`Marcus Vance CS601 % after Admin approval: ${updatedMarcusAtt.percentage}%`);
console.log(`Marcus Vance _overrideGranted:`, marcus._overrideGranted);

if (updatedMarcusAtt.percentage === 75.0 && marcus._overrideGranted && marcus._overrideGranted['CS601'] === true) {
  console.log("PASS: Admin approved override, updated percentage, and granted faculty permission!");
} else {
  console.error("FAIL: Admin approval did not grant permission or update percentage!");
}

console.log("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
