"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";

export default function CimeimPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl md:text-3xl text-neutral-dark mb-6">
        Címeim
      </h1>
      <div className="card p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-pale flex items-center justify-center mx-auto mb-6">
          <MapPin className="size-10 text-primary" />
        </div>
        <h2 className="font-display font-bold text-xl text-neutral-dark mb-2">
          Nincs mentett cím
        </h2>
        <p className="text-neutral-medium mb-6 max-w-md mx-auto">
          A következő rendelésednél mentheted a szállítási címedet a gyorsabb
          vásárláshoz.
        </p>
        <Link href="/" className="btn-primary">
          Vásárlás indítása
        </Link>
      </div>
    </div>
  );
}
