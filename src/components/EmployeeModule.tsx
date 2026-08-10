import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  DollarSign,
  Search,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  FileSpreadsheet,
  Award,
  Calendar,
  Briefcase,
  UserCheck,
  UserX,
  Filter,
  Lock,
  Unlock,
  ChevronRight,
  TrendingUp,
  Percent,
  Receipt
} from "lucide-react";
import {
  Employee,
  EmployeeRole,
  EmployeeShiftType,
  EmployeePermissions,
  AttendanceRecord,
  CommissionRecord
} from "../types";

interface EmployeeModuleProps {
  employees: Employee[];
  onAddEmployee: (newEmp: Employee) => void;
  onUpdateEmployee: (updatedEmp: Employee) => void;
  attendance: AttendanceRecord[];
  onClockIn: (employeeId: string, pin: string, notes?: string) => boolean;
  onClockOut: (attendanceId: string) => void;
  commissions: CommissionRecord[];
  onPayCommission: (commissionId: string) => void;
}

const DEFAULT_PERMISSIONS_BY_ROLE: Record<EmployeeRole, EmployeePermissions> = {
  Kasir: {
    canAccessPOS: true,
    canVoidOrder: false,
    canGiveDiscount: false,
    canViewReports: false,
    canManageStock: false,
    canManageEmployees: false,
    canChangeMenuPrice: false,
    canApprovePO: false
  },
  Waiter: {
    canAccessPOS: true,
    canVoidOrder: false,
    canGiveDiscount: false,
    canViewReports: false,
    canManageStock: false,
    canManageEmployees: false,
    canChangeMenuPrice: false,
    canApprovePO: false
  },
  Kitchen: {
    canAccessPOS: false,
    canVoidOrder: false,
    canGiveDiscount: false,
    canViewReports: false,
    canManageStock: true,
    canManageEmployees: false,
    canChangeMenuPrice: false,
    canApprovePO: false
  },
  Supervisor: {
    canAccessPOS: true,
    canVoidOrder: true,
    canGiveDiscount: true,
    canViewReports: true,
    canManageStock: true,
    canManageEmployees: false,
    canChangeMenuPrice: false,
    canApprovePO: false
  },
  Manager: {
    canAccessPOS: true,
    canVoidOrder: true,
    canGiveDiscount: true,
    canViewReports: true,
    canManageStock: true,
    canManageEmployees: true,
    canChangeMenuPrice: true,
    canApprovePO: true
  },
  Owner: {
    canAccessPOS: true,
    canVoidOrder: true,
    canGiveDiscount: true,
    canViewReports: true,
    canManageStock: true,
    canManageEmployees: true,
    canChangeMenuPrice: true,
    canApprovePO: true
  }
};

export const EmployeeModule: React.FC<EmployeeModuleProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  attendance,
  onClockIn,
  onClockOut,
  commissions,
  onPayCommission
}) => {
  const [activeTab, setActiveTab] = useState<
    "karyawan" | "hak_akses" | "shift" | "absensi" | "komisi"
  >("karyawan");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Clock In Form
  const [selectedEmpIdForClockIn, setSelectedEmpIdForClockIn] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [clockInNotes, setClockInNotes] = useState("");
  const [clockInError, setClockInError] = useState("");

  // New Employee Form
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState<EmployeeRole>("Kasir");
  const [empPhone, setEmpPhone] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empShift, setEmpShift] = useState<EmployeeShiftType>(
    "Shift Pagi (08:00 - 16:00)"
  );
  const [empBaseSalary, setEmpBaseSalary] = useState<number>(4000000);
  const [empCommissionRate, setEmpCommissionRate] = useState<number>(1.0);
  const [empPinCode, setEmpPinCode] = useState<string>("1234");
  const [empPermissions, setEmpPermissions] = useState<EmployeePermissions>(
    DEFAULT_PERMISSIONS_BY_ROLE["Kasir"]
  );

  const handleRoleChangeInForm = (role: EmployeeRole) => {
    setEmpRole(role);
    setEmpPermissions(DEFAULT_PERMISSIONS_BY_ROLE[role]);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empPhone) return;

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        name: empName,
        role: empRole,
        phone: empPhone,
        email: empEmail,
        shift: empShift,
        baseSalary: Number(empBaseSalary),
        commissionRatePercent: Number(empCommissionRate),
        pinCode: empPinCode,
        permissions: empPermissions
      };
      onUpdateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        nip: `EMP-2026-${(employees.length + 1).toString().padStart(3, "0")}`,
        name: empName,
        role: empRole,
        phone: empPhone,
        email: empEmail || `${empName.toLowerCase().replace(/\s+/g, ".")}@saungpasundan.id`,
        joinDate: new Date().toISOString().substring(0, 10),
        status: "Aktif",
        shift: empShift,
        baseSalary: Number(empBaseSalary),
        commissionRatePercent: Number(empCommissionRate),
        pinCode: empPinCode || "1234",
        permissions: empPermissions
      };
      onAddEmployee(newEmp);
    }

    setIsAddModalOpen(false);
    setEditingEmployee(null);
    resetForm();
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpPhone(emp.phone);
    setEmpEmail(emp.email);
    setEmpShift(emp.shift);
    setEmpBaseSalary(emp.baseSalary);
    setEmpCommissionRate(emp.commissionRatePercent);
    setEmpPinCode(emp.pinCode);
    setEmpPermissions(emp.permissions);
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setEmpName("");
    setEmpRole("Kasir");
    setEmpPhone("");
    setEmpEmail("");
    setEmpShift("Shift Pagi (08:00 - 16:00)");
    setEmpBaseSalary(4000000);
    setEmpCommissionRate(1.0);
    setEmpPinCode("1234");
    setEmpPermissions(DEFAULT_PERMISSIONS_BY_ROLE["Kasir"]);
  };

  const handleClockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClockInError("");
    if (!selectedEmpIdForClockIn || !inputPin) {
      setClockInError("Pilih karyawan dan masukkan PIN 4 digit!");
      return;
    }

    const ok = onClockIn(selectedEmpIdForClockIn, inputPin, clockInNotes);
    if (ok) {
      setIsClockInModalOpen(false);
      setSelectedEmpIdForClockIn("");
      setInputPin("");
      setClockInNotes("");
    } else {
      setClockInError("PIN Salah! Silakan periksa PIN Karyawan.");
    }
  };

  // Filtered Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery);
    const matchesRole = roleFilter === "All" || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const activeEmployeesCount = employees.filter((e) => e.status === "Aktif").length;
  const todayAttendanceCount = attendance.filter(
    (a) => a.date === new Date().toISOString().substring(0, 10)
  ).length;
  const totalCommissionPending = commissions
    .filter((c) => c.status === "Pending")
    .reduce((sum, c) => sum + c.commissionAmount + c.tipsAmount + c.bonusAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-100 font-serif tracking-tight">
                Manajemen Karyawan, Shift & Hak Akses
              </h1>
              <p className="text-xs text-stone-400">
                Kasir, Waiter, Kitchen, SPV, Manager, Owner • Absensi PIN, Shift Kerja, & Perhitungan Komisi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <button
            onClick={() => setIsClockInModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-lg"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In / Absensi PIN</span>
          </button>

          <button
            onClick={() => {
              setEditingEmployee(null);
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Total Karyawan Aktif</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">{activeEmployeesCount} Staf</p>
          <span className="text-[11px] text-stone-400 mt-1 block">Kasir, Waiter, Dapur, Mgt</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Hadir Absensi Hari Ini</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{todayAttendanceCount} Orang</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Sudah Clock In</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Komisi Unpaid / Pending</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400">
            Rp {totalCommissionPending.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-stone-400 mt-1 block">Siap Dicairkan</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Proteksi PIN System</span>
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">Aktif (6 Role)</p>
          <span className="text-[11px] text-stone-400 mt-1 block">Level Otorisasi POS</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("karyawan")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "karyawan"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Tim & Karyawan ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hak_akses")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "hak_akses"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Matriks Hak Akses Role</span>
          </button>

          <button
            onClick={() => setActiveTab("shift")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "shift"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jadwal Shift Kerja</span>
          </button>

          <button
            onClick={() => setActiveTab("absensi")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "absensi"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Rekap Absensi ({attendance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("komisi")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "komisi"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Komisi Sales & Tips</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DATA KARYAWAN */}
      {activeTab === "karyawan" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
              <input
                type="text"
                placeholder="Cari Nama Karyawan, NIP, No HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="All">Semua Jabatan / Role</option>
                <option value="Kasir">Kasir</option>
                <option value="Waiter">Waiter / Pramusaji</option>
                <option value="Kitchen">Kitchen / Chef</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
                <option value="Owner">Owner</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 hover:border-stone-700 transition relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-bold text-lg shadow-md font-serif">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-100 text-sm">{emp.name}</h3>
                      <p className="text-[11px] text-stone-400 font-mono">{emp.nip}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      emp.role === "Owner"
                        ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                        : emp.role === "Manager"
                        ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                        : emp.role === "Supervisor"
                        ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                        : emp.role === "Kasir"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : emp.role === "Waiter"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-300 pt-1 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Shift Kerja:</span>
                    <span className="font-semibold text-stone-200">{emp.shift}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Gaji Pokok:</span>
                    <span className="font-bold text-emerald-400">
                      Rp {emp.baseSalary.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Rate Komisi Sales:</span>
                    <span className="font-bold text-amber-400">{emp.commissionRatePercent}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">No. Telp/WA:</span>
                    <span className="font-mono text-stone-300">{emp.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">PIN POS:</span>
                    <span className="font-mono text-amber-300 font-bold">•••• ({emp.pinCode})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs">
                  <span className="text-[11px] text-stone-500">Masuk: {emp.joinDate}</span>

                  <button
                    onClick={() => openEditModal(emp)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS HAK AKSES */}
      {activeTab === "hak_akses" && (
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-stone-100 font-serif">Struktur Otorisasi & Matriks RBAC (Role-Based Access Control)</h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Hirarki wewenang sistem SundaResto AI berbasis skema RBAC untuk menjamin keamanan & pemisahan tugas karyawan.
            </p>
          </div>

          {/* Visual Role Cards Tree */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. OWNER */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-300">1. OWNER</span>
                <span className="text-[10px] bg-amber-500 text-stone-950 px-2 py-0.5 rounded font-extrabold uppercase">Full Access</span>
              </div>
              <ul className="text-xs space-y-1.5 text-stone-200 font-medium">
                <li className="flex items-center gap-2 text-emerald-400 font-bold"><span>├──</span> <span>Everything (Akses Penuh)</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Finance (Laporan Keuangan & Laba Rugi)</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Reports (Analisa Omzet & Performa)</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>License (Kelola Lisensi Software)</span></li>
                <li className="flex items-center gap-2"><span>└──</span> <span>AI (SundaResto AI Pilot Advisor)</span></li>
              </ul>
            </div>

            {/* 2. MANAGER */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-300">2. MANAGER</span>
                <span className="text-[10px] bg-emerald-500 text-stone-950 px-2 py-0.5 rounded font-extrabold uppercase">Operational</span>
              </div>
              <ul className="text-xs space-y-1.5 text-stone-200 font-medium">
                <li className="flex items-center gap-2"><span>├──</span> <span>Dashboard Executive</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>POS Kasir & Meja</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Inventory & Reorder Level</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Employees (Kelola Karyawan)</span></li>
                <li className="flex items-center gap-2"><span>└──</span> <span>Reports (Laporan Penjualan)</span></li>
              </ul>
            </div>

            {/* 3. SUPERVISOR */}
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-sky-300">3. SUPERVISOR</span>
                <span className="text-[10px] bg-sky-500 text-stone-950 px-2 py-0.5 rounded font-extrabold uppercase">Shift Lead</span>
              </div>
              <ul className="text-xs space-y-1.5 text-stone-200 font-medium">
                <li className="flex items-center gap-2"><span>├──</span> <span>POS (Termasuk Void & Discount)</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Kitchen Display Monitor</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Inventory Check & Opname</span></li>
                <li className="flex items-center gap-2"><span>└──</span> <span>Shift (Jadwal Shift & Purchasing)</span></li>
              </ul>
            </div>

            {/* 4. CASHIER */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-purple-300">4. CASHIER / KASIR</span>
                <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-extrabold uppercase">Front Desk</span>
              </div>
              <ul className="text-xs space-y-1.5 text-stone-200 font-medium">
                <li className="flex items-center gap-2"><span>├──</span> <span>POS (Mesin Kasir Transaksi)</span></li>
                <li className="flex items-center gap-2"><span>└──</span> <span>Transactions (History Struk & QRIS)</span></li>
              </ul>
            </div>

            {/* 5. WAITER */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-300">5. WAITER / PRAMUSAJI</span>
                <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-extrabold uppercase">Service Staff</span>
              </div>
              <ul className="text-xs space-y-1.5 text-stone-200 font-medium">
                <li className="flex items-center gap-2"><span>├──</span> <span>Tables (Denah Saung & Status Meja)</span></li>
                <li className="flex items-center gap-2"><span>├──</span> <span>Orders (Catat Pesanan Pelanggan)</span></li>
                <li className="flex items-center gap-2"><span>└──</span> <span>Customer (CRM Info & Loyalty)</span></li>
              </ul>
            </div>

            {/* 6. KITCHEN */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-rose-300">6. KITCHEN / KOKI</span>
                <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded font-extrabold uppercase">Kitchen</span>
              </div>
              <ul className="text-xs space-y-1.5 text-stone-200 font-medium">
                <li className="flex items-center gap-2"><span>└──</span> <span>Kitchen Display (KDS Monitor Pesanan)</span></li>
              </ul>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase border-b border-stone-800">
                <tr>
                  <th className="p-4">Modul Utama</th>
                  <th className="p-4 text-center">Owner</th>
                  <th className="p-4 text-center">Manager</th>
                  <th className="p-4 text-center">Supervisor</th>
                  <th className="p-4 text-center">Cashier</th>
                  <th className="p-4 text-center">Waiter</th>
                  <th className="p-4 text-center">Kitchen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                <tr>
                  <td className="p-4 font-semibold text-stone-200">Executive Dashboard & Analytics</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">POS Billing & Kasir</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">Denah Saung & Active Orders</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">Kitchen Display System (KDS)</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">Inventory & Resep Ayam/Ikan</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">Purchasing & Shift Opname</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">Finance, Reports & Laba Rugi</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-stone-200">Software License & AI Pilot</td>
                  <td className="p-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                  <td className="p-4 text-center"><XCircle className="w-4 h-4 text-stone-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SHIFT KERJA */}
      {activeTab === "shift" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <h2 className="text-lg font-bold text-stone-100 font-serif">Pengaturan Master Shift Kerja Restoran</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-400 text-sm">Shift Pagi</h3>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">08:00 - 16:00</span>
                </div>
                <p className="text-stone-400">Persiapan bahan saung, kasir pagi, pesanan makan siang keluarga.</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sky-400 text-sm">Shift Siang / Sore</h3>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono">12:00 - 20:00</span>
                </div>
                <p className="text-stone-400">Jam padat reservasi sore & acara reuni / rombongan bus wisata.</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-indigo-400 text-sm">Shift Malam</h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">15:00 - 23:00</span>
                </div>
                <p className="text-stone-400">Makan malam lesehan, closing kasir & rekonsiliasi setoran harian.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <h3 className="font-bold text-stone-100 text-base font-serif">Jadwal Shift Staf Hari Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-100 text-sm">{emp.name}</div>
                    <div className="text-stone-400">{emp.role} • NIP: {emp.nip}</div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 font-semibold">
                    {emp.shift}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REKAP ABSENSI */}
      {activeTab === "absensi" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-100 font-serif">Log Absensi Kehadiran Karyawan</h2>
              <button
                onClick={() => setIsClockInModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-md transition"
              >
                + Simulasi Clock In PIN
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 font-bold uppercase border-b border-stone-800">
                  <tr>
                    <th className="p-4">Karyawan</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Jam Masuk (Clock In)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Catatan</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-stone-800/40 transition">
                      <td className="p-4 font-bold text-stone-100">{att.employeeName} ({att.role})</td>
                      <td className="p-4 text-stone-300">{att.date}</td>
                      <td className="p-4 font-mono font-bold text-amber-400">{att.clockIn} WIB</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            att.status === "Hadir"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-4 text-stone-400 italic">{att.notes || "-"}</td>
                      <td className="p-4 text-right">
                        {att.clockOut ? (
                          <span className="text-stone-500">Clock Out: {att.clockOut}</span>
                        ) : (
                          <button
                            onClick={() => onClockOut(att.id)}
                            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-rose-500/20 text-stone-300 hover:text-rose-400 font-semibold"
                          >
                            Clock Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KOMISI SALES & TIPS */}
      {activeTab === "komisi" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-100 font-serif">Perhitungan Komisi Sales & Tips Staf</h2>
              <p className="text-xs text-stone-400">Bonus target omzet penjualan & insentif kinerja saung lesehan</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-800">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 font-bold uppercase border-b border-stone-800">
                  <tr>
                    <th className="p-4">Nama Staf</th>
                    <th className="p-4">Periode</th>
                    <th className="p-4">Total Sales Diservis</th>
                    <th className="p-4">Rate (%)</th>
                    <th className="p-4">Nominal Komisi</th>
                    <th className="p-4">Tips & Bonus</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {commissions.map((c) => {
                    const totalTakeHome = c.commissionAmount + c.tipsAmount + c.bonusAmount;
                    return (
                      <tr key={c.id} className="hover:bg-stone-800/40 transition">
                        <td className="p-4 font-bold text-stone-100">{c.employeeName} ({c.role})</td>
                        <td className="p-4 text-stone-300">{c.period}</td>
                        <td className="p-4 font-semibold text-stone-200">
                          Rp {c.totalSalesGenerated.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 font-bold text-amber-400">{c.commissionRate}%</td>
                        <td className="p-4 font-bold text-emerald-400">
                          Rp {c.commissionAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 text-stone-300">
                          Rp {(c.tipsAmount + c.bonusAmount).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              c.status === "Lunas"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {c.status === "Pending" ? (
                            <button
                              onClick={() => onPayCommission(c.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition shadow-sm"
                            >
                              Cairkan Komisi (Rp {totalTakeHome.toLocaleString("id-ID")})
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-semibold">✓ Terbayar</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH / EDIT KARYAWAN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-stone-100 font-serif">
                {editingEmployee ? "Edit Data Karyawan" : "Pendaftaran Karyawan Baru"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Contoh: Bpk. Kang Dedi"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">Role / Jabatan *</label>
                  <select
                    value={empRole}
                    onChange={(e) => handleRoleChangeInForm(e.target.value as EmployeeRole)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Kasir">Kasir</option>
                    <option value="Waiter">Waiter / Pramusaji</option>
                    <option value="Kitchen">Kitchen / Chef</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Manager">Manager</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">PIN Rahasia POS (4-Digit) *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={empPinCode}
                    onChange={(e) => setEmpPinCode(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 font-mono text-center text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Pilihan Shift Kerja</label>
                  <select
                    value={empShift}
                    onChange={(e) => setEmpShift(e.target.value as EmployeeShiftType)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Shift Pagi (08:00 - 16:00)">Shift Pagi (08:00 - 16:00)</option>
                    <option value="Shift Siang/Sore (12:00 - 20:00)">Shift Siang/Sore (12:00 - 20:00)</option>
                    <option value="Shift Malam (15:00 - 23:00)">Shift Malam (15:00 - 23:00)</option>
                    <option value="Full Day (09:00 - 21:00)">Full Day (09:00 - 21:00)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    value={empBaseSalary}
                    onChange={(e) => setEmpBaseSalary(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-emerald-400 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-medium block mb-1">Rate Komisi Sales Penjualan (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={empCommissionRate}
                  onChange={(e) => setEmpCommissionRate(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-amber-400 font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SIMULASI CLOCK IN PIN */}
      {isClockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-stone-100 font-serif">Absensi Clock In (Mesin POS)</h3>
              </div>
              <button
                onClick={() => setIsClockInModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClockInSubmit} className="space-y-4 text-xs">
              {clockInError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-center">
                  {clockInError}
                </div>
              )}

              <div>
                <label className="text-stone-400 block mb-1">Pilih Nama Karyawan</label>
                <select
                  value={selectedEmpIdForClockIn}
                  onChange={(e) => setSelectedEmpIdForClockIn(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Nama Staf --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} - PIN: {emp.pinCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Masukkan PIN Rahasia Karyawan (4 Digit)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-center text-lg font-mono text-amber-400 font-bold tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Catatan Kehadiran (Opsional)</label>
                <input
                  type="text"
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  placeholder="Contoh: Tepat waktu, siap di kasir saung 1"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsClockInModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Verifikasi PIN & Clock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
