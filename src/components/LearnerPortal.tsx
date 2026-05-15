import React, { useState } from "react";
import { Student, ClassGroup, Homework, AIPersonalizedPath, AIWeeklyMilestone, Test, TestQuestion, TestSubmission } from "../types";
import { Sparkles, BrainCircuit, CheckSquare, ListTodo, Award, HelpCircle, Send, Check, FileText, ClipboardSignature } from "lucide-react";

interface LearnerPortalProps {
  student: Student;
  classes: ClassGroup[];
  homeworks: Homework[];
  onHandInHomework: (hwId: string, solutionText: string) => void;
  onSavePersonalizedPath: (path: AIPersonalizedPath) => void;
  tests?: Test[];
  onSubmitTest?: (testId: string, studentId: string, answers: Record<string, string>) => void;
}

export default function LearnerPortal({
  student,
  classes,
  homeworks,
  onHandInHomework,
  onSavePersonalizedPath,
  tests = [],
  onSubmitTest
}: LearnerPortalProps) {
  const [learnerTab, setLearnerTab] = useState<"performance" | "homework" | "tests" | "attendance" | "aiPath">("performance");
  const [handInText, setHandInText] = useState("");
  const [activeHandInHwId, setActiveHandInHwId] = useState<string | null>(null);

  // States for student test taking modules
  const [activeTestIdForSubmission, setActiveTestIdForSubmission] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [activeTestIdForReview, setActiveTestIdForReview] = useState<string | null>(null);

  // AI Planner States
  const [generatingPath, setGeneratingPath] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [personalizedPath, setPersonalizedPath] = useState<AIPersonalizedPath | null>(null);
  
  // Track checked milestones to dynamic calculate progress
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  const myClassGroup = classes.find(c => c.name === student.className);
  const myHomeworks = homeworks.filter(h => h.classId === myClassGroup?.id);

  // Submit Homework handler
  const handleHandInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHandInHwId || !handInText) return;
    onHandInHomework(activeHandInHwId, handInText);
    setHandInText("");
    setActiveHandInHwId(null);
    alert("Homework submitted! Your class advisor has been notified for grading.");
  };

  // AI Personalized Study Map Generator
  const generateAIProgressMap = async () => {
    setGeneratingPath(true);
    try {
      const g = customGoal || `Strengthen Mathematics matrices and resolve spelling speed inside Grade 4 literature.`;
      
      const response = await fetch("/api/personalized-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          strengths: student.strengths,
          weaknesses: student.weaknesses,
          preferences: student.preferences,
          goal: g
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPersonalizedPath(result);
        onSavePersonalizedPath(result);
      } else {
        // Safe robust fallback client formulation if backend is offline/credentials missing
        setTimeout(() => {
          const fallbackPath: AIPersonalizedPath = {
            studentName: student.name,
            academicGoal: g,
            weeklyMilestones: [
              { week: "Week 1", focus: "Introductory foundations & Concepts", activity: "Establish core definitions, review past mistakes", type: "math" },
              { week: "Week 2", focus: "Analytical Drill execution", activity: "Solve 10 customized sample questions using colored templates", type: "science" },
              { week: "Week 3", focus: "Spelling & Text speed integration", activity: "Conduct interactive 1-on-1 spelling reviews", type: "languages" },
              { week: "Week 4", focus: "Comprehensive Assessment simulation", activity: "Perform self-paced timed mockup test", type: "creative" }
            ],
            personalizedTips: [
              "Maintain study sessions under 25-minute Pomodoro cycles.",
              "Use colored borders to isolate key elements as preferred.",
              "Focus specifically on " + student.weaknesses + " first thing in the morning."
            ]
          };
          setPersonalizedPath(fallbackPath);
          onSavePersonalizedPath(fallbackPath);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      // Fail-soft loading fallback
      const fallbackPath: AIPersonalizedPath = {
        studentName: student.name,
        academicGoal: "Resolve academic pressure around " + student.weaknesses,
        weeklyMilestones: [
          { week: "Week 1", focus: "Introductory concept outlines", activity: "Grasp core equations", type: "math" },
          { week: "Week 2", focus: "Intermediate workbook exercise", activity: "Check solutions against answer guides", type: "languages" },
          { week: "Week 3", focus: "Real-world context practice", activity: "Conduct comparative review sheets", type: "science" },
          { week: "Week 4", focus: "Evaluation milestones checks", activity: "Score simulation worksheet", type: "creative" }
        ],
        personalizedTips: ["Review daily logs.", "Adopt colorful highlights."]
      };
      setPersonalizedPath(fallbackPath);
      onSavePersonalizedPath(fallbackPath);
    } finally {
      setGeneratingPath(false);
    }
  };

  const handleToggleMilestone = (week: string) => {
    if (completedMilestones.includes(week)) {
      setCompletedMilestones(completedMilestones.filter(w => w !== week));
    } else {
      setCompletedMilestones([...completedMilestones, week]);
    }
  };

  // Calculate AI Checklist growth ring percentage
  const totalMilestonesCount = personalizedPath?.weeklyMilestones.length || 0;
  const completedCount = completedMilestones.length;
  const checklistCompletionRate = totalMilestonesCount > 0 
    ? Math.round((completedCount / totalMilestonesCount) * 100) 
    : 0;

  return (
    <div className="w-full bg-[#1b0505] rounded-3xl border border-[#FFD700]/15 overflow-hidden shadow-2xl p-6 lg:p-8 animate-fadeIn text-slate-100 font-sans">
      {/* Title Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 mb-5 gap-3">
        <div className="flex items-center space-x-3">
          <img
            src={student.photo}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD700] shadow-md shrink-0"
            alt=""
          />
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-[#FFD700]/10 text-[#FFD700] rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider mb-0.5">
              <span>Pupil Secure Portal</span>
            </div>
            <h2 className="text-2xl font-serif text-white italic font-bold">
              Account: {student.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Class Grade: <strong className="text-slate-200">{student.className}</strong> • Parent: {student.parentName}
            </p>
          </div>
        </div>

        {/* Inner Tabs selectors */}
        <div className="flex flex-wrap gap-1 bg-black/45 p-1 rounded-xl">
          {[
            { id: "performance", label: "Transcript Grades" },
            { id: "homework", label: "My Homework" },
            { id: "tests", label: "Interactive Tests" },
            { id: "attendance", label: "Attendance Log" },
            { id: "aiPath", label: "AI Study Planner" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLearnerTab(tab.id as any)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                learnerTab === tab.id
                  ? "bg-[#FFD700] text-[#2D0A0A] font-bold shadow-md"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary tab views */}

      {/* 1. Academic Performance Transcripts */}
      {learnerTab === "performance" && (
        <div className="space-y-6 font-serif">
          <h3 className="italic text-white text-lg font-bold">Academic Transcript Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div className="bg-[#2D0A0A] p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-[#FFD700] font-serif italic text-base font-bold">Curriculum Subjects</h4>
              <div className="space-y-3 font-mono text-xs">
                {Object.keys(student.grades).length === 0 ? (
                  <p className="text-slate-400 text-center py-4 font-sans text-xs">No evaluative grades logged inside directory database this term.</p>
                ) : (
                  Object.entries(student.grades).map(([subject, grade]) => (
                    <div key={subject} className="space-y-1">
                      <div className="flex justify-between font-sans text-[11px]">
                        <span>{subject}</span>
                        <span className="font-bold text-[#FFD700]">{grade}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${grade >= 80 ? "bg-emerald-400" : grade >= 70 ? "bg-[#1E90FF]" : "bg-amber-400"}`}
                          style={{ width: `${grade}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#2D0A0A] p-5 rounded-2xl border border-white/5 space-y-2">
              <h4 className="text-[#FFD700] font-serif italic text-base font-bold">Developmental Overview</h4>
              <ul className="space-y-2.5 text-xs font-mono pt-2 text-slate-300">
                <li className="border-b border-white/5 pb-1.5">
                  <span className="text-[#FFD700] block uppercase font-sans text-[9px] font-bold">My Strengths:</span>
                  <p className="font-sans font-medium text-slate-100">{student.strengths}</p>
                </li>
                <li className="border-b border-white/5 pb-1.5">
                  <span className="text-rose-400 block uppercase font-sans text-[9px] font-bold">My Weaknesses:</span>
                  <p className="font-sans font-medium text-slate-100">{student.weaknesses}</p>
                </li>
                <li>
                  <span className="text-[#1E90FF] block uppercase font-sans text-[9px] font-bold">My Preferences:</span>
                  <p className="font-sans font-medium text-slate-100">{student.preferences}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. Homework Tasks and submission portal */}
      {learnerTab === "homework" && (
        <div className="space-y-4 animate-fadeIn font-mono text-xs">
          <h3 className="italic text-white text-lg font-serif">Homework Activities Directory ({myHomeworks.length})</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {myHomeworks.length === 0 ? (
              <p className="p-6 text-center text-slate-400 bg-black/35 rounded-xl lg:col-span-2">No homework activities currently dispatched to your class.</p>
            ) : (
              myHomeworks.map((hw) => {
                const sub = hw.submissions[student.id];
                return (
                  <div key={hw.id} className="bg-[#2D0A0A] border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{hw.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            sub ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {sub ? "Submitted" : "Pending Hand-In"}
                        </span>
                      </div>
                      <h4 className="font-serif italic font-bold text-sm text-[#FFD700] leading-tight pt-1">{hw.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-normal font-sans pt-1.5">{hw.description}</p>
                    </div>

                    <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[10px] uppercase font-bold">
                      <span className="text-rose-400">Due: {hw.dueDate} ({hw.totalPoints} pts)</span>
                      {sub ? (
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">Grade: {sub.score !== undefined ? `${sub.score} / ${hw.totalPoints}` : "Awaiting"}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveHandInHwId(hw.id)}
                          className="px-3 py-1 bg-[#1E90FF] text-white rounded font-bold uppercase text-[9px] hover:bg-[#1E90FF]/85 cursor-pointer border-none"
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submission Dialog popup frame */}
          {activeHandInHwId && (
            <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
              <form onSubmit={handleHandInSubmit} className="bg-white text-[#2D0A0A] rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl ring-4 ring-[#FFD700]/20 animate-fadeIn">
                <h4 className="font-serif italic text-xl font-bold text-[#2D0A0A]">Hand In Homework Solution</h4>
                <p className="text-xs text-slate-600">
                  Type your calculations or homework narrative directly below. Hand-ins are routed instantly.
                </p>

                <textarea
                  required
                  rows={4}
                  value={handInText}
                  onChange={e => setHandInText(e.target.value)}
                  placeholder="Insert your answer here..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-[#2D0A0A] bg-slate-50 focus:outline-none"
                ></textarea>

                <div className="flex justify-end space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveHandInHwId(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold uppercase transition-colors shrink-0 border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2D0A0A] hover:bg-[#4E1010] text-white rounded font-bold uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Hand In Homework
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. Learner Attendance Ring representation */}
      {learnerTab === "attendance" && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="italic text-white text-lg font-serif">Attendance Statistics Log</h3>

          <div className="bg-[#2D0A0A] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs text-[#FFD700] uppercase font-mono tracking-widest block font-bold">My Personal Presence Ratio</span>
              <p className="text-slate-300 text-xs leading-relaxed max-w-md font-sans">
                Poplar Connect demands a <strong className="text-[#FFD700]">90% threshold commitment rate</strong> for secondary and primary pupils. Your faculty monitors daily checkpoints.
              </p>
            </div>

            <div className="flex items-center space-x-4 font-mono shrink-0">
              <div className="text-center bg-black/35 p-4 rounded-xl border border-white/5">
                <span className="text-[#FFD700] text-3xl font-serif font-black">{student.attendanceRate}%</span>
                <p className="text-[10px] uppercase text-slate-400 font-bold mt-1">Attendance rate</p>
              </div>

              {/* Colored status node */}
              <div className="bg-black/35 p-4 rounded-xl border border-white/5 text-xs space-y-1">
                <p className="text-slate-300">Status Check:</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${student.attendanceRate >= 90 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                  {student.attendanceRate >= 90 ? "EXCELLENT COMMITMENT" : "ALERT: NEEDS REVIEW"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI-Powered Personalized Study Path */}
      {learnerTab === "aiPath" && (
        <div className="space-y-6 animate-fadeIn font-serif">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="italic text-white text-lg font-bold flex items-center gap-1.5 leading-tight">
                <Sparkles className="w-5 h-5 text-[#FFD700] animate-[#FFD700]" /> AI-Powered Personalized Study Planner
              </h3>
              <p className="text-xs text-slate-400 font-sans tracking-normal pt-1">
                Utilize integrated server-side Gemini engines to tailor a self-paced study roadmap directly addressing your weaknesses.
              </p>
            </div>

            <button
              onClick={generateAIProgressMap}
              disabled={generatingPath}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFD700]/80 text-[#210202] text-xs font-mono font-black uppercase tracking-wider rounded-lg shadow-lg hover:shadow-yellow-500/15 disabled:opacity-40 transition-all cursor-pointer border-none"
            >
              {generatingPath ? "Synchronizing AI matrix..." : "Generate AI Academic Map"}
            </button>
          </div>

          {/* AI Loader */}
          {generatingPath && (
            <div className="p-12 text-center bg-black/35 rounded-2xl border border-dashed border-[#FFD700]/30 space-y-4">
              <BrainCircuit className="w-12 h-12 text-[#FFD700] mx-auto animate-pulse" />
              <p className="text-xs text-slate-300 font-mono tracking-wider">
                Reading student profile weak areas ("{student.weaknesses}") and drafting study weeks...
              </p>
            </div>
          )}

          {/* AI Path results */}
          {personalizedPath && !generatingPath && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              
              {/* Timeline weeks map and progression tracker on the left */}
              <div className="lg:col-span-8 space-y-5">
                <div className="bg-[#2D0A0A] p-5 rounded-2xl border border-[#FFD700]/15 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#FFD700] font-bold">Dynamic Academic Goal</span>
                  <h4 className="text-white text-base leading-snug">{personalizedPath.academicGoal}</h4>
                </div>

                <div className="space-y-3 font-sans">
                  <h5 className="font-serif italic text-[#FFD700] text-sm font-bold">Interactive Milestones Timeline Checklist</h5>
                  <p className="text-slate-400 text-xs">
                    Tick weeks off as you complete homework or self-paced exercises. These dynamic actions scale the progression ring.
                  </p>

                  <div className="space-y-3 pt-2">
                    {personalizedPath.weeklyMilestones.map((milestone, idx) => {
                      const isCompleted = completedMilestones.includes(milestone.week);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleMilestone(milestone.week)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isCompleted
                              ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-100"
                              : "bg-black/35 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                milestone.type === "math" ? "bg-[#FFD700]/15 text-[#FFD700]" : "bg-indigo-500/15 text-indigo-400"
                              }`}>
                                {milestone.week} • {milestone.type}
                              </span>
                              <h6 className="font-serif font-bold text-slate-200 text-xs">{milestone.focus}</h6>
                            </div>
                            <p className="text-slate-400 text-xs font-sans">{milestone.activity}</p>
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isCompleted ? "bg-emerald-500 border-emerald-500" : "border-slate-400"
                          }`}>
                            {isCompleted && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress Ring and Tips column right side */}
              <div className="lg:col-span-4 space-y-6 font-mono text-xs">
                {/* Progression Ring Gauge */}
                <div className="bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl text-center space-y-3">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Study Plan Progress</span>
                  
                  <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="#4A1010"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="#FFD700"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - (checklistCompletionRate / 100))}`}
                      />
                    </svg>
                    <span className="absolute text-[#FFD700] font-bold text-sm">
                      {checklistCompletionRate}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Checked off <strong>{completedCount}</strong> of <strong>{totalMilestonesCount}</strong> milestones.
                  </p>
                </div>

                {/* AI Tips */}
                <div className="bg-[#2D0A0A] border border-white/5 p-5 rounded-2xl space-y-3 font-sans">
                  <h5 className="font-serif italic text-white text-sm font-bold">Tailored AI Study Tips</h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {personalizedPath.personalizedTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckSquare className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Interactive Test and Quiz Portal */}
      {learnerTab === "tests" && (
        <div className="space-y-6 text-left font-serif">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="italic text-white text-lg font-bold">Assessments & Exams Center</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Take interactive exams designed by your instructors. Review graded scorecards and tutor remarks.
              </p>
            </div>
          </div>

          {(() => {
            const classTests = (tests || []).filter(t => t.classId === myClassGroup?.id);
            if (classTests.length === 0) {
              return (
                <div className="py-12 bg-black/25 text-center text-slate-400 rounded-xl italic font-sans text-xs">
                  No published tests or exams are currently dispatched to {student.className || "your class division"}.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {classTests.map((test) => {
                  const submission = test.submissions[student.id];
                  const hasSubmitted = !!submission;
                  const isGraded = submission && submission.score !== undefined;
                  
                  return (
                    <div
                      key={test.id}
                      className="bg-[#2D0A0A] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-[#FFD700]/15 transition-all text-xs text-left"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                          <span>{test.subject}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            isGraded 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                              : hasSubmitted 
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/15" 
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                          }`}>
                            {isGraded ? "Graded" : hasSubmitted ? "Submitted (Reviewing)" : "Not Started"}
                          </span>
                        </div>
                        <h4 className="font-serif italic font-bold text-base text-[#FFD700] leading-tight pt-1">
                          {test.title}
                        </h4>
                        <p className="text-slate-300 font-sans font-light text-[11px] leading-relaxed pt-1 line-clamp-3">
                          {test.description || "Interactive evaluation of course milestones."}
                        </p>
                      </div>

                      {/* Grade details if Scored */}
                      {isGraded && (
                        <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">Score Achieved:</span>
                            <span className="text-[#FFD700] font-bold">{submission.score} / {test.totalPoints} Marks</span>
                          </div>
                          {submission.feedback && (
                            <p className="text-slate-300 italic pt-1 font-sans text-[10px]">
                              "Tutor Feedback: {submission.feedback}"
                            </p>
                          )}
                        </div>
                      )}

                      <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] uppercase font-mono font-bold">
                        <span className="text-rose-400">Due: {test.dueDate || "Unscheduled"} (Points: {test.totalPoints})</span>
                        
                        {!hasSubmitted ? (
                          <button
                            onClick={() => {
                              setActiveTestIdForSubmission(test.id);
                              setStudentAnswers({});
                            }}
                            className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] rounded-lg font-bold uppercase text-[10px] cursor-pointer transition-all border-none font-sans"
                          >
                            Take Test
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTestIdForReview(test.id)}
                            className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-[#FFD700] rounded-lg font-bold uppercase text-[10px] cursor-pointer transition-all border border-white/10 font-sans"
                          >
                            Review Paper
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Dialog popup modal frame for Interactive Test taking */}
          {activeTestIdForSubmission && (() => {
            const currentTest = (tests || []).find(t => t.id === activeTestIdForSubmission);
            if (!currentTest) return null;
            
            return (
              <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#1b0505] text-slate-100 rounded-3xl p-6 lg:p-8 w-full max-w-2xl border border-[#FFD700]/20 shadow-2xl relative max-h-[85vh] overflow-y-auto font-sans">
                  
                  {/* Top Close Button */}
                  <button
                    onClick={() => setActiveTestIdForSubmission(null)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-white bg-transparent border-none text-xl cursor-pointer font-bold"
                  >
                    ×
                  </button>

                  <div className="border-b border-white/10 pb-3 mb-5 text-left">
                    <span className="inline-block bg-[#FFD700]/10 text-[#FFD700] rounded px-2.5 py-0.5 text-[10px] font-mono tracking-wider font-bold uppercase">
                      Official Assessment Paper
                    </span>
                    <h3 className="font-serif italic text-white text-2xl font-bold mt-1 leading-tight">{currentTest.title}</h3>
                    <p className="text-xs text-slate-200 mt-1">{currentTest.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Subject: {currentTest.subject} • Total Marks: {currentTest.totalPoints} points
                    </p>
                  </div>

                  {/* Questionnaire input form */}
                  <div className="space-y-6">
                    {currentTest.questions.map((q, idx) => {
                      return (
                        <div key={q.id} className="bg-black/35 p-4 rounded-2xl border border-white/5 space-y-3 text-left text-xs">
                          <p className="font-bold text-white text-sm">
                            Q{idx + 1}. {q.text} <span className="text-slate-400">({q.maxPoints} pts)</span>
                          </p>

                          {/* MCQ Choice select render */}
                          {q.type === "multiple-choice" && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options.map((option) => {
                                const optLetter = option.match(/^([A-D])\)/)?.[1] || option.slice(0, 1).toUpperCase();
                                const isSelected = studentAnswers[q.id] === optLetter;
                                
                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id]: optLetter }))}
                                    className={`p-2.5 rounded-lg border font-mono text-left transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-[#FFD700]/10 border-[#FFD700] text-white font-bold"
                                        : "bg-black/20 border-white/5 text-slate-300 hover:border-white/10"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* One Word short answer */}
                          {q.type === "one-word" && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-mono block">Short word response:</span>
                              <input
                                type="text"
                                value={studentAnswers[q.id] || ""}
                                onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                placeholder="Type answer word here..."
                                className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono"
                              />
                            </div>
                          )}

                          {/* Essay free text */}
                          {q.type === "essay" && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-mono block">Argument response dialogue:</span>
                              <textarea
                                value={studentAnswers[q.id] || ""}
                                onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                placeholder="Write detailed argument/essay explanation..."
                                rows={3}
                                className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100"
                              ></textarea>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-end pt-6 space-x-2">
                    <button
                      onClick={() => setActiveTestIdForSubmission(null)}
                      className="px-4 py-2 bg-black/45 border border-white/10 text-slate-300 rounded-lg hover:bg-black/60 cursor-pointer font-bold uppercase text-[10px] tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const unansweredCount = currentTest.questions.filter(q => !studentAnswers[q.id]).length;
                        if (unansweredCount > 0) {
                          const conf = window.confirm(`You left ${unansweredCount} questions unanswered. Do you want to submit anyway?`);
                          if (!conf) return;
                        }
                        
                        if (onSubmitTest) {
                          onSubmitTest(currentTest.id, student.id, studentAnswers);
                        }
                        
                        setActiveTestIdForSubmission(null);
                        alert(`Successfully logged assessment paper answers for "${currentTest.title}". Waiting for teacher to mark scorecard!`);
                      }}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#120303] rounded-lg font-bold uppercase text-[10px] tracking-widest cursor-pointer transition-all border-none font-sans"
                    >
                      Hand In Paper
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Test Submission Review Modal Frame */}
          {activeTestIdForReview && (() => {
            const currentTest = (tests || []).find(t => t.id === activeTestIdForReview);
            if (!currentTest) return null;
            
            const submission = currentTest.submissions[student.id];
            if (!submission) return null;
            
            return (
              <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#1b0505] text-slate-100 rounded-3xl p-6 lg:p-8 w-full max-w-2xl border border-[#FFD700] shadow-2xl relative max-h-[85vh] overflow-y-auto font-sans">
                  
                  {/* Top Close Button */}
                  <button
                    onClick={() => setActiveTestIdForReview(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-transparent border-none text-xl cursor-pointer font-bold"
                  >
                    ×
                  </button>

                  <div className="border-b border-white/10 pb-3 mb-5 text-left">
                    <span className="inline-block bg-[#1E90FF]/15 text-[#1E90FF] rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase">
                      Graded Test Journal
                    </span>
                    <h3 className="font-serif italic text-white text-2xl font-bold mt-1 leading-tight">{currentTest.title}</h3>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      Grading Status: {submission.score !== undefined ? `Evaluated ${submission.score} / ${currentTest.totalPoints} Marks` : "Awaiting Evaluation"}
                    </p>
                    {submission.feedback && (
                      <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl p-3 mt-3">
                        <p className="text-xs text-white italic">
                          "Tutor Feedbacks: {submission.feedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-left font-sans">
                    {currentTest.questions.map((q, idx) => {
                      const studentAns = submission.answers[q.id] || "No Answer Given";
                      const isCorrect = q.correctAnswer && studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                      
                      return (
                        <div key={q.id} className="bg-black/35 p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
                          <p className="font-bold text-white leading-tight">
                            Q{idx + 1}. {q.text} <span className="text-slate-400 font-normal font-mono text-[10px]">({q.maxPoints} pts)</span>
                          </p>
                          
                          {q.type === "multiple-choice" && q.options && (
                            <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                              {q.options.map((option) => (
                                <div key={option} className={option.startsWith(q.correctAnswer || "") ? "text-emerald-400 font-bold" : "text-slate-400"}>
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-1 font-mono text-[10px] leading-relaxed">
                            <p className="flex justify-between">
                              <span className="text-slate-400">Your Hand-In Solution:</span>
                              <span className={isCorrect ? "text-emerald-400 font-bold" : q.type === "essay" ? "text-slate-200" : "text-rose-400"}>
                                {studentAns}
                              </span>
                            </p>
                            {q.correctAnswer && (
                              <p className="flex justify-between border-t border-white/5 pt-1 mt-1 text-[9px]">
                                <span className="text-slate-500">Benchmark Solution Answer:</span>
                                <span className="text-emerald-400 font-bold uppercase">{q.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={() => setActiveTestIdForReview(null)}
                      className="px-5 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 cursor-pointer font-bold uppercase text-[10px] tracking-wider transition-all border-none font-sans"
                    >
                      Close Journal
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
}
