import React, { useState, useMemo } from "react";
import { Student, FeeTransaction, Staff } from "../types";
import { 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  TrendingUp, 
  HelpCircle, 
  Plus, 
  Users, 
  BookOpen, 
  Smartphone, 
  CreditCard, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowUpRight, 
  Bell, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Download
} from "lucide-react";

interface AccountantPortalProps {
  students: Student[];
  transactions: FeeTransaction[];
  onAdjustFees: (studentId: string, amount: number, isWaiver: boolean) => void;
  onRecordPayment: (studentId: string, amount: number, method: string) => void;
  onUpdateTransactionStatus: (transactionId: string, status: "Pending" | "Approved") => void;
}

export default function AccountantPortal({
  students = [],
  transactions = [],
  onAdjustFees,
  onRecordPayment,
  onUpdateTransactionStatus
}: AccountantPortalProps) {
  // Portal authentication & view states
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledgers" | "transactions" | "billing">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("All");
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  
  // Modals / Inputs
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  // Form states
  const [recordAmount, setRecordAmount] = useState<number>(150000);
  const [recordMethod, setRecordMethod] = useState<string>("MTN Mobile Money");
  const [adjustAmount, setAdjustAmount] = useState<number>(100000);
  const [isWaiver, setIsWaiver] = useState<boolean>(true);
  const [adjustReason, setAdjustReason] = useState<string>("Academic Scholarship Discount");

  // Filter logs / notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; date: string; type: "info" | "success" | "warning" }>>([
    { id: "1", text: "MTN Uganda mobile gateway audit successfully linked. Status: Operational.", date: "Just now", type: "success" },
    { id: "2", text: "End-of-term audit report draft generated automatically. Ready for Chief Admin oversight.", date: "1 hour ago", type: "info" },
    { id: "3", text: "Parent gate alerted: 12 families in Grades 4 & 11 carry payments overdue by 3 weeks.", date: "5 hours ago", type: "warning" }
  ]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper matching state
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalProjected = 0;
    let totalCleared = 0;
    let totalDueOutstanding = 0;
    
    students.forEach(s => {
      // Due + Paid is total expected
      totalProjected += (s.feesDue + s.feesPaid);
      totalCleared += s.feesPaid;
      totalDueOutstanding += s.feesDue;
    });

    const paymentMethodsBreakdown: { [key: string]: number } = {
      "Mobile Money": 0,
      "Smart Card": 0,
      "Bank Transfer": 0,
      "Manual Ledger": 0
    };

    transactions.forEach(t => {
      if (t.status === "Approved") {
        const method = t.paymentMethod.toLowerCase();
        if (method.includes("mobile") || method.includes("money") || method.includes("m-pesa") || method.includes("mtn") || method.includes("airtel")) {
          paymentMethodsBreakdown["Mobile Money"] += t.amount;
        } else if (method.includes("card") || method.includes("badge") || method.includes("nfc")) {
          paymentMethodsBreakdown["Smart Card"] += t.amount;
        } else if (method.includes("bank") || method.includes("transfer")) {
          paymentMethodsBreakdown["Bank Transfer"] += t.amount;
        } else {
          paymentMethodsBreakdown["Manual Ledger"] += t.amount;
        }
      }
    });

    return {
      totalProjected,
      totalCleared,
      totalDueOutstanding,
      collectionRatio: totalProjected > 0 ? (totalCleared / totalProjected) * 100 : 0,
      paymentMethodsBreakdown
    };
  }, [students, transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const student = studentMap.get(t.studentId);
      const studentName = student ? student.name.toLowerCase() : "unknown student";
      const receipt = t.receiptNo.toLowerCase();
      const method = t.paymentMethod.toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = studentName.includes(search) || receipt.includes(search) || method.includes(search);
      
      const isMethodMatch = selectedMethodFilter === "All" || 
        (selectedMethodFilter === "Mobile" && (method.includes("mobile") || method.includes("money") || method.includes("pesa") || method.includes("mtn") || method.includes("airtel"))) ||
        (selectedMethodFilter === "Card" && (method.includes("card") || method.includes("nfc") || method.includes("badge"))) ||
        (selectedMethodFilter === "Manual" && method.includes("manual"));

      const isStatusMatch = selectedStatusFilter === "All" || t.status === selectedStatusFilter;
      const isSectionMatch = selectedSectionFilter === "All" || (student && student.section === selectedSectionFilter);

      return matchesSearch && isMethodMatch && isStatusMatch && isSectionMatch;
    });
  }, [transactions, searchTerm, selectedMethodFilter, selectedStatusFilter, selectedSectionFilter, studentMap]);

  // Filter Students for Ledgers
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const nameMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const sectionMatch = selectedSectionFilter === "All" || s.section === selectedSectionFilter;
      return nameMatch && sectionMatch;
    });
  }, [students, searchTerm, selectedSectionFilter]);

  // Actions
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || recordAmount <= 0) {
      showToast("Please select a student and set an amount.");
      return;
    }
    onRecordPayment(selectedStudentId, recordAmount, recordMethod);
    const stud = studentMap.get(selectedStudentId);
    showToast(`Recorded payment of UGX ${recordAmount.toLocaleString()} for ${stud?.name || "Student"} via ${recordMethod}`);
    setIsRecordModalOpen(false);
    setSelectedStudentId("");
  };

  const handleAdjustFeesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || adjustAmount <= 0) {
      showToast("Please select a student and write structural details.");
      return;
    }
    onAdjustFees(selectedStudentId, adjustAmount, isWaiver);
    const stud = studentMap.get(selectedStudentId);
    showToast(`${isWaiver ? "Scholarship discount" : "Manual ledger invoice"} of UGX ${adjustAmount.toLocaleString()} successfully applied to ${stud?.name}`);
    setIsAdjustModalOpen(false);
    setSelectedStudentId("");
  };

  const handleManualReconcile = (txnId: string) => {
    onUpdateTransactionStatus(txnId, "Approved");
    showToast("Transaction checked, verified, and reconciled!");
    setNotifications(prev => [
      { id: Date.now().toString(), text: `Transaction #${txnId.slice(-4)} verified manually. Outstanding dues adjusted.`, date: "Just now", type: "success" },
      ...prev
    ]);
  };

  const handleIssueWarning = (student: Student) => {
    showToast(`Smart Notification email sent to ${student.parentName} (${student.parentEmail}) regarding UGX ${student.feesDue.toLocaleString()} overdue.`);
    setNotifications(prev => [
      { id: Date.now().toString(), text: `Overdue Warning issued successfully to ${student.parentName}.`, date: "Just now", type: "warning" },
      ...prev
    ]);
  };

  const downloadExcelMock = () => {
    showToast("Generating secure audit statement... CSV download started!");
    const link = document.createElement("a");
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Receipt No,Student,Section,AmountPaid,PaymentMethod,TransactionDate,Status",
         ...transactions.map(t => {
           const s = studentMap.get(t.studentId);
           return `"${t.receiptNo}","${s ? s.name : 'Unknown'}","${s ? s.section : ''}",${t.amount},"${t.paymentMethod}","${t.date}","${t.status}"`;
         })
        ].join("\n");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Poplar_School_Audit_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="accountant-portal-root" className="bg-[#1C0505] text-[#F3EFEF] rounded-3xl p-4 lg:p-6 border border-[#FFD700]/15 space-y-6">
      {/* Toast Alert Header */}
      {toastMessage && (
        <div id="accountant-toast" className="fixed top-24 right-6 bg-amber-500 text-black font-mono text-xs px-4 py-3 rounded-lg shadow-2xl border border-white/20 z-50 flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-950" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Ledger Ribbon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#FFD700]/10 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest bg-amber-500/10 text-[#FFD700] px-3 py-1 rounded-full border border-amber-500/15 font-bold">
              Treasury & Accounts
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: POPLAR-ACCT-09</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif italic text-white font-bold pt-1.5 flex items-center gap-2">
            Accountant Ledger Monitor
          </h2>
          <p className="text-xs text-[#E5C100] font-light italic mt-1 font-serif">
            Poplar Co-operative Academy and Nursery Consolidated Finance Control
          </p>
        </div>

        {/* Action Center Shortcut */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setSelectedStudentId(students[0]?.id || "");
              setIsRecordModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold text-xs uppercase tracking-wider rounded-lg border-none hover:brightness-110 cursor-pointer transition-all shadow-md font-mono"
          >
            <Plus className="w-3.5 h-3.5" /> Book Payment
          </button>
          <button
            onClick={downloadExcelMock}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#3D0F0F] text-[#FFD700] hover:bg-[#4E1414] font-semibold text-xs uppercase tracking-wider rounded-lg border border-[#FFD700]/25 cursor-pointer transition-all font-mono"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Fast Tabs Selector */}
      <div className="flex border-b border-white/5 pb-0.5 overflow-x-auto gap-1">
        {[
          { id: "dashboard", label: "Financial Metrics", badge: null },
          { id: "ledgers", label: "Student Ledgers", badge: `${students.filter(s => s.feesDue > 0).length} Overdue` },
          { id: "transactions", label: "Reconciliation Gateway", badge: `${transactions.filter(t => t.status === "Pending").length} Alert` },
          { id: "billing", label: "Fee Configuration", badge: "Live" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchTerm("");
            }}
            className={`py-3 px-4 text-xs font-semibold tracking-wider uppercase font-mono relative border-none bg-transparent cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? "text-[#FFD700] font-bold" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 ml-0.5 rounded font-bold ${
                  tab.badge.includes("Overdue") || tab.badge.includes("Alert")
                    ? "bg-amber-500/20 text-[#FFD700] border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {tab.badge}
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Tab Render Space */}
      {activeTab === "dashboard" && (
        <div id="accountant-tab-dashboard" className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#2D0A0A] p-4 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Expected Revenue</span>
                <p className="text-2xl font-mono text-white font-bold pt-1">UGX {stats.totalProjected.toLocaleString()}</p>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Base tuition projection for 2026 semester</span>
              </div>
              <DollarSign className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 pointer-events-none" />
            </div>

            <div className="bg-[#2D0A0A] p-4 rounded-2xl border border-[#FFD700]/15 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#FFD700] font-bold">Cleared Revenue Receipts</span>
                <p className="text-2xl font-mono text-[#FFD700] font-bold pt-1">UGX {stats.totalCleared.toLocaleString()}</p>
              </div>
              <div className="pt-2 text-[10px] text-amber-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#FFD700]" />
                <span>Deposited inside merchant bank systems</span>
              </div>
              <Coins className="absolute -bottom-2 -right-2 w-16 h-16 text-[#FFD700]/5 pointer-events-none" />
            </div>

            <div className="bg-[#2D0A0A] p-4 rounded-2xl border border-amber-500/15 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">Outstanding Receivables</span>
                <p className="text-2xl font-mono text-teal-300 font-bold pt-1">UGX {stats.totalDueOutstanding.toLocaleString()}</p>
              </div>
              <div className="pt-2 text-[10px] text-yellow-400 font-mono flex items-center gap-1">
                <AlertCircle className="w-3" />
                <span>Outstanding parental tuition dues</span>
              </div>
              <span className="absolute -bottom-1 -right-3 text-7xl font-sans text-teal-400/5 font-extrabold select-none">!</span>
            </div>

            <div className="bg-[#2D0A0A] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Vault Collection Progress</span>
                <div className="flex items-baseline gap-2 pt-1">
                  <p className="text-2xl font-mono text-emerald-400 font-bold">{stats.collectionRatio.toFixed(1)}%</p>
                  <span className="text-[10px] font-mono text-slate-400">of goal met</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="w-full bg-[#3D0F0F] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(stats.collectionRatio, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Payment Method Distribution Graph (Custom responsive beautiful SVG columns) */}
            <div className="bg-[#2D0A0A] p-5 rounded-3xl border border-white/5 lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif italic text-lg text-white font-bold">Clearing Methods Analytics</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Gross cleared volumes sorted by specific parent gateway integrations</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFD700]/10 text-[#FFD700] rounded">Real-Time Sync</span>
              </div>

              {/* Custom SVG Bar Graph */}
              <div className="h-64 flex flex-col justify-end pt-4">
                <div className="flex h-44 items-end justify-around border-b border-white/10 pb-1">
                  {Object.entries(stats.paymentMethodsBreakdown).map(([method, amount]) => {
                    const values = Object.values(stats.paymentMethodsBreakdown) as number[];
                    const maxAmount = Math.max(...values, 100000);
                    const percentageHeight = maxAmount > 0 ? ((amount as number) / maxAmount) * 85 : 0;
                    return (
                      <div key={method} className="flex flex-col items-center group w-24">
                        {/* Tooltip on hover */}
                        <div className="bg-black text-[9px] font-mono text-[#FFD700] px-2 py-1 rounded shadow-xl border border-[#FFD700]/25 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          UGX {amount.toLocaleString()}
                        </div>
                        {/* Bar */}
                        <div 
                          style={{ height: `${Math.max(percentageHeight, 4)}%` }}
                          className="w-12 bg-gradient-to-t from-amber-600 to-[#FFD700] rounded-t group-hover:brightness-125 transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
                        </div>
                        {/* Short Label */}
                        <span className="text-[10px] text-slate-400 font-mono mt-2 text-center truncate w-full">{method}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Visual Bottom Legend */}
                <div className="grid grid-cols-4 gap-2 pt-3 text-[9px] font-mono text-center">
                  <div>
                    <span className="inline-block w-2 bg-amber-500 rounded-full mr-1 h-2" />
                    <span className="text-slate-500">M-Pesa/MTN/Airtel</span>
                  </div>
                  <div>
                    <span className="inline-block w-2 bg-yellow-400 rounded-full mr-1 h-2" />
                    <span className="text-slate-500">Badge NFC</span>
                  </div>
                  <div>
                    <span className="inline-block w-2 bg-orange-400 rounded-full mr-1 h-2" />
                    <span className="text-slate-500">Bank Wire</span>
                  </div>
                  <div>
                    <span className="inline-block w-2 bg-rose-500 rounded-full mr-1 h-2" />
                    <span className="text-slate-500">Physical Cash</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Gateway Monitor and Alerts */}
            <div className="bg-[#2D0A0A] p-5 rounded-3xl border border-white/5 lg:col-span-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Bell className="w-4 h-4 text-[#FFD700]" />
                  <h3 className="font-serif italic text-base text-white font-bold">Gateway Audit Live Logs</h3>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                        notif.type === "success" 
                          ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                          : notif.type === "warning"
                          ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
                          : "bg-[#3D0F0F] border-white/5 text-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold uppercase tracking-wider">
                          {notif.type === "success" ? "✓ Gate Pass" : notif.type === "warning" ? "⚠ Overdue Notice" : "ℹ Note"}
                        </span>
                        <span className="text-slate-500 font-light">{notif.date}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-thin">{notif.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Gateway Diagnostic Sandbox Trigger */}
              <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 block font-bold">API Gateway Status</span>
                <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-white/5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-emerald-400 font-bold">INTEGRATED</span>
                  </div>
                  <span className="text-slate-400">Response: 14ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Active Debtor Summary (Top priority targets) */}
          <div className="bg-[#2D0A0A] p-5 rounded-3xl border border-white/5">
            <h3 className="font-serif italic text-lg text-white font-bold pb-3 flex items-center justify-between">
              <span>Top Outstandings</span>
              <span className="text-xs font-mono font-medium text-slate-400">Action items sorted by highest receivables</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {students.filter(s => s.feesDue > 0).sort((a,b) => b.feesDue - a.feesDue).slice(0, 3).map(s => {
                const total = s.feesDue + s.feesPaid;
                const ratio = total > 0 ? (s.feesPaid / total) * 100 : 0;
                return (
                  <div key={s.id} className="bg-[#3D0F0F] p-4 rounded-2xl border border-rose-500/10 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img referrerPolicy="no-referrer" src={s.photo} alt={s.name} className="w-8 h-8 rounded-full border border-white/10" />
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{s.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{s.className}</span>
                        </div>
                      </div>
                      <span className="text-[9px] uppercase font-mono bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded border border-rose-500/25">
                        UGX {s.feesDue.toLocaleString()} Due
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-slate-400">Cleared Volume:</span>
                        <span className="text-slate-200">UGX {s.feesPaid.toLocaleString()} ({ratio.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-[#1C0505] rounded-full h-1 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ratio}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setRecordAmount(s.feesDue);
                          setIsRecordModalOpen(true);
                        }}
                        className="py-1.5 bg-amber-500 hover:bg-amber-400 text-[#2D0A0A] font-bold text-[10px] rounded border-none cursor-pointer uppercase font-mono"
                      >
                        Book Clear
                      </button>
                      <button
                        onClick={() => handleIssueWarning(s)}
                        className="py-1.5 bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 font-bold text-[10px] rounded border border-white/5 cursor-pointer uppercase font-mono"
                      >
                        Notify Parent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ledgers" && (
        <div id="accountant-tab-ledgers" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students, classes, or parents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#2D0A0A] border border-white/10 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#FFD700]/50"
                />
              </div>

              {/* Section Selector */}
              <div className="flex gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
                {["All", "Nursery", "Primary", "Secondary"].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSectionFilter(sec)}
                    className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wider rounded border-none cursor-pointer ${
                      selectedSectionFilter === sec
                        ? "bg-[#FFD700] text-black font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Displaying <strong className="text-white">{filteredStudents.length}</strong> of {students.length} pupil ledgers
            </div>
          </div>

          {/* Ledgers Registry Table */}
          <div className="bg-[#2D0A0A] rounded-2xl border border-white/5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-[#3D0F0F] text-[#FFD700] uppercase font-bold text-[10px]">
                  <th className="p-3">Reference/Pupil</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Parent Information</th>
                  <th className="p-3">Fees Due Outstanding</th>
                  <th className="p-3">Fees Paid Cum.</th>
                  <th className="p-3 text-right">Accounting Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      No matching student ledgers found in physical section.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const balance = student.feesDue;
                    const totalExpected = student.feesDue + student.feesPaid;
                    return (
                      <tr key={student.id} className="hover:bg-black/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img referrerPolicy="no-referrer" src={student.photo} alt={student.name} className="w-8 h-8 rounded-full border border-white/5" />
                            <div>
                              <p className="font-bold text-white">{student.name}</p>
                              <p className="text-[10px] text-slate-400">{student.id} | {student.className}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            student.section === "Nursery" 
                              ? "bg-pink-500/10 text-pink-300 border border-pink-500/15" 
                              : student.section === "Primary"
                              ? "bg-[#1E90FF]/15 text-[#1E90FF] border border-[#1E90FF]/25"
                              : "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/15"
                          }`}>
                            {student.section}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-200">{student.parentName}</p>
                          <p className="text-[10px] text-slate-400 lowercase">{student.parentEmail}</p>
                        </td>
                        <td className="p-3 text-rose-300 font-bold">
                          {balance > 0 ? `UGX ${balance.toLocaleString()}` : "Cleared 100% ✓"}
                        </td>
                        <td className="p-3 text-[#FFD700] font-semibold">
                          UGX {student.feesPaid.toLocaleString()}
                        </td>
                        <td className="p-3 text-right space-y-1">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                setRecordAmount(student.feesDue || 250000);
                                setIsRecordModalOpen(true);
                              }}
                              title="Record Custom Ledger Payment"
                              className="px-2.5 py-1 bg-[#3D0F0F] hover:bg-[#4E1414] text-[#FFD700] border border-[#FFD700]/25 rounded text-[10px] uppercase font-bold cursor-pointer transition-all"
                            >
                              Pay
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                setAdjustAmount(200000);
                                setIsWaiver(true);
                                setIsAdjustModalOpen(true);
                              }}
                              title="Scholarship Adjustment discount"
                              className="px-2.5 py-1 bg-black/40 hover:bg-black/60 text-emerald-400 border border-emerald-500/20 rounded text-[10px] uppercase font-bold cursor-pointer transition-all"
                            >
                              Adj
                            </button>
                            <button
                              onClick={() => handleIssueWarning(student)}
                              className="p-1 px-2.5 bg-black/40 hover:bg-rose-500/20 text-rose-300 border border-rose-500/10 rounded text-[10px] uppercase font-bold cursor-pointer transition-all"
                            >
                              Alert
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div id="accountant-tab-transactions" className="space-y-4">
          {/* Filtering Options */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Receipt, child reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#2D0A0A] border border-white/10 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Method Filter */}
              <div className="bg-black/30 p-1 rounded-lg border border-white/5 flex gap-1">
                {[
                  { value: "All", label: "All Methods" },
                  { value: "Mobile", label: "Mobile Pay" },
                  { value: "Card", label: "NFC Badges" },
                  { value: "Manual", label: "Cash Ledger" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedMethodFilter(opt.value)}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-wider rounded border-none cursor-pointer font-mono ${
                      selectedMethodFilter === opt.value
                        ? "bg-[#FFD700] text-black font-extrabold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-[#2D0A0A] border border-white/10 text-slate-100 font-mono text-[10px] p-2 leading-none uppercase tracking-wider rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Alerts (Pending)</option>
                <option value="Approved">Verified (Approved)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedMethodFilter("All");
                setSelectedSectionFilter("All");
                setSelectedStatusFilter("All");
              }}
              className="text-[10px] text-[#FFD700] hover:underline bg-transparent border-none cursor-pointer font-mono font-bold"
            >
              Reset Filters
            </button>
          </div>

          {/* Transactions Register */}
          <div className="bg-[#2D0A0A] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-[#3D0F0F] text-[#FFD700] uppercase font-bold text-[10px]">
                  <th className="p-3">Gateway Reference ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Ref Date</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Audit State</th>
                  <th className="p-3 text-right">Manual Clearing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                      No matching parent transactions currently registered in gateway logs.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(txn => {
                    const student = studentMap.get(txn.studentId);
                    const isPending = txn.status === "Pending";
                    return (
                      <tr key={txn.id} className="hover:bg-black/2s transition-colors">
                        <td className="p-3 font-semibold text-white">
                          <span className="text-slate-400 font-light select-all">{txn.receiptNo}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-100">{student ? student.name : "System Sandbox Pupil"}</p>
                          <p className="text-[10px] text-slate-400 lowercase">{student?.parentEmail}</p>
                        </td>
                        <td className="p-3 text-slate-300">{txn.date}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1">
                            {txn.paymentMethod.toLowerCase().includes("mobile") || txn.paymentMethod.toLowerCase().includes("pesa") || txn.paymentMethod.toLowerCase().includes("mtn") || txn.paymentMethod.toLowerCase().includes("airtel") ? (
                              <>
                                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-slate-200">Mobile Money</span>
                              </>
                            ) : txn.paymentMethod.toLowerCase().includes("card") || txn.paymentMethod.toLowerCase().includes("badge") || txn.paymentMethod.toLowerCase().includes("nfc") ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5 text-[#1E90FF]" />
                                <span className="text-slate-200">NFC Smart badge</span>
                              </>
                            ) : (
                              <>
                                <Coins className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-slate-200">{txn.paymentMethod}</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400 font-bold">
                          UGX {txn.amount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1 ${
                            isPending 
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            {txn.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isPending ? (
                            <button
                              onClick={() => handleManualReconcile(txn.id)}
                              className="px-2 py-1 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-[10.5px] rounded border-none cursor-pointer uppercase font-mono"
                            >
                              Reconcile
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-normal">Passed Secure Auditor ✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div id="accountant-tab-billing" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base Tuition fee guidelines */}
          <div className="bg-[#2D0A0A] p-5 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <BookOpen className="w-4 h-4 text-[#FFD700]" />
              <h3 className="font-serif italic text-base text-white font-bold">Tuition Base Constants</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed font-light font-mono">
              The Poplar Unified school fees structure defaults by Section classification:
            </p>

            <div className="space-y-3 font-mono text-xs pt-2">
              <div className="flex justify-between items-center bg-[#3D0F0F] p-3 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-bold text-white">Nursery Division</h4>
                  <span className="text-[9px] text-slate-400">Tiny Tots & Early years</span>
                </div>
                <span className="text-pink-400 font-bold">UGX 650,000 / term</span>
              </div>

              <div className="flex justify-between items-center bg-[#3D0F0F] p-3 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-bold text-white">Primary Division</h4>
                  <span className="text-[9px] text-slate-400">Grades 1 to 7 classes</span>
                </div>
                <span className="text-[#1E90FF] font-bold">UGX 850,000 / term</span>
              </div>

              <div className="flex justify-between items-center bg-[#3D0F0F] p-3 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-bold text-white">Secondary Division</h4>
                  <span className="text-[9px] text-slate-400">Grades 8 to 12 classes</span>
                </div>
                <span className="text-[#FFD700] font-bold">UGX 1,200,000 / term</span>
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] text-slate-400 flex gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>Section Coordinators or Administrators automatically apply these initial structural parameters to pending kids upon admission acceptance.</p>
            </div>
          </div>

          {/* Quick Invoice Adjuster Manual Ledger */}
          <div className="bg-[#2D0A0A] p-5 rounded-3xl border border-white/5 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <h3 className="font-serif italic text-base text-white font-bold">Consolidated Sandbox Utilities</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Simulate manual accounting operations directly on the school vault registry. Change balances, inject virtual funds, or apply special grants:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Record a transaction */}
              <div className="border border-white/5 rounded-2xl p-4 bg-[#3D0F0F] space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif italic text-sm text-[#FFD700] font-bold">Record Cash Payment</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-1">
                    Book offline manual collections or bank transfers securely inside pupil transaction logs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentId(students[0]?.id || "");
                    setRecordAmount(250000);
                    setIsRecordModalOpen(true);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-mono font-bold text-[10px] tracking-wider rounded border-none hover:brightness-110 cursor-pointer transition-all"
                >
                  Book Manual Transaction
                </button>
              </div>

              {/* Adjust dues balance */}
              <div className="border border-white/5 rounded-2xl p-4 bg-[#3D0F0F] space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif italic text-sm text-[#FFD700] font-bold font-bold">Apply Fee Adjustment</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-1">
                    Extend academic scholarship tuition waivers or insert manual surcharge invoices to due ledgers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentId(students[0]?.id || "");
                    setAdjustAmount(150000);
                    setIsWaiver(true);
                    setIsAdjustModalOpen(true);
                  }}
                  className="w-full py-2 bg-transparent text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 font-mono font-bold text-[10px] tracking-wider rounded cursor-pointer transition-all"
                >
                  Tune Tuition Balances
                </button>
              </div>
            </div>

            {/* Smart NFC Badges information card */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#1E90FF]" /> NFC Smart Cards Core Integration
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-lg">
                  Pupils leverage RFID chips baked into standard Poplar badges. Parents recharge them using Mobile Money, while on-campus transactions deduct allowances instantly.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full shrink-0">
                ACTIVE GATEWAY
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: BOOK MANUAL PAYMENT */}
      {isRecordModalOpen && (
        <div id="accountant-modal-record" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleRecordPaymentSubmit}
            className="bg-[#2D0A0A] border border-[#FFD700]/25 rounded-2xl p-6 w-full max-w-md space-y-4 font-mono text-xs relative"
          >
            <h3 className="text-lg font-serif italic text-[#FFD700] font-bold">Book Manual Payment Receipt</h3>
            
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Target Scholar:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#1C0505] p-2.5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-400"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className}) — Balance: UGX {s.feesDue.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Receipt Amount (UGX):</label>
              <input
                type="number"
                value={recordAmount}
                onChange={(e) => setRecordAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#1C0505] p-2.5 border border-white/10 rounded-lg text-slate-100 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Gateway Channel:</label>
              <select
                value={recordMethod}
                onChange={(e) => setRecordMethod(e.target.value)}
                className="w-full bg-[#1C0505] p-2.5 border border-white/10 rounded-lg text-slate-100"
              >
                <option value="MTN Mobile Money">MTN Mobile Money Wallet</option>
                <option value="Airtel Money">Airtel Money Wallet</option>
                <option value="M-Pesa Mobile Gateway">M-Pesa Mobile Gateway</option>
                <option value="Smart Badge NFC Tap">Smart Badge NFC hardware scan</option>
                <option value="Direct Bank Ledger Wire">Electronic Bank Clearance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="py-2.5 bg-black/40 text-slate-300 font-bold uppercase rounded border border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-[#2C0A0A] font-bold uppercase rounded border-none cursor-pointer"
              >
                Clear Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: APPLY FEE ADJUSTMENTS */}
      {isAdjustModalOpen && (
        <div id="accountant-modal-adjust" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleAdjustFeesSubmit}
            className="bg-[#2D0A0A] border border-[#FFD700]/25 rounded-2xl p-6 w-full max-w-md space-y-4 font-mono text-xs relative"
          >
            <h3 className="text-lg font-serif italic text-white font-bold text-center">Modify Student Fee Ledger</h3>
            
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Target Scholar:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#1C0505] p-2.5 border border-white/10 rounded-lg text-slate-100"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className}) — Current Due: UGX {s.feesDue.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Adjustment Value (UGX):</label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#1C0505] p-2.5 border border-white/10 rounded-lg text-slate-150"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Adjustment Class Type:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsWaiver(true)}
                  className={`py-2 border rounded font-mono text-center cursor-pointer uppercase ${
                    isWaiver 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-bold" 
                      : "text-slate-400 bg-black/40 border-white/5"
                  }`}
                >
                  Waiver / Scholarship (-)
                </button>
                <button
                  type="button"
                  onClick={() => setIsWaiver(false)}
                  className={`py-2 border rounded font-mono text-center cursor-pointer uppercase ${
                    !isWaiver 
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/45 font-bold" 
                      : "text-slate-400 bg-black/40 border-white/5"
                  }`}
                >
                  Surcharge Invoice (+)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block p-0">Auditable Reason:</label>
              <input
                type="text"
                placeholder="e.g. Scholarship discount, Sports uniform fee..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-[#1C0505] p-2.5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="py-2.5 bg-black/40 text-slate-300 font-bold uppercase rounded border border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase rounded border-none cursor-pointer"
              >
                Commit Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
