"use client";

import React, { useState, useEffect } from "react";
import { NEWS_LIST } from "@/data/community";
import { Radio, ExternalLink, Layers, Globe, Filter, RefreshCw, ShieldCheck, Flame, ArrowUpRight } from "lucide-react";

interface ScrapedArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  image?: string;
  category: string;
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<"sandbox-frame" | "live-feed">("sandbox-frame");
  const [feedArticles, setFeedArticles] = useState<ScrapedArticle[]>([]);
  const [loadingFeed, setLoadingFeed] = useState<boolean>(true);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [iframeKey, setIframeKey] = useState<number>(1);

  // Fetch parsed articles from /api/esports-feed
  useEffect(() => {
    async function loadFeed() {
      try {
        setLoadingFeed(true);
        const res = await fetch("/api/esports-feed");
        if (res.ok) {
          const data = await res.json();
          const list = data.articles || data.data || [];
          if (list.length > 0) {
            setFeedArticles(list);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil feed esports.id:", err);
      } finally {
        setLoadingFeed(false);
      }
    }

    loadFeed();
  }, []);

  const gameFilters = [
    { label: "SEMUA GAME", value: "ALL" },
    { label: "PUBG MOBILE", value: "PUBG" },
    { label: "MOBILE LEGENDS", value: "MLBB" },
    { label: "ESPORTS UMUM", value: "UMUM" },
  ];

  const filteredArticles = feedArticles.filter((item) => {
    if (selectedGameFilter === "ALL") return true;
    if (selectedGameFilter === "PUBG") {
      return item.title.toUpperCase().includes("PUBG") || item.category.toUpperCase().includes("PUBG");
    }
    if (selectedGameFilter === "MLBB") {
      return item.title.toUpperCase().includes("MOBILE LEGENDS") || item.title.toUpperCase().includes("MLBB") || item.category.toUpperCase().includes("MLBB");
    }
    return true;
  });

  return (
    <div className="py-12 lg:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="border-b-2 border-slate-900 pb-8 dark:border-white">
          <div className="inline-flex items-center space-x-2 border-2 border-brand-blue bg-white px-3.5 py-1 text-xs font-bold text-brand-blue shadow-[2px_2px_0px_0px_#0030FF] rounded-none dark:border-brand-blue dark:bg-dark-surface dark:text-brand-cyan">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="uppercase tracking-wider font-mono">Kanal Informasi & Berita E-Sport</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 uppercase sm:text-6xl dark:text-white">
            E-SPORT FLASH
          </h1>
          <p className="mt-2 text-sm font-bold text-brand-blue dark:text-brand-cyan">
            Pusat kurasi berita esports nasional dan internasional yang disandbox langsung dari <strong className="text-brand-blue dark:text-brand-cyan">esports.id</strong>, serta buletin resmi komunitas CEES AREA.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("live-feed")}
              className={`flex items-center space-x-2 border-2 px-5 py-3 font-display text-xs font-bold tracking-wider uppercase transition-all rounded-none ${
                activeTab === "live-feed"
                  ? "border-brand-blue bg-brand-blue text-white shadow-[4px_4px_0px_0px_#0F172A] dark:shadow-[4px_4px_0px_0px_#FFFFFF]"
                  : "border-slate-900 bg-white text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-base"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Katalog Berita Esports.ID & CEES</span>
            </button>

            <button
              onClick={() => setActiveTab("sandbox-frame")}
              className={`flex items-center space-x-2 border-2 px-5 py-3 font-display text-xs font-bold tracking-wider uppercase transition-all rounded-none ${
                activeTab === "sandbox-frame"
                  ? "border-brand-blue bg-brand-blue text-white shadow-[4px_4px_0px_0px_#0F172A] dark:shadow-[4px_4px_0px_0px_#FFFFFF]"
                  : "border-slate-900 bg-white text-slate-900 shadow-[3px_3px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-surface dark:text-white dark:hover:bg-dark-base"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Portal Ter-Sandbox (esports.id Live)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Live Feed from esports.id + CEES Updates */}
        {activeTab === "live-feed" && (
          <div className="mt-10 space-y-12">
            
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-900 pb-6 dark:border-white">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white mr-2">
                <Filter className="h-3.5 w-3.5 text-brand-blue" />
                <span>FILTER GAME:</span>
              </div>
              {gameFilters.map((gf) => (
                <button
                  key={gf.value}
                  onClick={() => setSelectedGameFilter(gf.value)}
                  className={`rounded-none border-2 px-3.5 py-1.5 font-display text-xs font-bold tracking-wider uppercase transition-all ${
                    selectedGameFilter === gf.value
                      ? "border-brand-blue bg-brand-blue text-white shadow-[2px_2px_0px_0px_#0F172A] dark:shadow-[2px_2px_0px_0px_#FFFFFF]"
                      : "border-slate-900 bg-white text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] hover:bg-slate-50 dark:border-white dark:bg-dark-surface dark:text-white"
                  }`}
                >
                  {gf.label}
                </button>
              ))}
            </div>

            {/* Live Feed from esports.id Section */}
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-emerald-500 border border-slate-900 animate-pulse rounded-none" />
                  <h2 className="font-display text-xl font-black uppercase text-slate-900 dark:text-white">
                    Berita Terkini dari Esports.ID
                  </h2>
                </div>
                <a
                  href="https://www.esports.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-brand-blue hover:underline dark:text-brand-cyan"
                >
                  <span>Buka Website Asli Esports.id</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {loadingFeed ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface"
                    >
                      <div className="aspect-video w-full bg-slate-200 dark:bg-dark-base mb-4 rounded-none" />
                      <div className="h-4 w-3/4 bg-slate-200 dark:bg-dark-base mb-2 rounded-none" />
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-dark-base rounded-none" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredArticles.map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex flex-col justify-between border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#0030FF]"
                    >
                      <div>
                        {/* Thumbnail Image */}
                        <div className="relative aspect-video w-full overflow-hidden border-b-2 border-slate-900 bg-slate-950 dark:border-white rounded-none">
                          {article.image ? (
                            <img
                              src={article.image}
                              alt={article.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand-blue/10 text-brand-blue font-bold font-mono">
                              ESPORTS.ID
                            </div>
                          )}
                          <div className="absolute top-2.5 left-2.5 border border-white bg-brand-blue px-2.5 py-0.5 font-mono text-xs font-bold text-white uppercase shadow-[2px_2px_0px_0px_#000000] rounded-none">
                            {article.category}
                          </div>
                        </div>

                        {/* Article Text Content */}
                        <div className="p-5">
                          <h3 className="line-clamp-2 font-display text-lg font-black uppercase text-slate-900 group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-cyan transition-colors">
                            {article.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-700 dark:text-steel-200">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between border-t-2 border-slate-900 bg-slate-100 px-5 py-3 font-mono text-xs text-slate-800 dark:border-white dark:bg-dark-base dark:text-steel-300 rounded-none">
                        <span className="font-bold text-brand-blue dark:text-brand-cyan">
                          Sumber: esports.id
                        </span>
                        <span className="flex items-center space-x-1 font-bold group-hover:text-brand-blue dark:group-hover:text-white">
                          <span>Baca Berita</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Buletin & Pengumuman Internal CEES AREA */}
            <div className="border-t-2 border-slate-900 pt-12 dark:border-white">
              <div className="mb-6 flex items-center space-x-2">
                <Flame className="h-5 w-5 text-brand-blue dark:text-brand-cyan" />
                <h2 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                  Pengumuman Resmi CEES AREA
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {NEWS_LIST.map((news) => (
                  <div
                    key={news.id}
                    className="flex flex-col justify-between border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 font-mono text-xs font-bold dark:border-white">
                        <span className="text-brand-blue dark:text-brand-cyan uppercase">
                          {news.category}
                        </span>
                        <span className="text-slate-600 dark:text-steel-400">{news.date}</span>
                      </div>

                      <h3 className="mt-4 font-display text-xl font-black uppercase text-slate-900 dark:text-white">
                        {news.title}
                      </h3>

                      <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-steel-200">
                        {news.summary}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t-2 border-slate-900 pt-4 font-mono text-xs dark:border-white">
                      <span className="text-slate-600 dark:text-steel-400">{news.readTime}</span>
                      <span className="font-bold text-brand-blue dark:text-brand-cyan uppercase">
                        Buletin Internal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Embedded Interactive Sandbox Frame */}
        {activeTab === "sandbox-frame" && (
          <div className="mt-8 space-y-4">
            
            {/* Browser Sandbox Chrome Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-slate-900 bg-slate-100 p-3.5 shadow-[4px_4px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-surface">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="h-3.5 w-3.5 border border-slate-900 bg-red-500 rounded-none" />
                  <div className="h-3.5 w-3.5 border border-slate-900 bg-amber-500 rounded-none" />
                  <div className="h-3.5 w-3.5 border border-slate-900 bg-emerald-500 rounded-none" />
                </div>
                <div className="hidden sm:flex items-center space-x-1.5 border-2 border-slate-900 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-900 rounded-none dark:border-white dark:bg-dark-base dark:text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>https://www.esports.id/</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="inline-flex items-center space-x-1.5 border-2 border-slate-900 bg-white px-3 py-1.5 font-mono text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_#0030FF] rounded-none hover:bg-slate-50 dark:border-white dark:bg-dark-base dark:text-white"
                  title="Muat ulang sandbox"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Sandbox</span>
                </button>

                <a
                  href="https://www.esports.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="brutal-btn inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-none"
                >
                  <span>Buka Tab Baru</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Sandbox Container */}
            <div className="relative h-[800px] w-full overflow-hidden border-2 border-slate-900 bg-white shadow-[8px_8px_0px_0px_#0030FF] rounded-none dark:border-white dark:bg-dark-void">
              <iframe
                key={iframeKey}
                src="/api/esports-proxy"
                title="Sandbox Esports.id News Portal"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                className="h-full w-full border-0 rounded-none"
              />
            </div>

            <p className="font-mono text-xs text-slate-600 dark:text-steel-400">
              * Portal disandbox langsung dari <a href="https://www.esports.id/" target="_blank" rel="noreferrer" className="text-brand-blue font-bold hover:underline">https://www.esports.id/</a> secara aman dengan proteksi isolasi sandbox browser.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
