"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layers,
  FileText,
  Bot,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Store,
  LogOut,
  ChevronRight,
  CheckCheck,
  Clock3,
  AlertTriangle,
  Sparkles,
  Puzzle,
  Megaphone,
  Mail,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/termekek", icon: Package, label: "Termékek" },
  { href: "/admin/rendelesek", icon: ShoppingCart, label: "Rendelések" },
  { href: "/admin/hirlevel-feliratkozok", icon: Mail, label: "Hírlevél feliratkozók" },
  { href: "/admin/vasarlok", icon: Users, label: "Vásárlók" },
  { href: "/admin/kategoriak", icon: Layers, label: "Kategóriák" },
  { href: "/admin/blog", icon: FileText, label: "Blog" },
  { href: "/admin/marketing-posztok", icon: Megaphone, label: "Marketing posztok" },
  { href: "/admin/ai-agentek", icon: Bot, label: "AI Agentek" },
  { href: "/admin/pluginok", icon: Puzzle, label: "Pluginok" },
  { href: "/admin/beallitasok", icon: Settings, label: "Beállítások" },
];

const notifications = [
  {
    id: "n1",
    title: "Új rendelés érkezett",
    description: "BO-NEW124 · 26 980 Ft",
    time: "Most",
    href: "/admin/rendelesek",
    unread: true,
    icon: ShoppingCart,
    iconClass: "text-primary bg-primary/10",
  },
  {
    id: "n2",
    title: "Alacsony készlet",
    description: "3 termék 5 db alatt",
    time: "5 perce",
    href: "/admin/termekek",
    unread: true,
    icon: AlertTriangle,
    iconClass: "text-amber-600 bg-amber-100",
  },
  {
    id: "n3",
    title: "AI leírás elkészült",
    description: "8 termékfrissítés sikeresen lefutott",
    time: "22 perce",
    href: "/admin/ai-agentek",
    unread: false,
    icon: Sparkles,
    iconClass: "text-brand-cyan bg-brand-cyan/10",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        if (!response.ok) {
          router.replace("/bejelentkezes");
          return;
        }
        return response.json() as Promise<{ user?: { role?: string } }>;
      })
      .then((payload) => {
        if (!active || !payload) return;
        if (payload.user?.role !== "ADMIN") {
          router.replace("/bejelentkezes");
          return;
        }
        setIsAuthorized(true);
      })
      .catch(() => {
        if (active) router.replace("/bejelentkezes");
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  const currentPage = navItems.find(
    (item) => item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href)
  );
  const unreadCount = notifications.filter((item) => item.unread).length;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("bo-auth-user");
    router.replace("/bejelentkezes");
  };

  if (authChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-neutral-medium">Admin jogosultság ellenőrzése...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[260px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-brand-cyan flex items-center justify-center text-white text-xs font-extrabold">
              BO
            </div>
            <div>
              <span className="text-sm font-extrabold text-neutral-dark tracking-tight block">BabyOnline</span>
              <span className="text-[10px] font-semibold text-neutral-medium/60 uppercase tracking-wider">Admin</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-neutral-medium hover:text-neutral-dark hover:bg-gray-100 rounded-lg"
            aria-label="Menü bezárása"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-neutral-medium hover:text-neutral-dark hover:bg-gray-100"
                )}
              >
                <Icon className="size-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-medium hover:text-neutral-dark hover:bg-gray-100 transition-colors"
          >
            <Store className="size-[18px] flex-shrink-0" />
            <span>Webshop megtekintése</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-medium hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-[18px] flex-shrink-0" />
            <span>Kijelentkezés</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-neutral-dark hover:bg-gray-100 rounded-xl"
            aria-label="Menü megnyitása"
          >
            <Menu className="size-5" />
          </button>

          {/* Breadcrumb-like page title */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <span className="text-neutral-medium">Admin</span>
            <ChevronRight className="size-3.5 text-neutral-medium/40" />
            <span className="font-semibold text-neutral-dark">{currentPage?.label ?? "Dashboard"}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-medium" />
            <input
              type="search"
              placeholder="Keresés..."
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className={cn(
                "relative p-2 rounded-xl transition-colors",
                notificationsOpen
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-medium hover:text-neutral-dark hover:bg-gray-100"
              )}
              aria-label="Értesítések megnyitása"
              aria-expanded={notificationsOpen}
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/5 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/70">
                  <div>
                    <p className="text-xs font-extrabold text-neutral-dark tracking-tight">Értesítések</p>
                    <p className="text-[10px] text-neutral-medium">{unreadCount} olvasatlan</p>
                  </div>
                  <button className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
                    <CheckCheck className="size-3.5" />
                    Mind olvasott
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                  {notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className={cn("size-8 rounded-lg flex items-center justify-center flex-shrink-0", item.iconClass)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-neutral-dark tracking-tight line-clamp-1">
                              {item.title}
                            </p>
                            {item.unread && <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-neutral-medium mt-0.5 line-clamp-1">{item.description}</p>
                          <p className="text-[10px] text-neutral-medium/80 mt-1 inline-flex items-center gap-1">
                            <Clock3 className="size-3" />
                            {item.time}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
                  <Link
                    href="/admin/rendelesek"
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    Összes értesítés megtekintése
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-brand-cyan flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-neutral-dark tracking-tight">Admin</p>
              <p className="text-[10px] text-neutral-medium">admin@babyonline.hu</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
