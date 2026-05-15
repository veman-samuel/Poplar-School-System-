export type UserRole = "Visitor" | "SectionManager" | "Teacher" | "Learner" | "Admin";

export interface Student {
  id: string;
  name: string;
  section: "Nursery" | "Primary" | "Secondary";
  className: string;
  strengths: string;
  weaknesses: string;
  preferences: string;
  parentName: string;
  parentEmail: string;
  enrollmentStatus: "Pending" | "Approved";
  photo: string;
  attendanceRate: number; // percentage
  feesDue: number;
  feesPaid: number;
  grades: { [subject: string]: number }; // e.g. { "Mathematics": 85 }
}

export interface Staff {
  id: string;
  name: string;
  role: "Teacher" | "SectionManager" | "Admin";
  section?: "Nursery" | "Primary" | "Secondary";
  subjectSpecialty?: string;
  email: string;
  phone: string;
  salary: number;
  attendanceStatus: "Present" | "Absent" | "Excused";
}

export interface ClassGroup {
  id: string;
  name: string; // e.g. "Grade 4", "Tiny Tots"
  section: "Nursery" | "Primary" | "Secondary";
  subjects: string[];
  teacherId: string;
}

export interface Homework {
  id: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  submissions: {
    [studentId: string]: {
      submittedAt: string;
      status: "Pending" | "Completed";
      score?: number;
      feedback?: string;
    };
  };
}

export interface SchemeOfWork {
  id: string;
  teacherId: string;
  subject: string;
  className: string;
  term: string;
  months: {
    monthNumber: number;
    title: string;
    objectives: string[];
    resources: string[];
  }[];
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: "Pending" | "Approved";
  receiptNo: string;
}

export interface Announcement {
  id: string;
  section: "Nursery" | "Primary" | "Secondary" | "All";
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface AIWeeklyMilestone {
  week: string;
  focus: string;
  activity: string;
  type: "math" | "languages" | "science" | "humanities" | "creative";
}

export interface AIPersonalizedPath {
  studentName: string;
  academicGoal: string;
  weeklyMilestones: AIWeeklyMilestone[];
  personalizedTips: string[];
}

export interface TestQuestion {
  id: string;
  type: "multiple-choice" | "one-word" | "essay";
  text: string;
  options?: string[]; // only for multiple-choice
  correctAnswer?: string; // correct option letter (e.g. A, B, C, D) or correct word
  maxPoints: number;
}

export interface TestSubmission {
  submittedAt: string;
  answers: { [questionId: string]: string }; // questionId -> answer
  score?: number;
  feedback?: string;
  status: "Pending" | "Completed";
}

export interface Test {
  id: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  totalPoints: number;
  dueDate: string;
  submissions: {
    [studentId: string]: TestSubmission;
  };
}

