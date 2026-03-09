"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasSavedPreference, setHasSavedPreference] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("bo-analytics-consent");
    setHasSavedPreference(Boolean(saved));
    setVisible(!saved);
  }, []);

  const handleChoice = (choice: "granted" | "denied") => {
    window.localStorage.setItem("bo-analytics-consent", choice);
    setHasSavedPreference(true);
    setVisible(false);
    setExpanded(false);
    if (choice === "granted") {
      window.location.reload();
    }
  };

  if (!visible && !expanded) {
    return hasSavedPreference ? (
      <button
        type="button"
        onClick={() => {
          setVisible(true);
          setExpanded(true);
        }}
        className="fixed bottom-6 left-4 z-[90] inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-neutral-dark shadow-lg hover:bg-gray-50"
        aria-label="Süti beállítások megnyitása"
      >
        <Cookie className="size-4 text-amber-600" />
        Sütik
      </button>
    ) : null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(92vw,640px)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-100">
          <Cookie className="size-4 text-amber-700" />
        </span>
        <p className="text-sm font-semibold text-neutral-dark">Süti beállítások</p>
      </div>
      <p className="mt-2 text-xs text-neutral-medium">
        A weboldal működéséhez szükséges sütiket mindig használjuk. Analitikai és marketing sütiket csak hozzájárulás után töltünk be.
      </p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => handleChoice("denied")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-neutral-dark"
        >
          Csak szükséges
        </button>
        <button
          onClick={() => {
            window.localStorage.removeItem("bo-analytics-consent");
            setVisible(false);
            setExpanded(false);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-neutral-dark"
        >
          Bezárás
        </button>
        <button
          onClick={() => handleChoice("granted")}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
        >
          Mindet elfogadom
        </button>
      </div>
    </div>
  );
}

