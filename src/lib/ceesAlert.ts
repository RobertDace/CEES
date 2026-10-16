// src/lib/ceesAlert.ts
"use client";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm" | "loading";

export interface AlertOptions {
  id?: string;
  type?: AlertType;
  title: string;
  message?: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  progress?: number; // 0 - 100
  showProgress?: boolean;
}

export interface ToastOptions {
  id?: string;
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number; // default 3500ms
}

type AlertCallback = {
  resolve: (value: boolean) => void;
};

class CeesAlertService {
  private activeAlert: AlertOptions | null = null;
  private alertListeners: Set<(alert: AlertOptions | null) => void> = new Set();
  private toastListeners: Set<(toasts: ToastOptions[]) => void> = new Set();
  private toasts: ToastOptions[] = [];
  private currentResolver: AlertCallback | null = null;

  // Web Audio Synth for Streetwear Haptic Sound
  public playSound(type: "click" | "success" | "error" | "alert") {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "alert") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Ignored if user hasn't interacted yet
    }
  }

  // Subscribe modal alert
  public subscribeAlert(listener: (alert: AlertOptions | null) => void) {
    this.alertListeners.add(listener);
    listener(this.activeAlert);
    return () => {
      this.alertListeners.delete(listener);
    };
  }

  // Subscribe toast stack
  public subscribeToast(listener: (toasts: ToastOptions[]) => void) {
    this.toastListeners.add(listener);
    listener(this.toasts);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  private notifyAlert() {
    this.alertListeners.forEach((l) => l(this.activeAlert));
  }

  private notifyToast() {
    this.toastListeners.forEach((l) => l([...this.toasts]));
  }

  /**
   * Tampilkan Modal Alert Umum
   */
  public fire(options: AlertOptions | string, message?: string): Promise<boolean> {
    const opts: AlertOptions =
      typeof options === "string"
        ? { title: options, message: message || "", type: "info" }
        : options;

    if (this.currentResolver) {
      this.currentResolver.resolve(false);
      this.currentResolver = null;
    }

    if (opts.type === "success") this.playSound("success");
    else if (opts.type === "error") this.playSound("error");
    else this.playSound("alert");

    this.activeAlert = {
      ...opts,
      type: opts.type || "info",
    };
    this.notifyAlert();

    return new Promise((resolve) => {
      this.currentResolver = { resolve };
    });
  }

  public playClick() {
    this.playSound("click");
  }

  public success(
    titleOrOptions: string | { title: string; message?: string; details?: string },
    message?: string,
    details?: string
  ): Promise<boolean> {
    if (typeof titleOrOptions === "object") {
      return this.fire({ type: "success", ...titleOrOptions });
    }
    return this.fire({ type: "success", title: titleOrOptions, message, details });
  }

  public error(
    titleOrOptions: string | { title: string; message?: string; details?: string },
    message?: string,
    details?: string
  ): Promise<boolean> {
    if (typeof titleOrOptions === "object") {
      return this.fire({ type: "error", danger: true, ...titleOrOptions });
    }
    return this.fire({ type: "error", title: titleOrOptions, message, details, danger: true });
  }

  public warning(
    titleOrOptions: string | { title: string; message?: string; details?: string },
    message?: string,
    details?: string
  ): Promise<boolean> {
    if (typeof titleOrOptions === "object") {
      return this.fire({ type: "warning", ...titleOrOptions });
    }
    return this.fire({ type: "warning", title: titleOrOptions, message, details });
  }

  public info(
    titleOrOptions: string | { title: string; message?: string; details?: string },
    message?: string,
    details?: string
  ): Promise<boolean> {
    if (typeof titleOrOptions === "object") {
      return this.fire({ type: "info", ...titleOrOptions });
    }
    return this.fire({ type: "info", title: titleOrOptions, message, details });
  }

  /**
   * Konfirmasi Modal Dialog (Menggantikan confirm browser native)
   */
  public confirm(options: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }): Promise<boolean> {
    this.playSound("alert");
    return this.fire({
      type: "confirm",
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || "YA, LANJUTKAN",
      cancelText: options.cancelText || "BATAL",
      danger: options.danger ?? false,
    });
  }

  /**
   * Loading & Progress Modal HUD
   */
  public loading(options: {
    title: string;
    message?: string;
    progress?: number;
    showProgress?: boolean;
  }) {
    this.playSound("click");
    this.activeAlert = {
      type: "loading",
      title: options.title,
      message: options.message || "Sedang memproses data...",
      progress: options.progress ?? 0,
      showProgress: options.showProgress ?? (typeof options.progress === "number"),
    };
    this.notifyAlert();
  }

  /**
   * Update persentase progress loading
   */
  public updateProgress(progress: number, message?: string) {
    if (this.activeAlert && this.activeAlert.type === "loading") {
      this.activeAlert = {
        ...this.activeAlert,
        progress: Math.min(100, Math.max(0, progress)),
        message: message || this.activeAlert.message,
        showProgress: true,
      };
      this.notifyAlert();
    }
  }

  /**
   * Tutup modal alert/loading aktif
   */
  public close(confirmed = false) {
    if (this.currentResolver) {
      this.currentResolver.resolve(confirmed);
      this.currentResolver = null;
    }
    this.activeAlert = null;
    this.notifyAlert();
  }

  /**
   * Toast Notification (Corner popup auto-dismiss)
   */
  public toast(options: ToastOptions | string, message?: string) {
    const opts: ToastOptions =
      typeof options === "string"
        ? { title: options, message: message || "", type: "info" }
        : options;

    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const newToast: ToastOptions = {
      ...opts,
      id,
      duration: opts.duration ?? 3800,
    };

    if (opts.type === "success") this.playSound("success");
    else if (opts.type === "error") this.playSound("error");
    else this.playSound("alert");

    this.toasts = [...this.toasts, newToast];
    this.notifyToast();

    // Auto dismiss
    setTimeout(() => {
      this.removeToast(id);
    }, newToast.duration);
  }

  public removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notifyToast();
  }
}

export const ceesAlert = new CeesAlertService();
