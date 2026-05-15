import React, { useState } from "react";
import { Student, Staff, Announcement } from "../types";
import { BookOpen, Phone, MapPin, Mail, Award, Users, ChevronRight, Send, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  config: {
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
  announcements: Announcement[];
  students: Student[];
  staffList: Staff[];
  onOpenPortal: () => void;
}

export default function LandingPage({
  config,
  announcements,
  students,
  staffList,
  onOpenPortal
}: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"home" | "about" | "sections" | "pta" | "contact">("home");
  const [contactForm, setContactForm] = useState({ name: "", email: "", role: "Parent", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: "", email: "", role: "Parent", message: "" });
    }, 4500);
  };

  // Summarize count for quick statistics
  const nurseryStudents = students.filter(s => s.section === "Nursery" && s.enrollmentStatus === "Approved").length;
  const primaryStudents = students.filter(s => s.section === "Primary" && s.enrollmentStatus === "Approved").length;
  const secondaryStudents = students.filter(s => s.section === "Secondary" && s.enrollmentStatus === "Approved").length;
  const totalTeachers = staffList.filter(s => s.role === "Teacher").length;

  return (
    <div id="landing-container" className="w-full min-h-screen bg-[#2D0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#FFD700] selection:text-[#2D0A0A]">
      {/* Brand Elegant Topbar */}
      <header id="landing-header" className="sticky top-0 z-50 bg-[#240808]/95 backdrop-blur border-b border-[#ffd700]/15 px-4 lg:px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-[#2D0A0A] font-bold text-xl shadow-md font-serif italic">
            P
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-serif tracking-tight font-bold italic text-[#FFD700]">
              Poplar School
            </h1>
            <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
              Nursery • Primary • Secondary
            </p>
          </div>
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center space-x-1">
          {[
            { id: "home", label: "Home" },
            { id: "sections", label: "Schools Summary" },
            { id: "pta", label: "PTA Council" },
            { id: "about", label: "About" },
            { id: "contact", label: "Contact Us" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-[#FFD700] text-[#2D0A0A] font-bold shadow-md"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div>
          <button
            onClick={onOpenPortal}
            className="relative px-5 py-2 overflow-hidden rounded-full bg-[#1E90FF] text-white hover:bg-[#1E90FF]/90 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#1E90FF]/25 hover:shadow-[#1E90FF]/40 active:scale-95 group"
          >
            <span className="relative z-10 flex items-center gap-1">
              Secure Login <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div className="flex md:hidden bg-[#1f0606] border-b border-[#ffd700]/10 px-2 py-2 overflow-x-auto gap-1">
        {[
          { id: "home", label: "Home" },
          { id: "sections", label: "Sections" },
          { id: "pta", label: "PTA" },
          { id: "about", label: "About" },
          { id: "contact", label: "Contact" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all shrink-0 ${
              activeTab === tab.id ? "bg-[#FFD700] text-[#2D0A0A]" : "text-slate-300 bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {activeTab === "home" && (
          <div className="space-y-12">
            {/* Banner Hero */}
            <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#4A1010] via-[#2D0A0A] to-[#120303] border border-[#ffd700]/15 p-8 lg:p-14 shadow-2xl">
              <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 scroll-smooth select-none">
                <h1 className="text-[12rem] font-serif font-black italic select-none">POPLAR</h1>
              </div>
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-mono">
                  <span>★</span><span>Poplar Elite Digital Portal</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-serif text-white tracking-tight leading-tight font-medium">
                  {config.heroTitle}
                </h2>
                <p className="text-base lg:text-lg text-slate-300 leading-relaxed font-light">
                  {config.heroSubtitle}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={onOpenPortal}
                    className="px-8 py-3 bg-[#FFD700] text-[#2D0A0A] font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-[#FFD700]/15 hover:bg-[#ffe14d] transition-all cursor-pointer"
                  >
                    Enter Secure Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab("sections")}
                    className="px-8 py-3 bg-white/5 border border-white/15 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Explore Sections
                  </button>
                </div>
              </div>

              {/* Summary Dashboard Grid inside Hero */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 bg-[#2D0A0A]/60 backdrop-blur rounded-2xl p-5 border border-white/5">
                <div className="text-center p-3 border-r border-white/10 last:border-0 md:block">
                  <span className="text-[#FFD700] font-serif text-3xl font-extrabold">{nurseryStudents}</span>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">Nursery Learners</p>
                </div>
                <div className="text-center p-3 border-r border-white/10 last:border-0">
                  <span className="text-[#1E90FF] font-serif text-3xl font-extrabold">{primaryStudents}</span>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">Primary Pupils</p>
                </div>
                <div className="text-center p-3 border-r border-white/10 last:border-0">
                  <span className="text-emerald-400 font-serif text-3xl font-extrabold">{secondaryStudents}</span>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">Secondary Scholars</p>
                </div>
                <div className="text-center p-3 last:border-0">
                  <span className="text-pink-400 font-serif text-3xl font-extrabold">{totalTeachers}</span>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">Expert Faculty</p>
                </div>
              </div>
            </section>

            {/* Director's Welcome Row */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#3E0F0F]/60 rounded-3xl p-8 border border-white/5 shadow-xl">
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
                  alt="Director Portrait"
                  className="w-48 h-48 rounded-full border-4 border-[#FFD700] object-cover shadow-xl grayscale hover:grayscale-0 transition-all duration-500"
                />
                <h4 className="font-serif italic text-lg text-[#FFD700] mt-4 font-bold">{config.directorName}</h4>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{config.directorRole}</p>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="w-12 h-1 bg-[#FFD700] rounded"></div>
                <h3 className="text-2xl font-serif text-white italic">"Cultivating Minds, Inspiring Futures"</h3>
                <p className="text-slate-300 leading-relaxed font-serif italic text-base lg:text-lg">
                  "{config.directorIntroWords}"
                </p>
                <p className="text-xs text-[#FFD700] font-mono tracking-widest uppercase">
                  — POPLAR EXECUTIVE OFFICE OF DIRECTORS OR ADVISORS
                </p>
              </div>
            </section>

            {/* Active Announcements & Notice Board */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl font-serif text-[#FFD700] italic font-bold">Poplar Notice Board</h3>
                <span className="text-[10px] font-mono uppercase text-slate-400 bg-white/5 px-2.5 py-1 rounded">
                  Live Dispatch
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-[#240808] border border-white/5 rounded-2xl p-5 hover:border-[#ffd700]/25 transition-all shadow-md relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#FFD700] block mb-2">
                      To: {ann.section} • {ann.date}
                    </span>
                    <h4 className="font-serif text-lg text-white font-bold mb-3 group-hover:text-[#FFD700] transition-colors leading-snug">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">{ann.content}</p>
                    <span className="text-[10px] font-mono text-slate-400 block mt-4 text-right">
                      By: {ann.author}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Schools Summary Section - 3 Divisions */}
        {activeTab === "sections" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl lg:text-4xl font-serif italic text-[#FFD700] font-bold">Poplar Core Sections</h2>
              <p className="text-slate-300 text-sm">
                Each section is supervised by an expert Section Manager responsible for custom course layouts, teacher registers, parents approvals, and comprehensive performance metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Nursery */}
              <div className="bg-[#3A0D0D] rounded-3xl border border-[#FFD700]/20 overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#FFD700]/10 text-[#FFD700] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      Early Years
                    </span>
                    <span className="text-slate-400 text-xs">Ages 2-5</span>
                  </div>
                  <h3 className="text-2xl font-serif italic text-white font-bold">Nursery Section</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nursery sets the spatial, physical, and phonics foundation inside a luxurious playfield using safe sensory coordination boards. Focus includes creative coloring and social empathy.
                  </p>
                  <div className="p-3 bg-[#2D0A0A]/80 rounded-xl space-y-2 text-xs">
                    <p className="text-slate-300">
                      <strong className="text-[#FFD700]">Section Manager:</strong> Ms. Elena Vance
                    </p>
                    <p className="text-slate-300">
                      <strong className="text-[#FFD700]">Key Subjects:</strong> Phonics, Coloring, Sensory Play
                    </p>
                  </div>
                </div>
                <div className="bg-[#240808] p-4 text-center border-t border-white/5">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#FFD700]">
                    Active Approved Enrollment: {nurseryStudents}
                  </p>
                </div>
              </div>

              {/* Primary */}
              <div className="bg-[#3A0D0D] rounded-3xl border border-[#1E90FF]/20 overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#1E90FF]/15 text-[#1E90FF] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      Intermediate
                    </span>
                    <span className="text-slate-400 text-xs">Ages 6-11</span>
                  </div>
                  <h3 className="text-2xl font-serif italic text-white font-bold">Primary Section</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Primary school implements visual puzzles, general biology concepts, writing frameworks, and robust multiplication tables. Learners tackle homework drills and physical integration tasks.
                  </p>
                  <div className="p-3 bg-[#2D0A0A]/80 rounded-xl space-y-2 text-xs">
                    <p className="text-slate-300">
                      <strong className="text-[#1E90FF]">Section Manager:</strong> Mr. Julian Thorne
                    </p>
                    <p className="text-slate-300">
                      <strong className="text-[#1E90FF]">Key Subjects:</strong> Mathematics, Science, Literature, PE
                    </p>
                  </div>
                </div>
                <div className="bg-[#240808] p-4 text-center border-t border-white/5">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#1E90FF]">
                    Active Approved Enrollment: {primaryStudents}
                  </p>
                </div>
              </div>

              {/* Secondary */}
              <div className="bg-[#3A0D0D] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="bg-white/10 text-slate-100 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      High School
                    </span>
                    <span className="text-slate-400 text-xs">Ages 12-18</span>
                  </div>
                  <h3 className="text-2xl font-serif italic text-white font-bold">Secondary Section</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our Senior academic track empowers logical reasoning, programming (algorithms, dictionaries, nested sets), physics mechanics, chemistry balances, and historical analyses.
                  </p>
                  <div className="p-3 bg-[#2D0A0A]/80 rounded-xl space-y-2 text-xs">
                    <p className="text-slate-300">
                      <strong className="text-slate-200">Section Manager:</strong> Dr. Sarah Bloom
                    </p>
                    <p className="text-slate-300">
                      <strong className="text-slate-200">Key Subjects:</strong> Advanced Math, Chemistry, Computer Science
                    </p>
                  </div>
                </div>
                <div className="bg-[#240808] p-4 text-center border-t border-white/5">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-slate-300">
                    Active Approved Enrollment: {secondaryStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PTA Council Tab */}
        {activeTab === "pta" && (
          <div className="space-y-6 max-w-4xl mx-auto bg-[#3A0D0D]/40 rounded-3xl p-8 border border-white/5 shadow-2xl animate-fadeIn">
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 text-[#FFD700] mx-auto opacity-80" />
              <h2 className="text-3xl font-serif italic text-white font-bold">{config.ptaTitle}</h2>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Parent-Teacher Alliance Protocol</p>
            </div>
            <div className="w-16 h-1 bg-[#FFD700] mx-auto rounded"></div>
            <p className="text-slate-200 leading-relaxed font-serif text-center italic text-lg px-4">
              "{config.ptaMessage}"
            </p>
            <div className="border-t border-white/10 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#2D0A0A]/80 rounded-2xl p-5 border border-[#ffd700]/10">
                <h4 className="font-serif text-[#FFD700] font-bold text-lg mb-2">Council Executives (Current Term)</h4>
                <ul className="space-y-3 text-xs text-slate-300 mt-3 font-mono">
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Elena Vance (Nursery Rep)</span>
                    <span className="text-[#FFD700]">Vice Chair</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Julian Thorne (Primary Rep)</span>
                    <span className="text-[#FFD700]">Trustee</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Dr. Sarah Bloom (Secondary Rep)</span>
                    <span className="text-[#FFD700]">Academic Advisor</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Agatha Sterling (Super Admin)</span>
                    <span className="text-[#FFD700]">Honorary President</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#2D0A0A]/80 rounded-2xl p-5 border border-[#ffd700]/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-[#FFD700] font-bold text-lg mb-2">Playfield Safety & Sensory Fund</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">
                    To support the playground upgrade program, the PTA Council launched the Sensory Renovation Drive. Contribution rate reached <strong className="text-emerald-400">92% audit completion</strong> this quarter.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-xl text-center">
                  <span className="text-xs text-[#1E90FF] font-semibold font-mono">PTA Contact: pta-liaison@poplar.edu</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About App Section */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-serif italic text-[#FFD700] font-bold">Poplar Academy of Excellence</h2>
              <p className="text-slate-300 leading-relaxed text-sm">
                {config.aboutContent}
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white text-sm">Interactive Study Planners</h5>
                    <p className="text-xs text-slate-400">Teachers build robust schemes of work spanning four months for complete visibility.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1E90FF] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white text-sm">Attendance & Roster Tracking</h5>
                    <p className="text-xs text-slate-400">Class teachers record instant daily tallies, available to managers for audit logs.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white text-sm">AI Personalized Path & Metrics</h5>
                    <p className="text-xs text-slate-400">Gemini models generate tailored, self-paced progress maps addressing individual weaknesses.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#FFD700] to-[#1E90FF] rounded-3xl blur-md opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80"
                alt="Poplar Academic Hall"
                className="relative rounded-3xl border border-white/10 w-full object-cover aspect-video lg:aspect-square shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Contact Us Section */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn">
            {/* Contact Details */}
            <div className="bg-[#3A0D0D]/60 rounded-3xl p-8 border border-white/5 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-white font-bold">Inquiries & Admissions</h3>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Poplar School Administration</p>
              </div>
              <ul className="space-y-4 text-xs">
                <li className="flex items-center space-x-3 p-3 bg-[#2D0A0A]/60 rounded-xl border border-white/5">
                  <MapPin className="w-5 h-5 text-[#FFD700]" />
                  <div>
                    <p className="font-bold text-slate-300">HQ Office Location</p>
                    <p className="text-slate-400">{config.contactAddress}</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3 p-3 bg-[#2D0A0A]/60 rounded-xl border border-white/5">
                  <Phone className="w-5 h-5 text-[#FFD700]" />
                  <div>
                    <p className="font-bold text-slate-300">Reception Line</p>
                    <p className="text-slate-400">{config.contactPhone}</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3 p-3 bg-[#2D0A0A]/60 rounded-xl border border-white/5">
                  <Mail className="w-5 h-5 text-[#FFD700]" />
                  <div>
                    <p className="font-bold text-slate-300">Digital Support</p>
                    <p className="text-slate-400">{config.contactEmail}</p>
                  </div>
                </li>
              </ul>
              <div className="p-4 bg-[#FFD700]/5 rounded-2xl border border-[#FFD700]/10 text-xs">
                <p className="text-slate-300 leading-relaxed font-serif italic">
                  "Visitors are welcome to witness our spatial, visual laboratories and phonics auditoriums. Live tours can be scheduled with Dr. Agatha Sterling."
                </p>
              </div>
            </div>

            {/* Inquire Form */}
            <form onSubmit={handleContactSubmit} className="bg-white text-[#2D0A0A] p-8 rounded-3xl shadow-2xl space-y-4">
              <h3 className="text-2xl font-serif text-[#2D0A0A] font-bold">Write Poplar Council</h3>
              <p className="text-xs text-slate-600">Please lodge custom admission inquiries or general feedback.</p>

              {contactSuccess ? (
                <div className="p-5 bg-emerald-50 text-emerald-800 rounded-xl text-xs space-y-2 flex items-start gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Message Sent!</h5>
                    <p className="text-slate-600">Thank you for submitting your dynamic feedback. Our section coordinator will respond shortly.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700 tracking-wider font-mono">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#2D0A0A] text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700 tracking-wider font-mono">Your Personal Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#2D0A0A] text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700 tracking-wider font-mono">Affiliation</label>
                    <select
                      value={contactForm.role}
                      onChange={e => setContactForm({ ...contactForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#2D0A0A] text-xs font-medium focus:outline-none bg-white"
                    >
                      <option>Parent</option>
                      <option>Prospective Parent</option>
                      <option>Community Partner</option>
                      <option>Applicant</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-700 tracking-wider font-mono">Inquiry Narrative</label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Tell us about your learner or question..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#2D0A0A] text-xs font-medium focus:outline-none focus:placeholder-slate-400"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#2D0A0A] hover:bg-[#4E1010] text-white rounded-lg font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Inquiry
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="bg-[#1C0505] border-t border-[#ffd700]/15 mt-16 px-4 lg:px-8 py-8 text-center text-slate-400 text-xs">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="font-serif italic text-sm text-[#FFD700]">POPLAR CONNECT • MOBILE PORTAL</p>
          <p className="text-[10px]">
             Secure internal systems. All digital operations (attendance tracking, grades ledger, Schemes of Work planning) managed relative to local storage. 2026 Sandbox.
          </p>
          <div className="flex justify-center space-x-4 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <button onClick={() => setActiveTab("home")} className="hover:text-[#FFD700]">Home</button>
            <span>•</span>
            <button onClick={() => setActiveTab("pta")} className="hover:text-[#FFD700]">PTA</button>
            <span>•</span>
            <button onClick={() => setActiveTab("contact")} className="hover:text-[#FFD700]">Admissions</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
