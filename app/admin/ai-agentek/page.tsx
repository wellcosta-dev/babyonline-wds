"use client";

import { useState } from "react";
import {
  Bot,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Package,
  FileText,
  Share2,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const agents = [
  {
    id: "order-processor",
    name: "Rendelésfeldolgozó",
    description: "Automatikus rendelésfeldolgozás és státuszfrissítés",
    status: "active" as const,
    lastTriggered: "10:32",
    metric1Label: "Mai feldolgozások",
    metric1Value: "12",
    metric2Label: "Sikerarány",
    metric2Value: "100%",
    icon: ShoppingCart,
    color: "from-primary to-primary-light",
    tasks: [
      { time: "10:32", action: "12 rendelés feldolgozva", success: true },
      { time: "08:45", action: "5 rendelés státusz frissítve", success: true },
      { time: "07:30", action: "Email küldve: BO-ABC123", success: true },
    ],
  },
  {
    id: "product-description",
    name: "Termékleírás AI",
    description: "AI által generált termékleírások és SEO szövegek",
    status: "active" as const,
    lastTriggered: "09:15",
    metric1Label: "Leírt termékek",
    metric1Value: "156",
    metric2Label: "Mai feladatok",
    metric2Value: "8",
    icon: Package,
    color: "from-brand-cyan to-cyan-400",
    tasks: [
      { time: "09:15", action: "3 termék leírása generálva", success: true },
      { time: "07:45", action: "2 termék leírása frissítve", success: true },
    ],
  },
  {
    id: "blog-generator",
    name: "Blog generáló",
    description: "Automatikus blog cikk generálás és közzététel",
    status: "active" as const,
    lastTriggered: "08:00",
    metric1Label: "Cikkek e hónapban",
    metric1Value: "8",
    metric2Label: "Következő futás",
    metric2Value: "holnap 08:00",
    icon: FileText,
    color: "from-brand-pink to-pink-400",
    tasks: [
      { time: "09:00", action: "Cikk váz generálva", success: true },
      { time: "08:00", action: "Új cikk publikálva", success: true },
    ],
  },
  {
    id: "social-media",
    name: "Social Media",
    description: "Posztok generálása és ütemezése (Facebook, Instagram)",
    status: "active" as const,
    lastTriggered: "11:45",
    metric1Label: "Posztok ezen a héten",
    metric1Value: "5",
    metric2Label: "Következő poszt",
    metric2Value: "ma 18:00",
    icon: Share2,
    color: "from-accent to-amber-400",
    tasks: [
      { time: "11:45", action: "Instagram poszt közzétéve", success: true },
      { time: "08:30", action: "Facebook poszt ütemezve", success: true },
      { time: "07:00", action: "Reggeli poszt közzétéve", success: true },
    ],
  },
];

const globalActivity = [
  { time: "11:45", agent: "Social Media", action: "Instagram poszt közzétéve", icon: Share2, color: "text-accent" },
  { time: "10:32", agent: "Rendelésfeldolgozó", action: "12 rendelés feldolgozva", icon: ShoppingCart, color: "text-primary" },
  { time: "10:15", agent: "Social Media", action: "Facebook poszt közzétéve", icon: Share2, color: "text-accent" },
  { time: "09:15", agent: "Termékleírás AI", action: "3 termék leírása generálva", icon: Package, color: "text-brand-cyan" },
  { time: "09:00", agent: "Blog generáló", action: "Cikk váz generálva", icon: FileText, color: "text-brand-pink" },
  { time: "08:45", agent: "Rendelésfeldolgozó", action: "5 rendelés státusz frissítve", icon: ShoppingCart, color: "text-primary" },
  { time: "08:30", agent: "Social Media", action: "Poszt ütemezve", icon: Share2, color: "text-accent" },
  { time: "08:00", agent: "Blog generáló", action: "Új cikk publikálva", icon: FileText, color: "text-brand-pink" },
];

export default function AdminAiAgentekPage() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-dark tracking-tight">AI Agent Vezérlőpult</h1>
          <p className="text-sm text-neutral-medium">Agentek kezelése és monitorozása</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            4/4 aktív
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Összes feladat ma", value: "28", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
          { label: "Sikerarány", value: "100%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Aktív agentek", value: "4/4", icon: Activity, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
          { label: "Átlag válaszidő", value: "0.3s", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={cn("size-9 rounded-lg flex items-center justify-center", kpi.bg)}>
                <Icon className={cn("size-4", kpi.color)} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-neutral-dark tracking-tight">{kpi.value}</p>
                <p className="text-[10px] text-neutral-medium">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isExpanded = expandedAgent === agent.id;
          return (
            <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
              <div className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className={cn("size-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0", agent.color)}>
                    <Icon className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-dark tracking-tight">{agent.name}</h3>
                      <span className="size-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-[10px] text-neutral-medium mt-0.5">{agent.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="p-3 bg-gray-50/80 rounded-xl">
                    <p className="text-[10px] text-neutral-medium">{agent.metric1Label}</p>
                    <p className="text-lg font-extrabold text-neutral-dark tracking-tight mt-0.5">{agent.metric1Value}</p>
                  </div>
                  <div className="p-3 bg-gray-50/80 rounded-xl">
                    <p className="text-[10px] text-neutral-medium">{agent.metric2Label}</p>
                    <p className="text-lg font-extrabold text-neutral-dark tracking-tight mt-0.5">{agent.metric2Value}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-sm shadow-primary/20 transition-colors">
                    <Play className="size-3" />
                    Futtatás
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-neutral-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Pause className="size-3" />
                    Szünet
                  </button>
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    <Terminal className="size-3" />
                    Napló
                    {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 p-3 bg-neutral-dark rounded-xl">
                    <div className="space-y-1.5">
                      {agent.tasks.map((task, j) => (
                        <div key={j} className="flex items-center gap-2 text-[10px]">
                          <span className="font-mono text-gray-500 w-10">{task.time}</span>
                          <span className={cn("size-1.5 rounded-full flex-shrink-0", task.success ? "bg-emerald-400" : "bg-red-400")} />
                          <span className="text-gray-300">{task.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global activity timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-neutral-dark tracking-tight">Tevékenység idővonal</h2>
          <p className="text-[10px] text-neutral-medium mt-0.5">Utolsó 8 művelet</p>
        </div>
        <div className="divide-y divide-gray-50">
          {globalActivity.map((log, i) => {
            const LogIcon = log.icon;
            return (
              <div key={i} className="flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className={cn("size-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0")}>
                  <LogIcon className={cn("size-3.5", log.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-dark">{log.agent}</span>
                    <span className="text-[10px] text-neutral-medium">{log.action}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-medium">{log.time}</span>
                <span className="size-2 rounded-full bg-emerald-500 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
