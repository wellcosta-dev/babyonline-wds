"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BeallitasokPage() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  return (
    <div>
      <h1 className="font-display font-bold text-2xl md:text-3xl text-neutral-dark mb-8">
        Beállítások
      </h1>

      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card p-6 md:p-8"
        >
          <h2 className="font-display font-bold text-xl text-neutral-dark mb-6">
            Személyes adatok
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Név
              </label>
              <input
                type="text"
                defaultValue="Kovács Anna"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                E-mail
              </label>
              <input
                type="email"
                defaultValue="anna.kovacs@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Telefon
              </label>
              <input
                type="tel"
                defaultValue="+36 30 123 4567"
                className="input-field"
              />
            </div>
          </div>
          <button type="button" className="btn-primary mt-4">
            Mentés
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card p-6 md:p-8"
        >
          <h2 className="font-display font-bold text-xl text-neutral-dark mb-6">
            Jelszó módosítás
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Jelenlegi jelszó
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Új jelszó
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-2">
                Új jelszó megerősítése
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
            </div>
          </div>
          <button type="button" className="btn-primary mt-4">
            Jelszó módosítása
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-6 md:p-8"
        >
          <h2 className="font-display font-bold text-xl text-neutral-dark mb-6 flex items-center gap-2">
            <Bell className="size-5" />
            Értesítések
          </h2>
          <div className="space-y-4">
            {[
              {
                key: "orderUpdates" as const,
                label: "Rendelés státusz frissítések",
                desc: "E-mail értesítés a rendelésed állapotáról",
              },
              {
                key: "promotions" as const,
                label: "Akciók és promóciók",
                desc: "Egyedi ajánlatok és kedvezmények",
              },
              {
                key: "newsletter" as const,
                label: "Hírlevél",
                desc: "Heti tippek és újdonságok",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-neutral-dark">
                    {item.label}
                  </div>
                  <div className="text-sm text-neutral-medium">
                    {item.desc}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    notifications[item.key]
                      ? "bg-primary"
                      : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      notifications[item.key] ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-6 md:p-8 border-red-200"
        >
          <h2 className="font-display font-bold text-xl text-red-600 mb-2">
            Fiók törlése
          </h2>
          <p className="text-neutral-medium text-sm mb-4">
            A fiók törlése visszavonhatatlan. Minden adatod véglegesen törlődik.
          </p>
          <button
            type="button"
            className="font-semibold text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 px-6 py-3 rounded-xl transition-colors"
          >
            Fiók törlése
          </button>
        </motion.section>
      </div>
    </div>
  );
}
