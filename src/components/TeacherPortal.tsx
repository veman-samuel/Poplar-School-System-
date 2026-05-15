import React, { useState } from "react";
import { Student, Staff, ClassGroup, Homework, SchemeOfWork, Test, TestQuestion, TestSubmission } from "../types";
import { BookOpen, AlertCircle, PlusCircle, PenTool, CheckCircle, Save, Calendar, CheckSquare, ListPlus, FileText, Download, Award, ShieldCheck } from "lucide-react";

interface TeacherPortalProps {
  teacherId: string;
  students: Student[];
  staff: Staff[];
  classes: ClassGroup[];
  homeworks: Homework[];
  schemesOfWork: SchemeOfWork[];
  onAddHomework: (hw: any) => void;
  onGradeHomework: (hwId: string, studentId: string, score: number, feedback: string) => void;
  onUpdateSchemeOfWork: (scheme: any) => void;
  onAddSchemeOfWork: (scheme: any) => void;
  onUpdateStudentAttendance: (studentId: string, change: number) => void;
  tests?: Test[];
  onAddTest?: (test: Test) => void;
  onGradeTest?: (testId: string, studentId: string, score: number, feedback: string) => void;
}

export default function TeacherPortal({
  teacherId,
  students,
  staff,
  classes,
  homeworks,
  schemesOfWork,
  onAddHomework,
  onGradeHomework,
  onUpdateSchemeOfWork,
  onAddSchemeOfWork,
  onUpdateStudentAttendance,
  tests = [],
  onAddTest,
  onGradeTest
}: TeacherPortalProps) {
  const [teacherTab, setTeacherTab] = useState<"sow" | "homework" | "grading" | "attendance" | "tests">("sow");

  // Local state elements for tests
  const [selectedClassIdForTest, setSelectedClassIdForTest] = useState("");
  const [selectedSubjectForTest, setSelectedSubjectForTest] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [testDueDate, setTestDueDate] = useState("2026-06-15");
  
  // Custom interactive question builder list states
  const [designedQuestions, setDesignedQuestions] = useState<TestQuestion[]>([]);
  const [currentQText, setCurrentQText] = useState("");
  const [currentQType, setCurrentQType] = useState<"multiple-choice" | "one-word" | "essay">("multiple-choice");
  const [currentQPts, setCurrentQPts] = useState(5);
  // Options for multiple choice
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  // Correct answer for one-word
  const [correctWord, setCorrectWord] = useState("");

  // Test grading states
  const [activeTestIdForGrading, setActiveTestIdForGrading] = useState("");
  const [activeStudentIdForTestGrading, setActiveStudentIdForTestGrading] = useState("");
  const [testGradingScore, setTestGradingScore] = useState<number>(0);
  const [testGradingFeedback, setTestGradingFeedback] = useState("");

  // Local state elements
  const [selectedClassIdForHomework, setSelectedClassIdForHomework] = useState("");
  const [selectedSubjectForHomework, setSelectedSubjectForHomework] = useState("");
  const [newHwTitle, setNewHwTitle] = useState("");
  const [newHwDesc, setNewHwDesc] = useState("");
  const [newHwPoints, setNewHwPoints] = useState(20);
  const [newHwDueDate, setNewHwDueDate] = useState("2026-05-25");

  // Grading states
  const [activeHwIdForGrading, setActiveHwIdForGrading] = useState("");
  const [gradingScoreInput, setGradingScoreInput] = useState<number>(0);
  const [gradingFeedbackInput, setGradingFeedbackInput] = useState("");

  // Scheme of Work States
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [sowClass, setSowClass] = useState("Grade 4 Bravo");
  const [sowSubject, setSowSubject] = useState("Mathematics");
  const [sowTerm, setSowTerm] = useState("Term 2");

  // 4 Month variables
  const [month1Obj, setMonth1Obj] = useState("Vertices, edges, internal 2D angles");
  const [month1Res, setMonth1Res] = useState("Solid box, block boards, rulers");
  const [month2Obj, setMonth2Obj] = useState("Vivid coloring fractions representation");
  const [month2Res, setMonth2Res] = useState("Decimal sliders, slider panels");
  const [month3Obj, setMonth3Obj] = useState("Practical decimeter conversion scales");
  const [month3Res, setMonth3Res] = useState("Sensory scales, visual meters");
  const [month4Obj, setMonth4Obj] = useState("Final comprehensive diagnostic assessment revisions");
  const [month4Res, setMonth4Res] = useState("Personalized feedback planners, diagnostic tablets");

  const myTeacherProfile = staff.find(s => s.id === teacherId) || {
    name: "Faculty Member",
    subjectSpecialty: "Mathematics",
    email: "faculty@poplar.edu"
  };

  const myClasses = classes.filter(c => c.teacherId === teacherId);
  const mySchemes = schemesOfWork.filter(s => s.teacherId === teacherId);

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    const newScheme: SchemeOfWork = {
      id: "scheme-" + Date.now().toString().slice(-4),
      teacherId,
      subject: sowSubject,
      className: sowClass,
      term: sowTerm,
      months: [
        { monthNumber: 1, title: "Month 1 Foundations", objectives: [month1Obj], resources: [month1Res] },
        { monthNumber: 2, title: "Month 2 Core concepts", objectives: [month2Obj], resources: [month2Res] },
        { monthNumber: 3, title: "Month 3 Integration", objectives: [month3Obj], resources: [month3Res] },
        { monthNumber: 4, title: "Month 4 Evaluative Prep", objectives: [month4Obj], resources: [month4Res] }
      ]
    };
    onAddSchemeOfWork(newScheme);
    alert("New scheme of work created for " + sowClass);
  };

  const handlePreFillSoW = () => {
    setSowClass("Grade 4 Bravo");
    setSowSubject("Mathematics");
    setSowTerm("Term 2 - Secondary Map");
    setMonth1Obj("Learn standard and nested algebraic structures, multiplication algorithms");
    setMonth1Res("Visual mathematics slide grids, block matrices sheets");
    setMonth2Obj("Grasp multi digit division algorithms and practical fractional weights");
    setMonth2Res("Poplar digital currency items, sandbox fractional sliders");
    setMonth3Obj("Introduce real world currencies and conversion models");
    setMonth3Res("Visual coin boards, decimals ledger program, practice exercises");
    setMonth4Obj("Comprehensive terminal evaluation revisions and custom projects review");
    setMonth4Res("Review diagnostic folders, group learning sessions");
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassIdForHomework || !selectedSubjectForHomework || !newHwTitle) {
      alert("Please choose a valid class segment, subject specialty and fill out assignment credentials.");
      return;
    }
    const newHw: Homework = {
      id: "hw-" + Date.now().toString().slice(-4),
      classId: selectedClassIdForHomework,
      subject: selectedSubjectForHomework,
      title: newHwTitle,
      description: newHwDesc,
      dueDate: newHwDueDate,
      totalPoints: newHwPoints,
      submissions: {}
    };
    onAddHomework(newHw);
    setNewHwTitle("");
    setNewHwDesc("");
    alert("New homework dispatched to selected class group!");
  };

  const handleRecordGradeSubmit = (hwId: string, studentId: string) => {
    if (gradingScoreInput < 0) {
      alert("Invalid grade score! Please check.");
      return;
    }
    onGradeHomework(hwId, studentId, gradingScoreInput, gradingFeedbackInput);
    setGradingFeedbackInput("");
    setGradingScoreInput(0);
    alert("Feedback logged! Pupil archives updated.");
  };

  const myTests = (tests || []).filter(t => myClasses.some(c => c.id === t.classId));

  const handleAddQuestionToDraft = () => {
    if (!currentQText.trim()) {
      alert("Please provide the question content!");
      return;
    }
    const newQ: TestQuestion = {
      id: "q-" + Date.now().toString().slice(-4),
      type: currentQType,
      text: currentQText,
      maxPoints: currentQPts
    };
    if (currentQType === "multiple-choice") {
      if (!optA || !optB) {
        alert("Multiple choice questions require at least Option A and Option B!");
        return;
      }
      newQ.options = [
        `A) ${optA}`,
        `B) ${optB}`,
        optC ? `C) ${optC}` : "",
        optD ? `D) ${optD}` : ""
      ].filter(Boolean);
      newQ.correctAnswer = correctOption;
    } else if (currentQType === "one-word") {
      if (!correctWord.trim()) {
        alert("Please specify the correct one-word answer!");
        return;
      }
      newQ.correctAnswer = correctWord.trim().toLowerCase();
    }
    setDesignedQuestions(prev => [...prev, newQ]);
    
    // Reset question inputs
    setCurrentQText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectWord("");
  };

  const handlePublishTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassIdForTest || !selectedSubjectForTest || !testTitle) {
      alert("Please provide a valid class, subject, and title!");
      return;
    }
    if (designedQuestions.length === 0) {
      alert("A test must contain at least one question!");
      return;
    }
    
    const computedPoints = designedQuestions.reduce((acc, q) => acc + q.maxPoints, 0);
    const newT: Test = {
      id: "test-" + Date.now().toString().slice(-4),
      classId: selectedClassIdForTest,
      subject: selectedSubjectForTest,
      title: testTitle,
      description: testDescription,
      questions: designedQuestions,
      totalPoints: computedPoints,
      dueDate: testDueDate,
      submissions: {}
    };
    
    if (onAddTest) {
      onAddTest(newT);
    }
    
    // Clear state
    setTestTitle("");
    setTestDescription("");
    setDesignedQuestions([]);
    alert(`Success: Published "${testTitle}"! Total Questions: ${designedQuestions.length}. Total marks: ${computedPoints}.`);
  };

  return (
    <div className="w-full bg-[#1b0505] rounded-3xl border border-[#FFD700]/15 overflow-hidden shadow-2xl p-6 lg:p-8 animate-fadeIn text-slate-100 font-sans">
      {/* Title Details Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 mb-5 gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#FFD700]/10 text-[#FFD700] rounded-full px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase mb-1.5">
            <span>Faculty Workspace</span>
          </div>
          <h2 className="text-2xl font-serif text-white italic font-bold">
            Instructor Portal: {myTeacherProfile.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Subject Specialty: <strong className="text-slate-200">{myTeacherProfile.subjectSpecialty}</strong> • Email: {myTeacherProfile.email}
          </p>
        </div>

        {/* Inner Tab Controller */}
        <div className="flex flex-wrap gap-1 bg-black/45 p-1 rounded-xl">
          {[
            { id: "sow", label: "Schemes of Work", icon: PenTool },
            { id: "homework", label: "Assign Homework", icon: ListPlus },
            { id: "grading", label: "Grade submissions", icon: CheckCircle },
            { id: "attendance", label: "Mark Attendance", icon: CheckSquare },
            { id: "tests", label: "Create & Grade Tests", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTeacherTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  teacherTab === tab.id
                    ? "bg-[#FFD700] text-[#2D0A0A] font-bold shadow-md"
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

      {/* Tab Workspaces content */}

      {/* 1. Schemes of Work Core */}
      {teacherTab === "sow" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-serif">
          {/* Create Scheme Form with Month 1 - Month 4 details */}
          <form onSubmit={handleCreateScheme} className="lg:col-span-6 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4 text-xs font-sans">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="font-serif italic text-white text-lg font-bold">Plan 4-Month Scheme of Work</h4>
              <button
                type="button"
                onClick={handlePreFillSoW}
                className="px-2 py-1 bg-[#1E90FF]/15 text-[#1E90FF] rounded font-bold text-[9px] uppercase tracking-wider hover:bg-[#1E90FF]/25 border-none cursor-pointer"
              >
                Demo Pre-fill SOW
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-300">Class Target</label>
                <input
                  type="text"
                  required
                  value={sowClass}
                  onChange={e => setSowClass(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-300">Subject Specialty</label>
                <input
                  type="text"
                  required
                  value={sowSubject}
                  onChange={e => setSowSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-300">Academic Term</label>
                <input
                  type="text"
                  required
                  value={sowTerm}
                  onChange={e => setSowTerm(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded"
                />
              </div>
            </div>

            {/* 4 Month inputs stacked */}
            <div className="space-y-2 border-t border-white/5 pt-3">
              <h5 className="font-serif italic text-white text-sm mb-2 text-[#FFD700]">Monthly Objectives & Course Materials</h5>

              <div className="p-3 bg-black/25 rounded-lg border border-white/5 space-y-2">
                <span className="text-[9px] uppercase text-[#FFD700] font-mono">Month 1 Strategy</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Objectives: e.g. Fractions foundations"
                    value={month1Obj}
                    onChange={e => setMonth1Obj(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Resources: e.g. Sliding grids"
                    value={month1Res}
                    onChange={e => setMonth1Res(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/25 rounded-lg border border-white/5 space-y-2">
                <span className="text-[9px] uppercase text-[#FFD700] font-mono">Month 2 Strategy</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Objectives"
                    value={month2Obj}
                    onChange={e => setMonth2Obj(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Resources"
                    value={month2Res}
                    onChange={e => setMonth2Res(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/25 rounded-lg border border-white/5 space-y-2">
                <span className="text-[9px] uppercase text-[#FFD700] font-mono">Month 3 Strategy</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Objectives"
                    value={month3Obj}
                    onChange={e => setMonth3Obj(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Resources"
                    value={month3Res}
                    onChange={e => setMonth3Res(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/25 rounded-lg border border-white/5 space-y-2">
                <span className="text-[9px] uppercase text-[#FFD700] font-mono">Month 4 Strategy</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Objectives"
                    value={month4Obj}
                    onChange={e => setMonth4Obj(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Resources"
                    value={month4Res}
                    onChange={e => setMonth4Res(e.target.value)}
                    className="px-2 py-1 bg-black/30 border border-white/5 rounded text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded border-none cursor-pointer"
            >
              Commit Term Course Scheme
            </button>
          </form>

          {/* Current schemes of work register overview */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="italic text-white text-lg font-bold">Planned Schemes List ({mySchemes.length})</h4>
            {mySchemes.length === 0 ? (
              <p className="font-sans text-xs text-slate-400 py-6 bg-black/40 rounded-xl text-center">No structural Schemes of Work registered under your name.</p>
            ) : (
              <div className="space-y-4 text-xs font-sans">
                {mySchemes.map((scheme) => (
                  <div key={scheme.id} className="bg-[#2D0A0A] border border-white/5 p-4 rounded-xl space-y-3 font-mono">
                    <p className="font-serif italic font-bold text-base text-[#FFD700] flex justify-between">
                      <span>{scheme.className}</span>
                      <span className="text-[10px] font-mono bg-white/5 text-slate-400 px-2 rounded">{scheme.term} — {scheme.subject}</span>
                    </p>

                    {/* Timeline representation of Month 1 to Month 4 */}
                    <div className="space-y-3 pt-2">
                      {scheme.months.map((m, i) => (
                        <div key={i} className="flex gap-2.5 text-[11px] items-start border-l-2 border-[#FFD700]/30 pl-3">
                          <span className="text-[#FFD700] font-sans font-bold">Month {m.monthNumber}:</span>
                          <div>
                            <p className="text-slate-100 italic">Objective: <span className="font-sans font-light normal-case text-slate-300">{m.objectives.join(", ")}</span></p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Resources: <span className="font-sans">{m.resources.join(", ")}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Assign Homework form */}
      {teacherTab === "homework" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
          {/* Homework assignment Creation form */}
          <form onSubmit={handleCreateHomework} className="lg:col-span-6 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4">
            <h4 className="font-serif italic text-white text-lg border-b border-white/5 pb-2">Dispatch New Homework Assignment</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Select Target Class</label>
                <select
                  required
                  value={selectedClassIdForHomework}
                  onChange={(e) => {
                    setSelectedClassIdForHomework(e.target.value);
                    // Autofill subject specialty or default
                    const cl = classes.find(c => c.id === e.target.value);
                    if (cl && cl.subjects.length > 0) setSelectedSubjectForHomework(cl.subjects[0]);
                  }}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded font-semibold text-slate-300 bg-[#2D0A0A]"
                >
                  <option value="">Choose Class Group...</option>
                  {myClasses.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Subject Topic</label>
                <select
                  required
                  value={selectedSubjectForHomework}
                  onChange={(e) => setSelectedSubjectForHomework(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded font-semibold text-[#FFD700] bg-[#2D0A0A]"
                >
                  <option value="">Select subject topic...</option>
                  {classes.find(c => c.id === selectedClassIdForHomework)?.subjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Assignment Headline Title</label>
                <input
                  type="text"
                  required
                  value={newHwTitle}
                  onChange={e => setNewHwTitle(e.target.value)}
                  placeholder="e.g. Geometry Polygon calculations"
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-slate-200"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Detailed Task Instructions</label>
                <textarea
                  rows={4}
                  required
                  value={newHwDesc}
                  onChange={e => setNewHwDesc(e.target.value)}
                  placeholder="Task guidelines..."
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded text-slate-300 font-sans"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Maximum Grade Points</label>
                <input
                  type="number"
                  required
                  value={newHwPoints}
                  onChange={e => setNewHwPoints(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded font-bold text-[#FFD700]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-300 uppercase">Submission Due Date</label>
                <input
                  type="date"
                  required
                  value={newHwDueDate}
                  onChange={e => setNewHwDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded font-bold text-rose-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#FFD700] hover:bg-[#FFD700]/95 text-[#2D0A0A] font-bold uppercase text-[10px] tracking-wider rounded border-none cursor-pointer"
            >
              Dispatch Activity Homework
            </button>
          </form>

          {/* List of homework assigned with status updates */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="font-serif italic text-white text-lg font-bold leading-tight">My Dispatched Tasks ({homeworks.filter(h => classes.some(c => c.id === h.classId && c.teacherId === teacherId)).length})</h4>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {homeworks.filter(h => classes.some(c => c.id === h.classId && c.teacherId === teacherId)).map((hw) => {
                const targetC = classes.find(c => c.id === hw.classId) || { name: "Amical Segment" };
                const subCount = Object.keys(hw.submissions).length;
                return (
                  <div key={hw.id} className="bg-[#2D0A0A] border border-white/5 p-4 rounded-xl space-y-1.5">
                    <p className="font-serif font-bold text-[#FFD700] text-sm italic">{hw.title}</p>
                    <p className="text-[10px] text-slate-400">Class: {targetC.name} • Topic: {hw.subject}</p>
                    <p className="text-[10px] text-rose-400 font-bold">Due: {hw.dueDate} • Limit: {hw.totalPoints} pts</p>
                    <div className="pt-1.5 flex justify-between items-center text-[10px] uppercase font-semibold">
                      <span className="text-emerald-400 font-mono">{subCount} Handed In Submissions</span>
                      <button
                        onClick={() => {
                          setTeacherTab("grading");
                          setActiveHwIdForGrading(hw.id);
                        }}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Record student performance (Grading homeworks) */}
      {teacherTab === "grading" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-[#2D0A0A] p-4 rounded-xl border border-white/5">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Select Dispatched Assignment to Grade:</label>
              <select
                value={activeHwIdForGrading}
                onChange={(e) => setActiveHwIdForGrading(e.target.value)}
                className="px-3 py-1.5 bg-black/50 border border-white/10 rounded text-slate-100 font-bold bg-[#2D0A0A] focus:outline-none"
              >
                <option value="">Choose Homework Activity...</option>
                {homeworks.filter(h => classes.some(c => c.id === h.classId && c.teacherId === teacherId)).map(hw => {
                  const cc = classes.find(c => c.id === hw.classId);
                  return (
                    <option key={hw.id} value={hw.id}>{hw.title} ({cc?.name})</option>
                  );
                })}
              </select>
            </div>
            {activeHwIdForGrading && (
              <span className="text-[11px] font-bold text-[#FFD700] font-sans">
                Max points allowed: {homeworks.find(h => h.id === activeHwIdForGrading)?.totalPoints} pts
              </span>
            )}
          </div>

          {activeHwIdForGrading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Submission listings left side */}
              <div className="lg:col-span-7 bg-[#2D0A0A] p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="font-serif italic text-white text-base">Class pupil Submissions</h4>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {students
                    .filter(s => {
                      const hw = homeworks.find(h => h.id === activeHwIdForGrading);
                      return hw && s.className === classes.find(c => c.id === hw.classId)?.name;
                    })
                    .map((st) => {
                      const hw = homeworks.find(h => h.id === activeHwIdForGrading)!;
                      const sub = hw.submissions[st.id];
                      return (
                        <div
                          key={st.id}
                          className="bg-black/35 border border-white/5 p-3 rounded-lg flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-serif font-bold text-slate-100 text-sm leading-tight">{st.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Status:{" "}
                              <span className={sub ? "text-emerald-400 font-bold" : "text-amber-500"}>
                                {sub ? `Submitted (${sub.status})` : "Missing / Pending"}
                              </span>
                            </p>
                            {sub?.feedback && (
                              <p className="text-[10px] font-sans italic text-slate-300 mt-1.5 p-1.5 bg-black/50 rounded">
                                "Tutor Review: {sub.feedback}"
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {sub?.score !== undefined ? (
                              <span className="text-emerald-400 font-bold text-sm">
                                {sub.score} / {hw.totalPoints} pts
                              </span>
                            ) : (
                              <div className="space-y-1 text-center">
                                <div className="flex items-center space-x-1.5">
                                  <input
                                    type="number"
                                    placeholder="Score"
                                    max={hw.totalPoints}
                                    defaultValue={hw.totalPoints - 2}
                                    onChange={(e) => setGradingScoreInput(Number(e.target.value))}
                                    className="w-12 px-2 py-0.5 bg-black/40 border border-white/10 rounded text-center text-[#FFD700] font-bold"
                                  />
                                  <span className="text-slate-400">/ {hw.totalPoints}</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Review Words"
                                  onChange={(e) => setGradingFeedbackInput(e.target.value)}
                                  className="w-24 px-1 py-0.5 bg-black/40 border border-white/10 rounded text-[9px] mt-1 text-slate-300"
                                />
                                <button
                                  onClick={() => handleRecordGradeSubmit(hw.id, st.id)}
                                  className="w-full text-[9px] font-bold bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#2D0A0A] py-1 rounded cursor-pointer border-none"
                                >
                                  Submit Grade
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Tips for evaluation on the right */}
              <div className="lg:col-span-5 bg-[#200404] p-5 rounded-2xl border border-[#FFD700]/15 space-y-2 text-xs font-serif leading-relaxed italic text-slate-300">
                <AlertCircle className="w-6 h-6 text-[#FFD700] mb-2 opacity-85" />
                <p>
                  "Tutors should evaluate student hand-ins with empathy. Consider the pupil's visual preferences and coordinate directly with section heads for any persistent weaknesses."
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center font-sans text-xs text-slate-400 py-10 bg-black/20 rounded-xl">Please select an assigned activity homework from the selector above to manage scores.</p>
          )}
        </div>
      )}

      {/* 4. Classroom Attendance Log Track */}
      {teacherTab === "attendance" && (
        <div className="space-y-4 font-mono text-xs">
          <h4 className="font-serif italic text-white text-lg">Mark Student Attendance rate</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
            Updating the ledger below adjusts student averages in real-time. Present increments overall metrics, absent lowers them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.filter(s => myClasses.some(c => c.name === s.className)).map((st) => (
              <div key={st.id} className="bg-[#2D0A0A] border border-white/5 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-serif font-bold text-white text-sm">{st.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-1">Class Segment: {st.className}</p>
                  <p className="text-[10px] text-pink-400 mt-0.5">Average Attendance Rate: {st.attendanceRate}%</p>
                </div>
                {/* Plus-minus buttons to mock register presence */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onUpdateStudentAttendance(st.id, -2)}
                    className="p-1 px-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20 active:scale-95 border-none cursor-pointer"
                    title="Mark Absent (-2%)"
                  >
                    Absent
                  </button>
                  <button
                    onClick={() => onUpdateStudentAttendance(st.id, 1)}
                    className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 active:scale-95 border-none cursor-pointer"
                    title="Mark Present (+1%)"
                  >
                    Present
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Exam and Test Designer */}
      {teacherTab === "tests" && (
        <div className="space-y-8 font-sans">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Test Creation Form */}
            <form onSubmit={handlePublishTest} className="lg:col-span-5 bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4 text-xs text-left">
              <div>
                <h4 className="font-serif italic text-white text-lg font-bold">Design Dynamic Exam & Tests</h4>
                <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                  Publish multiple choice, one-word, and essay test modules directly to class registries.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block uppercase text-[10px]">Test Title Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Geometry Exam"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/45 border border-white/10 rounded-lg text-xs font-semibold text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block uppercase text-[10px]">Objective Description:</label>
                <textarea
                  placeholder="Write clear expectations or syllabus sections..."
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-black/45 border border-white/10 rounded-lg text-xs text-slate-100"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block uppercase text-[10px]">Target Class:</label>
                  <select
                    value={selectedClassIdForTest}
                    onChange={(e) => {
                      setSelectedClassIdForTest(e.target.value);
                      const cls = classes.find(c => c.id === e.target.value);
                      if (cls && cls.subjects.length > 0) {
                        setSelectedSubjectForTest(cls.subjects[0]);
                      }
                    }}
                    required
                    className="w-full px-2.5 py-1.5 bg-black/45 border border-white/10 rounded-lg text-xs"
                  >
                    <option value="">-- Select Class --</option>
                    {myClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block uppercase text-[10px]">Subject Course:</label>
                  <select
                    value={selectedSubjectForTest}
                    onChange={(e) => setSelectedSubjectForTest(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-black/45 border border-white/10 rounded-lg text-xs"
                  >
                    <option value="">-- Specialization --</option>
                    {(() => {
                      const cls = classes.find(c => c.id === selectedClassIdForTest);
                      if (cls) {
                        return cls.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>);
                      }
                      return <option value="Mathematics">Mathematics</option>;
                    })()}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block uppercase text-[10px]">Due Deadline Date:</label>
                <input
                  type="date"
                  required
                  value={testDueDate}
                  onChange={(e) => setTestDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black/45 border border-white/10 rounded-lg text-xs font-mono"
                />
              </div>

              {/* Incremental Question Custom Maker Subsection */}
              <div className="bg-black/45 p-3.5 rounded-xl border border-[#FFD700]/10 space-y-3">
                <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                  <span className="text-[#FFD700] uppercase font-bold text-[9px]">Add a Question</span>
                  <span className="text-slate-400 text-[9px] font-mono">Current draft: {designedQuestions.length} Qs</span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block uppercase text-[9px]">Question Type:</label>
                  <select
                    value={currentQType}
                    onChange={(e) => setCurrentQType(e.target.value as any)}
                    className="w-full px-2 py-1 bg-black/40 border border-white/10 rounded text-xs"
                  >
                    <option value="multiple-choice">Multiple Choice (MCQ)</option>
                    <option value="one-word">One-Word Short Answer</option>
                    <option value="essay">Essay / Free Text</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block uppercase text-[9px]">Question Heading/Text:</label>
                  <input
                    type="text"
                    placeholder="e.g. What is the value of pi to 4 decimals?"
                    value={currentQText}
                    onChange={(e) => setCurrentQText(e.target.value)}
                    className="w-full px-2 py-1 bg-black/40 border border-white/5 rounded text-xs"
                  />
                </div>

                {/* Multiple choice specific choices layout */}
                {currentQType === "multiple-choice" && (
                  <div className="space-y-1.5 bg-[#2D0A0A]/20 p-2 rounded border border-white/5">
                    <p className="text-[9px] text-amber-300 uppercase font-mono">Input options & select key choice:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                      <input
                        type="text"
                        placeholder="Option A"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        className="p-1 bg-black/45 text-white border border-white/5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Option B"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        className="p-1 bg-black/45 text-white border border-white/5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Option C"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        className="p-1 bg-black/45 text-white border border-white/5 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Option D"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        className="p-1 bg-black/45 text-white border border-white/5 rounded"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-[10px] text-slate-300">Correct:</span>
                      <select
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value)}
                        className="px-1.5 py-0.5 bg-black text-slate-200 border border-white/10 rounded text-[10px]"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* One word answer text */}
                {currentQType === "one-word" && (
                  <div className="space-y-1 bg-[#2D0A0A]/20 p-2 rounded border border-white/5 text-[9px]">
                    <label className="text-slate-300 block">Correct Exact Word (case-insensitive Comparison):</label>
                    <input
                      type="text"
                      placeholder="e.g. photosynthesis"
                      value={correctWord}
                      onChange={(e) => setCorrectWord(e.target.value)}
                      className="w-full p-1 bg-black/45 border border-white/5 rounded text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <span className="text-slate-300 block mb-0.5 font-bold uppercase">Points Worth:</span>
                    <input
                      type="number"
                      min="1"
                      value={currentQPts}
                      onChange={(e) => setCurrentQPts(Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 bg-black/40 border border-[#FFD700]/10 rounded text-slate-200"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={handleAddQuestionToDraft}
                      className="px-3 py-1 bg-[#FFD700] hover:bg-[#FFE14D] text-black font-bold uppercase rounded text-[10px] border-none cursor-pointer"
                    >
                      Stage Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Publish button */}
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-[#120303] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer border-none transition-all disabled:opacity-40"
                disabled={designedQuestions.length === 0}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Publish Test ({designedQuestions.reduce((acc, q) => acc + q.maxPoints, 0)} Total Marks)</span>
              </button>
            </form>

            {/* Right side: Current designed questions list AND available submissions for grading */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Questionnaire live preview block */}
              <div className="bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-4 text-left">
                <h4 className="font-serif italic text-[#FFD700] text-sm font-bold flex justify-between">
                  <span>Draft Questionnaire Preview</span>
                  <span className="font-mono text-xs">{designedQuestions.length} Questions Drafted</span>
                </h4>

                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {designedQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-black/35 p-2.5 rounded-xl border border-white/5 relative flex justify-between items-start text-xs font-mono">
                      <div>
                        <p className="font-bold text-white leading-tight">
                          #{idx + 1}. {q.text} <span className="text-amber-400 font-bold">({q.maxPoints} pts)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Type: {q.type}</p>
                        {q.type === "multiple-choice" && q.options && (
                          <div className="text-[9px] text-[#FFD700] pl-3 mt-1 space-y-0.5 font-sans">
                            {q.options.map((o, io) => (
                              <div key={io} className={o.startsWith(q.correctAnswer || "") ? "font-bold text-emerald-400" : ""}>{o}</div>
                            ))}
                          </div>
                        )}
                        {q.type === "one-word" && (
                          <p className="text-[9px] text-emerald-400 font-bold font-mono pl-3">Correct answer: {q.correctAnswer}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDesignedQuestions(prev => prev.filter(item => item.id !== q.id))}
                        className="text-rose-400 hover:text-rose-300 font-bold text-[10px] bg-transparent border-none cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {designedQuestions.length === 0 && (
                    <div className="py-10 text-center text-slate-400 font-serif italic text-xs">
                      Question paper is empty. Stage multiple-choice, one-word, or essay questions using the designer form on the left.
                    </div>
                  )}
                </div>
              </div>

              {/* Submissions List & Grading Tool */}
              <div className="bg-[#2D0A0A] border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="font-serif italic text-white text-base font-bold">Grade Test Submissions</h4>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase font-bold">
                    Interactive Rubric
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Submissions list */}
                  <div className="md:col-span-5 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Assessable Test List:</span>
                    <select
                      value={activeTestIdForGrading}
                      onChange={(e) => {
                        setActiveTestIdForGrading(e.target.value);
                        setActiveStudentIdForTestGrading("");
                      }}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs font-semibold focus:outline-none"
                    >
                      <option value="">-- Choose A Published Test --</option>
                      {myTests.map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.subject})</option>
                      ))}
                    </select>

                    {activeTestIdForGrading && (
                      <div className="space-y-1.5 pt-3">
                        <span className="text-[10px] font-mono uppercase text-[#FFD700] block font-bold">Class Student Submissions:</span>
                        {(() => {
                          const currentTest = myTests.find(t => t.id === activeTestIdForGrading);
                          if (!currentTest) return null;
                          
                          const studentsInClass = students.filter(s => s.className === classes.find(c => c.id === currentTest.classId)?.name);
                          return studentsInClass.map(s => {
                            const sub = currentTest.submissions[s.id];
                            const isSelected = activeStudentIdForTestGrading === s.id;
                            
                            return (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setActiveStudentIdForTestGrading(s.id);
                                  setTestGradingScore(sub?.score ?? currentTest.totalPoints);
                                  setTestGradingFeedback(sub?.feedback ?? "");
                                }}
                                className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex justify-between items-center ${
                                  isSelected 
                                    ? "bg-[#FFD700]/10 border-[#FFD700]/33 text-white font-bold" 
                                    : "bg-black/20 border-white/5 text-slate-300 hover:border-white/10"
                                }`}
                              >
                                <div>
                                  <p className="font-serif font-bold text-slate-100">{s.name}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5 leading-none">
                                    {sub ? `Submitted: ${new Date(sub.submittedAt).toLocaleDateString()}` : "Not submitted yet"}
                                  </p>
                                </div>
                                
                                {sub ? (
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    sub.score !== undefined ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" : "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                                  }`}>
                                    {sub.score !== undefined ? `${sub.score} marks` : "Needs Grading"}
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-slate-500/10 text-slate-400 border border-white/5 rounded text-[8px] font-bold uppercase font-mono">
                                    Missing
                                  </span>
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right grading detail and rubric */}
                  <div className="md:col-span-7 bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-sans text-left">
                    {activeTestIdForGrading && activeStudentIdForTestGrading ? (
                      (() => {
                        const currentTest = myTests.find(t => t.id === activeTestIdForGrading)!;
                        const studentProfile = students.find(s => s.id === activeStudentIdForTestGrading)!;
                        const sub = currentTest.submissions[studentProfile.id];
                        
                        return (
                          <div className="space-y-4">
                            <div className="border-b border-white/10 pb-2">
                              <span className="bg-[#FFD700]/10 text-[#FFD700] rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase">Evaluating Sheet</span>
                              <h5 className="font-serif italic text-white text-base font-bold mt-1 leading-tight">{studentProfile.name}</h5>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">Test: {currentTest.title} • Max Points: {currentTest.totalPoints}</p>
                            </div>

                            {sub ? (
                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                {currentTest.questions.map((q, idx) => {
                                  const studentAns = sub.answers[q.id] || "No Answer Given";
                                  const isCorrect = q.correctAnswer && studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                                  
                                  return (
                                    <div key={q.id} className="bg-[#2D0A0A]/30 border border-white/5 p-3 rounded-lg space-y-2">
                                      <p className="font-semibold text-slate-100 font-mono text-[11px] leading-tight">
                                        Q{idx + 1}: {q.text} <span className="text-slate-400">({q.maxPoints} pts)</span>
                                      </p>
                                      
                                      {q.options && (
                                        <div className="grid grid-cols-2 gap-1.5 text-[10px] pl-2 font-mono text-slate-400">
                                          {q.options.map((o, io) => (
                                            <div key={io} className={o.startsWith(q.correctAnswer || "") ? "text-emerald-400 font-bold" : ""}>
                                              {o}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="bg-black/40 p-2 rounded border border-white/5 space-y-1 text-[10px] font-mono leading-relaxed">
                                        <p className="flex justify-between">
                                          <span className="text-slate-400">Learner's Answer:</span>
                                          <span className={isCorrect ? "text-emerald-400 font-bold" : q.type === "essay" ? "text-slate-200" : "text-rose-400"}>
                                            {studentAns}
                                          </span>
                                        </p>
                                        {q.correctAnswer && (
                                          <p className="flex justify-between border-t border-white/5 pt-1 mt-1 text-[9px]">
                                            <span className="text-slate-500">Benchmark Correct Answer:</span>
                                            <span className="text-emerald-400 font-bold uppercase">{q.correctAnswer}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Submission Evaluation Panel */}
                                <div className="bg-[#2D0A0A] border border-white/5 p-4 rounded-xl space-y-3 font-sans">
                                  <h6 className="font-bold text-white uppercase text-[10px] tracking-wider leading-none">Submit Grades & Feedback Registry</h6>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-mono text-slate-300 block uppercase font-bold">Graded Points Score:</label>
                                      <div className="flex items-center space-x-2 bg-black/40 px-2 py-1 rounded border border-white/10">
                                        <input
                                          type="number"
                                          min="0"
                                          max={currentTest.totalPoints}
                                          value={testGradingScore}
                                          onChange={(e) => setTestGradingScore(Math.min(currentTest.totalPoints, Math.max(0, Number(e.target.value))))}
                                          className="w-12 bg-transparent text-[#FFD700] font-mono text-xs font-bold text-center border-none focus:outline-none"
                                        />
                                        <span className="text-slate-400 text-[10px] font-mono">/ {currentTest.totalPoints} marks</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-slate-300 block uppercase font-bold">Constructive Feedback Remarks:</label>
                                    <textarea
                                      rows={2}
                                      value={testGradingFeedback}
                                      onChange={(e) => setTestGradingFeedback(e.target.value)}
                                      placeholder="Provide detailed marks review..."
                                      className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs focus:ring-1 focus:ring-[#FFD700] text-slate-100"
                                    ></textarea>
                                  </div>

                                  <button
                                    onClick={() => {
                                      if (onGradeTest) {
                                        onGradeTest(currentTest.id, studentProfile.id, testGradingScore, testGradingFeedback);
                                        alert(`Successfully marked test scorecard for ${studentProfile.name}!`);
                                      }
                                    }}
                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-[10px] tracking-widest rounded-lg cursor-pointer border-none font-sans"
                                  >
                                    Process Grade Report
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="py-12 text-center text-slate-400 italic font-serif">
                                Student hasn't submitted this assessment yet. You can still grade or give pre-evaluation words!
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-20 text-center italic text-slate-400 font-serif">
                        Select an active test and scroll student name submissions to evaluate scorecard answers.
                      </div>
                    )}
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
