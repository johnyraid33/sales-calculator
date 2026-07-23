"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
  PlusCircle,
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
  totalExtraIncome: number;
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

interface ExtraIncome {
  id: string;
  date: string;
  amount: number;
  type: string; // "EXPENSE" | "SOCIAL_SECURITY" | "SALARY" | "RENT_ALLOWANCE" | "OTHER"
  memo: string | null;
  agentId: string | null;
  agent?: { name: string };
}

export default function Home() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [extraIncomes, setExtraIncomes] = useState<ExtraIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Extra Income Form States
  const [extraDialogOpen, setExtraDialogOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraIncome | null>(null);
  const [extraDate, setExtraDate] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [extraType, setExtraType] = useState("EXPENSE");
  const [extraMemo, setExtraMemo] = useState("");
  const [extraAgentId, setExtraAgentId] = useState("none");

  // Extra Income Filter States
  const [extraSearch, setExtraSearch] = useState("");
  const [extraTypeFilter, setExtraTypeFilter] = useState("ALL");
  const [extraAgentFilter, setExtraAgentFilter] = useState("ALL");

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
  const [txAgentId, setTxAgentId] = useState("none");

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
      const [resAgents, resTx, resPmt, resExtra] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/transactions"),
        fetch("/api/payments"),
        fetch("/api/extra-incomes"),
      ]);

      const dataAgents = await resAgents.json();
      const dataTx = await resTx.json();
      const dataPmt = await resPmt.json();
      const dataExtra = await resExtra.json();

      setAgents(dataAgents);
      setTransactions(dataTx);
      setPayments(dataPmt);
      setExtraIncomes(dataExtra);

      if (dataAgents.length > 0) {
        setPmtAgentId(dataAgents[0].id);
      }
      setTxAgentId("none");
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
      setTxAgentId(tx.agentId || "none");

      const ratePct = (tx.rate * 100).toString();
      if (["1", "1.5", "2", "2.5", "5", "50"].includes(ratePct)) {
        setTxRate((tx.rate).toString());
        setTxCustomRate("");
      } else {
        setTxRate("custom");
        setTxCustomRate((tx.rate * 100).toString());
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
      setTxAgentId("none");
    }
    setTxDialogOpen(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTx ? "PUT" : "POST";
    let finalRate;
    if (txDealType === "RENT") {
      finalRate = 0.50;
    } else if (txRate === "custom") {
      const cleanCustomRate = txCustomRate.replace(",", ".");
      finalRate = parseFloat(cleanCustomRate) / 100;
    } else {
      finalRate = parseFloat(txRate);
    }

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
          agentId: (txAgentId === "none" || !txAgentId) ? null : txAgentId,
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

  const handleOpenExtraDialog = (item: ExtraIncome | null = null) => {
    if (item) {
      setEditingExtra(item);
      setExtraDate(item.date.split("T")[0]);
      setExtraAmount(item.amount.toString());
      setExtraType(item.type);
      setExtraMemo(item.memo || "");
      setExtraAgentId(item.agentId || "none");
    } else {
      setEditingExtra(null);
      setExtraDate(new Date().toISOString().split("T")[0]);
      setExtraAmount("");
      setExtraType("EXPENSE");
      setExtraMemo("");
      setExtraAgentId("none");
    }
    setExtraDialogOpen(true);
  };

  const handleSaveExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingExtra ? "PUT" : "POST";

    try {
      const response = await fetch("/api/extra-incomes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingExtra?.id,
          date: extraDate,
          amount: extraAmount,
          type: extraType,
          memo: extraMemo || null,
          agentId: extraAgentId === "none" ? null : extraAgentId,
        }),
      });

      if (response.ok) {
        setExtraDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to save claim");
      }
    } catch (error) {
      console.error("Error saving claim:", error);
    }
  };

  const handleDeleteExtra = async (id: string) => {
    if (!confirm("Are you sure you want to delete this claim?")) return;

    try {
      const response = await fetch(`/api/extra-incomes?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting claim:", error);
    }
  };


  // Calculations
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatPct = (val: number) => {
    const pctVal = Number((val * 100).toFixed(6));
    return `${pctVal}%`;
  };

  const totalSalesVolume = transactions
    .filter((t) => t.dealType === "SALE")
    .reduce((sum, t) => sum + t.price, 0);

  const totalCommissionsDue = transactions.reduce((sum, t) => sum + t.commission, 0);

  const totalExtraIncomeDue = extraIncomes.reduce((sum, item) => sum + item.amount, 0);

  const totalPaymentsMade = payments.reduce((sum, p) => {
    return sum + p.amount;
  }, 0);

  const outstandingBalance = totalCommissionsDue + totalExtraIncomeDue - totalPaymentsMade;

  // Group by Month for Charts & Reconciliation
  const getMonthlyBreakdown = () => {
    const months: { [key: string]: { sales: number; commission: number; paid: number; rentAllow: number; extra: number } } = {};

    // Group transactions
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { sales: 0, commission: 0, paid: 0, rentAllow: 0, extra: 0 };
      }
      if (tx.dealType === "SALE") {
        months[key].sales += tx.price;
      }
      months[key].commission += tx.commission;
    });

    // Group extra incomes
    extraIncomes.forEach((item) => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { sales: 0, commission: 0, paid: 0, rentAllow: 0, extra: 0 };
      }
      months[key].extra += item.amount;
    });

    // Group payments
    payments.forEach((p) => {
      const date = new Date(p.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) {
        months[key] = { sales: 0, commission: 0, paid: 0, rentAllow: 0, extra: 0 };
      }
      if (p.type === "RENT_ALLOWANCE") {
        months[key].rentAllow += p.amount;
      }
      // Both payouts and deductions reduce the remaining balance (variance)
      months[key].paid += p.amount;
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
          extra: months[key].extra,
          variance: (months[key].commission + months[key].extra) - months[key].paid,
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

  const filteredExtra = extraIncomes.filter((item) => {
    const matchesSearch =
      (item.memo && item.memo.toLowerCase().includes(extraSearch.toLowerCase())) ||
      item.type.toLowerCase().includes(extraSearch.toLowerCase());

    const matchesType = extraTypeFilter === "ALL" || item.type === extraTypeFilter;
    const matchesAgent =
      extraAgentFilter === "ALL"
        ? true
        : extraAgentFilter === "none"
        ? item.agentId === null || item.agentId === "none"
        : item.agentId === extraAgentFilter;

    return matchesSearch && matchesType && matchesAgent;
  });

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r bg-card p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground font-bold">AN</div>
            <div>
              <h2 className="font-semibold text-lg leading-tight text-foreground">Ark Noah</h2>
              <span className="text-xs text-muted-foreground">Sales & Rent Engine</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: HomeIcon },
              { id: "transactions", label: "Transactions", icon: Layers },
              { id: "extraIncomes", label: "Extra Dues & Claims", icon: PlusCircle },
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
                      ? "bg-accent text-accent-foreground border-l-2 border-primary pl-2.5"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <div className="text-[10px] text-muted-foreground">
            <p>© 2026 Ark Noah Holdings</p>
            <p className="mt-1">Version 1.0.0 (Prisma SQLite)</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header summary row */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground capitalize">
              {activeTab === "extraIncomes" ? "Extra Dues & Claims" : activeTab}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "dashboard" && "Sales volumes, commissions, and agent payment breakdown"}
              {activeTab === "transactions" && "Log of client property transactions"}
              {activeTab === "extraIncomes" && "Log extra agent income, expenses, and social security claims"}
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
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Reload
            </Button>

            {activeTab === "transactions" && (
              <Button size="sm" onClick={() => handleOpenTxDialog()}>
                <Plus className="w-4 h-4 mr-2" /> New Deal
              </Button>
            )}

            {activeTab === "extraIncomes" && (
              <Button size="sm" onClick={() => handleOpenExtraDialog()}>
                <Plus className="w-4 h-4 mr-2" /> Log Claim
              </Button>
            )}

            {activeTab === "payments" && (
              <Button size="sm" onClick={() => handleOpenPmtDialog()}>
                <Plus className="w-4 h-4 mr-2" /> Log Payment
              </Button>
            )}

            {activeTab === "agents" && (
              <Button size="sm" onClick={() => handleOpenAgentDialog()}>
                <UserPlus className="w-4 h-4 mr-2" /> Add Agent
              </Button>
            )}
          </div>
        </header>

        {/* Global Summary Cards - only on Dashboard and Reconciliation */}
        {(activeTab === "dashboard" || activeTab === "reconciliation") && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales Volume</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSalesVolume)}</div>
                <p className="text-xs text-muted-foreground mt-1">Excludes rentals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commissions Due</CardTitle>
                <Percent className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommissionsDue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Sales + Rental commissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Extra Income / Claims</CardTitle>
                <PlusCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExtraIncomeDue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Expenses, social security, etc.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Receipts Paid</CardTitle>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPaymentsMade)}</div>
                <p className="text-xs text-muted-foreground mt-1">Deductions factored in</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Variance Balance</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {outstandingBalance >= 0 ? "Outstanding due to agent" : "Agent overpaid"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dynamic Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground text-sm">Querying database...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* SVG Chart */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <CardTitle className="text-lg">Monthly Commission Dues vs Receipts Paid</CardTitle>
                      <CardDescription>Performance and payment variance over time</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-[var(--chart-1)] rounded"></span>
                        <span>Commission Due</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-[var(--chart-2)] rounded"></span>
                        <span>Receipts Paid</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Container */}
                  <div className="h-64 w-full relative">
                    {monthlyData.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No chart data available</div>
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
                              stroke="var(--border)"
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
                                  fill="var(--chart-1)"
                                  rx="2"
                                  className="transition-all duration-300 hover:opacity-80"
                                />

                                {/* Paid Bar */}
                                <rect
                                  x={xBase + barWidth / 2 + 2}
                                  y={yPaid}
                                  width={barWidth}
                                  height={paidHeight}
                                  fill="var(--chart-2)"
                                  rx="2"
                                  className="transition-all duration-300 hover:opacity-80"
                                />

                                {/* X Label */}
                                <text
                                  x={xBase}
                                  y="222"
                                  fill="currentColor"
                                  className="fill-muted-foreground"
                                  fontSize="9"
                                  textAnchor="end"
                                  transform={`rotate(-35, ${xBase}, 222)`}
                                >
                                  {data.label.replace(/ (\d{2})(\d{2})/, " '$2")}
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
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Agent Balances</CardTitle>
                      <CardDescription>Total commissions due vs actual payments by representative</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>                           <TableRow>
                            <TableHead>Representative</TableHead>
                            <TableHead className="text-right">Commission Due</TableHead>
                            <TableHead className="text-right">Extra Dues</TableHead>
                            <TableHead className="text-right">Paid to Agent</TableHead>
                            <TableHead className="text-right">Net Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agents.map((agent) => (
                            <TableRow key={agent.id}>
                              <TableCell className="font-medium">{agent.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(agent.totalCommissionDue)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(agent.totalExtraIncome)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(agent.totalPaid)}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${agent.balance >= 0 ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"}`}>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Deals</CardTitle>
                      <CardDescription>Last property sales and rents logged</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-semibold truncate max-w-[150px]">{tx.client}</p>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              {tx.dealType === "SALE" ? (
                                <Badge variant="secondary" className="py-0 px-1.5 text-[9px]">Sale</Badge>
                              ) : (
                                <Badge variant="outline" className="py-0 px-1.5 text-[9px]">Rent</Badge>
                              )}
                              <span>{tx.project || "Direct"}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(tx.price)}</p>
                            <span className="text-[11px] text-muted-foreground">Com. {formatCurrency(tx.commission)}</span>
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
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search client, project, partner..."
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="pl-9 bg-background border-input text-foreground placeholder-muted-foreground focus-visible:ring-ring"
                      />
                    </div>

                    <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                      <SelectTrigger className="w-36 bg-background border-input text-foreground">
                        <SelectValue placeholder="Deal Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="ALL">All Deals</SelectItem>
                        <SelectItem value="SALE">Sales only</SelectItem>
                        <SelectItem value="RENT">Rentals only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={txAgentFilter} onValueChange={setTxAgentFilter}>
                      <SelectTrigger className="w-40 bg-background border-input text-foreground">
                        <SelectValue placeholder="Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="ALL">All Agents</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium">
                    Showing {filteredTx.length} of {transactions.length} entries
                  </span>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Client / Property</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Rate</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTx.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {new Date(tx.date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {tx.agent?.name || "Direct"}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{tx.client}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {tx.project ? `${tx.project}` : ""} {tx.type ? `(${tx.type})` : ""}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            {tx.dealType === "SALE" ? (
                              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 text-[10px] py-0.5 px-2 font-semibold">
                                Sale
                              </Badge>
                            ) : (
                              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 text-[10px] py-0.5 px-2 font-semibold">
                                Rent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(tx.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {formatPct(tx.rate)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(tx.commission)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                tx.paymentStatus === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : tx.paymentStatus === "PARTIALLY_PAID"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20"
                                  : "bg-muted text-muted-foreground"
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
                              className="w-8 h-8"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTx(tx.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-8 h-8"
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

            {/* EXTRA INCOMES / CLAIMS TAB */}
            {activeTab === "extraIncomes" && (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search memo / comments..."
                        value={extraSearch}
                        onChange={(e) => setExtraSearch(e.target.value)}
                        className="pl-9 bg-background border-input text-foreground placeholder-muted-foreground focus-visible:ring-ring"
                      />
                    </div>

                    <Select value={extraTypeFilter} onValueChange={setExtraTypeFilter}>
                      <SelectTrigger className="w-40 bg-background border-input text-foreground">
                        <SelectValue placeholder="Claim Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="EXPENSE">Expense Reimbursement</SelectItem>
                        <SelectItem value="SOCIAL_SECURITY">Social Security</SelectItem>
                        <SelectItem value="SALARY">Salary Claim</SelectItem>
                        <SelectItem value="RENT_ALLOWANCE">Rent Allowance</SelectItem>
                        <SelectItem value="OTHER">Other Claim</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={extraAgentFilter} onValueChange={setExtraAgentFilter}>
                      <SelectTrigger className="w-40 bg-background border-input text-foreground">
                        <SelectValue placeholder="Agent / Direct" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="ALL">All Agents / Direct</SelectItem>
                        <SelectItem value="none">Direct (No Agent)</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium">
                    Showing {filteredExtra.length} of {extraIncomes.length} entries
                  </span>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Agent / Direct</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Memo / Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExtra.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No extra dues or claims logged.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExtra.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {new Date(item.date).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {item.agent?.name || "Direct (Company)"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  item.type === "EXPENSE"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                                    : item.type === "SOCIAL_SECURITY"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    : item.type === "SALARY"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : item.type === "RENT_ALLOWANCE"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {item.type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="italic max-w-sm truncate">
                              {item.memo || "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-amber-600 dark:text-amber-500">
                              +{formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-right space-x-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenExtraDialog(item)}
                                className="w-8 h-8"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteExtra(item.id)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive w-8 h-8"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* 3. PAYMENTS TAB */}
            {activeTab === "payments" && (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search memo / comments..."
                        value={pmtSearch}
                        onChange={(e) => setPmtSearch(e.target.value)}
                        className="pl-9 bg-background border-input text-foreground placeholder-muted-foreground focus-visible:ring-ring"
                      />
                    </div>

                    <Select value={pmtTypeFilter} onValueChange={setPmtTypeFilter}>
                      <SelectTrigger className="w-40 bg-background border-input text-foreground">
                        <SelectValue placeholder="Payment Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
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
                      <SelectTrigger className="w-40 bg-background border-input text-foreground">
                        <SelectValue placeholder="Agent" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="ALL">All Agents</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium">
                    Showing {filteredPmt.length} of {payments.length} entries
                  </span>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Memo / Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPmt.map((pmt) => {
                        const isDeduction = pmt.type === "DEDUCTION";
                        return (
                          <TableRow key={pmt.id}>
                            <TableCell>
                              {new Date(pmt.date).toLocaleDateString("en-GB")}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {pmt.agent?.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  pmt.type === "COMMISSION"
                                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                    : pmt.type === "SALARY"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : pmt.type === "RENT_ALLOWANCE"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    : pmt.type === "BONUS"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : pmt.type === "DEDUCTION"
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {pmt.type.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="italic max-w-sm truncate">
                              {pmt.memo || "—"}
                            </TableCell>
                            <TableCell className={`text-right font-bold ${isDeduction ? "text-red-600 dark:text-red-400" : ""}`}>
                              {isDeduction ? "-" : ""}{formatCurrency(pmt.amount)}
                            </TableCell>
                            <TableCell className="text-right space-x-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenPmtDialog(pmt)}
                                className="w-8 h-8"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePmt(pmt.id)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive w-8 h-8"
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
                  <Card key={agent.id} className="flex flex-col justify-between">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold">{agent.name}</CardTitle>
                          <CardDescription className="mt-1">{agent.email || "No email"}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          {agent.phone || "No phone"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                      <div className="grid grid-cols-3 gap-2 text-xs border-y py-3">
                        <div>
                          <p className="text-muted-foreground">Base Salary</p>
                          <p className="font-semibold mt-0.5">{formatCurrency(agent.baseSalary)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rent Allowance</p>
                          <p className="font-semibold mt-0.5">{formatCurrency(agent.rentAllowance)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Social Sec.</p>
                          <p className="font-semibold mt-0.5">{formatCurrency(agent.socialSecurity)}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm pt-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commissions Due:</span>
                          <span className="font-semibold">{formatCurrency(agent.totalCommissionDue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Paid:</span>
                          <span className="font-semibold">{formatCurrency(agent.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Due Balance:</span>
                          <span className={`font-bold ${agent.balance >= 0 ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"}`}>
                            {formatCurrency(agent.balance)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="border-t px-6 py-4 flex justify-end gap-2 bg-muted/20">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenAgentDialog(agent)}>
                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Settings
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAgent(agent.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* 5. RECONCILIATION TAB */}
            {activeTab === "reconciliation" && (
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-base font-semibold">Monthly Reconciliation Summary</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">Variance report matching sales pipeline commission against treasury payouts.</p>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Commissions Due</TableHead>
                        <TableHead className="text-right">Extra Dues</TableHead>
                        <TableHead className="text-right">Receipts Paid</TableHead>
                        <TableHead className="text-right">Variance</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((data) => {
                        const isUnderpaid = data.variance > 0;
                        const isOverpaid = data.variance < 0;
                        const isPerfect = Math.abs(data.variance) < 1;

                        return (
                          <TableRow key={data.monthKey}>
                            <TableCell className="font-semibold">{data.label}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(data.commission)}</TableCell>
                            <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">+{formatCurrency(data.extra)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(data.paid)}</TableCell>
                            <TableCell className={`text-right font-bold ${isUnderpaid ? "text-amber-600 dark:text-amber-500" : isOverpaid ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"}`}>
                              {isUnderpaid ? "+" : ""}{formatCurrency(data.variance)}
                            </TableCell>
                            <TableCell className="text-center">
                              {isPerfect ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-0.5 px-2">
                                  Settled
                                </Badge>
                              ) : isUnderpaid ? (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 py-0.5 px-2">
                                  Due to Agent
                                </Badge>
                              ) : (
                                <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 py-0.5 px-2">
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
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveAgent} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit Agent Settings" : "Add New Agent"}</DialogTitle>
              <DialogDescription>Configure base monthly metrics for agent remuneration calculations.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label htmlFor="agent-name">Name</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="agent-email">Email</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    value={agentEmail}
                    onChange={(e) => setAgentEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-phone">Phone</Label>
                  <Input
                    id="agent-phone"
                    value={agentPhone}
                    onChange={(e) => setAgentPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="agent-salary">Base Salary</Label>
                  <Input
                    id="agent-salary"
                    type="number"
                    value={agentBaseSalary}
                    onChange={(e) => setAgentBaseSalary(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-allowance">Rent Allowance</Label>
                  <Input
                    id="agent-allowance"
                    type="number"
                    value={agentRentAllowance}
                    onChange={(e) => setAgentRentAllowance(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-soc">Social Security</Label>
                  <Input
                    id="agent-soc"
                    type="number"
                    value={agentSocialSecurity}
                    onChange={(e) => setAgentSocialSecurity(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAgentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAgent ? "Save Changes" : "Create Agent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Transaction Dialog */}
      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSaveTx} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingTx ? "Edit Deal Details" : "Log New Property Deal"}</DialogTitle>
              <DialogDescription>Save a property sale or rent deal. Commission calculations are handled automatically.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tx-deal-type">Deal Type</Label>
                  <Select value={txDealType} onValueChange={(val) => {
                    setTxDealType(val);
                    // Autofill rent rate to 50%
                    if (val === "RENT") {
                      setTxRate("0.50");
                    } else {
                      setTxRate("0.01");
                    }
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Deal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALE">Sale</SelectItem>
                      <SelectItem value="RENT">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tx-date">Date</Label>
                  <Input
                    id="tx-date"
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tx-agent">Representative Agent</Label>
                  <Select value={txAgentId} onValueChange={setTxAgentId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Direct Deal)</SelectItem>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tx-client">Client Name</Label>
                  <Input
                    id="tx-client"
                    value={txClient}
                    onChange={(e) => setTxClient(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label htmlFor="tx-project">Project / Building</Label>
                  <Input
                    id="tx-project"
                    placeholder="e.g. Garden Studio Residence"
                    value={txProject}
                    onChange={(e) => setTxProject(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tx-type">Unit / Loft #</Label>
                  <Input
                    id="tx-type"
                    placeholder="e.g. #102"
                    value={txUnitType}
                    onChange={(e) => setTxUnitType(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="tx-partner">Partner Agency</Label>
                  <Input
                    id="tx-partner"
                    placeholder="e.g. Agency Co."
                    value={txPartner}
                    onChange={(e) => setTxPartner(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tx-price">Price / Rent (€)</Label>
                  <Input
                    id="tx-price"
                    type="number"
                    value={txPrice}
                    onChange={(e) => setTxPrice(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tx-rate">Commission Rate</Label>
                  {txDealType === "RENT" ? (
                    <div className="bg-muted text-muted-foreground py-2 px-3 rounded-lg text-sm font-semibold mt-1">
                      50%
                    </div>
                  ) : (
                    <Select value={txRate} onValueChange={setTxRate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Rate" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <Label htmlFor="tx-custom-rate">Enter custom percentage (e.g. 2.439024 for 2.439024%)</Label>
                  <Input
                    id="tx-custom-rate"
                    placeholder="2.439024"
                    value={txCustomRate}
                    onChange={(e) => setTxCustomRate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tx-status">Payment Status</Label>
                <Select value={txStatus} onValueChange={setTxStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">PAID (Settled)</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">PARTIALLY PAID (Deposit)</SelectItem>
                    <SelectItem value="UNPAID">UNPAID (Pending)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTxDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTx ? "Update Deal" : "Save Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Payment Dialog */}
      <Dialog open={pmtDialogOpen} onOpenChange={setPmtDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSavePmt} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingPmt ? "Edit Payment Record" : "Log Treasury Payment"}</DialogTitle>
              <DialogDescription>Record a payout, salary, or expense remuneration paid to an agent.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pmt-agent">Agent</Label>
                  <Select value={pmtAgentId} onValueChange={setPmtAgentId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pmt-date">Date Paid</Label>
                  <Input
                    id="pmt-date"
                    type="date"
                    value={pmtDate}
                    onChange={(e) => setPmtDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pmt-amount">Amount (€)</Label>
                  <Input
                    id="pmt-amount"
                    type="number"
                    value={pmtAmount}
                    onChange={(e) => setPmtAmount(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pmt-type">Payment Type</Label>
                  <Select value={pmtType} onValueChange={setPmtType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
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
                <Label htmlFor="pmt-memo">Memo / Description</Label>
                <Input
                  id="pmt-memo"
                  placeholder="e.g. Garden Studio #102 Commission Payout"
                  value={pmtMemo}
                  onChange={(e) => setPmtMemo(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPmtDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPmt ? "Save Changes" : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extra Income / Claim Dialog */}
      <Dialog open={extraDialogOpen} onOpenChange={setExtraDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveExtra} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingExtra ? "Edit Extra Due / Claim" : "Log Extra Due / Claim"}</DialogTitle>
              <DialogDescription>Record a custom expense reimbursement, social security, or other due to be factored into receivables.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="extra-agent">Agent / Direct</Label>
                  <Select value={extraAgentId} onValueChange={setExtraAgentId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Agent / Direct" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Direct Deal (No Agent)</SelectItem>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="extra-date">Date Logged</Label>
                  <Input
                    id="extra-date"
                    type="date"
                    value={extraDate}
                    onChange={(e) => setExtraDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="extra-amount">Amount (€)</Label>
                  <Input
                    id="extra-amount"
                    type="number"
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="extra-type">Claim Type</Label>
                  <Select value={extraType} onValueChange={setExtraType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense Reimbursement</SelectItem>
                      <SelectItem value="SOCIAL_SECURITY">Social Security</SelectItem>
                      <SelectItem value="SALARY">Salary Claim</SelectItem>
                      <SelectItem value="RENT_ALLOWANCE">Rent Allowance</SelectItem>
                      <SelectItem value="OTHER">Other Claim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="extra-memo">Memo / Description</Label>
                <Input
                  id="extra-memo"
                  placeholder="e.g. Travel tickets reimbursement"
                  value={extraMemo}
                  onChange={(e) => setExtraMemo(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setExtraDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingExtra ? "Save Changes" : "Log Claim"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
