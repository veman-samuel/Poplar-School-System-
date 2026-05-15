import { Student, Staff, ClassGroup, Homework, SchemeOfWork, FeeTransaction, Announcement, Test } from "./types";

export const initialStudents: Student[] = [
  // Nursery Section
  {
    id: "stud-n1",
    name: "Leo Vance",
    section: "Nursery",
    className: "Tiny Tots (Preschool 1)",
    strengths: "Drawing, singing, high social empathy",
    weaknesses: "Short attention span, coordination during motor games",
    preferences: "Vibrant visual sheets, interactive storytelling",
    parentName: "Elena Vance",
    parentEmail: "elena.vance@poplar.edu",
    enrollmentStatus: "Approved",
    photo: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&auto=format&fit=crop&q=60",
    attendanceRate: 94,
    feesDue: 500,
    feesPaid: 1500,
    grades: {
      "Creative Coloring": 92,
      "Phonics & Rhymes": 95,
      "Sensory Coordination": 82
    }
  },
  {
    id: "stud-n2",
    name: "Oliver Smith",
    section: "Nursery",
    className: "Tiny Tots (Preschool 1)",
    strengths: "Counting blocks, active curiosity",
    weaknesses: "Shyness, pronunciation issues",
    preferences: "Hands-on blocks, sensory musical guides",
    parentName: "Patricia Smith",
    parentEmail: "patricia.smith@example.com",
    enrollmentStatus: "Pending",
    photo: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=200&auto=format&fit=crop&q=60",
    attendanceRate: 88,
    feesDue: 2000,
    feesPaid: 0,
    grades: {
      "Creative Coloring": 85,
      "Phonics & Rhymes": 78,
      "Sensory Coordination": 90
    }
  },
  // Primary Section
  {
    id: "stud-p1",
    name: "Clara Thorne",
    section: "Primary",
    className: "Grade 4 Bravo",
    strengths: "Avid reader, highly inquisitive about natural world",
    weaknesses: "Multiplication tables, arithmetic speed",
    preferences: "Puzzles, structural tables, audio stories",
    parentName: "Julian Thorne",
    parentEmail: "julian.thorne@poplar.edu",
    enrollmentStatus: "Approved",
    photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60",
    attendanceRate: 98,
    feesDue: 800,
    feesPaid: 2200,
    grades: {
      "Mathematics": 74,
      "English Literature": 94,
      "General Science": 89,
      "Physical Education": 90
    }
  },
  {
    id: "stud-p2",
    name: "Ambrose Gable",
    section: "Primary",
    className: "Grade 4 Bravo",
    strengths: "Mathematical logic, spatial patterns",
    weaknesses: "Spelling, hand-written essay structures",
    preferences: "Flowcharts, colored highlights, gamified spelling puzzles",
    parentName: "Mark Gable",
    parentEmail: "mgable@example.com",
    enrollmentStatus: "Approved",
    photo: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=60",
    attendanceRate: 92,
    feesDue: 0,
    feesPaid: 3200,
    grades: {
      "Mathematics": 96,
      "English Literature": 72,
      "General Science": 88,
      "Physical Education": 79
    }
  },
  // Secondary Section
  {
    id: "stud-s1",
    name: "Marcus Bloom",
    section: "Secondary",
    className: "Grade 11 Alpha (High School)",
    strengths: "Analytical coding, high chemistry intuition",
    weaknesses: "History essay pacing, speaking in public venues",
    preferences: "Concise summary charts, dynamic technical roadmaps",
    parentName: "Sarah Bloom",
    parentEmail: "sarah.bloom@poplar.edu",
    enrollmentStatus: "Approved",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=60",
    attendanceRate: 96,
    feesDue: 1200,
    feesPaid: 2800,
    grades: {
      "Advanced Math": 91,
      "Chemistry & Physics": 94,
      "World History": 76,
      "Computer Science": 98
    }
  },
  {
    id: "stud-s2",
    name: "Diana Sterling",
    section: "Secondary",
    className: "Grade 11 Alpha (High School)",
    strengths: "Public speaking, linguistic fluency in French and Latin",
    weaknesses: "Complex calculus integration proofs",
    preferences: "Historical text review, tabular comparative matrices",
    parentName: "Agatha Sterling",
    parentEmail: "asterling@poplar.edu",
    enrollmentStatus: "Approved",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60",
    attendanceRate: 95,
    feesDue: 4000,
    feesPaid: 0,
    grades: {
      "Advanced Math": 66,
      "Chemistry & Physics": 82,
      "World History": 96,
      "Computer Science": 85
    }
  }
];

export const initialStaffs: Staff[] = [
  // Section Managers
  {
    id: "staff-mgr-n",
    name: "Ms. Elena Vance",
    role: "SectionManager",
    section: "Nursery",
    email: "elena.vance@poplar.edu",
    phone: "+1-555-0101",
    salary: 5800,
    attendanceStatus: "Present"
  },
  {
    id: "staff-mgr-p",
    name: "Mr. Julian Thorne",
    role: "SectionManager",
    section: "Primary",
    email: "julian.thorne@poplar.edu",
    phone: "+1-555-0102",
    salary: 6200,
    attendanceStatus: "Present"
  },
  {
    id: "staff-mgr-s",
    name: "Dr. Sarah Bloom",
    role: "SectionManager",
    section: "Secondary",
    email: "sarah.bloom@poplar.edu",
    phone: "+1-555-0103",
    salary: 6800,
    attendanceStatus: "Present"
  },

  // Teachers
  {
    id: "staff-t1",
    name: "Mr. Alistair Cook",
    role: "Teacher",
    section: "Primary",
    subjectSpecialty: "Mathematics & Science",
    email: "acook@poplar.edu",
    phone: "+1-555-0211",
    salary: 4300,
    attendanceStatus: "Present"
  },
  {
    id: "staff-t2",
    name: "Mrs. Jane Bennett",
    role: "Teacher",
    section: "Secondary",
    subjectSpecialty: "Computer Science & Advanced Math",
    email: "jbennett@poplar.edu",
    phone: "+1-555-0212",
    salary: 4600,
    attendanceStatus: "Present"
  },
  {
    id: "staff-t3",
    name: "Miss Chloe Dupont",
    role: "Teacher",
    section: "Nursery",
    subjectSpecialty: "Phonics & Sensory Art",
    email: "cdupont@poplar.edu",
    phone: "+1-555-0213",
    salary: 3900,
    attendanceStatus: "Present"
  },

  // General Admin
  {
    id: "staff-admin-1",
    name: "Chief Admin Agatha Sterling",
    role: "Admin",
    email: "asterling@poplar.edu",
    phone: "+1-555-0001",
    salary: 7500,
    attendanceStatus: "Present"
  }
];

export const initialClasses: ClassGroup[] = [
  {
    id: "class-n1",
    name: "Tiny Tots (Preschool 1)",
    section: "Nursery",
    subjects: ["Creative Coloring", "Phonics & Rhymes", "Sensory Coordination"],
    teacherId: "staff-t3"
  },
  {
    id: "class-p1",
    name: "Grade 4 Bravo",
    section: "Primary",
    subjects: ["Mathematics", "English Literature", "General Science", "Physical Education"],
    teacherId: "staff-t1"
  },
  {
    id: "class-s1",
    name: "Grade 11 Alpha (High School)",
    section: "Secondary",
    subjects: ["Advanced Math", "Chemistry & Physics", "World History", "Computer Science"],
    teacherId: "staff-t2"
  }
];

export const initialHomeworks: Homework[] = [
  {
    id: "hw-1",
    classId: "class-p1",
    subject: "Mathematics",
    title: "Introductory Geometry & Polygon Math",
    description: "Complete chapter 4 homework sheets. Illustrate 3 regular shapes (polygon, square, trapezoid) and solve the perimeter queries.",
    dueDate: "2026-05-20",
    totalPoints: 20,
    submissions: {
      "stud-p1": {
        submittedAt: "2026-05-14T15:30:00Z",
        status: "Completed",
        score: 15,
        feedback: "Outstanding drawings! Please recheck problem 4 for perimeter formulation."
      },
      "stud-p2": {
        submittedAt: "2026-05-15T09:12:00Z",
        status: "Completed",
        score: 19,
        feedback: "Virtually flawless execution of polygon angles."
      }
    }
  },
  {
    id: "hw-2",
    classId: "class-p1",
    subject: "General Science",
    title: "Photosynthesis Diagram and Key Terms",
    description: "Draw the carbon-oxygen lifecycle diagram in your notebook. Identify stomata, chlorophyll, and define the glucose outcome.",
    dueDate: "2026-05-24",
    totalPoints: 10,
    submissions: {
      "stud-p1": {
        submittedAt: "2026-05-15T10:00:00Z",
        status: "Completed",
        score: 9,
        feedback: "Incredible attention to visual details!"
      }
    }
  },
  {
    id: "hw-3",
    classId: "class-s1",
    subject: "Computer Science",
    title: "Array and Dictionary Loop Implementation",
    description: "Write an iterative algorithm in pseudo-code to accumulate overall inventory totals stored inside modern nested maps.",
    dueDate: "2026-05-19",
    totalPoints: 50,
    submissions: {
      "stud-s1": {
        submittedAt: "2026-05-14T18:40:00Z",
        status: "Completed",
        score: 49,
        feedback: "Splendid optimized solution showing O(N) complexity!"
      }
    }
  }
];

export const initialSchemesOfWork: SchemeOfWork[] = [
  {
    id: "scheme-1",
    teacherId: "staff-t1",
    subject: "Mathematics",
    className: "Grade 4 Bravo",
    term: "Term 2",
    months: [
      {
        monthNumber: 1,
        title: "Basic Geometric Foundations",
        objectives: ["Identify vertices, edges, and internal angles in 2D shapes", "Derive standard formulas for perimeter metrics"],
        resources: ["Wooden geometric solids set", "Polygon interactive workspace tablets"]
      },
      {
        monthNumber: 2,
        title: "Advanced Multiplication Fractions",
        objectives: ["Recognize numerator and denominator proportions visually", "Execute compound multiplier divisions with custom matrices"],
        resources: ["Fractions colored slider scales", "Poplar customized printable visual puzzles"]
      },
      {
        monthNumber: 3,
        title: "Introduction to Practical Decimals",
        objectives: ["Translate real currency scenarios into system floating points", "Convert fractions to basic tenths and hundredths"],
        resources: ["Poplar mock store currencies", "Digital decimals ledger tools"]
      },
      {
        monthNumber: 4,
        title: "Comprehensive Assessment Preparations",
        objectives: ["Revise Term 2 diagnostic objectives", "Conduct high school readiness performance simulations"],
        resources: ["Interactive digital diagnostic applet", "1-on-1 personalized review logs"]
      }
    ]
  },
  {
    id: "scheme-2",
    teacherId: "staff-t2",
    subject: "Computer Science",
    className: "Grade 11 Alpha (High School)",
    term: "Term 2",
    months: [
      {
        monthNumber: 1,
        title: "Data Structures & Nested Sets",
        objectives: ["Build lists, dictionaries, tuples", "Analyze execution costs of lookup keys"],
        resources: ["Python compiler console", "Visual algorithms sandbox animations"]
      },
      {
        monthNumber: 2,
        title: "Objected Oriented Solid Models",
        objectives: ["Understand base classes, inheritable systems, encapsulation"],
        resources: ["Interactive sandbox design apps", "UML structured layouts workbook"]
      },
      {
        monthNumber: 3,
        title: "SQL Databases & Queries",
        objectives: ["Formulate basic SELECT fields", "Join primary records with Foreign unique IDs"],
        resources: ["Poplar playground database port", "Relational diagnostic worksheets"]
      },
      {
        monthNumber: 4,
        title: "Terminal Capstone Codebase Projects",
        objectives: ["Formulate custom dynamic backends for online school shops"],
        resources: ["Shared git workflows", "Developer API mock gateways"]
      }
    ]
  }
];

export const initialFeeTransactions: FeeTransaction[] = [
  {
    id: "txn-1",
    studentId: "stud-n1",
    amount: 1500,
    date: "2026-05-10",
    paymentMethod: "Bank Transfer",
    status: "Approved",
    receiptNo: "REC-POPLAR-39391"
  },
  {
    id: "txn-2",
    studentId: "stud-p1",
    amount: 2200,
    date: "2026-05-12",
    paymentMethod: "Credit Card",
    status: "Approved",
    receiptNo: "REC-POPLAR-99321"
  },
  {
    id: "txn-3",
    studentId: "stud-s1",
    amount: 2800,
    date: "2026-05-14",
    paymentMethod: "Mobile Money Pay",
    status: "Approved",
    receiptNo: "REC-POPLAR-11104"
  },
  {
    id: "txn-4",
    studentId: "stud-s2",
    amount: 4000,
    date: "2026-05-15",
    paymentMethod: "Direct Bank Draft",
    status: "Pending",
    receiptNo: "REC-POPLAR-PEND-22"
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    section: "All",
    title: "Poplar School Annual Cultural & Science Gala Day",
    content: "Greetings Poplar family! We are delighted to announce our Annual Gala will take place next month. Each section will showcase custom visual projects. Parents are warmly invited to lead the custom snacks stall. Detailed schedules have been dispatched to the PTA Council.",
    date: "2026-05-15",
    author: "Chief Admin Agatha Sterling"
  },
  {
    id: "ann-2",
    section: "Nursery",
    title: "Sensory Playground Renovation Accomplished",
    content: "Ms. Elena Vance is thrilled to communicate that the Nursery sensory playground upgrade is complete! New safe non-toxic structures and color-matching grids are ready for our little ones' motor development drills. Feel free to join for feedback on Monday.",
    date: "2026-05-14",
    author: "Ms. Elena Vance"
  },
  {
    id: "ann-3",
    section: "Primary",
    title: "Primary Math Olympiad Submissions",
    content: "Calling all little minds! Please confirm enrollment in our section's puzzle diagnostic event through Julian Thorne before Friday. Prizes are ready!",
    date: "2026-05-11",
    author: "Mr. Julian Thorne"
  }
];

export const initialTests: Test[] = [
  {
    id: "test-1",
    classId: "class-p1", // Primary Grade 4 Bravo
    subject: "Mathematics",
    title: "Mid-Term Mathematics Speed Quiz",
    description: "A short assessment covering multiplication tables, quick division, and basic word problems.",
    totalPoints: 20,
    dueDate: "2026-06-15",
    questions: [
      {
        id: "q-1",
        type: "multiple-choice",
        text: "What is 12 multiplied by 8?",
        options: ["A) 86", "B) 96", "C) 106", "D) 76"],
        correctAnswer: "B",
        maxPoints: 5
      },
      {
        id: "q-2",
        type: "one-word",
        text: "What is the name of a triangle that has all three sides equal (all sides matching in size)?",
        correctAnswer: "equilateral",
        maxPoints: 5
      },
      {
        id: "q-3",
        type: "essay",
        text: "Explain in 2-3 sentences how you would solve the algebraic equation: 3x + 5 = 20.",
        maxPoints: 10
      }
    ],
    submissions: {
      "stud-p1": {
        submittedAt: "2026-05-14T10:00:00Z",
        answers: {
          "q-1": "B",
          "q-2": "equilateral",
          "q-3": "First, subtract 5 from both sides to get 3x = 15. Then divide both sides by 3 to get x = 5. Therefore the correct answer is x = 5."
        },
        score: 18,
        feedback: "Outstanding work Clara! Perfect algebraic reasoning, very clear explanation.",
        status: "Completed"
      }
    }
  },
  {
    id: "test-2",
    classId: "class-s1", // Secondary
    subject: "Computer Science",
    title: "Algorithms & Logic Gates Exam",
    description: "Covers standard gate outputs (AND, OR, XOR) and simple array search pacing.",
    totalPoints: 30,
    dueDate: "2026-06-20",
    questions: [
      {
        id: "test2-q1",
        type: "multiple-choice",
        text: "Which logic gate outputs 1 only when its two input bits are different?",
        options: ["A) AND", "B) OR", "C) XOR", "D) NAND"],
        correctAnswer: "C",
        maxPoints: 10
      },
      {
        id: "test2-q2",
        type: "one-word",
        text: "What is the worst-case space complexity of standard merge sort? (e.g. O(1), O(n), or other)",
        correctAnswer: "O(n)",
        maxPoints: 10
      },
      {
        id: "test2-q3",
        type: "essay",
        text: "Briefly explain the main difference between a Stack and a Queue data structure, highlighting how elements are added and removed (LIFO vs FIFO).",
        maxPoints: 10
      }
    ],
    submissions: {}
  }
];

