import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isDeadlinePassed(kickoffAt: string): boolean {
  const kickoff = new Date(kickoffAt);
  const deadline = new Date(kickoff.getTime() - 24 * 60 * 60 * 1000);
  return new Date() >= deadline;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function formatTimeAR(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function formatTimeEU(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export function formatTimeOnly(dateStr: string, tz: string): string {
  return new Date(dateStr).toLocaleString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

export function formatDayShort(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
