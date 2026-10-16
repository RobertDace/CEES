// src/components/common/CeesAlertContainer.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  HelpCircle,
  Loader2,
  X,
  Flame,
  Zap,
} from "lucide-react";
import {
  ceesAlert,
  AlertOptions,
  ToastOptions,
  AlertType,
} from "@/lib/ceesAlert";

export default function CeesAlertContainer() {
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    const unsubAlert = ceesAlert.subscribeAlert((currAlert) => {
      setAlert(currAlert ? { ...currAlert } : null);
    });
    const unsubToast = ceesAlert.subscribeToast((currToasts) => {
      setToasts([...currToasts]);
    });

    return () => {
      unsubAlert();
      unsubToast();
    };
  }, []);

  // Keyboard shortcut ESC to dismiss non-loading alert
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && alert && alert.type !== "loading") {
        ceesAlert.close(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alert]);

  const getAlertColorConfig = (type?: AlertType, danger?: boolean) => {
    switch (type) {
      case "success":
        return {
          border: "border-emerald-600 dark:border-emerald-400",
          shadow: "shadow-[8px_8px_0px_0px_#10B981]",
          headerBg: "bg-emerald-600 text-white",
          tagBg: "bg-emerald-600 text-white",
          iconColor: "text-emerald-500",
          statusText: "[ STATUS // 200 SUCCESS ]",
          buttonBg: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[4px_4px_0px_0px_#000]",
          Icon: CheckCircle2,
        };
      case "error":
        return {
          border: "border-rose-600 dark:border-rose-500",
          shadow: "shadow-[8px_8px_0px_0px_#EF4444]",
          headerBg: "bg-rose-600 text-white",
          tagBg: "bg-rose-600 text-white",
          iconColor: "text-rose-500",
          statusText: "[ STATUS // ERROR ALERT ]",
          buttonBg: "bg-rose-600 text-white hover:bg-rose-700 shadow-[4px_4px_0px_0px_#000]",
          Icon: ShieldAlert,
        };
      case "warning":
        return {
          border: "border-amber-500 dark:border-amber-400",
          shadow: "shadow-[8px_8px_0px_0px_#F59E0B]",
          headerBg: "bg-amber-400 text-slate-950",
          tagBg: "bg-amber-400 text-slate-950 font-black",
          iconColor: "text-amber-500",
          statusText: "[ STATUS // WARNING CAUTION ]",
          buttonBg: "bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-[4px_4px_0px_0px_#000]",
          Icon: AlertTriangle,
        };
      case "confirm":
        return {
          border: danger
            ? "border-rose-600 dark:border-rose-500"
            : "border-slate-900 dark:border-white",
          shadow: danger
            ? "shadow-[8px_8px_0px_0px_#EF4444]"
            : "shadow-[8px_8px_0px_0px_#0030FF]",
          headerBg: danger
            ? "bg-rose-600 text-white"
            : "bg-brand-blue text-white",
          tagBg: danger
            ? "bg-rose-600 text-white"
            : "bg-brand-blue text-white",
          iconColor: danger ? "text-rose-500" : "text-brand-blue dark:text-brand-cyan",
          statusText: "[ ACTION // KONFIRMASI DIBUTUHKAN ]",
          buttonBg: danger
            ? "bg-rose-600 text-white hover:bg-rose-700 shadow-[4px_4px_0px_0px_#000]"
            : "bg-brand-blue text-white hover:bg-blue-600 shadow-[4px_4px_0px_0px_#000]",
          Icon: HelpCircle,
        };
      case "loading":
        return {
          border: "border-brand-blue dark:border-brand-cyan",
          shadow: "shadow-[8px_8px_0px_0px_#0030FF]",
          headerBg: "bg-slate-900 text-white dark:bg-white dark:text-slate-950",
          tagBg: "bg-brand-blue text-white",
          iconColor: "text-brand-blue dark:text-brand-cyan",
          statusText: "[ OPERATION // PROSES SEDANG BERJALAN ]",
          buttonBg: "bg-slate-900 text-white",
          Icon: Loader2,
        };
      case "info":
      default:
        return {
          border: "border-slate-900 dark:border-white",
          shadow: "shadow-[8px_8px_0px_0px_#0030FF]",
          headerBg: "bg-brand-blue text-white",
          tagBg: "bg-brand-blue text-white",
          iconColor: "text-brand-blue dark:text-brand-cyan",
          statusText: "[ SYSTEM NOTICE // SEKTOR HQ ]",
          buttonBg: "brutal-btn",
          Icon: Info,
        };
    }
  };

  const alertConfig = alert ? getAlertColorConfig(alert.type, alert.danger) : null;

  return (
    <>
      {/* 1. SWEET ALERT MODAL DIALOG */}
      {alert && alertConfig && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div
            className={`relative w-full max-w-lg border-4 ${alertConfig.border} bg-white dark:bg-dark-surface ${alertConfig.shadow} p-6 sm:p-7 rounded-none transition-all my-auto`}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Tactical Bar */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-3 mb-5">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 bg-brand-blue dark:bg-brand-cyan animate-pulse inline-block" />
                <span className="font-mono text-[11px] font-black tracking-widest text-slate-800 dark:text-steel-300 uppercase">
                  {alertConfig.statusText}
                </span>
              </div>
              {alert.type !== "loading" && (
                <button
                  onClick={() => ceesAlert.close(false)}
                  className="border-2 border-slate-900 bg-slate-100 p-1 text-slate-900 hover:bg-rose-500 hover:text-white transition-colors dark:border-white dark:bg-dark-base dark:text-white"
                  title="Tutup (ESC)"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Alert Body */}
            <div className="flex items-start space-x-4">
              {/* Tactical Icon Box */}
              <div
                className={`flex-shrink-0 border-2 border-slate-900 p-3 bg-slate-50 dark:border-white dark:bg-dark-base shadow-[3px_3px_0px_0px_#000]`}
              >
                {alert.type === "loading" ? (
                  <Loader2 className={`h-8 w-8 ${alertConfig.iconColor} animate-spin`} />
                ) : (
                  <alertConfig.Icon className={`h-8 w-8 ${alertConfig.iconColor}`} />
                )}
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-tight">
                  {alert.title}
                </h3>
                {alert.message && (
                  <p className="mt-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-steel-300 leading-relaxed break-words whitespace-pre-wrap">
                    {alert.message}
                  </p>
                )}
                {alert.details && (
                  <div className="mt-3 border-2 border-slate-900 bg-slate-100 p-2.5 font-mono text-[11px] text-slate-600 dark:border-steel-700 dark:bg-dark-void dark:text-steel-400 overflow-x-auto max-h-32">
                    {alert.details}
                  </div>
                )}
              </div>
            </div>

            {/* PROGRESS BAR (Khusus type: loading atau dengan showProgress) */}
            {alert.type === "loading" && (
              <div className="mt-6 border-t-2 border-slate-900 dark:border-white pt-4">
                <div className="flex items-center justify-between font-mono text-xs font-black text-slate-800 dark:text-steel-200 mb-1.5 uppercase">
                  <span className="flex items-center space-x-1.5">
                    <Zap className="h-3.5 w-3.5 text-brand-blue dark:text-brand-cyan animate-bounce" />
                    <span>MEMPROSES // PROTOKOL HQ</span>
                  </span>
                  <span>{alert.progress ?? 100}%</span>
                </div>

                <div className="w-full h-5 border-2 border-slate-900 bg-slate-100 dark:border-white dark:bg-dark-base p-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-blue via-blue-500 to-brand-cyan transition-all duration-200 relative"
                    style={{
                      width: `${alert.showProgress ? (alert.progress ?? 0) : 100}%`,
                    }}
                  >
                    {/* Animated diagonal hazard stripes */}
                    <div
                      className="absolute inset-0 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(-45deg, #fff 0, #fff 8px, transparent 8px, transparent 16px)",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {alert.type !== "loading" && (
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t-2 border-slate-900 dark:border-white pt-4">
                {alert.type === "confirm" ? (
                  <>
                    <button
                      onClick={() => ceesAlert.close(false)}
                      className="brutal-btn-outline px-5 py-2.5 text-xs font-bold"
                    >
                      <span>{alert.cancelText || "BATAL"}</span>
                    </button>
                    <button
                      onClick={() => ceesAlert.close(true)}
                      className={`px-6 py-2.5 font-display font-black text-xs uppercase tracking-wider transition-transform active:translate-x-0.5 active:translate-y-0.5 border-2 border-slate-900 dark:border-white ${alertConfig.buttonBg}`}
                    >
                      <span>{alert.confirmText || "YA, LANJUTKAN"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => ceesAlert.close(true)}
                    className={`px-6 py-2.5 font-display font-black text-xs uppercase tracking-wider transition-transform active:translate-x-0.5 active:translate-y-0.5 border-2 border-slate-900 dark:border-white ${alertConfig.buttonBg}`}
                  >
                    <span>{alert.confirmText || "MENGERTI // OK"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SWEET TOAST NOTIFICATION STACK (Corner Popups) */}
      <div className="fixed bottom-20 sm:bottom-5 right-3 sm:right-5 z-[115] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
        {toasts.map((toast) => {
          let borderColor = "border-slate-900 dark:border-white";
          let shadowColor = "shadow-[4px_4px_0px_0px_#0030FF]";
          let tagBg = "bg-brand-blue text-white";
          let IconComp = Info;

          if (toast.type === "success") {
            borderColor = "border-emerald-600 dark:border-emerald-400";
            shadowColor = "shadow-[4px_4px_0px_0px_#10B981]";
            tagBg = "bg-emerald-600 text-white";
            IconComp = CheckCircle2;
          } else if (toast.type === "error") {
            borderColor = "border-rose-600 dark:border-rose-500";
            shadowColor = "shadow-[4px_4px_0px_0px_#EF4444]";
            tagBg = "bg-rose-600 text-white";
            IconComp = ShieldAlert;
          } else if (toast.type === "warning") {
            borderColor = "border-amber-500 dark:border-amber-400";
            shadowColor = "shadow-[4px_4px_0px_0px_#F59E0B]";
            tagBg = "bg-amber-400 text-slate-950 font-black";
            IconComp = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-3 sm:border-4 ${borderColor} bg-white dark:bg-dark-surface ${shadowColor} p-3.5 transition-all animate-in slide-in-from-right-5 fade-in duration-200 relative overflow-hidden`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <IconComp className="h-5 w-5 text-slate-900 dark:text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.2 font-mono text-[9px] font-black uppercase ${tagBg}`}>
                      {toast.type || "INFO"}
                    </span>
                  </div>
                  <h4 className="mt-1 font-display font-black text-sm uppercase text-slate-950 dark:text-white leading-tight">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="mt-0.5 font-mono text-xs text-slate-600 dark:text-steel-300 leading-snug">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toast.id && ceesAlert.removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-rose-500 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Bottom auto-dismiss indicator bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-dark-base overflow-hidden">
                <div
                  className={`h-full ${tagBg} animate-toast-timer`}
                  style={{
                    animationDuration: `${toast.duration || 3800}ms`,
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
