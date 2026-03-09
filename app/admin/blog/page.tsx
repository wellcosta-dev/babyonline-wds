"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  Calendar,
  User,
  Tag,
  BookOpen,
  Bot,
} from "lucide-react";
import { blogPosts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { StatusChip } from "@/app/admin/_components/StatusChip";

const coverGradients = [
  "from-primary to-brand-cyan",
  "from-brand-pink to-secondary",
  "from-brand-cyan to-primary",
  "from-accent to-amber-400",
  "from-emerald-500 to-brand-cyan",
];

export default function AdminBlogPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filteredPosts = blogPosts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "published" && p.isPublished) || (filter === "draft" && !p.isPublished);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-dark tracking-tight">Blog kezelés</h1>
          <p className="text-sm text-neutral-medium">{filteredPosts.length} cikk</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-dark bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Sparkles className="size-3.5 text-primary" />
            AI cikk generálás
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-sm shadow-primary/20 transition-colors">
            <Plus className="size-3.5" />
            Új cikk
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-medium" />
          <input
            type="search"
            placeholder="Keresés cím vagy szerző alapján..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { id: "all" as const, label: "Összes" },
            { id: "published" as const, label: "Közzétéve" },
            { id: "draft" as const, label: "Piszkozat" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors",
                filter === tab.id
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-white border border-gray-200 text-neutral-medium hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPosts.map((post, i) => (
          <article key={post.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
            {/* Cover */}
            <div className={cn("h-32 bg-gradient-to-br relative", coverGradients[i % coverGradients.length])}>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="size-10 text-white/20" />
              </div>
              <div className="absolute top-3 left-3 flex gap-1.5">
                <StatusChip
                  label={post.isPublished ? "Közzétéve" : "Piszkozat"}
                  tone={post.isPublished ? "success" : "neutral"}
                />
                {post.aiGenerated && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/20 text-white backdrop-blur-sm flex items-center gap-0.5">
                    <Bot className="size-2.5" /> AI
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-neutral-dark tracking-tight line-clamp-2">{post.title}</h3>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-neutral-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-medium">
                <span className="flex items-center gap-1"><User className="size-3" /> {post.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" })
                    : new Date(post.createdAt).toLocaleDateString("hu-HU")}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-dark hover:bg-gray-50 transition-colors" title="Szerkesztés">
                  <Pencil className="size-3.5" />
                  Szerkesztés
                </button>
                <button className="p-1.5 text-neutral-medium hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={post.isPublished ? "Visszavonás" : "Közzététel"}>
                  {post.isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <button className="p-1.5 text-neutral-medium hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Törlés">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
