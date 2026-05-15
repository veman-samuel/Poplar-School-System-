import React, { useState, useEffect } from "react";
import { Student, Staff, ClassGroup, Homework, SchemeOfWork, FeeTransaction, Announcement, AIPersonalizedPath, Test } from "./types";
import {
  initialStudents,
  initialStaffs,
  initialClasses,
  initialHomeworks,
  initialSchemesOfWork,
  initialFeeTransactions,
  initialAnnouncements,
  initialTests
} from "./mockData";
import LandingPage from "./components/LandingPage";
import AdminPortal from "./components/AdminPortal";
import SectionManagerPortal from "./components/SectionManagerPortal";
import TeacherPortal from "./components/TeacherPortal";
import LearnerPortal from "./components/LearnerPortal";
import { KeyRound, ShieldAlert, Monitor, Sparkles, BookOpen, UserCircle, LogOut } from "lucide-react";

// Helper keys for localStorage persistence
const LS_STUDENTS = "poplar_students_v1";
const LS_STAFF = "poplar_staff_v1";
const LS_CLASSES = "poplar_classes_v1";
const LS_HOMEWORKS = "poplar_homeworks_v1";
const LS_SOW = "poplar_sow_v1";
const LS_TXNS = "poplar_txns_v1";
const LS_ANNOUNCEMENTS = "poplar_announcements_v1";
const LS_LANDING_CONFIG = "poplar_landing_config_v1";
const LS_TESTS = "poplar_tests_v1";

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  directorIntroWords: string;
  directorName: string;
  directorRole: string;
  ptaTitle: string;
  ptaMessage: string;
  aboutContent: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

const defaultLandingConfig: LandingConfig = {
  heroTitle: "Cultivating Elite Minds, Inspiring Bright Futures",
  heroSubtitle: "A premium triple-section academy (Nursery, Primary, and Secondary) fostering holistic growth, deep analytical thinking, and tailored creative milestones.",
  directorIntroWords: "Every child is an individual story waiting to unfold. Here at Poplar School, we don't just instruct; we nourish the creative soul, sharpen analytical instincts, and establish paths that turn curiosity into lifetime leadership qualities.",
  directorName: "Dr. Agatha Sterling",
  directorRole: "Executive Director & Founder",
  ptaTitle: "Active Collaboration: The Poplar PTA Council",
  ptaMessage: "Our Parent-Teacher Association believes in absolute structural alignment. Regular bimonthly forums review student attendance diagnostics, verify developmental playground safety, and maintain the Poplar Excellence Fund.",
  aboutContent: "Poplar School represents a modern standard of multi-tiered academic distinction. Serving the local community, our Nursery section establishes motor coordination and phonics milestones. The Primary branch initiates spatial and multiplication frameworks. The Secondary program elevates advanced studies into chemistry, calculus, and algorithms.",
  contactEmail: "portal.admin@poplar.edu",
  contactPhone: "+1 (555) 0100",
  contactAddress: "747 Royal Poplar Drive, Academic Ridge, NW"
};

export default function App() {
  // Stateful Entities (Initialized from local storage or preloaded fallback defaults)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(LS_STUDENTS);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(LS_STAFF);
    return saved ? JSON.parse(saved) : initialStaffs;
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem(LS_CLASSES);
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    const saved = localStorage.getItem(LS_HOMEWORKS);
    return saved ? JSON.parse(saved) : initialHomeworks;
  });

  const [schemesOfWork, setSchemesOfWork] = useState<SchemeOfWork[]>(() => {
    const saved = localStorage.getItem(LS_SOW);
    return saved ? JSON.parse(saved) : initialSchemesOfWork;
  });

  const [transactions, setTransactions] = useState<FeeTransaction[]>(() => {
    const saved = localStorage.getItem(LS_TXNS);
    return saved ? JSON.parse(saved) : initialFeeTransactions;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(LS_ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [landingConfig, setLandingConfig] = useState<LandingConfig>(() => {
    const saved = localStorage.getItem(LS_LANDING_CONFIG);
    return saved ? JSON.parse(saved) : defaultLandingConfig;
  });

  const [tests, setTests] = useState<Test[]>(() => {
    const saved = localStorage.getItem(LS_TESTS);
    return saved ? JSON.parse(saved) : initialTests;
  });

  // Active Role and Persona State
  const [currentRole, setCurrentRole] = useState<"Visitor" | "Admin" | "SectionManager" | "Teacher" | "Learner">("Visitor");
  const [activePersonaId, setActivePersonaId] = useState<string>("");
  const [activeSection, setActiveSection] = useState<"Nursery" | "Primary" | "Secondary">("Primary");

  const [deviceFrameMode, setDeviceFrameMode] = useState(false); // Can wrap the dashboard in a luxury tablet shell simulated border
  const [showRoleSelectorModal, setShowRoleSelectorModal] = useState(false);

  // Sync to localStorage on every update
  useEffect(() => {
    localStorage.setItem(LS_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LS_STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(LS_CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(LS_HOMEWORKS, JSON.stringify(homeworks));
  }, [homeworks]);

  useEffect(() => {
    localStorage.setItem(LS_SOW, JSON.stringify(schemesOfWork));
  }, [schemesOfWork]);

  useEffect(() => {
    localStorage.setItem(LS_TXNS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LS_ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(LS_LANDING_CONFIG, JSON.stringify(landingConfig));
  }, [landingConfig]);

  useEffect(() => {
    localStorage.setItem(LS_TESTS, JSON.stringify(tests));
  }, [tests]);

  // Handle Switch to Specific Prepared Demo Accounts
  const handleQuickLogin = (role: "Visitor" | "Admin" | "SectionManager" | "Teacher" | "Learner", id: string = "", section: "Nursery" | "Primary" | "Secondary" = "Primary") => {
    setCurrentRole(role);
    setActivePersonaId(id);
    setActiveSection(section);
    setShowRoleSelectorModal(false);
  };

  // State modifiers accessed by sub-portals
  const updateLandingConfig = (newConfig: LandingConfig) => {
    setLandingConfig(newConfig);
  };

  const approveEnrollment = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, enrollmentStatus: "Approved" } : s))
    );
  };

  const addStudent = (newS: Student) => {
    setStudents(prev => [...prev, newS]);
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const addStaff = (newS: Staff) => {
    setStaff(prev => [...prev, newS]);
  };

  const updateSalary = (staffId: string, newSalary: number) => {
    setStaff(prev =>
      prev.map(s => (s.id === staffId ? { ...s, salary: newSalary } : s))
    );
  };

  const addGlobalAnnouncement = (newAnn: Announcement) => {
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const createClass = (className: string, subjects: string[], teacherId: string) => {
    const newClass: ClassGroup = {
      id: "class-" + Date.now().toString().slice(-4),
      name: className,
      section: activeSection,
      subjects,
      teacherId
    };
    setClasses(prev => [...prev, newClass]);
  };

  const addTeacher = (name: string, specialty: string, email: string, phone: string, salary: number) => {
    const newT: Staff = {
      id: "staff-" + Date.now().toString().slice(-4),
      name,
      role: "Teacher",
      section: activeSection,
      subjectSpecialty: specialty,
      email,
      phone,
      salary,
      attendanceStatus: "Present"
    };
    setStaff(prev => [...prev, newT]);
  };

  const addSectionCommunication = (title: string, content: string) => {
    const newAnn: Announcement = {
      id: "ann-" + Date.now().toString().slice(-4),
      section: activeSection,
      title,
      content,
      date: new Date().toISOString().split("T")[0],
      author: staff.find(s => s.role === "SectionManager" && s.section === activeSection)?.name || "Section Head"
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const registerFeePayment = (studentId: string, amount: number, paymentMethod: string) => {
    // Deduct due, increment paid
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const actualPaid = s.feesPaid + amount;
          const actualDue = Math.max(0, s.feesDue - amount);
          return { ...s, feesPaid: actualPaid, feesDue: actualDue };
        }
        return s;
      })
    );
    // Add transaction audit slip
    const newTxn: FeeTransaction = {
      id: "txn-" + Date.now().toString().slice(-4),
      studentId,
      amount,
      date: new Date().toISOString().split("T")[0],
      paymentMethod,
      status: "Approved",
      receiptNo: "REC-POPLAR-MANUAL-" + Math.floor(Math.random() * 90000 + 10000)
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  const addHomework = (hw: Homework) => {
    setHomeworks(prev => [...prev, hw]);
  };

  const gradeHomework = (hwId: string, studentId: string, score: number, feedback: string) => {
    setHomeworks(prev =>
      prev.map(hw => {
        if (hw.id === hwId) {
          const updatedSubmissions = {
            ...hw.submissions,
            [studentId]: {
              submittedAt: new Date().toISOString(),
              status: "Completed" as const,
              score,
              feedback
            }
          };
          return { ...hw, submissions: updatedSubmissions };
        }
        return hw;
      })
    );

    // Additionally, write to the student's grades object automatically
    const targetHw = homeworks.find(h => h.id === hwId);
    if (targetHw) {
      setStudents(prev =>
        prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              grades: {
                ...s.grades,
                [targetHw.subject]: score >= 0 ? score : 0
              }
            };
          }
          return s;
        })
      );
    }
  };

  const updateSchemeOfWork = (scheme: SchemeOfWork) => {
    setSchemesOfWork(prev =>
      prev.map(s => (s.id === scheme.id ? scheme : s))
    );
  };

  const addSchemeOfWork = (scheme: SchemeOfWork) => {
    setSchemesOfWork(prev => [...prev, scheme]);
  };

  // Modify attendance metrics (Mocking present rate)
  const updateStudentAttendance = (studentId: string, value: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const rate = Math.min(100, Math.max(0, s.attendanceRate + value));
          return { ...s, attendanceRate: rate };
        }
        return s;
      })
    );
  };

  const handleHandInHomework = (hwId: string, solutionText: string) => {
    setHomeworks(prev =>
      prev.map(hw => {
        if (hw.id === hwId) {
          return {
            ...hw,
            submissions: {
              ...hw.submissions,
              [activePersonaId]: {
                submittedAt: new Date().toISOString(),
                status: "Pending" as const,
                feedback: `Answer Logged: ${solutionText.slice(0, 40)}...`
              }
            }
          };
        }
        return hw;
      })
    );
  };

  const handleSavePersonalizedPath = (path: AIPersonalizedPath) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.name === path.studentName) {
          return {
            ...s,
            // Track learning achievements or modify attributes relative to generated path
            preferences: `Study Mode: self-paced timeline. Preferred tips: ${path.personalizedTips.slice(0, 2).join(", ")}`
          };
        }
        return s;
      })
    );
  };

  const addTest = (newT: Test) => {
    setTests(prev => [...prev, newT]);
  };

  const handleGradeTest = (testId: string, studentId: string, score: number, feedback: string) => {
    setTests(prev =>
      prev.map(t => {
        if (t.id === testId) {
          const sub = t.submissions[studentId] || { submittedAt: new Date().toISOString(), answers: {}, status: "Pending" };
          const updatedSubmissions = {
            ...t.submissions,
            [studentId]: {
              ...sub,
              status: "Completed" as const,
              score,
              feedback
            }
          };
          return { ...t, submissions: updatedSubmissions };
        }
        return t;
      })
    );

    // Write to student grades automatically
    const targetTest = tests.find(t => t.id === testId);
    if (targetTest) {
      setStudents(prev =>
        prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              grades: {
                ...s.grades,
                [targetTest.subject]: score
              }
            };
          }
          return s;
        })
      );
    }
  };

  const handleSubmitTest = (testId: string, studentId: string, answers: { [qId: string]: string }) => {
    setTests(prev =>
      prev.map(t => {
        if (t.id === testId) {
          return {
            ...t,
            submissions: {
              ...t.submissions,
              [studentId]: {
                submittedAt: new Date().toISOString(),
                answers,
                status: "Pending"
              }
            }
          };
        }
        return t;
      })
    );
  };

  // Get active student or active teacher variables if needed
  const activeStudentProfile = students.find(s => s.id === activePersonaId);
  const activeTeacherProfile = staff.find(s => s.id === activePersonaId);

  return (
    <div className="min-h-screen bg-[#240808] text-slate-100 flex flex-col font-sans">
      {/* Dynamic Gold-Glow Status Line */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#1E90FF] to-pink-500 shadow-sm z-50"></div>

      {/* Corporate floating header tool bar */}
      <div className="bg-[#1C0505] border-b border-[#FFD700]/15 px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 relative shadow-xl">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl font-serif tracking-tight font-black uppercase text-[#FFD700] flex items-center gap-1.5 font-bold italic">
            Poplar Connect
            <span className="text-xs font-mono uppercase bg-white/5 border border-[#ffd700]/20 text-[#FFD700] px-2 py-0.5 rounded-full tracking-widest leading-none not-italic">
              Portal v2.6
            </span>
          </span>
        </div>

        {/* Workspace Active Role Widget / Controller */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 text-xs font-semibold uppercase tracking-wider font-mono">
            <Monitor className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="text-slate-300">Workspace Framework:</span>
            <span className="text-[#FFD700] font-black italic">
              {currentRole === "Visitor" ? "Landing Page (Active)" : `${currentRole} Section`}
            </span>
          </div>

          <button
            onClick={() => setShowRoleSelectorModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-br from-[#FFD700] to-[#E5C100] text-[#2D0A0A] font-bold text-xs rounded-full uppercase tracking-widest shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/35 transition-all outline-none border-none cursor-pointer hover:scale-105"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Portal Selector / Sandbox Login</span>
          </button>

          {currentRole !== "Visitor" && (
            <button
              onClick={() => handleQuickLogin("Visitor")}
              className="p-2 bg-[#2D0A0A] hover:bg-rose-500/10 text-rose-400 font-bold text-xs uppercase tracking-wider rounded-full border border-rose-500/20 max-w-xs cursor-pointer"
              title="Return to Public Landing Page"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col">
        {currentRole === "Visitor" ? (
          /* Visitor View (Editable Landing Page Content) */
          <LandingPage
            config={landingConfig}
            announcements={announcements}
            students={students}
            staffList={staff}
            onOpenPortal={() => setShowRoleSelectorModal(true)}
          />
        ) : (
          /* Core Portals Workspace Frame */
          <div className="p-4 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
            {/* Quick Helper Profile Bar */}
            <div className="bg-[#2D0A0A]/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between text-xs gap-4 shadow-md font-mono">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0"></div>
                <span className="text-slate-300">Secure Sandboxed User:</span>
                <span className="text-[#FFD700] font-bold uppercase tracking-wider">
                  {currentRole === "Admin" && "Chief Agatha Sterling (Super Admin)"}
                  {currentRole === "SectionManager" && `${staff.find(s => s.role === "SectionManager" && s.section === activeSection)?.name || "Section Supervisor"} (${activeSection} Head)`}
                  {currentRole === "Teacher" && `${activeTeacherProfile?.name || "Teacher Tutor"} (Tutor)`}
                  {currentRole === "Learner" && `${activeStudentProfile?.name || "Learner"} (${activeStudentProfile?.className})`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Environment Sandbox: All writes logged in memory.</span>
                <button
                  onClick={() => {
                    if (window.confirm("Restore factory defaults? This clears custom names, grades, and Scheme adjustments stored in LocalStorage.")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-2.5 py-1 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded text-[9px] uppercase font-bold tracking-wider cursor-pointer border-none"
                >
                  Factory Reset State
                </button>
              </div>
            </div>

            {/* Conditionally Render Portal Blocks */}
            {currentRole === "Admin" && (
              <AdminPortal
                students={students}
                staff={staff}
                announcements={announcements}
                transactions={transactions}
                landingConfig={landingConfig}
                onUpdateConfig={updateLandingConfig}
                onApproveEnrollment={approveEnrollment}
                onAddStudent={addStudent}
                onDeleteStudent={deleteStudent}
                onAddStaff={addStaff}
                onUpdateSalary={updateSalary}
                onAddGlobalAnnouncement={addGlobalAnnouncement}
              />
            )}

            {currentRole === "SectionManager" && (
              <SectionManagerPortal
                section={activeSection}
                students={students}
                staff={staff}
                classes={classes}
                announcements={announcements}
                transactions={transactions}
                onApproveEnrollment={approveEnrollment}
                onCreateClass={createClass}
                onAddTeacher={addTeacher}
                onAddSectionCommunication={addSectionCommunication}
                onRegisterFeePayment={registerFeePayment}
              />
            )}

            {currentRole === "Teacher" && (
              <TeacherPortal
                teacherId={activePersonaId}
                students={students}
                staff={staff}
                classes={classes}
                homeworks={homeworks}
                schemesOfWork={schemesOfWork}
                onAddHomework={addHomework}
                onGradeHomework={gradeHomework}
                onUpdateSchemeOfWork={updateSchemeOfWork}
                onAddSchemeOfWork={addSchemeOfWork}
                onUpdateStudentAttendance={updateStudentAttendance}
                tests={tests}
                onAddTest={addTest}
                onGradeTest={handleGradeTest}
              />
            )}

            {currentRole === "Learner" && activeStudentProfile && (
              <LearnerPortal
                student={activeStudentProfile}
                classes={classes}
                homeworks={homeworks}
                onHandInHomework={handleHandInHomework}
                onSavePersonalizedPath={handleSavePersonalizedPath}
                tests={tests}
                onSubmitTest={handleSubmitTest}
              />
            )}
          </div>
        )}
      </div>

      {/* Luxury Role Selector Modal / Popup Frame */}
      {showRoleSelectorModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2D0A0A] text-slate-100 rounded-3xl p-6 lg:p-8 w-full max-w-4xl border border-[#FFD700]/25 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-serif text-[#FFD700] italic font-bold">Poplar Security Gateway</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
              Single Sign-On (SSO) Sandbox Portals — Select a persona to test exact credentials:
            </p>

            <button
              onClick={() => setShowRoleSelectorModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#FFD700] font-bold text-lg border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>

            {/* Grid of Demarcated portals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
              {/* Box 1: Public View */}
              <div className="bg-[#3D0F0F] rounded-2xl p-4 border border-white/5 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-[#FFD700] font-bold">Public Space</span>
                  <h4 className="font-serif italic font-bold text-lg text-white pt-1">Visitor Portal</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light mt-1">
                    Gaze upon the elite responsive landing page with Director's speech, PTA directives, and dynamic dispatches.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLogin("Visitor")}
                  className="w-full py-2 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] text-xs font-bold uppercase tracking-wider rounded border-none cursor-pointer"
                >
                  Load Landing View
                </button>
              </div>

              {/* Box 2: Super Admin */}
              <div className="bg-[#3D0F0F] rounded-2xl p-4 border border-[#FFD700]/15 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400 font-bold">Authority Concept</span>
                  <h4 className="font-serif italic font-bold text-lg text-white pt-1">Super Administrator</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light mt-1">
                    Modify the live text parameters of the parent landing page, add newly admitted student profiles, and update global faculty payroll records.
                  </p>
                </div>
                <button
                  onClick={() => handleQuickLogin("Admin", "staff-admin-1")}
                  className="w-full py-2 bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-emerald-400 transition-colors border-none cursor-pointer"
                >
                  Login as Chief Admin (Agatha)
                </button>
              </div>

              {/* Box 3: Section Manager Division */}
              <div className="bg-[#3D0F0F] rounded-2xl p-4 border border-[#1E90FF]/15 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-[#1E90FF] font-bold">Department Heads</span>
                  <h4 className="font-serif italic font-bold text-lg text-white pt-1">Section Coordinator</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light mt-1">
                    Manage classes, create faculty teachers, approve parent requests, post section announcements, and view fees.
                  </p>

                  <div className="space-y-1 mt-3">
                    <label className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Active Department Section:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["Nursery", "Primary", "Secondary"] as const).map(sec => (
                        <button
                          key={sec}
                          onClick={() => setActiveSection(sec)}
                          className={`text-[9px] py-1 border rounded capitalize text-center ${
                            activeSection === sec
                              ? "bg-[#1E90FF] text-white border-[#1E90FF] font-bold"
                              : "text-slate-400 bg-black/30 border-white/5"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const profileId = activeSection === "Nursery" ? "staff-mgr-n" : activeSection === "Primary" ? "staff-mgr-p" : "staff-mgr-s";
                    handleQuickLogin("SectionManager", profileId, activeSection);
                  }}
                  className="w-full py-2 bg-[#1E90FF] text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-[#1E90FF]/85 border-none cursor-pointer"
                >
                  Load {activeSection} Manager
                </button>
              </div>

              {/* Box 4: Teachers & Learners Roles */}
              <div className="bg-[#3D0F0F] rounded-2xl p-4 border border-pink-500/10 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-pink-400 font-bold">Class Instructors & Pupils</span>
                  <h4 className="font-serif italic font-bold text-lg text-white pt-1">Active Faculty/Scholars</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light mt-1">
                    Plan Term 4-month Schemes of Work, grade assignments, mark daily attendance registers, or generate AI personalized learning checklist maps.
                  </p>

                  {/* Quick trigger lists for Mr Alistair, Clara, Marcus etc. */}
                  <div className="space-y-2.5 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 font-mono block">Faculty Tutors:</span>
                      <div className="flex flex-col gap-1 mt-1 font-mono text-[9px]">
                        <button
                          onClick={() => handleQuickLogin("Teacher", "staff-t1", "Primary")}
                          className="bg-black/40 hover:bg-black/60 p-1 rounded text-left border border-white/5 text-[#FFD700] font-bold cursor-pointer"
                        >
                          Mr. Alistair Cook (Primary Math)
                        </button>
                        <button
                          onClick={() => handleQuickLogin("Teacher", "staff-t2", "Secondary")}
                          className="bg-black/40 hover:bg-black/60 p-1 rounded text-left border border-white/5 text-[#FFD700] font-bold cursor-pointer"
                        >
                          Mrs. Jane Bennett (Secondary Computer Science)
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-slate-400 font-mono block">Approved Scholars:</span>
                      <div className="flex flex-col gap-1 mt-1 font-mono text-[9px]">
                        <button
                          onClick={() => handleQuickLogin("Learner", "stud-p1", "Primary")}
                          className="bg-black/40 hover:bg-black/60 p-1 rounded text-left border border-white/5 text-[#1E90FF] font-bold cursor-pointer"
                        >
                          Clara Thorne (Grade 4 Bravo)
                        </button>
                        <button
                          onClick={() => handleQuickLogin("Learner", "stud-s1", "Secondary")}
                          className="bg-black/40 hover:bg-black/60 p-1 rounded text-left border border-white/5 text-[#1E90FF] font-bold cursor-pointer"
                        >
                          Marcus Bloom (Grade 11 Alpha)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
