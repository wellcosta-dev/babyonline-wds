"use client";

import {
  Award,
  Heart,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Users,
  ShieldCheck,
  Truck,
  Star,
  Package,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { cn } from "@/lib/utils";

const VALUES = [
  {
    title: "Minőség",
    description:
      "Csak a legjobb, baba-barát minőségű termékeket kínáljuk. Minden termékünket gondosan válogatjuk és teszteljük.",
    icon: Award,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Bizalom",
    description:
      "Több mint 10 000 elégedett vásárlónk bízik bennünk. Átlátható információk, gyors szállítás és barátságos ügyfélszolgálat.",
    icon: Heart,
    color: "text-brand-pink",
    bg: "bg-brand-pink/10",
  },
  {
    title: "Innováció",
    description:
      "Folyamatosan bővítjük kínálatunkat a legújabb trendekkel és innovatív termékekkel, hogy mindig a legjobbat nyújthassuk.",
    icon: Sparkles,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/10",
  },
];

const STATS = [
  { value: "1000+", label: "Termék", icon: Package, color: "text-primary", bg: "bg-primary/10" },
  { value: "10 000+", label: "Elégedett vásárló", icon: Users, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
  { value: "5+", label: "Év tapasztalat", icon: Star, color: "text-accent", bg: "bg-accent/10" },
  { value: "99.5%", label: "Pozitív értékelés", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
];

const TEAM = [
  { name: "Kovács Mária", role: "Ügyvezető", initials: "KM", gradient: "from-primary to-primary-light" },
  { name: "Nagy Péter", role: "Vásárlási vezető", initials: "NP", gradient: "from-brand-cyan to-primary" },
  { name: "Szabó Anna", role: "Ügyfélszolgálat", initials: "SzA", gradient: "from-brand-pink to-secondary" },
];

const TIMELINE = [
  { year: "2019", title: "Indulás", text: "A BabyOnline.hu megalapítása, az első 100 termékkel." },
  { year: "2020", title: "Növekedés", text: "1000 terméket értünk el, és bevezettük az ingyenes szállítást." },
  { year: "2022", title: "Bővítés", text: "Kínálatunk 5000+ termékre bővült, új raktárbázis nyitás." },
  { year: "2024", title: "Innováció", text: "AI alapú termékkereső és személyre szabott ajánlórendszer." },
  { year: "2026", title: "Ma", text: "Magyarország egyik vezető baba-mama webshopja." },
];

export default function RolunkPage() {
  return (
    <div className="min-h-screen bg-neutral-pale">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: "Főoldal", href: "/" },
            { label: "Rólunk" },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="relative rounded-3xl bg-gradient-to-br from-primary via-primary-light to-brand-cyan overflow-hidden p-8 md:p-12 lg:p-16 mb-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 size-64 rounded-full bg-white/40" />
            <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-white/30" />
            <div className="absolute top-1/2 right-1/4 size-32 rounded-full bg-white/20" />
          </div>
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 backdrop-blur-sm">
              <Heart className="size-3" /> Történetünk
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
              A BabyOnline.hu Története
            </h1>
            <p className="text-base md:text-lg text-white/85 leading-relaxed">
              2019-ben indult útjára a BabyOnline.hu egy egyszerű ötlettel: Magyarországon
              is legyen egy olyan baba-mama webshop, ahol a szülők mindent megtalálhatnak
              egy helyen – minőségi termékekkel, gyors szállítással és barátságos
              ügyfélszolgálattal.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="size-5 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-neutral-dark tracking-tight">
                Küldetésünk
              </h2>
            </div>
            <p className="text-neutral-medium text-base leading-relaxed max-w-3xl">
              A BabyOnline.hu célja, hogy Magyarország legjobb baba-mama webshopja legyen.
              Minden nap arra törekszünk, hogy a legszélesebb választékot kínáljuk a
              legjobb áron – pelenkák, babaruhák, babakocsik, etetési termékek és minden,
              amit a babádhoz és magadhoz szükséges. Magyarországi szállítással, gyors
              kiszállítással és egy olyan csapattal, akik maguk is szülők, és tudják, mit
              jelent a megbízható minőség.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={cn("size-12 rounded-xl flex items-center justify-center mx-auto mb-3", stat.bg)}>
                    <Icon className={cn("size-6", stat.color)} />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-neutral-dark tracking-tight mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-neutral-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-neutral-dark tracking-tight">
              Értékeink
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALUES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={cn("size-12 rounded-xl flex items-center justify-center mb-4", item.bg)}>
                    <Icon className={cn("size-6", item.color)} />
                  </div>
                  <h3 className="text-base font-bold text-neutral-dark tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-medium leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-neutral-dark tracking-tight">
              Történetünk
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-brand-cyan/20 to-transparent" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="relative">
              <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-brand-cyan to-brand-pink rounded-full hidden md:block" />
              <div className="space-y-6 md:space-y-8">
                {TIMELINE.map((item, i) => (
                  <div key={item.year} className="flex gap-4 md:gap-6 items-start">
                    <div className="relative z-10 flex-shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-extrabold text-primary">{item.year}</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-neutral-dark tracking-tight">{item.title}</h3>
                      <p className="text-sm text-neutral-medium mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-neutral-dark tracking-tight">
              Csapatunk
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-brand-pink/20 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={cn("size-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4 text-white text-xl font-extrabold", member.gradient)}>
                  {member.initials}
                </div>
                <h3 className="text-base font-bold text-neutral-dark tracking-tight">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-primary mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl md:text-2xl font-extrabold text-neutral-dark tracking-tight">
              Kapcsolat
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="mailto:hello@jatekonline.hu"
              className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 transition-all"
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                <Mail className="size-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-dark tracking-tight">E-mail</div>
                <div className="text-sm text-neutral-medium">hello@jatekonline.hu</div>
              </div>
            </a>
            <a
              href="tel:+36202982228"
              className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 hover:border-brand-cyan/20 transition-all"
            >
              <div className="size-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cyan transition-colors">
                <Phone className="size-5 text-brand-cyan group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-dark tracking-tight">Telefon</div>
                <div className="text-sm text-neutral-medium">06202982228</div>
              </div>
            </a>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-brand-pink/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="size-5 text-brand-pink" />
              </div>
              <div>
                <div className="text-sm font-bold text-neutral-dark tracking-tight">Cím</div>
                <div className="text-sm text-neutral-medium">4531 Nyírpazony, Hunyadi utca 6.</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary to-brand-cyan rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-3">
            Fedezd fel kínálatunkat!
          </h2>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            Böngéssz több mint 1000 termékünk között és találd meg a tökéletes terméket babád számára.
          </p>
          <Link
            href="/termekek"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary font-bold text-sm hover:bg-gray-50 transition-colors shadow-lg"
          >
            Vásárlás megkezdése
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
