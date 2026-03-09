"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Bot,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Truck,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

const kpiCards = [
  {
    title: "Mai bevétel",
    value: "187 500 Ft",
    change: "+12%",
    isUp: true,
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    desc: "tegnaphox képest",
  },
  {
    title: "Mai rendelések",
    value: "12",
    change: "+15%",
    isUp: true,
    icon: ShoppingCart,
    color: "text-primary",
    bg: "bg-primary/10",
    desc: "tegnaphox képest",
  },
  {
    title: "Aktív felhasználók",
    value: "342",
    change: "+8%",
    isUp: true,
    icon: Users,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/10",
    desc: "ma az oldalon",
  },
  {
    title: "Készlethiány",
    value: "3",
    change: null,
    isUp: false,
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    desc: "termék figyelmet igényel",
  },
];

const revenueData = [
  { day: "H", value: 98000 },
  { day: "K", value: 125000 },
  { day: "Sz", value: 89000 },
  { day: "Cs", value: 142000 },
  { day: "P", value: 168000 },
  { day: "Szo", value: 115000 },
  { day: "V", value: 108500 },
];

const recentOrders = [
  { id: "BO-ABC123", customer: "Kovács János", total: 13980, status: "DELIVERED", date: "márc. 5." },
  { id: "BO-DEF456", customer: "Nagy Anna", total: 91480, status: "SHIPPED", date: "márc. 7." },
  { id: "BO-GHI789", customer: "Szabó Péter", total: 10980, status: "PENDING", date: "márc. 8." },
  { id: "BO-JKL012", customer: "Tóth Eszter", total: 45990, status: "CONFIRMED", date: "márc. 8." },
  { id: "BO-MNO345", customer: "Horváth Márk", total: 27990, status: "SHIPPED", date: "márc. 7." },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { label: "Függőben", icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
  CONFIRMED: { label: "Megerősítve", icon: CheckCircle, color: "text-blue-700", bg: "bg-blue-50" },
  SHIPPED: { label: "Szállítva", icon: Truck, color: "text-purple-700", bg: "bg-purple-50" },
  DELIVERED: { label: "Kézbesítve", icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
};

const aiAgents = [
  { name: "Rendelésfeldolgozó", status: "active", lastRun: "10:32", tasks: 12, color: "bg-primary" },
  { name: "Termékleírás AI", status: "active", lastRun: "09:15", tasks: 8, color: "bg-brand-cyan" },
  { name: "Blog generáló", status: "active", lastRun: "08:00", tasks: 3, color: "bg-brand-pink" },
  { name: "Social media", status: "active", lastRun: "11:45", tasks: 5, color: "bg-accent" },
];

const topProducts = [
  { name: "FreeON Fantasy 3in1 babakocsi", sold: 24, revenue: 2159760 },
  { name: "Pampers Premium Care pelenka", sold: 89, revenue: 622110 },
  { name: "Ergobaby hordozókendő", sold: 18, revenue: 503820 },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.value));

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-dark tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-medium mt-0.5">Üdvözöljük a BabyOnline admin felületen</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-medium bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Clock className="size-3.5" />
          <span>Utolsó frissítés: ma 11:52</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("size-10 rounded-xl flex items-center justify-center", card.bg)}>
                  <Icon className={cn("size-5", card.color)} />
                </div>
                {card.change && (
                  <span className={cn(
                    "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold",
                    card.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {card.isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {card.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-neutral-dark tracking-tight">{card.value}</p>
              <p className="text-[11px] text-neutral-medium mt-0.5">{card.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-neutral-dark tracking-tight">Bevétel (utolsó 7 nap)</h2>
              <p className="text-xs text-neutral-medium mt-0.5">Összesen: {formatPrice(revenueData.reduce((a, b) => a + b.value, 0))}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-44">
            {revenueData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-neutral-dark">{formatPrice(d.value)}</span>
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary-light rounded-lg hover:from-primary-light hover:to-primary transition-all cursor-default min-h-[8px]"
                  style={{ height: `${Math.max((d.value / maxRevenue) * 100, 8)}%` }}
                />
                <span className="text-[10px] font-semibold text-neutral-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Agents */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-dark tracking-tight">AI Agentek</h2>
            <Link href="/admin/ai-agentek" className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5">
              Részletek <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {aiAgents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                <div className="relative">
                  <div className={cn("size-2 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-white", agent.status === "active" ? "bg-emerald-500" : "bg-gray-400")} />
                  <div className={cn("size-8 rounded-lg flex items-center justify-center", agent.color)}>
                    <Bot className="size-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-dark tracking-tight truncate">{agent.name}</p>
                  <p className="text-[10px] text-neutral-medium">{agent.lastRun} · {agent.tasks} feladat</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-neutral-dark tracking-tight">Legutóbbi rendelések</h2>
            <Link href="/admin/rendelesek" className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5">
              Összes <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.PENDING;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{order.id}</span>
                      <span className="text-[10px] text-neutral-medium">{order.date}</span>
                    </div>
                    <p className="text-xs text-neutral-dark font-medium mt-0.5">{order.customer}</p>
                  </div>
                  <span className="text-xs font-extrabold text-neutral-dark">{formatPrice(order.total)}</span>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold", status.bg, status.color)}>
                    <StatusIcon className="size-3" />
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-dark tracking-tight">Top termékek</h2>
            <Link href="/admin/termekek" className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5">
              Összes <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="size-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-neutral-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-dark tracking-tight truncate">{product.name}</p>
                  <p className="text-[10px] text-neutral-medium">{product.sold} eladva</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">{formatPrice(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
