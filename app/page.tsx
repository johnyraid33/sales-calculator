"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  Search,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  Filter,
  RefreshCw,
  Building,
  Home as HomeIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Agent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  baseSalary: number;
  rentAllowance: number;
  socialSecurity: number;
  totalCommissionDue: number;
  totalPaid: number;
  balance: number;
}

interface Transaction {
  id: string;
  date: string;
  client: string;
  partnerAgency: string | null;
  type: string | null;
  project: string | null;
  price: number;
  rate: number;
  commission: number;
  dealType: string;
  paymentStatus: string;
  agentId: string;
  agent?: { name: string };
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  type: string;
  memo: string | null;
  agentId: string;
  agent?: { name: string };
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filter States
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("ALL");
  const [txAgentFilter, setTxAgentFilter] = useState("ALL");
  
  const [pmtSearch, setPmtSearch] = useState("");
  const [pmtTypeFilter, setPmtTypeFilter] = useState("ALL");
  const [pmtAgentFilter, setPmtAgentFilter] = useState("ALL");

  // Form Dialog States
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [pmtDialogOpen, setPmtDialogOpen] = useState(false);

  // Edit target states
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingPmt, setEditingPmt] = useState<Payment | null>(null);

  // Form Fields - Agent
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [agentBaseSalary, setAgentBaseSalary] = useState("0");
  const [agentRentAllowance, setAgentRentAllowance] = useState("0");
  const [agentSocialSecurity, setAgentSocialSecurity] = useState("0");

  // Form Fields - Transaction
  const [txDate, setTxDate] = useState("");
  const [txClient, setTxClient] = useState("");
  const [txPartner, setTxPartner] = useState("");
  const [txUnitType, setTxUnitType] = useState("");
  const [txProject, setTxProject] = useState("");
  const [txPrice, setTxPrice] = useState("");
  const [txRate, setTxRate] = useState("0.01");
  const [txCustomRate, setTxCustomRate] = useState("");
  const [txDealType, setTxDealType] = useState("SALE");
  const [txStatus, setTxStatus] = useState("PAID");
  const [txAgentId, setTxAgentId] = useState("");

  // Form Fields - Payment
  const [pmtDate, setPmtDate] = useState("");
  const [pmtAmount, setPmtAmount] = useState("");
  const [pmtType, setPmtType] = useState("COMMISSION");
  const [pmtMemo, setPmtMemo] = useState("");
  const [pmtAgentId, setPmtAgentId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resAgents, resTx, resPmt] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/transactions"),
        fetch("/api/payments"),
      ]);

      const dataAgents = await resAgents.json();
      const dataTx = await resTx.json();
      const dataPmt = await resPmt.json();

      setAgents(dataAgents);
      setTransactions(dataTx);
      setPayments(dataPmt);

      if (dataAgents.length > 0) {
        setTxAgentId(dataAgents[0].id);
        setPmtAgentId(dataAgents[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAgentDialog = (agent: Agent | null = null) => {
    if (agent) {
      setEditingAgent(agent);
      setAgentName(agent.name);
      setAgentEmail(agent.email || "");
      setAgentPhone(agent.phone || "");
      setAgentBaseSalary(agent.baseSalary.toString());
      setAgentRentAllowance(agent.rentAllowance.toString());
      setAgentSocialSecurity(agent.socialSecurity.toString());
    } else {
      setEditingAgent(null);
      setAgentName("");
      setAgentEmail("");
      setAgentPhone("");
      setAgentBaseSalary("0");
      setAgentRentAllowance("0");
      setAgentSocialSecurity("0");
    }
    setAgentDialogOpen(true);
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingAgent ? `/api/agents/${editingAgent.id}` : "/api/agents";
    const method = editingAgent ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          email: agentEmail || null,
          phone: agentPhone || null,
          baseSalary: agentBaseSalary,
          rentAllowance: agentRentAllowance,
          socialSecurity: agentSocialSecurity,
        }),
      });

      if (response.ok) {
        setAgentDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to save agent");
      }
    } catch (error) {
      console.error("Error saving agent:", error);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent? This will delete all their transactions and payments.")) return;

    try {
      const response = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  const handleOpenTxDialog = (tx: Transaction | null = null) => {
    if (tx) {
      setEditingTx(tx);
      setTxDate(tx.date.split("T")[0]);
      setTxClient(tx.client);
      setTxPartner(tx.partnerAgency || "");
      setTxUnitType(tx.type || "");
      setTxProject(tx.project || "");
      setTxPrice(tx.price.toString());
      setTxDealType(tx.dealType);
      setTxStatus(tx.paymentStatus);
      setTxAgentId(tx.agentId);

      const ratePct = (tx.rate * 100).toString();
      if (["1", "1.5", "2", "2.5", "5", "50"].includes(ratePct)) {
        setTxRate((tx.rate).toString());
        setTxCustomRate("");
      } else {
        setTxRate("custom");
        setTxCustomRate(tx.rate.toString());
      }
    } else {
      setEditingTx(null);
      setTxDate(new Date().toISOString().split("T")[0]);
      setTxClient("");
      setTxPartner("");
      setTxUnitType("");
      setTxProject("");
      setTxPrice("");
      setTxDealType("SALE");
      setTxRate("0.01");
      setTxCustomRate("");
      setTxStatus("PAID");
      if (agents.length > 0) setTxAgentId(agents[0].id);
    }
    setTxDialogOpen(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTx ? "PUT" : "POST";
    const finalRate = txRate === "custom" ? parseFloat(txCustomRate) : parseFloat(txRate);

    try {
      const response = await fetch("/api/transactions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTx?.id,
          date: txDate,
          client: txClient,
          partnerAgency: txPartner || null,
          type: txUnitType || null,
          project: txProject || null,
          price: txPrice,
          rate: finalRate,
          dealType: txDealType,
          paymentStatus: txStatus,
          agentId: txAgentId,
        }),
      });

      if (response.ok) {
        setTxDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to save transaction");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleOpenPmtDialog = (pmt: Payment | null = null) => {
    if (pmt) {
      setEditingPmt(pmt);
      setPmtDate(pmt.date.split("T")[0]);
      setPmtAmount(pmt.amount.toString());
      setPmtType(pmt.type);
      setPmtMemo(pmt.memo || "");
      setPmtAgentId(pmt.agentId);
    } else {
      setEditingPmt(null);
      setPmtDate(new Date().toISOString().split("T")[0]);
      setPmtAmount("");
      setPmtType("COMMISSION");
      setPmtMemo("");
      if (agents.length > 0) setPmtAgentId(agents[0].id);
    }
    setPmtDialogOpen(true);
  };

  const handleSavePmt = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPmt ? "PUT" : "POST";

    try {
      const response = await fetch("/api/payments", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPmt?.id,
          date: pmtDate,
          amount: pmtAmount,
          type: pmtType,
          memo: pmtMemo || null,
          agentId: pmtAgentId,
        }),
      });

      if (response.ok) {
        setPmtDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to save payment");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  const handleDeletePmt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const response = await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  // Calculations
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPct = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const totalSalesVolume = transactions
    .filter((t) => t.dealType === "SALE")
    .reduce((sum, t) => sum + t.price, 0);

  const totalCommissionsDue = transactions.reduce((sum, t) => sum + t.commission, 0);

  const totalPaymentsMade = payments.reduce((sum, p) => {
    if (p.type === "DEDUCTION") return sum - Math.abs(p.amount);
    return sum + p.amount;
  }, 0);

  const outstandingBalance = totalCommissionsDue - totalPaymentsMade;

  // Group by Month for Charts & Reconciliation
  const getMonthlyBreakdown = () => {
    const months: { [key: string]: { sales: number; commission: number; paid: number; rentAllow: number } } = {};

    // Group transactions
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { sales: 0, commission: 0, paid: 0, rentAllow: 0 };
      }
      if (tx.dealType === "SALE") {
        months[key].sales += tx.price;
      }
      months[key].commission += tx.commission;
    });

    // Group payments
    payments.forEach((p) => {
      const date = new Date(p.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { sales: 0, commission: 0, paid: 0, rentAllow: 0 };
      }
      if (p.type === "RENT_ALLOWANCE") {
        months[key].rentAllow += p.amount;
      }
      // Deductions act negative
      const amountSign = p.type === "DEDUCTION" ? -p.amount : p.amount;
      months[key].paid += amountSign;
    });

    // Sort keys chronologically
    return Object.keys(months)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return {
          monthKey: key,
          label: `${monthNames[parseInt(month) - 1]} ${year}`,
          sales: months[key].sales,
          commission: months[key].commission,
          paid: months[key].paid,
          rentAllow: months[key].rentAllow,
          variance: months[key].commission - months[key].paid,
        };
      });
  };

  const monthlyData = getMonthlyBreakdown();

  // Filters logic
  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.client.toLowerCase().includes(txSearch.toLowerCase()) ||
      (tx.project && tx.project.toLowerCase().includes(txSearch.toLowerCase())) ||
      (tx.partnerAgency && tx.partnerAgency.toLowerCase().includes(txSearch.toLowerCase()));

    const matchesType = txTypeFilter === "ALL" || tx.dealType === txTypeFilter;
    const matchesAgent = txAgentFilter === "ALL" || tx.agentId === txAgentFilter;

    return matchesSearch && matchesType && matchesAgent;
  });

  const filteredPmt = payments.filter((p) => {
    const matchesSearch =
      (p.memo && p.memo.toLowerCase().includes(pmtSearch.toLowerCase())) ||
      p.type.toLowerCase().includes(pmtSearch.toLowerCase());

    const matchesType = pmtTypeFilter === "ALL" || p.type === pmtTypeFilter;
    const matchesAgent = pmtAgentFilter === "ALL" || p.agentId === pmtAgentFilter;

    return matchesSearch && matchesType && matchesAgent;
  });

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="rounded-lg bg-sky-500 p-2 text-slate-900 font-bold">AN</div>
            <div>
              <h2 className="font-semibold text-lg leading-tight text-white">Ark Noah</h2>
              <span className="text-xs text-slate-400">Sales & Rent Engine</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: HomeIcon },
              { id: "transactions", label: "Transactions", icon: Layers },
              { id: "payments", label: "Payments Log", icon: CreditCard },
              { id: "agents", label: "Agents Directory", icon: Users },
              { id: "reconciliation", label: "Reconciliation", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-sky-500/10 text-sky-400 border-l-2 border-sky-400 pl-2.5"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
          <p>© 2026 Ark Noah Holdings</p>
          <p className="mt-1">Version 1.0.0 (Prisma SQLite)</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header summary row */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "dashboard" && "Sales volumes, commissions, and agent payment breakdown"}
              {activeTab === "transactions" && "Log of client property transactions"}
              {activeTab === "payments" && "Records of payouts, allowances, and social security"}
              {activeTab === "agents" && "Configure sales representatives and base remuneration settings"}
              {activeTab === "reconciliation" && "Month-by-month commission dues and payouts balance sheet"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Reload
            </Button>

            {activeTab === "transactions" && (
              <Button size="sm" onClick={() => handleOpenTxDialog()} className="bg-sky-500 text-slate-900 hover:bg-sky-400 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> New Deal
              </Button>
            )}

            {activeTab === "payments" && (
              <Button size="sm" onClick={() => handleOpenPmtDialog()} className="bg-sky-500 text-slate-900 hover:bg-sky-400 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Log Payment
              </Button>
            )}

            {activeTab === "agents" && (
              <Button size="sm" onClick={() => handleOpenAgentDialog()} className="bg-sky-500 text-slate-900 hover:bg-sky-400 font-semibold">
                <UserPlus className="w-4 h-4 mr-2" /> Add Agent
              </Button>
            )}
          </div>
        </header>

        {/* Global Summary Cards - only on Dashboard and Reconciliation */}
        {(activeTab === "dashboard" || activeTab === "reconciliation") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Sales Volume</CardTitle>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(totalSalesVolume)}</div>
                <p className="text-xs text-sky-400 mt-1">Excludes rentals</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Commissions Due</CardTitle>
                <Percent className="w-4 h-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(totalCommissionsDue)}</div>
                <p className="text-xs text-emerald-400 mt-1">Sales + Rental commissions</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Receipts Paid</CardTitle>
                <CreditCard className="w-4 h-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(totalPaymentsMade)}</div>
                <p className="text-xs text-purple-400 mt-1">Including base rent allowances</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Variance Balance</CardTitle>
                <DollarSign className={`w-4 h-4 ${outstandingBalance >= 0 ? "text-amber-500" : "text-emerald-500"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(outstandingBalance)}</div>
                <p className="text-xs text-amber-500 mt-1">
                  {outstandingBalance >= 0 ? "Outstanding due to agent" : "Agent overpaid"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dynamic Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
            <p className="text-slate-400 text-sm">Querying database...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* SVG Chart */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <CardTitle className="text-lg text-white">Monthly Commission Dues vs Receipts Paid</CardTitle>
                      <CardDescription className="text-slate-400">Performance and payment variance over time</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-sky-500 rounded"></span>
                        <span>Commission Due</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-purple-500 rounded"></span>
                        <span>Receipts Paid</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Container */}
                  <div className="h-64 w-full relative">
                    {monthlyData.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500">No chart data available</div>
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 800 240" preserveAspectRatio="none">
                        {/* Grids */}
                        {[0, 1, 2, 3, 4].map((grid, i) => {
                          const y = 20 + i * 45;
                          return (
                            <line
                              key={i}
                              x1="40"
                              y1={y}
                              x2="780"
                              y2={y}
                              stroke="#1e293b"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                          );
                        })}

                        {/* Bars rendering */}
                        {(() => {
                          // Find max value to scale chart
                          const maxVal = Math.max(
                            ...monthlyData.map((d) => Math.max(d.commission, d.paid, 5000))
                          );
                          const chartWidth = 720;
                          const barSpacing = chartWidth / monthlyData.length;
                          const barWidth = Math.min(20, barSpacing / 3);

                          return monthlyData.map((data, index) => {
                            const xBase = 60 + index * barSpacing;
                            const commHeight = (data.commission / maxVal) * 160;
                            const paidHeight = (data.paid / maxVal) * 160;

                            const yComm = 200 - commHeight;
                            const yPaid = 200 - paidHeight;

                            return (
                              <g key={data.monthKey} className="group">
                                {/* Commission Bar */}
                                <rect
                                  x={xBase - barWidth / 2 - 2}
                                  y={yComm}
                                  width={barWidth}
                                  height={commHeight}
                                  fill="#0ea5e9"
                                  rx="2"
                                  className="transition-all duration-300 hover:opacity-85"
                                />

                                {/* Paid Bar */}
                                <rect
                                  x={xBase + barWidth / 2 + 2}
                                  y={yPaid}
                                  width={barWidth}
                                  height={paidHeight}
                                  fill="#a855f7"
                                  rx="2"
                                  className="transition-all duration-300 hover:opacity-85"
                                />

                                {/* X Label */}
                                <text
                                  x={xBase}
                                  y="225"
                                  fill="#64748b"
                                  fontSize="9"
                                  textAnchor="middle"
                                >
                                  {data.label}
                                </text>

                                {/* Hover tooltip values */}
                                <title>
                                  {`${data.label}\nDue: ${formatCurrency(data.commission)}\nPaid: ${formatCurrency(data.paid)}`}
                                </title>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                    )}
                  </div>
                </Card>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Top Agents summaries */}
                  <Card className="bg-slate-900/40 border-slate-800 backdrop-blur lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Agent Balances</CardTitle>
                      <CardDescription className="text-slate-400">Total commissions due vs actual payments by representative</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader className="border-slate-800">
                          <TableRow className="border-slate-800 hover:bg-slate-800/30">
                            <TableHead className="text-slate-400">Representative</TableHead>
                            <TableHead className="text-slate-400 text-right">Commission Due</TableHead>
                            <TableHead className="text-slate-400 text-right">Paid to Agent</TableHead>
                            <TableHead className="text-slate-400 text-right">Net Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agents.map((agent) => (
                            <TableRow key={agent.id} className="border-slate-800/50 hover:bg-slate-800/20">
                              <TableCell className="font-medium text-white">{agent.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(agent.totalCommissionDue)}</TableCell>
                              <TableCell className="text-right text-purple-400">{formatCurrency(agent.totalPaid)}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${agent.balance >= 0 ? "text-amber-500" : "text-emerald-500"}`}>
                                  {formatCurrency(agent.balance)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Right Column: Recent activity log */}
                  <Card className="bg-slate-900/40 border-slate-800 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Recent Deals</CardTitle>
                      <CardDescription className="text-slate-400">Last property sales and rents logged</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center text-sm border-b border-slate-800/40 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-semibold text-white truncate max-w-[150px]">{tx.client}</p>
                            <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              {tx.dealType === "SALE" ? (
                                <Badge className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/15 py-0 px-1.5 text-[9px]">Sale</Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 py-0 px-1.5 text-[9px]">Rent</Badge>
                              )}
                              <span>{tx.project || "Direct"}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{formatCurrency(tx.price)}</p>
                            <span className="text-[11px] text-emerald-400">Com. {formatCurrency(tx.commission)}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* 2. TRANSACTIONS TAB */}
            {activeTab === "transactions" && (
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <Input
                        placeholder="Search client, project, partner..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="pl-9 bg-slate-950/60 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-sky-500"
                      />
                    </div>

                    <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                      <SelectTrigger className="w-36 bg-slate-950/60 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Deal Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="ALL">All Deals</SelectItem>
                        <SelectItem value="SALE">Sales only</SelectItem>
                        <SelectItem value="RENT">Rentals only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={txAgentFilter} onValueChange={setTxAgentFilter}>
                      <SelectTrigger className="w-40 bg-slate-950/60 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="ALL">All Agents</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Showing {filteredTx.length} of {transactions.length} entries
                  </span>
                </div>

                <div className="rounded-md border border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-950/40 border-slate-800">
                      <TableRow className="border-slate-800 hover:bg-slate-950/50">
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400">Agent</TableHead>
                        <TableHead className="text-slate-400">Client / Property</TableHead>
                        <TableHead className="text-slate-400 text-right">Price</TableHead>
                        <TableHead className="text-slate-400 text-center">Rate</TableHead>
                        <TableHead className="text-slate-400 text-right">Commission</TableHead>
                        <TableHead className="text-slate-400 text-center">Status</TableHead>
                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTx.map((tx) => (
                        <TableRow key={tx.id} className="border-slate-800/60 hover:bg-slate-800/10">
                          <TableCell className="text-slate-300">
                            {new Date(tx.date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            {tx.agent?.name}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-white">{tx.client}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {tx.project ? `${tx.project}` : ""} {tx.type ? `(${tx.type})` : ""}
                            </p>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-slate-200">
                            {formatCurrency(tx.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-slate-700 text-slate-300 py-0.5 px-2 bg-slate-950/30">
                              {formatPct(tx.rate)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-sky-400">
                            {formatCurrency(tx.commission)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                tx.paymentStatus === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : tx.paymentStatus === "PARTIALLY_PAID"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-slate-800 text-slate-400"
                              }
                            >
                              {tx.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenTxDialog(tx)}
                              className="text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTx(tx.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-8 h-8"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* 3. PAYMENTS TAB */}
            {activeTab === "payments" && (
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <Input
                        placeholder="Search memo / comments..."
                        value={pmtSearch}
                        onChange={(e) => setPmtSearch(e.target.value)}
                        className="pl-9 bg-slate-950/60 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-sky-500"
                      />
                    </div>

                    <Select value={pmtTypeFilter} onValueChange={setPmtTypeFilter}>
                      <SelectTrigger className="w-40 bg-slate-950/60 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Payment Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="COMMISSION">Commission Payout</SelectItem>
                        <SelectItem value="SALARY">Base Salary</SelectItem>
                        <SelectItem value="RENT_ALLOWANCE">Rent Allowance</SelectItem>
                        <SelectItem value="BONUS">Bonus</SelectItem>
                        <SelectItem value="EXPENSE">Expense Remuneration</SelectItem>
                        <SelectItem value="DEDUCTION">Deduction</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={pmtAgentFilter} onValueChange={setPmtAgentFilter}>
                      <SelectTrigger className="w-40 bg-slate-950/60 border-slate-800 text-slate-300">
                        <SelectValue placeholder="Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="ALL">All Agents</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Showing {filteredPmt.length} of {payments.length} entries
                  </span>
                </div>

                <div className="rounded-md border border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-950/40 border-slate-800">
                      <TableRow className="border-slate-800 hover:bg-slate-950/50">
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400">Agent</TableHead>
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-slate-400">Memo / Description</TableHead>
                        <TableHead className="text-slate-400 text-right">Amount</TableHead>
                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPmt.map((pmt) => {
                        const isDeduction = pmt.type === "DEDUCTION";
                        return (
                          <TableRow key={pmt.id} className="border-slate-800/60 hover:bg-slate-800/10">
                            <TableCell className="text-slate-300">
                              {new Date(pmt.date).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell className="font-semibold text-white">
                              {pmt.agent?.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  pmt.type === "COMMISSION"
                                    ? "bg-sky-500/10 text-sky-400"
                                    : pmt.type === "SALARY"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : pmt.type === "RENT_ALLOWANCE"
                                    ? "bg-purple-500/10 text-purple-400"
                                    : pmt.type === "BONUS"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : pmt.type === "DEDUCTION"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-slate-800 text-slate-300"
                                }
                              >
                                {pmt.type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300 italic max-w-sm truncate">
                              {pmt.memo || "—"}
                            </TableCell>
                            <TableCell className={`text-right font-bold ${isDeduction ? "text-red-400" : "text-purple-400"}`}>
                              {isDeduction ? "-" : ""}{formatCurrency(pmt.amount)}
                            </TableCell>
                            <TableCell className="text-right space-x-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenPmtDialog(pmt)}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePmt(pmt.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-8 h-8"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* 4. AGENTS TAB */}
            {activeTab === "agents" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <Card key={agent.id} className="bg-slate-900/40 border-slate-800 backdrop-blur flex flex-col justify-between">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-white font-bold">{agent.name}</CardTitle>
                          <CardDescription className="text-slate-400 mt-1">{agent.email || "No email"}</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-950/20">
                          {agent.phone || "No phone"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                      <div className="grid grid-cols-3 gap-2 text-xs border-y border-slate-800/60 py-3">
                        <div>
                          <p className="text-slate-400">Base Salary</p>
                          <p className="text-white font-semibold mt-0.5">{formatCurrency(agent.baseSalary)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Rent Allowance</p>
                          <p className="text-white font-semibold mt-0.5">{formatCurrency(agent.rentAllowance)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Social Sec.</p>
                          <p className="text-white font-semibold mt-0.5">{formatCurrency(agent.socialSecurity)}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Commissions Due:</span>
                          <span className="font-semibold text-sky-400">{formatCurrency(agent.totalCommissionDue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Paid:</span>
                          <span className="font-semibold text-purple-400">{formatCurrency(agent.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800/40 pt-2">
                          <span className="text-slate-400">Due Balance:</span>
                          <span className={`font-bold ${agent.balance >= 0 ? "text-amber-500" : "text-emerald-500"}`}>
                            {formatCurrency(agent.balance)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="border-t border-slate-800/60 px-6 py-4 flex justify-end gap-2 bg-slate-950/20">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenAgentDialog(agent)} className="text-slate-300 hover:text-white hover:bg-slate-800">
                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Settings
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAgent(agent.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* 5. RECONCILIATION TAB */}
            {activeTab === "reconciliation" && (
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur p-6">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white">Monthly Reconciliation Summary</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Variance report matching sales pipeline commission against treasury payouts.</p>
                </div>

                <div className="rounded-md border border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-950/40 border-slate-800">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Month</TableHead>
                        <TableHead className="text-slate-400 text-right">Commissions Due</TableHead>
                        <TableHead className="text-slate-400 text-right">Receipts Paid</TableHead>
                        <TableHead className="text-slate-400 text-right">Variance</TableHead>
                        <TableHead className="text-slate-400 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((data) => {
                        const isUnderpaid = data.variance > 0;
                        const isOverpaid = data.variance < 0;
                        const isPerfect = Math.abs(data.variance) < 1;

                        return (
                          <TableRow key={data.monthKey} className="border-slate-800/60 hover:bg-slate-800/10">
                            <TableCell className="font-semibold text-slate-200">{data.label}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(data.commission)}</TableCell>
                            <TableCell className="text-right text-purple-400">{formatCurrency(data.paid)}</TableCell>
                            <TableCell className={`text-right font-bold ${isUnderpaid ? "text-amber-500" : isOverpaid ? "text-emerald-500" : "text-slate-300"}`}>
                              {isUnderpaid ? "+" : ""}{formatCurrency(data.variance)}
                            </TableCell>
                            <TableCell className="text-center">
                              {isPerfect ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2">
                                  Settled
                                </Badge>
                              ) : isUnderpaid ? (
                                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 py-0.5 px-2">
                                  Due to Agent
                                </Badge>
                              ) : (
                                <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 py-0.5 px-2">
                                  Pre-Paid / Advance
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      {/* DIALOGS FOR FORMS */}
      
      {/* 1. Agent Dialog */}
      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <form onSubmit={handleSaveAgent} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-white">{editingAgent ? "Edit Agent Settings" : "Add New Agent"}</DialogTitle>
              <DialogDescription className="text-slate-400">Configure base monthly metrics for agent remuneration calculations.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label htmlFor="agent-name" className="text-slate-300">Name</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="agent-email" className="text-slate-300">Email</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    value={agentEmail}
                    onChange={(e) => setAgentEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-phone" className="text-slate-300">Phone</Label>
                  <Input
                    id="agent-phone"
                    value={agentPhone}
                    onChange={(e) => setAgentPhone(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="agent-salary" className="text-slate-300">Base Salary</Label>
                  <Input
                    id="agent-salary"
                    type="number"
                    value={agentBaseSalary}
                    onChange={(e) => setAgentBaseSalary(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-allowance" className="text-slate-300">Rent Allowance</Label>
                  <Input
                    id="agent-allowance"
                    type="number"
                    value={agentRentAllowance}
                    onChange={(e) => setAgentRentAllowance(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-soc" className="text-slate-300">Social Security</Label>
                  <Input
                    id="agent-soc"
                    type="number"
                    value={agentSocialSecurity}
                    onChange={(e) => setAgentSocialSecurity(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAgentDialogOpen(false)} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button type="submit" className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold">
                {editingAgent ? "Save Changes" : "Create Agent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Transaction Dialog */}
      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
          <form onSubmit={handleSaveTx} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-white">{editingTx ? "Edit Deal Details" : "Log New Property Deal"}</DialogTitle>
              <DialogDescription className="text-slate-400">Save a property sale or rent deal. Commission calculations are handled automatically.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tx-deal-type" className="text-slate-300">Deal Type</Label>
                  <Select value={txDealType} onValueChange={(val) => {
                    setTxDealType(val);
                    // Autofill rent rate to 50%
                    if (val === "RENT") {
                      setTxRate("0.50");
                    } else {
                      setTxRate("0.01");
                    }
                  }}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 mt-1">
                      <SelectValue placeholder="Deal Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="SALE">Sale</SelectItem>
                      <SelectItem value="RENT">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tx-date" className="text-slate-300">Date</Label>
                  <Input
                    id="tx-date"
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tx-agent" className="text-slate-300">Representative Agent</Label>
                  <Select value={txAgentId} onValueChange={setTxAgentId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 mt-1">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tx-client" className="text-slate-300">Client Name</Label>
                  <Input
                    id="tx-client"
                    value={txClient}
                    onChange={(e) => setTxClient(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label htmlFor="tx-project" className="text-slate-300">Project / Building</Label>
                  <Input
                    id="tx-project"
                    placeholder="e.g. Garden Studio Residence"
                    value={txProject}
                    onChange={(e) => setTxProject(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tx-type" className="text-slate-300">Unit / Loft #</Label>
                  <Input
                    id="tx-type"
                    placeholder="e.g. #102"
                    value={txUnitType}
                    onChange={(e) => setTxUnitType(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="tx-partner" className="text-slate-300">Partner Agency</Label>
                  <Input
                    id="tx-partner"
                    placeholder="e.g. Agency Co."
                    value={txPartner}
                    onChange={(e) => setTxPartner(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tx-price" className="text-slate-300">Price / Rent (€)</Label>
                  <Input
                    id="tx-price"
                    type="number"
                    value={txPrice}
                    onChange={(e) => setTxPrice(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tx-rate" className="text-slate-300">Commission Rate</Label>
                  {txDealType === "RENT" ? (
                    <div className="bg-slate-950 border border-slate-800 text-slate-400 py-2 px-3 rounded-lg text-sm font-semibold mt-1">
                      50%
                    </div>
                  ) : (
                    <Select value={txRate} onValueChange={setTxRate}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 mt-1">
                        <SelectValue placeholder="Select Rate" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="0.01">1.0%</SelectItem>
                        <SelectItem value="0.015">1.5%</SelectItem>
                        <SelectItem value="0.02">2.0%</SelectItem>
                        <SelectItem value="0.025">2.5%</SelectItem>
                        <SelectItem value="0.05">5.0%</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {txRate === "custom" && txDealType === "SALE" && (
                <div>
                  <Label htmlFor="tx-custom-rate" className="text-slate-300">Enter custom decimal rate (e.g. 0.03 for 3%)</Label>
                  <Input
                    id="tx-custom-rate"
                    placeholder="0.03"
                    value={txCustomRate}
                    onChange={(e) => setTxCustomRate(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tx-status" className="text-slate-300">Payment Status</Label>
                <Select value={txStatus} onValueChange={setTxStatus}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 mt-1">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                    <SelectItem value="PAID">PAID (Settled)</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">PARTIALLY PAID (Deposit)</SelectItem>
                    <SelectItem value="UNPAID">UNPAID (Pending)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTxDialogOpen(false)} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button type="submit" className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold">
                {editingTx ? "Update Deal" : "Save Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Payment Dialog */}
      <Dialog open={pmtDialogOpen} onOpenChange={setPmtDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <form onSubmit={handleSavePmt} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-white">{editingPmt ? "Edit Payment Record" : "Log Treasury Payment"}</DialogTitle>
              <DialogDescription className="text-slate-400">Record a payout, salary, or expense remuneration paid to an agent.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pmt-agent" className="text-slate-300">Agent</Label>
                  <Select value={pmtAgentId} onValueChange={setPmtAgentId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 mt-1">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pmt-date" className="text-slate-300">Date Paid</Label>
                  <Input
                    id="pmt-date"
                    type="date"
                    value={pmtDate}
                    onChange={(e) => setPmtDate(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pmt-amount" className="text-slate-300">Amount (€)</Label>
                  <Input
                    id="pmt-amount"
                    type="number"
                    value={pmtAmount}
                    onChange={(e) => setPmtAmount(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pmt-type" className="text-slate-300">Payment Type</Label>
                  <Select value={pmtType} onValueChange={setPmtType}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="COMMISSION">Commission Payout</SelectItem>
                      <SelectItem value="SALARY">Base Salary</SelectItem>
                      <SelectItem value="RENT_ALLOWANCE">Rent Allowance</SelectItem>
                      <SelectItem value="BONUS">Bonus</SelectItem>
                      <SelectItem value="EXPENSE">Expense Remuneration</SelectItem>
                      <SelectItem value="DEDUCTION">Deduction (Negative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="pmt-memo" className="text-slate-300">Memo / Description</Label>
                <Input
                  id="pmt-memo"
                  placeholder="e.g. Garden Studio #102 Commission Payout"
                  value={pmtMemo}
                  onChange={(e) => setPmtMemo(e.target.value)}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-sky-500 text-slate-200 mt-1"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPmtDialogOpen(false)} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button type="submit" className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold">
                {editingPmt ? "Save Changes" : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
