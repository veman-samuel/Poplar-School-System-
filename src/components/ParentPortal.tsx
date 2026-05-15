import React, { useState } from "react";
import { Student, FeeTransaction, ClassGroup } from "../types";
import { 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Building, 
  KeyRound, 
  ArrowRight, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Wallet, 
  GraduationCap, 
  Calendar, 
  User, 
  Coins,
  History,
  AlertTriangle,
  Lock,
  ChevronRight,
  Info
} from "lucide-react";

interface ParentPortalProps {
  students: Student[];
  transactions: FeeTransaction[];
  onRegisterParentAndStudent: (parentData: {
    parentName: string;
    parentEmail: string;
    studentName: string;
    section: "Nursery" | "Primary" | "Secondary";
    className: string;
    strengths: string;
    weaknesses: string;
    preferences: string;
    photo: string;
  }) => void;
  onPayFees: (studentId: string, amount: number, method: string) => void;
}

export default function ParentPortal({
  students = [],
  transactions = [],
  onRegisterParentAndStudent,
  onPayFees
}: ParentPortalProps) {
  // Authentication states
  const [parentEmail, setParentEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(() => {
    // Attempt auto-login with last active parent
    const lastParent = localStorage.getItem("poplar_active_parent_email");
    return lastParent || null;
  });
  const [parentNameInput, setParentNameInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration states for a NEW parent + student
  const [regParentName, setRegParentName] = useState("");
  const [regParentEmail, setRegParentEmail] = useState("");
  const [regStudentName, setRegStudentName] = useState("");
  const [regSection, setRegSection] = useState<"Nursery" | "Primary" | "Secondary">("Primary");
  const [regClassName, setRegClassName] = useState("Grade 4 Bravo");
  const [regStrengths, setRegStrengths] = useState("");
  const [regWeaknesses, setRegWeaknesses] = useState("");
  const [regPreferences, setRegPreferences] = useState("");
  const [regPhoto, setRegPhoto] = useState("https://images.unsplash.com/photo-1544717305-2782549b5136?w=150");

  // Portal view states
  const [activeTab, setActiveTab] = useState<"kids" | "history" | "enroll">("kids");

  // Payment states
  const [payingStudentId, setPayingStudentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "smart_card">("mobile_money");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProgressMsg, setPaymentProgressMsg] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mobile Money states
  const [mobileOperator, setMobileOperator] = useState("M-Pesa");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Smart Card / Card states
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardPin, setCardPin] = useState("");

  // Quick Switch for testing
  const allParentEmails = Array.from(new Set(students.map(s => s.parentEmail).filter(Boolean)));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail.trim()) return;
    const cleanEmail = parentEmail.trim().toLowerCase();
    setLoggedInEmail(cleanEmail);
    localStorage.setItem("poplar_active_parent_email", cleanEmail);
  };

  const handleLogout = () => {
    setLoggedInEmail(null);
    localStorage.removeItem("poplar_active_parent_email");
    setActiveTab("kids");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regParentName.trim() || !regParentEmail.trim() || !regStudentName.trim()) {
      alert("Please fill in parent name, parent email and student name.");
      return;
    }

    onRegisterParentAndStudent({
      parentName: regParentName,
      parentEmail: regParentEmail.trim().toLowerCase(),
      studentName: regStudentName,
      section: regSection,
      className: regClassName,
      strengths: regStrengths || "Eager learner",
      weaknesses: regWeaknesses || "Needs practice under pressure",
      preferences: regPreferences || "Visual aids and regular check-ins",
      photo: regPhoto
    });

    // Auto log-in with the registered email
    const registeredEmail = regParentEmail.trim().toLowerCase();
    setLoggedInEmail(registeredEmail);
    localStorage.setItem("poplar_active_parent_email", registeredEmail);
    setIsRegistering(false);
    setActiveTab("kids");

    // Reset fields
    setRegStudentName("");
    setRegStrengths("");
    setRegWeaknesses("");
    setRegPreferences("");
  };

  // Register an ADDITIONAL child under already logged-in parent profile
  const handleAddChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInEmail) return;
    if (!regStudentName.trim()) {
      alert("Please specify the pupil's name");
      return;
    }

    // Lookup current parent name to reuse it
    const existingStudentObj = students.find(s => s.parentEmail.toLowerCase() === loggedInEmail.toLowerCase());
    const currentParentName = existingStudentObj ? existingStudentObj.parentName : "Parent User";

    onRegisterParentAndStudent({
      parentName: currentParentName,
      parentEmail: loggedInEmail,
      studentName: regStudentName,
      section: regSection,
      className: regClassName,
      strengths: regStrengths || "Attentive",
      weaknesses: regWeaknesses || "Needs study routine assistance",
      preferences: regPreferences || "Personalized assignments",
      photo: regPhoto
    });

    alert(`Enrollment Request for ${regStudentName} successfully lodged under ${loggedInEmail}! Waiting for Section Head approval.`);
    setRegStudentName("");
    setRegStrengths("");
    setRegWeaknesses("");
    setRegPreferences("");
    setActiveTab("kids");
  };

  // Find students linked to this parent email
  const myStudents = loggedInEmail 
    ? students.filter(s => s.parentEmail && s.parentEmail.toLowerCase() === loggedInEmail.toLowerCase())
    : [];

  // Find transactions for my kids
  const myStudentIds = myStudents.map(s => s.id);
  const myTransactions = transactions.filter(t => myStudentIds.includes(t.studentId));

  // Payment process simulation
  const startPayment = (studentId: string, balance: number) => {
    setPayingStudentId(studentId);
    setPaymentAmount(balance);
    setPaymentSuccess(false);
    setOtpSent(false);
    setMobileOtp("");
    setCardPin("");
  };

  const executePaymentGateway = () => {
    if (paymentAmount <= 0) {
      alert("Please enter a valid payment fee value.");
      return;
    }

    if (paymentMethod === "mobile_money") {
      if (!mobileNumber.trim()) {
        alert("Please specify a valid Mobile Money number.");
        return;
      }
      if (!otpSent) {
        setPaymentProgressMsg("Dispatching remote carrier push handshake...");
        setIsProcessingPayment(true);
        setTimeout(() => {
          setIsProcessingPayment(false);
          setOtpSent(true);
          alert("A one-time OTP secure token was pushed to child device line. Please type '1234' or any valid pin.");
        }, 1500);
        return;
      } else {
        if (!mobileOtp.trim()) {
          alert("Please type the PIN OTP you received.");
          return;
        }
      }
    } else {
      // Smart Card Validation
      if (!cardHolder.trim() || !cardNumber.trim()) {
        alert("Please complete the holder and smart card credentials.");
        return;
      }
    }

    // Run clearance spinner
    setIsProcessingPayment(true);
    setPaymentProgressMsg("Verifying hardware accounts and clearing ledger balances...");
    
    setTimeout(() => {
      setPaymentProgressMsg("Re-routing merchant receipt through treasury engine...");
      setTimeout(() => {
        if (!payingStudentId) return;
        
        onPayFees(payingStudentId, paymentAmount, paymentMethod === "mobile_money" ? "Mobile Money - " + mobileOperator : "Smart Card Gateway");
        setIsProcessingPayment(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          setPayingStudentId(null);
          setPaymentSuccess(false);
        }, 2200);
      }, 1500);
    }, 1500);
  };

  return (
    <div id="parent-portal-root" className="w-full bg-[#1b0505] rounded-3xl border border-[#FFD700]/15 overflow-hidden shadow-xl p-6 animate-fadeIn text-left font-sans text-slate-100">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 mb-5 gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#FFD700]/10 text-[#FFD700] rounded-full px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase mb-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Parent Verified Account Hub</span>
          </div>
          <h2 className="text-2xl font-serif text-white italic font-bold">
            Guardian &amp; Accounts Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create unified parent credentials, deposit child dues via Mobile Money or Smart Cards, and keep track of academic dispatches.
          </p>
        </div>

        {loggedInEmail && (
          <div className="flex items-center gap-3">
            <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 text-right">
              <span className="text-[9px] text-slate-400 block font-mono">Logged in Guardian:</span>
              <span className="text-[#FFD700] font-bold text-xs">{loggedInEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-rose-500/20"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* 2. Authentication Screen */}
      {!loggedInEmail ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          
          {/* Quick Sandbox Selector */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="text-left">
              <h4 className="text-sm font-serif italic text-[#FFD700] font-bold">Quick Sandbox Parent Accounts</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Select one of the default mock-registered parents to enter their dashboard instantly or sign-in below.
              </p>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              {allParentEmails.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No pre-registered parent emails found. Please use the registration form to create one!</p>
              ) : (
                allParentEmails.map(email => {
                  const studentMatch = students.find(s => s.parentEmail === email);
                  return (
                    <button
                      key={email}
                      onClick={() => {
                        setParentEmail(email);
                        setLoggedInEmail(email.toLowerCase());
                        localStorage.setItem("poplar_active_parent_email", email.toLowerCase());
                      }}
                      className="p-3 bg-[#2D0A0A] hover:bg-[#3d1111] rounded-xl border border-white/5 hover:border-[#FFD700]/30 text-left transition-all flex items-center justify-between cursor-pointer group text-[11px]"
                    >
                      <div className="space-y-0.5">
                        <span className="text-white font-bold block">{studentMatch?.parentName || "Guardian"}</span>
                        <span className="text-slate-400 text-[10px]">{email}</span>
                        <span className="text-slate-500 text-[9px] block">Pupil: {studentMatch?.name} ({studentMatch?.className})</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#FFD700] group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Manual Login & Register split */}
          <div className="space-y-6">
            {!isRegistering ? (
              <div className="bg-[#2D0A0A] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-[#FFD700]" />
                  <h3 className="font-serif italic font-bold text-white text-base">Sign In to Your Parent Dashboard</h3>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Enter your registered parent email to pay pending school tuition, review report cards, and track student attendance logs.
                </p>

                <form onSubmit={handleLogin} className="space-y-3 font-sans">
                  <div>
                    <label className="text-[10px] font-mono text-slate-300 uppercase tracking-wider block font-bold mb-1">Guardian Email Address</label>
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="e.g. parent@example.com"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-xs text-slate-100 font-mono outline-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] rounded font-bold text-xs uppercase tracking-wider cursor-pointer transition-all font-sans border-none"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="flex-1 py-2 bg-black/40 hover:bg-black/60 text-[#FFD700] border border-white/10 rounded font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Create Account & Student Enrollment Request Panel
              <div className="bg-[#2D0A0A] border border-white/10 rounded-2xl p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif italic font-semibold text-white text-base">New Family Account &amp; Kids Registration</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Fill in your credentials to apply for parent login. You must enroll at least one student below. Your request will be routed to the specific Section Head for verified approval.
                </p>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  {/* Guardian details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-slate-300 uppercase block font-bold mb-1">Parent/Guardian Name</label>
                      <input
                        type="text"
                        required
                        value={regParentName}
                        onChange={(e) => setRegParentName(e.target.value)}
                        placeholder="e.g. Samuel Veman"
                        className="w-full px-3 py-1.5 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-300 uppercase block font-bold mb-1">Parent/Guardian Email</label>
                      <input
                        type="email"
                        required
                        value={regParentEmail}
                        onChange={(e) => setRegParentEmail(e.target.value)}
                        placeholder="e.g. samuel@example.com"
                        className="w-full px-3 py-1.5 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Pupil details */}
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <span className="text-[9px] font-mono text-[#FFD700] uppercase tracking-wider block font-bold mb-2">Child (Pupil) Enrollment Request</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono text-slate-300 uppercase block font-medium mb-1">Full Pupil Name</label>
                        <input
                          type="text"
                          required
                          value={regStudentName}
                          onChange={(e) => setRegStudentName(e.target.value)}
                          placeholder="e.g. Leo Thorne"
                          className="w-full px-3 py-1.5 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-300 uppercase block font-medium mb-1">Academic Level (Section)</label>
                        <select
                          value={regSection}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setRegSection(val);
                            if (val === "Nursery") setRegClassName("Tiny Tots");
                            else if (val === "Primary") setRegClassName("Grade 4 Bravo");
                            else setRegClassName("Grade 11 Alpha");
                          }}
                          className="w-full px-2.5 py-1.5 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono text-[11px]"
                        >
                          <option value="Nursery">Nursery Section Head</option>
                          <option value="Primary">Primary Section Head</option>
                          <option value="Secondary">Secondary Section Head</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional diagnostic pointers for custom AI path generation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block mb-1">Allocated Class Name</label>
                      <input
                        type="text"
                        value={regClassName}
                        onChange={(e) => setRegClassName(e.target.value)}
                        placeholder="e.g. Class Division Name"
                        className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block mb-1">Academic Strengths</label>
                      <input
                        type="text"
                        value={regStrengths}
                        onChange={(e) => setRegStrengths(e.target.value)}
                        placeholder="e.g. Mathematics, Drawing"
                        className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400 block mb-1">Academic Weaknesses</label>
                      <input
                        type="text"
                        value={regWeaknesses}
                        onChange={(e) => setRegWeaknesses(e.target.value)}
                        placeholder="e.g. Spelling, Essay speed"
                        className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">Desired Avatar / Photo URL</label>
                    <input
                      type="text"
                      value={regPhoto}
                      onChange={(e) => setRegPhoto(e.target.value)}
                      placeholder="Image address URL"
                      className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 text-[11px] font-sans">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#120303] rounded font-bold uppercase tracking-wider cursor-pointer border-none"
                    >
                      Submit Registration Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 rounded font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 3. Parent Logged-In Area
        <div className="space-y-6">
          
          {/* Internal Navigation Bar */}
          <div className="flex items-center space-x-1 border-b border-white/5 pb-3">
            {[
              { id: "kids", label: "My Supervised Children", icon: GraduationCap },
              { id: "enroll", label: "Enroll Another Scholar", icon: UserPlus },
              { id: "history", label: "Fee Payment Receipts", icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#FFD700] text-[#2D0A0A] font-bold shadow"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: My Kids Dashboard */}
          {activeTab === "kids" && (
            <div className="space-y-6">
              {myStudents.length === 0 ? (
                <div className="py-12 bg-black/20 text-center rounded-2xl border border-dashed border-white/5 italic">
                  <GraduationCap className="w-10 h-10 text-slate-400 mx-auto opacity-35 mb-2" />
                  <p className="text-xs text-slate-400 font-sans">No children profiles associated with account email "{loggedInEmail}" yet.</p>
                  <button
                    onClick={() => setActiveTab("enroll")}
                    className="mt-3 px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] font-bold text-[10px] uppercase tracking-wider rounded cursor-pointer border-none"
                  >
                    Lodge New Child Enrollment Request
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myStudents.map((child) => {
                    const isApproved = child.enrollmentStatus === "Approved";
                    return (
                      <div key={child.id} className="bg-[#2D0A0A] border border-white/5 rounded-2xl p-5 hover:border-[#FFD700]/15 transition-all space-y-4">
                        
                        {/* Kid Summary Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={child.photo || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"}
                              alt={child.name}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 rounded-full object-cover border border-[#FFD700]/25"
                            />
                            <div className="text-left">
                              <h4 className="font-serif italic font-bold text-white text-base leading-snug">{child.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono uppercase">
                                {child.section} Division • {child.className}
                              </p>
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold tracking-wider ${
                            isApproved 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-400/10 text-amber-500 border border-amber-400/15"
                          }`}>
                            {isApproved ? "Approved & Enrolled" : "Admission Pending Code Approval"}
                          </span>
                        </div>

                        {/* If student is pending, show an admonition */}
                        {!isApproved && (
                          <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-[10px] font-sans flex items-start space-x-2 text-amber-500">
                            <Info className="w-4 h-4 shrink-0" />
                            <p className="leading-normal">
                              Admission under review by the <strong>{child.section} Section Manager</strong>. You can pay class tuition early, which generates priority keys for enrollment verification.
                            </p>
                          </div>
                        )}

                        {/* Balance Grid & CTA for Gateway */}
                        <div className="grid grid-cols-2 gap-3 font-mono text-[11px] bg-black/25 p-3 rounded-xl border border-white/5">
                          <div className="border-r border-white/5">
                            <span className="text-slate-400 block text-[9px] uppercase">Tuition Dues:</span>
                            <span className="text-rose-400 font-bold block text-sm pt-0.5">UGX {child.feesDue.toLocaleString()}</span>
                          </div>
                          <div className="pl-2">
                            <span className="text-slate-400 block text-[9px] uppercase">Paid Ledger:</span>
                            <span className="text-emerald-400 font-bold block text-sm pt-0.5">UGX {child.feesPaid.toLocaleString()}</span>
                          </div>
                        </div>

                        {isApproved && (
                          <div className="space-y-2 border-t border-white/5 pt-3">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Academic Performance Dispatch</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(child.grades || {}).length === 0 ? (
                                <span className="text-[10px] text-slate-400 italic">No academic subject grade scores published yet this term.</span>
                              ) : (
                                Object.entries(child.grades).map(([subject, score]) => (
                                  <div key={subject} className="bg-black/35 px-2.5 py-1 rounded border border-white/5 font-mono text-[9px] flex items-center gap-1.5">
                                    <span className="text-slate-300 font-light">{subject}:</span>
                                    <span className={score >= 75 ? "text-emerald-400 font-bold" : score >= 50 ? "text-amber-400" : "text-rose-400"}>
                                      {score}%
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-300">
                              <span>Verified Attendance rate:</span>
                              <strong className="text-emerald-400">{child.attendanceRate || 100}%</strong>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] uppercase font-mono">
                          <span className="text-slate-500">ID Reference: {child.id}</span>
                          {child.feesDue > 0 ? (
                            <button
                              onClick={() => startPayment(child.id, child.feesDue)}
                              className="px-4 py-2 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] font-bold uppercase rounded-lg text-[9px] tracking-widest cursor-pointer border-none shadow transition-all hover:scale-102 flex items-center space-x-1"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>Clear Outstanding Fees</span>
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Fully Cleared
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Enroll another scholar */}
          {activeTab === "enroll" && (
            <div className="bg-[#2D0A0A] border border-white/5 rounded-2xl p-6 space-y-4 max-w-xl mx-auto">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif italic font-bold text-white text-base">Enroll Another Child</h3>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Add another pupil to the Poplar School database under your current parent email: <strong className="text-[#FFD700]">{loggedInEmail}</strong>.
              </p>

              <form onSubmit={handleAddChildSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-300 block font-bold mb-1 uppercase">Full Student Name</label>
                    <input
                      type="text"
                      required
                      value={regStudentName}
                      onChange={(e) => setRegStudentName(e.target.value)}
                      placeholder="e.g. Liam Thorne"
                      className="w-full px-3 py-1.5 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-300 block font-bold mb-1 uppercase">Section Level</label>
                    <select
                      value={regSection}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setRegSection(val);
                        if (val === "Nursery") setRegClassName("Tiny Tots");
                        else if (val === "Primary") setRegClassName("Grade 4 Bravo");
                        else setRegClassName("Grade 11 Alpha");
                      }}
                      className="w-full px-2.5 py-1.5 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-slate-100 font-mono text-xs"
                    >
                      <option value="Nursery">Nursery Section Head</option>
                      <option value="Primary">Primary Section Head</option>
                      <option value="Secondary">Secondary Section Head</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">Assigned Class Room</label>
                    <input
                      type="text"
                      value={regClassName}
                      onChange={(e) => setRegClassName(e.target.value)}
                      placeholder="e.g. Division/Stream Class"
                      className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">Learner Strengths</label>
                    <input
                      type="text"
                      value={regStrengths}
                      onChange={(e) => setRegStrengths(e.target.value)}
                      placeholder="e.g. Science, Athletics"
                      className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-400 block mb-1">Learner Weaknesses</label>
                    <input
                      type="text"
                      value={regWeaknesses}
                      onChange={(e) => setRegWeaknesses(e.target.value)}
                      placeholder="e.g. Critical reading"
                      className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Avatar / Image URL</label>
                  <input
                    type="text"
                    value={regPhoto}
                    onChange={(e) => setRegPhoto(e.target.value)}
                    className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-slate-100 font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FFD700] hover:bg-[#FFE14D] text-[#2D0A0A] rounded font-bold uppercase text-xs tracking-wider cursor-pointer border-none transition-all"
                >
                  Lodge Verified Enrollment Admission Request
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: History of Transactions Receipts */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-serif italic font-medium text-white text-base">Fee Clearance Receipts Journal</h3>
                <span className="text-[10px] font-mono text-slate-400">{myTransactions.length} Cleared Deposits</span>
              </div>

              {myTransactions.length === 0 ? (
                <div className="py-12 bg-black/20 text-center rounded-2xl text-slate-400 italic">
                  No payment events registered on this account profile ledger yet.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {myTransactions.map(txn => {
                    const childObj = students.find(s => s.id === txn.studentId);
                    return (
                      <div key={txn.id} className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-left">
                          <p className="text-[#FFD700] font-bold text-sm">Receipt ID: {txn.receiptNo}</p>
                          <p className="text-slate-400">Pupil: <strong className="text-white">{childObj?.name || "Student"}</strong> ({txn.studentId})</p>
                          <p className="text-[10px] text-slate-500">Authorized Date Stamp: {txn.date} • Mode: {txn.paymentMethod}</p>
                        </div>
                        <div className="text-right sm:border-l sm:border-white/5 sm:pl-6 shrink-0">
                          <span className="text-[10px] text-slate-400 block uppercase">Cleared Amount:</span>
                          <span className="text-emerald-400 text-lg font-bold">UGX {txn.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 4. Pay Tuition Outstanding Virtual Gateway Modal dialog */}
      {payingStudentId && (() => {
        const matchingChild = students.find(s => s.id === payingStudentId);
        if (!matchingChild) return null;
        
        return (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#120303] text-slate-100 rounded-3xl p-6 lg:p-8 w-full max-w-lg border border-[#FFD700]/30 shadow-2xl relative font-sans text-left max-h-[92vh] overflow-y-auto">
              
              {/* Dismiss Button */}
              <button
                onClick={() => setPayingStudentId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-transparent border-none text-xl cursor-pointer font-bold"
              >
                ×
              </button>

              {/* Title Header */}
              <div className="border-b border-white/10 pb-3 mb-5 text-left">
                <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 rounded px-2.5 py-0.5 text-[9px] font-mono tracking-wider font-bold uppercase">
                  <Lock className="w-3 h-3" /> Secure Bank Link Node
                </span>
                <h3 className="font-serif italic text-white text-xl font-bold mt-1">Poplar Tuition Clearing Gateway</h3>
                <p className="text-xs text-slate-400 mt-1">Clearing school tuition dues for <strong className="text-slate-200">{matchingChild.name}</strong></p>
              </div>

              {/* Steps inside Payment Process */}
              {paymentSuccess ? (
                <div className="py-8 text-center space-y-3 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h4 className="font-serif italic text-xl font-bold text-white">Deposit Clearance Successful!</h4>
                  <p className="text-xs text-slate-300">Outstanding ledger balance cleared. School administrative receipt issued instantly in Journal log.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Payment Mode Tab */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase font-mono bg-black/45 p-1 rounded-xl">
                    <button
                      onClick={() => setPaymentMethod("mobile_money")}
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all border-none font-bold text-[10px] cursor-pointer ${
                        paymentMethod === "mobile_money"
                          ? "bg-[#FFD700] text-[#2D0A0A] font-bold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile Money</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("smart_card")}
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition-all border-none font-bold text-[10px] cursor-pointer ${
                        paymentMethod === "smart_card"
                          ? "bg-[#FFD700] text-[#2D0A0A] font-bold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Smart Card</span>
                    </button>
                  </div>

                  {/* Input amount of payment */}
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
                      <span>Total Owed Balance:</span>
                      <span>UGX {matchingChild.feesDue.toLocaleString()}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase font-semibold">Payment Deposit Amount (UGX):</label>
                      <input
                        type="number"
                        min={1}
                        max={matchingChild.feesDue}
                        value={paymentAmount || ""}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-black border border-white/10 rounded focus:ring-1 focus:ring-[#FFD700] text-sm text-slate-100 font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Render payment-specific payload form */}
                  {paymentMethod === "mobile_money" ? (
                    <div className="space-y-3 p-4 bg-black/45 rounded-2xl border border-white/5 text-xs animate-fadeIn text-left">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Mobile Money Provider details</span>
                      
                      <div className="grid grid-cols-3 gap-1.5">
                        {["M-Pesa", "MTN Momo", "Airtel Money"].map(op => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setMobileOperator(op)}
                            className={`p-2 rounded font-mono text-[10px] text-center border cursor-pointer ${
                              mobileOperator === op
                                ? "bg-[#FFD700]/10 border-[#FFD700] text-white font-bold"
                                : "bg-black/30 border-white/5 text-slate-400 hover:border-white/10"
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-300 uppercase block">Registered Phone Number</label>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="e.g. +256 700 000 000"
                          className="w-full px-3 py-2 bg-black border border-[#FFD700]/20 rounded text-slate-100 font-mono text-xs focus:border-[#FFD700] outline-none"
                        />
                      </div>

                      {otpSent && (
                        <div className="space-y-1.5 pt-2 border-t border-white/5 animate-fadeIn">
                          <label className="text-[9px] font-mono text-emerald-400 uppercase font-semibold block">Enter SMS/USSD OTP code pin to clear</label>
                          <input
                            type="password"
                            maxLength={6}
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value)}
                            placeholder="Type 4-digit code (e.g. 1234)"
                            className="w-full px-3 py-2 bg-black border border-emerald-500/20 text-emerald-400 rounded font-mono text-center tracking-widest outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    // Smart Card layout option (NFC School Smart badge format representation)
                    <div className="space-y-4 animate-fadeIn">
                      
                      {/* Virtual high-end graphic representation of Smart Card */}
                      <div className="relative h-44 bg-gradient-to-br from-[#4A0A0A] to-[#240808] border border-[#FFD700]/30 rounded-2xl p-5 overflow-hidden flex flex-col justify-between shadow-xl">
                        {/* Decorative smart card chip and NFC beacon */}
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-8 bg-gradient-to-tr from-amber-400/90 to-yellow-600/90 rounded-md border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] opacity-40 border-b border-black"></div>
                          </div>
                          <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white tracking-widest font-bold uppercase">
                            Poplar SmartCard v3.1
                          </span>
                        </div>

                        <div className="space-y-2 mt-4">
                          <p className="font-mono text-base tracking-widest text-shadow text-white">
                            {cardNumber || "••••  ••••  ••••  ••••"}
                          </p>
                          <div className="flex justify-between font-mono text-[9px] text-slate-300">
                            <div>
                              <span className="text-[7px] text-slate-400 block uppercase">Card Holder:</span>
                              <span className="font-semibold uppercase tracking-wider">{cardHolder || "PARENT VERIFIED GUARDIAN"}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[7px] text-slate-400 block uppercase">Expiry:</span>
                              <span>{cardExpiry || "MM / YY"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metallic golden background reflection logo strip */}
                        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-radial-gradient from-yellow-300/10 to-transparent -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-1">Holder Name on Card</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="e.g. Samuel Veman"
                            className="w-full px-3 py-1.5 bg-black border border-white/10 rounded font-mono text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-1">Poplar NFC Smart Code</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              // Auto spacing helper
                              const val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                              const matches = val.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || "";
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              if (parts.length > 0) {
                                setCardNumber(parts.join(" "));
                              } else {
                                setCardNumber(e.target.value);
                              }
                            }}
                            maxLength={19}
                            placeholder="Card Number 16-digits"
                            className="w-full px-3 py-1.5 bg-black border border-[#FFD700]/25 rounded text-[#FFD700] font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-1">Expiry Stamp</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="05/29"
                            maxLength={5}
                            className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-center font-mono text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-1">Secure CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            maxLength={3}
                            className="w-full px-3 py-1.5 bg-black border border-white/10 rounded text-center font-mono text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-400 block mb-1">Hardware PIN</label>
                          <input
                            type="password"
                            value={cardPin}
                            onChange={(e) => setCardPin(e.target.value)}
                            placeholder="••••"
                            maxLength={4}
                            className="w-full px-3 py-1.5 bg-black border border-[#FFD700]/20 rounded text-center text-[#FFD700] font-bold font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loader progress indicator when checking with backend */}
                  {isProcessingPayment && (
                    <div className="p-3 bg-black/60 rounded-xl border border-[#FFD700]/25 flex items-center space-x-3 text-[11px] font-mono text-[#FFD700] animate-pulse">
                      <div className="w-4 h-4 border-2 border-t-transparent border-[#FFD700] rounded-full animate-spin shrink-0"></div>
                      <p>{paymentProgressMsg}</p>
                    </div>
                  )}

                  {/* Actions Bar Footer */}
                  <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setPayingStudentId(null)}
                      disabled={isProcessingPayment}
                      className="px-4 py-2 bg-black/45 border border-white/10 hover:bg-black/60 text-slate-300 rounded-lg cursor-pointer font-bold uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executePaymentGateway}
                      disabled={isProcessingPayment}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-lg text-[10px] tracking-widest cursor-pointer border-none transition-all disabled:opacity-50"
                    >
                      {otpSent && paymentMethod === "mobile_money" ? "Aprove Push Code" : "Submit Clear Balance"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

    </div>
  );
}
