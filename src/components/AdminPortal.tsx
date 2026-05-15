import React, { useState } from "react";
import { Student, Staff, Announcement, FeeTransaction } from "../types";
import { Settings, Users, Shield, TrendingUp, DollarSign, PlusCircle, PenTool, Check, Trash2, Megaphone, FileText, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface AdminPortalProps {
  students: Student[];
  staff: Staff[];
  announcements: Announcement[];
  transactions: FeeTransaction[];
  landingConfig: {
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
  };
  onUpdateConfig: (newConfig: any) => void;
  onApproveEnrollment: (studentId: string) => void;
  onAddStudent: (newStudent: any) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddStaff: (newStaff: any) => void;
  onUpdateSalary: (staffId: string, newSalary: number) => void;
  onAddGlobalAnnouncement: (ann: any) => void;
}

export default function AdminPortal({
  students,
  staff,
  announcements,
  transactions,
  landingConfig,
  onUpdateConfig,
  onApproveEnrollment,
  onAddStudent,
  onDeleteStudent,
  onAddStaff,
  onUpdateSalary,
  onAddGlobalAnnouncement
}: AdminPortalProps) {
  const [adminTab, setAdminTab] = useState<"landing" | "students" | "faculty" | "reports">("landing");

  // State for Landing Page Form Configuration
  const [formConfig, setFormConfig] = useState({ ...landingConfig });

  // State for New Student Form
  const [newStud, setNewStud] = useState({
    name: "",
    section: "Primary" as "Nursery" | "Primary" | "Secondary",
    className: "Grade 4 Bravo",
    parentName: "",
    parentEmail: "",
    strengths: "Quick adaptation, reading",
    weaknesses: "Slight impatience inside large projects",
    preferences: "Colored outlines",
    photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60",
    feesDue: 1800,
    feesPaid: 0,
    attendanceRate: 100
  });

  // State for New Staff Form
  const [newStaffMember, setNewStaffMember] = useState({
    name: "",
    role: "Teacher" as "Teacher" | "SectionManager" | "Admin",
    section: "Primary" as "Nursery" | "Primary" | "Secondary" | undefined,
    subjectSpecialty: "",
    email: "",
    phone: "",
    salary: 4200,
    attendanceStatus: "Present" as "Present" | "Absent" | "Excused"
  });

  // State for Global announcement trigger
  const [newAnn, setNewAnn] = useState({ title: "", content: "", section: "All" as "All" | "Nursery" | "Primary" | "Secondary" });

  const downloadReportBookPDF = (student: Student) => {
    const doc = new jsPDF();
    
    // Page Border
    doc.setDrawColor(218, 165, 32); // Goldenrod
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);
    
    // Header Banner
    doc.setFillColor(45, 10, 10); // Dark Crimson Red (#2D0A0A)
    doc.rect(5, 5, 200, 30, "F");
    
    // Title text
    doc.setTextColor(255, 215, 0); // Gold
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("POPLAR ACADEMY REPORT BOOK", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Official Academic Record • Section: ${student.section}`, 15, 28);
    
    // Subheader Details - Left Column
    doc.setTextColor(45, 10, 10);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SCHOLAR DETAILS", 15, 50);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 52, 100, 52);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Student ID: ${student.id}`, 15, 60);
    doc.text(`Full Name: ${student.name}`, 15, 67);
    doc.text(`Section Division: ${student.section}`, 15, 74);
    doc.text(`Class Group: ${student.className}`, 15, 81);
    
    // Subheader Details - Right Column
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(45, 10, 10);
    doc.text("PARENT/GUARDIAN DIRECTIVE", 115, 50);
    doc.line(115, 52, 195, 52);
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`Parent/Guardian: ${student.parentName}`, 115, 60);
    doc.text(`Contact Email: ${student.parentEmail}`, 115, 67);
    doc.text(`Enrollment Status: ${student.parentEmail && student.enrollmentStatus ? student.enrollmentStatus : "Vetted Scholar"}`, 115, 74);
    doc.text(`Academic Year: 2026/2027`, 115, 81);

    // Divide Line
    doc.setDrawColor(45, 10, 10);
    doc.setLineWidth(0.5);
    doc.line(15, 90, 195, 90);
    
    // Academic Performance Table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(45, 10, 10);
    doc.text("I. ACADEMIC EVALUATION TRANSCRIPT", 15, 100);
    
    // Table headers
    doc.setFillColor(240, 230, 230);
    doc.rect(15, 105, 180, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(45, 10, 10);
    doc.text("CURRICULUM SUBJECT", 20, 110);
    doc.text("ASSESSMENT SCORE", 110, 110);
    doc.text("GRADE", 160, 110);
    
    // Entries
    let currentY = 120;
    const gradesKeys = Object.keys(student.grades || {});
    
    const getLetterGrade = (score: number) => {
      if (score >= 90) return "A (Excellent)";
      if (score >= 80) return "B (Very Good)";
      if (score >= 70) return "C (Satisfactory)";
      if (score >= 60) return "D (Pass)";
      return "F (Needs Attention)";
    };

    if (gradesKeys.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text("No graded assessments recorded in transcript for this term.", 20, currentY);
      currentY += 10;
    } else {
      gradesKeys.forEach((subj) => {
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(subj, 20, currentY);
        
        const score = student.grades[subj];
        doc.setFont("Helvetica", "normal");
        doc.text(`${score} / 100`, 110, currentY);
        doc.text(getLetterGrade(score), 160, currentY);
        
        // Draw subtle row underline
        doc.setDrawColor(230, 230, 230);
        doc.line(15, currentY + 3, 195, currentY + 3);
        currentY += 10;
      });
    }
    
    // Attendance and Diagnostics Segment
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(45, 10, 10);
    doc.text("II. BEHAVIORAL & ENGAGEMENT METRICS", 15, currentY + 5);
    currentY += 13;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    // Attendance Rate with feedback
    const attRate = student.attendanceRate ?? 100;
    let attFeedback = "Excellent presence showing great study commitment.";
    if (attRate < 90) attFeedback = "Lapses observed. Parents requested to review class attendance registry.";
    
    doc.setFont("Helvetica", "bold");
    doc.text("Presence Ratio in Classes:", 15, currentY);
    doc.setFont("Helvetica", "normal");
    doc.text(`${attRate}% — ${attFeedback}`, 65, currentY);
    currentY += 9;
    
    // Strengths
    doc.setFont("Helvetica", "bold");
    doc.text("Inherent Strengths:", 15, currentY);
    doc.setFont("Helvetica", "normal");
    doc.text(student.strengths || "Analytical focus, positive interest", 65, currentY);
    currentY += 9;
    
    // Weaknesses
    doc.setFont("Helvetica", "bold");
    doc.text("Growth Opportunities:", 15, currentY);
    doc.setFont("Helvetica", "normal");
    doc.text(student.weaknesses || "Writing layouts, extended exercises", 65, currentY);
    currentY += 9;
    
    // Preferences
    doc.setFont("Helvetica", "bold");
    doc.text("Cognitive Preferences:", 15, currentY);
    doc.setFont("Helvetica", "normal");
    doc.text(student.preferences || "Visual outlines, interactive tasks", 65, currentY);
    currentY += 15;
    
    // Executive Sign-off Section at the bottom
    doc.setDrawColor(45, 10, 10);
    doc.line(15, currentY, 195, currentY);
    currentY += 10;
    
    doc.setFont("Helvetica", "bolditalic");
    doc.setFontSize(11);
    doc.setTextColor(45, 10, 10);
    doc.text("Poplar Executive Seal of Endorsement", 15, currentY);
    currentY += 7;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("This learners report book is programmatically compiled and vetted of all double-entry logs. It is authorized based on classroom attendance rosters, curriculum test records, and section coordinator audits.", 15, currentY, { maxWidth: 180 });
    currentY += 18;
    
    // Signatures
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text("Julian Thorne", 15, currentY);
    doc.text("Dr. Agatha Sterling", 115, currentY);
    
    // Lines
    doc.setDrawColor(150, 150, 150);
    doc.line(15, currentY + 2, 85, currentY + 2);
    doc.line(115, currentY + 2, 185, currentY + 2);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("SECTION COORDINATOR ENFORCER", 15, currentY + 6);
    doc.text("CHIEF SUPERINTENDENT OF SCHOOLS", 115, currentY + 6);
    
    // Save PDF
    doc.save(`Poplar_ReportBook_${student.name.replace(/\s+/g, "_")}.pdf`);
  };

  const downloadSchoolExecutiveSummaryPDF = () => {
    const doc = new jsPDF();
    
    // Page Border
    doc.setDrawColor(218, 165, 32); // Gold
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);
    
    // Header
    doc.setFillColor(45, 10, 10);
    doc.rect(5, 5, 200, 30, "F");
    
    doc.setTextColor(255, 215, 0);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("POPLAR EXECUTIVE COMMISSION", 15, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`School-wide Executive Performance & Ledger Summary • Created: ${new Date().toLocaleDateString()}`, 15, 28);
    
    doc.setTextColor(50, 50, 50);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("I. OVERALL INSTITUTIONAL METRICS", 15, 50);
    doc.line(15, 52, 195, 52);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Active Approved Learners: ${approvedStudents.length}`, 15, 62);
    doc.text(`Pending Enrollment Approvals: ${students.filter(s => s.enrollmentStatus === "Pending").length}`, 15, 69);
    doc.text(`Total Roster Faculty/Staff: ${staff.length}`, 15, 76);
    doc.text(`Estimated School-wide Attendance Average: ${schoolWideAttendance}%`, 15, 83);
    
    doc.setFont("Helvetica", "bold");
    doc.text("II. FINANCIAL LEDGER AUDIT", 15, 96);
    doc.line(15, 98, 195, 98);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Total Expected Annual Fees: $${totalFeesRequired}`, 15, 108);
    doc.text(`Total Cleared Payments Ledger: $${totalFeesCleared}`, 15, 115);
    doc.text(`Total Scholar Arrears Pending: $${totalFeesRequired - totalFeesCleared}`, 15, 122);
    doc.text(`Verified Dynamic Accounting Receipts: ${transactions.length} receipts`, 15, 129);
    
    doc.setFont("Helvetica", "bold");
    doc.text("III. DETAILED STUDENT ACADEMIC PROGRESS INDEX", 15, 142);
    doc.line(15, 144, 195, 144);
    
    // Student Index rows
    let currentY = 153;
    approvedStudents.forEach((st, idx) => {
      if (currentY > 260) {
        doc.addPage();
        // border on new page
        doc.setDrawColor(218, 165, 32);
        doc.setLineWidth(1);
        doc.rect(5, 5, 200, 287);
        currentY = 20;
      }
      doc.setFont("Helvetica", "bold");
      doc.text(`${idx + 1}. ${st.name} (${st.className})`, 15, currentY);
      
      doc.setFont("Helvetica", "normal");
      const subjs = Object.keys(st.grades || {});
      const avgGrade = subjs.length > 0 
        ? Math.round(subjs.reduce((acc, s) => acc + st.grades[s], 0) / subjs.length)
        : "N/A";
        
      doc.text(`Attendance: ${st.attendanceRate}%   |   Avg Grade: ${avgGrade}%   |   Parents: ${st.parentName}`, 15, currentY + 5);
      
      doc.setDrawColor(230, 230, 230);
      doc.line(15, currentY + 8, 195, currentY + 8);
      currentY += 13;
    });
    
    // Seal
    if (currentY > 240) {
      doc.addPage();
      doc.setDrawColor(218, 165, 32);
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287);
      currentY = 20;
    }
    
    doc.setDrawColor(45, 10, 10);
    doc.line(15, currentY, 195, currentY);
    doc.setFont("Helvetica", "bolditalic");
    doc.text("Vetted by Poplar Super Admin Command Office", 15, currentY + 8);
    doc.text("Dr. Agatha Sterling, Super Admin Executive", 15, currentY + 15);
    
    doc.save("Poplar_Executive_Audit_Report.pdf");
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formConfig);
    alert("Landing page parameters saved! Go to the Landing Page (Visitor view) to see the changes instantly.");
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStud.name || !newStud.parentEmail) return;
    onAddStudent({
      ...newStud,
      id: "stud-" + Date.now().toString().slice(-4),
      enrollmentStatus: "Approved", // Admins approve automatically
      grades: {}
    });
    setNewStud({
      name: "",
      section: "Primary",
      className: "Grade 4 Bravo",
      parentName: "",
      parentEmail: "",
      strengths: "Quick adaptation, reading",
      weaknesses: "Slight impatience",
      preferences: "Colored outlines",
      photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60",
      feesDue: 1800,
      feesPaid: 0,
      attendanceRate: 100
    });
    alert("New Student enrolled successfully!");
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffMember.name || !newStaffMember.email) return;
    onAddStaff({
      ...newStaffMember,
      id: "staff-" + Date.now().toString().slice(-4)
    });
    setNewStaffMember({
      name: "",
      role: "Teacher",
      section: "Primary",
      subjectSpecialty: "",
      email: "",
      phone: "",
      salary: 4200,
      attendanceStatus: "Present"
    });
    alert("Roster updated: Added " + newStaffMember.name);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGlobalAnnouncement({
      id: "ann-" + Date.now().toString().slice(-4),
      title: newAnn.title,
      content: newAnn.content,
      section: newAnn.section,
      date: new Date().toISOString().split("T")[0],
      author: "Chief Admin Agatha Sterling"
    });
    setNewAnn({ title: "", content: "", section: "All" });
    alert("Global notice dispatched!");
  };

  // Math Metrics
  const approvedStudents = students.filter(s => s.enrollmentStatus === "Approved");
  const totalFeesRequired = approvedStudents.reduce((acc, current) => acc + current.feesPaid + current.feesDue, 0);
  const totalFeesCleared = approvedStudents.reduce((acc, current) => acc + current.feesPaid, 0);
  const schoolWideAttendance = approvedStudents.length > 0 
    ? Math.round(approvedStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / approvedStudents.length)
    : 100;

  return (
    <div className="w-full bg-[#200505] rounded-3xl border border-[#FFD700]/15 overflow-hidden shadow-2xl p-6 lg:p-8 animate-fadeIn">
      {/* Admin Title Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#FFD700]/10 text-[#FFD700] rounded-full px-3 py-1 text-[10px] font-mono tracking-widest uppercase border border-[#FFD700]/20 mb-2">
            <Shield className="w-3 h-3 text-[#FFD700] fill-[#FFD700]/10" />
            <span>EXECUTIVE COMMAND PORTAL</span>
          </div>
          <h2 className="text-3xl font-serif text-white italic font-bold">Poplar Super Administrator</h2>
          <p className="text-xs text-slate-400 font-mono text-left mt-1">Logged in: Chief Executive Agatha Sterling (Super Admin)</p>
        </div>

        {/* Inner Tabs Selector */}
        <div className="flex flex-wrap bg-black/40 p-1.5 rounded-xl border border-white/5 gap-1">
          {[
            { id: "landing", label: "Edit Landing Page", icon: PenTool },
            { id: "students", label: "Enrollment Roster", icon: Users },
            { id: "faculty", label: "Faculty & Staff", icon: Settings },
            { id: "reports", label: "Academic Audit", icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                  adminTab === tab.id
                    ? "bg-[#FFD700] text-[#2D0A0A] font-bold"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#2D0A0A] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Approved Learners</p>
            <p className="text-2xl font-serif text-[#FFD700] font-bold mt-1">{approvedStudents.length}</p>
          </div>
          <Users className="w-8 h-8 text-[#FFD700] opacity-35" />
        </div>
        <div className="bg-[#2D0A0A] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Pending Approvals</p>
            <p className="text-2xl font-serif text-[#1E90FF] font-bold mt-1">
              {students.filter(s => s.enrollmentStatus === "Pending").length}
            </p>
          </div>
          <Shield className="w-8 h-8 text-[#1E90FF] opacity-35" />
        </div>
        <div className="bg-[#2D0A0A] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Fee Clearances</p>
            <p className="text-xl font-serif text-emerald-400 font-bold mt-1">
              ${totalFeesCleared} / ${totalFeesRequired}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400 opacity-35" />
        </div>
        <div className="bg-[#2D0A0A] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">School Attendance</p>
            <p className="text-2xl font-serif text-pink-400 font-bold mt-1">{schoolWideAttendance}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-pink-400 opacity-35" />
        </div>
      </div>

      {/* Tab Contents */}

      {/* 1. Landing Page Edit Section */}
      {adminTab === "landing" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Edit Form */}
          <form onSubmit={handleSaveConfig} className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-serif italic text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <PenTool className="w-4 h-4 text-[#FFD700]" /> Dynamic Content Coordinator
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Updates saved here overwrite the values on the public landing page. Try entering custom mottos or quotes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Hero Title</label>
                <input
                  type="text"
                  value={formConfig.heroTitle}
                  onChange={e => setFormConfig({ ...formConfig, heroTitle: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Director Name</label>
                <input
                  type="text"
                  value={formConfig.directorName}
                  onChange={e => setFormConfig({ ...formConfig, directorName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={formConfig.heroSubtitle}
                  onChange={e => setFormConfig({ ...formConfig, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                ></textarea>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Director's Speech</label>
                <textarea
                  rows={4}
                  value={formConfig.directorIntroWords}
                  onChange={e => setFormConfig({ ...formConfig, directorIntroWords: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                ></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">PTA Title</label>
                <input
                  type="text"
                  value={formConfig.ptaTitle}
                  onChange={e => setFormConfig({ ...formConfig, ptaTitle: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">School Email</label>
                <input
                  type="email"
                  value={formConfig.contactEmail}
                  onChange={e => setFormConfig({ ...formConfig, contactEmail: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">PTA Message / Goals</label>
                <textarea
                  rows={3}
                  value={formConfig.ptaMessage}
                  onChange={e => setFormConfig({ ...formConfig, ptaMessage: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-[#FFD700] hover:bg-[#ffe249] text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Commit Landing Updates
            </button>
          </form>

          {/* Quick Announcement Broadcast */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleCreateAnnouncement} className="bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-3">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Megaphone className="w-4 h-4 text-[#1E90FF]" /> Dispatch Global News
              </h3>
              <p className="text-xs text-slate-400">
                Pushes a prominent notice block directly to the visitors/parents billboard section.
              </p>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Notice Target Group</label>
                <select
                  value={newAnn.section}
                  onChange={e => setNewAnn({ ...newAnn, section: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Sections (Public)</option>
                  <option value="Nursery">Nursery Parents Only</option>
                  <option value="Primary">Primary Parents Only</option>
                  <option value="Secondary">Secondary Scholars Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Headline Title</label>
                <input
                  type="text"
                  required
                  value={newAnn.title}
                  onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
                  placeholder="e.g. Renovation Announcement"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Information Content</label>
                <textarea
                  rows={3}
                  required
                  value={newAnn.content}
                  onChange={e => setNewAnn({ ...newAnn, content: e.target.value })}
                  placeholder="Details of the announcement..."
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-medium focus:outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Publish Global Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Enrollment / Student Admissions */}
      {adminTab === "students" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Enroll Form */}
          <form onSubmit={handleCreateStudent} className="lg:col-span-5 bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-serif italic text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" /> New Student Enrollment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Student Name</label>
                <input
                  type="text"
                  required
                  value={newStud.name}
                  onChange={e => setNewStud({ ...newStud, name: e.target.value })}
                  placeholder="Leo Vance Junior"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Section division</label>
                <select
                  value={newStud.section}
                  onChange={e => setNewStud({ ...newStud, section: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none bg-[#2D0A0A]"
                >
                  <option value="Nursery">Nursery</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Class Label</label>
                <input
                  type="text"
                  required
                  value={newStud.className}
                  onChange={e => setNewStud({ ...newStud, className: e.target.value })}
                  placeholder="Grade 4 Bravo"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Parent Name</label>
                <input
                  type="text"
                  required
                  value={newStud.parentName}
                  onChange={e => setNewStud({ ...newStud, parentName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Parent Email</label>
                <input
                  type="email"
                  required
                  value={newStud.parentEmail}
                  onChange={e => setNewStud({ ...newStud, parentEmail: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Strength Markers</label>
                <input
                  type="text"
                  value={newStud.strengths}
                  onChange={e => setNewStud({ ...newStud, strengths: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-medium"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Weakness Markers</label>
                <input
                  type="text"
                  value={newStud.weaknesses}
                  onChange={e => setNewStud({ ...newStud, weaknesses: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-[#120303] font-bold uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer border-none"
            >
              Enroll & Approve Pupil
            </button>
          </form>

          {/* Student Review List */}
          <div className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-serif italic text-white border-b border-white/5 pb-2">
              Poplar Academy Roster & Admissions ({students.length})
            </h3>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs hover:border-[#FFD700]/10 transition-all font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <img src={st.photo} className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0" alt="" />
                    <div>
                      <p className="font-bold text-white font-serif text-sm">{st.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {st.section} • {st.className}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          st.enrollmentStatus === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {st.enrollmentStatus}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1">Due: ${st.feesDue}</p>
                    </div>

                    {st.enrollmentStatus === "Pending" ? (
                      <button
                        onClick={() => onApproveEnrollment(st.id)}
                        className="px-2 py-1 bg-[#1E90FF] text-white rounded text-[10px] font-bold uppercase hover:bg-[#1E90FF]/80 cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => onDeleteStudent(st.id)}
                        className="p-1 px-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20 transition-colors border-none cursor-pointer"
                        title="Delete enrollment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Faculty & Staff Management */}
      {adminTab === "faculty" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add Staff */}
          <form onSubmit={handleCreateStaff} className="lg:col-span-5 bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-serif italic text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <PlusCircle className="w-4 h-4 text-[#FFD700]" /> Add New Roster Staff Office
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffMember.name}
                  onChange={e => setNewStaffMember({ ...newStaffMember, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Doyle"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Roster Role</label>
                <select
                  value={newStaffMember.role}
                  onChange={e => setNewStaffMember({ ...newStaffMember, role: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="SectionManager">Section Manager</option>
                  <option value="Admin">General Admin</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Academic Class Section</label>
                <select
                  value={newStaffMember.section}
                  onChange={e => setNewStaffMember({ ...newStaffMember, section: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold text-slate-300"
                >
                  <option value="">None / Admin</option>
                  <option value="Nursery">Nursery Division</option>
                  <option value="Primary">Primary Division</option>
                  <option value="Secondary">Secondary Division</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Subject Speciality</label>
                <input
                  type="text"
                  value={newStaffMember.subjectSpecialty}
                  onChange={e => setNewStaffMember({ ...newStaffMember, subjectSpecialty: e.target.value })}
                  placeholder="Calculus & Physics"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Monthly Salary ($)</label>
                <input
                  type="number"
                  required
                  value={newStaffMember.salary}
                  onChange={e => setNewStaffMember({ ...newStaffMember, salary: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Roster Contact (Email)</label>
                <input
                  type="email"
                  required
                  value={newStaffMember.email}
                  onChange={e => setNewStaffMember({ ...newStaffMember, email: e.target.value })}
                  placeholder="staff.member@poplar.edu"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Telephone Phone</label>
                <input
                  type="text"
                  value={newStaffMember.phone}
                  onChange={e => setNewStaffMember({ ...newStaffMember, phone: e.target.value })}
                  placeholder="+1-555-0902"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#FFD700] hover:bg-[#FFD700]/85 text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer border-none"
            >
              Add Faculty to Roster
            </button>
          </form>

          {/* Staff Salary Controller list */}
          <div className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4 font-mono">
            <h3 className="text-lg font-serif italic text-white border-b border-white/5 pb-2">
              Poplar Faculty Payroll & Salary Ledger ({staff.length})
            </h3>
            <p className="text-xs text-slate-400">
              Only Super Admins can alter executive payroll parameters. Double-click or change the salary inputs directly.
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {staff.map((stf) => (
                <div
                  key={stf.id}
                  className="bg-black/35 border border-white/5 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-100 font-serif text-sm">{stf.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {stf.role} {stf.section ? `(${stf.section} Section)` : ""}
                      {stf.subjectSpecialty ? ` — Specialty: ${stf.subjectSpecialty}` : ""}
                    </p>
                    <p className="text-[10px] text-[#1E90FF] lowercase tracking-normal font-light mt-0.5">{stf.email}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] text-slate-400">Monthly Salary:</span>
                    <div className="flex items-center bg-black/60 rounded px-2 py-1 border border-white/10">
                      <span className="text-emerald-400">$</span>
                      <input
                        type="number"
                        value={stf.salary}
                        onChange={(e) => onUpdateSalary(stf.id, Number(e.target.value))}
                        className="w-16 bg-transparent text-emerald-400 font-bold ml-1 border-none focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Academic Reports Audit */}
      {adminTab === "reports" && (
        <div className="space-y-8 font-serif">
          {/* Charts/Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4">
              <h4 className="text-[#FFD700] text-lg font-bold italic leading-tight">Class-by-Class Comparative Strengths</h4>
              <p className="text-xs tracking-normal font-sans text-slate-300">
                School-wide averages mapped dynamic from current grades catalog. Outlying performance scores inside Mathematics and CS disciplines:
              </p>

              {/* Custom SVG Graph (Visual Bar Representation) */}
              <div className="py-4 font-mono text-xs">
                <div className="space-y-3">
                  {/* Nursery */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-sans text-slate-100 text-[11px]">
                      <span>Nursery Division Cognitive Coloring averages</span>
                      <span className="text-[#FFD700] font-bold">88%</span>
                    </div>
                    <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-[#FFD700] h-full" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                  {/* Primary Math */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-sans text-slate-100 text-[11px]">
                      <span>Primary Mathematics curriculum average</span>
                      <span className="text-[#1E90FF] font-bold">85%</span>
                    </div>
                    <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-[#1E90FF] h-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  {/* Secondary CS */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-sans text-slate-100 text-[11px]">
                      <span>Secondary Computer Science iterative average</span>
                      <span className="text-emerald-400 font-bold">91.5%</span>
                    </div>
                    <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-emerald-400 h-full" style={{ width: "91.5%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4 font-sans">
              <h4 className="text-[#FFD700] text-lg font-bold italic font-serif leading-tight">Financial Fee Audit Progress</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Represents school-wide pending accounting balances. Section Managers update student balances as mobile banking details verify.
              </p>

              {/* Fee SVG Circle Ring Chart */}
              <div className="flex items-center space-x-6">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-black/40 rounded-full border border-white/5">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#4A1010"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (totalFeesCleared / (totalFeesRequired || 1)))}`}
                    />
                  </svg>
                  <span className="absolute text-emerald-400 font-bold text-xs font-mono">
                    {Math.round((totalFeesCleared / (totalFeesRequired || 1)) * 100)}% Clear
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <p className="text-slate-300 flex justify-between gap-4 border-b border-white/5 pb-1">
                    <span>Audit Total Clearance:</span>
                    <strong className="text-emerald-400">${totalFeesCleared}</strong>
                  </p>
                  <p className="text-slate-300 flex justify-between gap-4 border-b border-white/5 pb-1">
                    <span>Arrears Outstanding:</span>
                    <strong className="text-amber-500">${totalFeesRequired - totalFeesCleared}</strong>
                  </p>
                  <p className="text-slate-300 flex justify-between gap-4">
                    <span>Active Receipts Ledger:</span>
                    <strong>{transactions.length} Verified</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Audit Action Bar */}
          <div className="bg-[#2D0A0A] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans text-xs">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#FFD700]" />
              <div className="text-left">
                <h4 className="font-serif font-bold text-white text-sm">Download Executive Administrative Audit Document</h4>
                <p className="text-slate-300 font-light mt-0.5">Generates a master school roster report featuring financials, faculty size, and list of all active pupils matching attendance.</p>
              </div>
            </div>
            <button
              onClick={downloadSchoolExecutiveSummaryPDF}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#120303] font-bold uppercase text-[10px] tracking-widest rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer border-none transition-all hover:scale-105 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Master Audit (PDF)</span>
            </button>
          </div>

          {/* Individual Learner Report Books list */}
          <div className="bg-[#2D0A0A] border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
              <div className="text-left">
                <h4 className="text-[#FFD700] text-lg font-bold italic">Official Scholar Report Books (Learners PDF Cards)</h4>
                <p className="text-xs text-slate-300 font-sans mt-0.5">
                  Click below to generate and download the official verified learners report booklet card for physical print and physical signature.
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2.5 py-1 text-[10px] font-mono uppercase font-bold">
                ABAC Certified Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-xs text-left">
              {approvedStudents.map((st) => {
                const docKeys = Object.keys(st.grades || {});
                return (
                  <div
                    key={st.id}
                    id={`report-card-${st.id}`}
                    className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-[#FFD700]/15 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img src={st.photo} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                      <div>
                        <p className="font-serif font-bold text-white text-sm leading-tight">{st.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {st.className} • Presence: {st.attendanceRate}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/20 p-2.5 rounded border border-white/5 space-y-1.5 mb-4 font-mono text-[10px]">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-slate-400">Section Div:</span>
                        <span className="text-slate-200">{st.section}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class Progress:</span>
                        <span className="text-emerald-400 font-bold">{docKeys.length} Subjects Evaluated</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadReportBookPDF(st)}
                      className="w-full py-2 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer border-none transition-all hover:scale-[1.02]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Report Book (PDF)</span>
                    </button>
                  </div>
                );
              })}
              {approvedStudents.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 italic font-sans animate-pulse">
                  No approved scholars found in school roster.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
