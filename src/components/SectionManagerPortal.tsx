import React, { useState } from "react";
import { Student, Staff, ClassGroup, Announcement, FeeTransaction } from "../types";
import { BookOpen, UserCheck, Plus, CircleDot, DollarSign, BarChart3, Users, HelpCircle } from "lucide-react";

interface SectionManagerPortalProps {
  section: "Nursery" | "Primary" | "Secondary";
  students: Student[];
  staff: Staff[];
  classes: ClassGroup[];
  announcements: Announcement[];
  transactions: FeeTransaction[];
  onApproveEnrollment: (studentId: string) => void;
  onCreateClass: (className: string, subjects: string[], teacherId: string) => void;
  onAddTeacher: (name: string, subjectSpecialty: string, email: string, phone: string, salary: number) => void;
  onAddSectionCommunication: (title: string, content: string) => void;
  onRegisterFeePayment: (studentId: string, amount: number, paymentMethod: string) => void;
}

export default function SectionManagerPortal({
  section,
  students,
  staff,
  classes,
  announcements,
  transactions,
  onApproveEnrollment,
  onCreateClass,
  onAddTeacher,
  onAddSectionCommunication,
  onRegisterFeePayment
}: SectionManagerPortalProps) {
  const [managerTab, setManagerTab] = useState<"admissions" | "teachers" | "classes" | "finances" | "announcements" | "reports">("admissions");

  // Local state forms
  const [newTeacherForm, setNewTeacherForm] = useState({ name: "", email: "", phone: "", specialty: "", salary: 4300 });
  const [newClassForm, setNewClassForm] = useState({ name: "", subjectsString: "Math, Science, Reading", teacherId: "" });
  const [newTopicInput, setNewTopicInput] = useState("");
  const [selectedClassIdForTopics, setSelectedClassIdForTopics] = useState("");
  const [commForm, setCommForm] = useState({ title: "", content: "" });
  const [feeForm, setFeeForm] = useState({ studentId: "", amount: 500, method: "Bank Transfer" });

  const sectionStudents = students.filter(s => s.section === section);
  const sectionTeachers = staff.filter(s => s.role === "Teacher" && s.section === section);
  const sectionClasses = classes.filter(c => c.section === section);
  const sectionAnnouncements = announcements.filter(a => a.section === section || a.section === "All");

  const managerProfile = staff.find(s => s.role === "SectionManager" && s.section === section) || {
    name: "Section Supervisor",
    phone: "+1-555-0000",
    email: "supervisor@poplar.edu"
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name || !newTeacherForm.email) return;
    onAddTeacher(
      newTeacherForm.name,
      newTeacherForm.specialty,
      newTeacherForm.email,
      newTeacherForm.phone,
      newTeacherForm.salary
    );
    setNewTeacherForm({ name: "", email: "", phone: "", specialty: "", salary: 4300 });
    alert("Instructor Added and registered inside " + section + " roster.");
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.name || !newClassForm.teacherId) return;
    const subsArray = newClassForm.subjectsString.split(",").map(s => s.trim()).filter(Boolean);
    onCreateClass(newClassForm.name, subsArray, newClassForm.teacherId);
    setNewClassForm({ name: "", subjectsString: "Math, Science, Reading", teacherId: "" });
    alert("New class segment established successfully!");
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commForm.title || !commForm.content) return;
    onAddSectionCommunication(commForm.title, commForm.content);
    setCommForm({ title: "", content: "" });
    alert("Parent announcements dispatched live!");
  };

  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.studentId || feeForm.amount <= 0) return;
    onRegisterFeePayment(feeForm.studentId, feeForm.amount, feeForm.method);
    alert("Payment transaction captured. Balance updated.");
  };

  // Metrics calculators
  const sectionAttendanceAverage = sectionStudents.length > 0
    ? Math.round(sectionStudents.reduce((acc, current) => acc + current.attendanceRate, 0) / sectionStudents.length)
    : 100;

  const unpaidBalAmount = sectionStudents.reduce((acc, curr) => acc + curr.feesDue, 0);
  const clearedBalAmount = sectionStudents.reduce((acc, curr) => acc + curr.feesPaid, 0);

  return (
    <div className="w-full bg-[#1b0505] rounded-3xl border border-[#FFD700]/15 overflow-hidden shadow-xl p-6 animate-fadeIn">
      {/* Title Details Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 mb-5 gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#FFD700]/10 text-[#FFD700] rounded-full px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase mb-1.5">
            <span>Section Supervisor Workspace</span>
          </div>
          <h2 className="text-2xl font-serif text-white italic font-bold">
            {section} Department Coordinator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Section Head: <strong className="text-slate-200">{managerProfile.name}</strong> • Phone: {managerProfile.phone}
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl">
          {[
            { id: "admissions", label: "Enrollment" },
            { id: "teachers", label: "Roster Faculty" },
            { id: "classes", label: "Classes & Topics" },
            { id: "finances", label: "Student Fees" },
            { id: "announcements", label: "Bulletins" },
            { id: "reports", label: "Department Report" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setManagerTab(tab.id as any)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                managerTab === tab.id
                  ? "bg-[#FFD700] text-[#2D0A0A] font-bold shadow-md"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Panels content */}

      {/* Panel 1: Parent & Pupil Registrations */}
      {managerTab === "admissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif italic text-lg text-white">Pending Parent Registry Approvals</h3>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono text-slate-400">Section Logs</span>
          </div>
          <p className="text-xs text-slate-400">
            When parents submit enrollment requests, their child is registered as "Pending". Approve them below to dispatch digital keys.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionStudents.filter(s => s.enrollmentStatus === "Pending").length === 0 ? (
              <div className="md:col-span-2 p-6 bg-[#2D0A0A]/40 rounded-2xl text-center border border-dashed border-white/5">
                <UserCheck className="w-8 h-8 text-[#FFD700] mx-auto opacity-30 mb-2" />
                <p className="text-xs text-slate-400">No pending parent or pupil permissions awaiting approval inside {section}.</p>
              </div>
            ) : (
              sectionStudents.filter(s => s.enrollmentStatus === "Pending").map((st) => (
                <div key={st.id} className="bg-[#2D0A0A] border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="space-y-1">
                    <p className="font-serif font-bold text-sm text-white">{st.name}</p>
                    <p className="text-slate-400 font-light">Class Track: {st.className}</p>
                    <p className="text-[10px] text-slate-400">Parent: {st.parentName} ({st.parentEmail})</p>
                  </div>
                  <button
                    onClick={() => onApproveEnrollment(st.id)}
                    className="px-4 py-1.5 bg-[#FFD700] text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded shadow hover:bg-[#ffe043] cursor-pointer"
                  >
                    Approve Request
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] font-mono text-[#FFD700] uppercase tracking-wider mb-2">Approved Section Roster ({sectionStudents.filter(s => s.enrollmentStatus === "Approved").length} Active)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sectionStudents.filter(s => s.enrollmentStatus === "Approved").map((st) => (
                <div key={st.id} className="bg-black/30 border border-white/5 p-3 rounded-lg flex items-center space-x-2 text-xs">
                  <img src={st.photo} className="w-8 h-8 rounded-full object-cover grayscale" alt="" />
                  <div>
                    <h5 className="font-serif font-bold text-slate-100">{st.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{st.className}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: Teachers Management */}
      {managerTab === "teachers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Create Teacher */}
          <form onSubmit={handleCreateTeacher} className="lg:col-span-5 bg-[#2D0A0A] border border-[#FFD700]/10 p-5 rounded-2xl space-y-4">
            <h4 className="font-serif italic text-white text-lg border-b border-white/5 pb-2">Roster New Teacher</h4>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-mono text-[10px] uppercase">Teacher Name</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.name}
                  onChange={e => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  placeholder="e.g. Mrs. Susan Cooper"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-mono text-[10px] uppercase">Professional Subject Specialty</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.specialty}
                  onChange={e => setNewTeacherForm({ ...newTeacherForm, specialty: e.target.value })}
                  placeholder="e.g. Geometry & Phonics"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-mono text-[10px] uppercase">Roster Email (Login Email)</label>
                <input
                  type="email"
                  required
                  value={newTeacherForm.email}
                  onChange={e => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                  placeholder="scooper@poplar.edu"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-mono text-[10px] uppercase">Salary Allowance ($/mo)</label>
                <input
                  type="number"
                  required
                  value={newTeacherForm.salary}
                  onChange={e => setNewTeacherForm({ ...newTeacherForm, salary: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-emerald-400 font-bold"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-[#FFD700] to-[#FFD700]/80 text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded-lg border-none cursor-pointer hover:opacity-90"
            >
              Add Section Teacher
            </button>
          </form>

          {/* Teacher Roster List */}
          <div className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-3 font-mono">
            <h4 className="font-serif italic text-white text-lg">Department Faculty Registered ({sectionTeachers.length})</h4>
            {sectionTeachers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No assigned subject teachers are currently registered.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {sectionTeachers.map((tc) => (
                  <div key={tc.id} className="bg-black/30 border border-white/5 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-serif font-bold text-sm text-white">
                      <span>{tc.name}</span>
                      <span className="text-emerald-400">${tc.salary}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Specialty: {tc.subjectSpecialty}</p>
                    <p className="text-[9px] text-[#1E90FF]">{tc.email} • {tc.phone || "No phone input"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel 3: Create Classes & Subjects */}
      {managerTab === "classes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Create Class */}
          <form onSubmit={handleCreateClass} className="lg:col-span-5 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4">
            <h4 className="font-serif italic text-white text-lg border-b border-white/5 pb-2">Establish New Class Segment</h4>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Segment Name</label>
                <input
                  type="text"
                  required
                  value={newClassForm.name}
                  onChange={e => setNewClassForm({ ...newClassForm, name: e.target.value })}
                  placeholder="e.g. Preschool 1 Tiny Tots or Primary 4 Bravo"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Core Subjects (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={newClassForm.subjectsString}
                  onChange={e => setNewClassForm({ ...newClassForm, subjectsString: e.target.value })}
                  placeholder="Mathematics, English, Arts"
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Class Teacher Tutor</label>
                <select
                  required
                  value={newClassForm.teacherId}
                  onChange={e => setNewClassForm({ ...newClassForm, teacherId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-slate-300 font-semibold"
                >
                  <option value="">Select Department Teacher...</option>
                  {sectionTeachers.map(stf => (
                    <option key={stf.id} value={stf.id}>{stf.name} ({stf.subjectSpecialty})</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#FFD700] hover:bg-[#FFD700]/95 text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded-lg border-none cursor-pointer"
            >
              Establish New Segment Class
            </button>
          </form>

          {/* Classes & Topics Overview */}
          <div className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4 font-mono">
            <h4 className="font-serif italic text-white text-lg">Department Slipped Segments ({sectionClasses.length})</h4>
            <div className="space-y-3">
              {sectionClasses.map((cl) => {
                const assignedT = staff.find(tc => tc.id === cl.teacherId) || { name: "No Tutor Assigned" };
                return (
                  <div key={cl.id} className="bg-black/30 border border-white/5 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-start font-serif font-bold text-sm text-[#FFD700]">
                      <span>{cl.name}</span>
                      <span className="text-[10px] font-mono uppercase font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        ID: {cl.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      <strong>Tutor Advisor:</strong> {assignedT.name}
                    </p>
                    <div>
                      <strong className="text-[10px] uppercase text-slate-400">Class Topics / Subjects:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {cl.subjects.map((sub, i) => (
                          <span key={i} className="bg-[#FFD700]/10 text-[#FFD700] px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Panel 4: Fees & Balances Register */}
      {managerTab === "finances" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Register Payment */}
          <form onSubmit={handleApplyPayment} className="lg:col-span-5 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4">
            <h4 className="font-serif italic text-white text-lg border-b border-white/5 pb-1">Record Tuition Slip Payment</h4>
            <p className="text-xs text-slate-400">Apply verified bank wire remittances to clear pupil invoice balances.</p>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Select Learner</label>
                <select
                  required
                  value={feeForm.studentId}
                  onChange={e => setFeeForm({ ...feeForm, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-[#ffd700]/10 rounded font-semibold text-slate-300 bg-[#2D0A0A]"
                >
                  <option value="">Choose Approved student...</option>
                  {sectionStudents.filter(s => s.enrollmentStatus === "Approved").map(st => (
                    <option key={st.id} value={st.id}>{st.name} (Due: ${st.feesDue})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Amount Remitted ($)</label>
                <input
                  type="number"
                  required
                  value={feeForm.amount}
                  onChange={e => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-[#ffd700]/10 rounded text-emerald-400 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Remittance Method</label>
                <select
                  value={feeForm.method}
                  onChange={e => setFeeForm({ ...feeForm, method: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/40 border border-[#ffd700]/10 rounded bg-[#2D0A0A]"
                >
                  <option value="Bank Transfer">Direct Bank Wire</option>
                  <option value="Mobile money Pay">Mobile Money App</option>
                  <option value="Credit Card">Credit Card Portal</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-[#150303] font-bold uppercase text-[10px] tracking-wider rounded border-none cursor-pointer"
            >
              Record Wire clearance
            </button>
          </form>

          {/* Ledger Table */}
          <div className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4 font-mono text-xs">
            <h4 className="font-serif italic text-white text-lg">Department Tuition Balances</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {sectionStudents.filter(s => s.enrollmentStatus === "Approved").map((st) => (
                <div key={st.id} className="bg-black/35 border border-white/5 p-3 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-serif font-bold text-sm text-slate-200">{st.name}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Class Segment: {st.className}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">Paid: ${st.feesPaid}</p>
                    <p className="text-rose-400 font-medium">Arrears: ${st.feesDue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel 5: Section Bulletins announcements */}
      {managerTab === "announcements" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Create announcement */}
          <form onSubmit={handlePublishAnnouncement} className="lg:col-span-5 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4">
            <h4 className="font-serif italic text-white text-lg border-b border-white/5 pb-2">Publish Department Notice</h4>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Bulletin Headline</label>
                <input
                  type="text"
                  required
                  value={commForm.title}
                  onChange={e => setCommForm({ ...commForm, title: e.target.value })}
                  placeholder="Notice title..."
                  className="w-full px-3 py-1.5 bg-black/40 border border-[#ffd700]/10 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-300 uppercase">Bulletin Body Context</label>
                <textarea
                  rows={4}
                  required
                  value={commForm.content}
                  onChange={e => setCommForm({ ...commForm, content: e.target.value })}
                  placeholder="Include timings or parent requirements..."
                  className="w-full px-3 py-1.5 bg-black/40 border border-[#ffd700]/10 rounded"
                ></textarea>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#210505] font-bold uppercase text-[10px] tracking-wider rounded border-none cursor-pointer"
            >
              Broadcast Bulletin Notice
            </button>
          </form>

          {/* Bulletins Feed list */}
          <div className="lg:col-span-7 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-3 font-mono text-xs">
            <h4 className="font-serif italic text-white text-lg">Department Bulletins Feed</h4>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto Pr-1">
              {sectionAnnouncements.map((ann) => (
                <div key={ann.id} className="bg-black/30 border border-white/5 p-3 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-[#FFD700]"></div>
                  <h5 className="font-serif font-bold text-slate-100 text-sm">{ann.title}</h5>
                  <p className="text-[10px] text-slate-400 mt-1">Dispatched: {ann.date} • Scope: {ann.section}</p>
                  <p className="text-slate-300 text-xs leading-relaxed mt-2 font-sans">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel 6: Statistical Section Reports */}
      {managerTab === "reports" && (
        <div className="space-y-6 font-serif select-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="bg-[#2D0A0A] p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-lg font-serif italic text-[#FFD700] leading-tight font-bold">Attendance & Commitment Tracker</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Represents cumulative present marks registered by department instructors. Threshold alerts report below 90%.
              </p>
              {/* Stat Bar charts or Rings */}
              <div className="flex items-center space-x-6 py-2 pb-0">
                <div className="text-center">
                  <span className="text-emerald-400 font-serif text-3xl font-bold">{sectionAttendanceAverage}%</span>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Section average</p>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${sectionAttendanceAverage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-[#2D0A0A] p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-lg font-serif italic text-[#FFD700] leading-tight font-bold">Financial Arrears Overview</h4>
              <p className="text-xs text-slate-300">Outstanding fee indices of approved learners within this department section.</p>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="bg-black/40 p-2.5 rounded-lg">
                  <span className="text-emerald-400 font-bold">${clearedBalAmount}</span>
                  <p className="text-[10px] text-slate-400 tracking-wider">Payments Collected</p>
                </div>
                <div className="bg-black/40 p-2.5 rounded-lg">
                  <span className="text-amber-500 font-bold">${unpaidBalAmount}</span>
                  <p className="text-[10px] text-slate-400 tracking-wider font-semibold">Outstanding Dues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
