"use client";

import { useEffect, useState } from "react";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("bo-analytics-consent");
    setVisible(!saved);
  }, []);

  const handleChoice = (choice: "granted" | "denied") => {
    window.localStorage.setItem("bo-analytics-consent", choice);
    setVisible(false);
    if (choice === "granted") {
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] sm:left-auto sm:max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
      <p className="text-sm font-semibold text-neutral-dark">Süti és analitika hozzájárulás</p>
      <p className="mt-1 text-xs text-neutral-medium">
        A mérési script-eket csak hozzájárulás után töltjük be.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleChoice("denied")}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-neutral-dark"
        >
          Elutasítás
        </button>
        <button
          onClick={() => handleChoice("granted")}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
        >
          Elfogadás
        </button>
      </div>
    </div>
  );
}

