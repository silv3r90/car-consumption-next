import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatierung für Währung
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Formatierung für Zahlen mit Dezimalstellen
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Monatsnamen
export const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

// Farbpalette für Charts
export const chartColors = {
  blue: "rgba(59, 130, 246, 0.7)",
  blueLight: "rgba(59, 130, 246, 0.3)",
  red: "rgba(239, 68, 68, 0.7)",
  redLight: "rgba(239, 68, 68, 0.3)",
  green: "rgba(34, 197, 94, 0.7)",
  greenLight: "rgba(34, 197, 94, 0.3)",
  yellow: "rgba(234, 179, 8, 0.7)",
  yellowLight: "rgba(234, 179, 8, 0.3)",
};