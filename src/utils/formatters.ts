export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `SND-${dateStr}-${randomNum}`;
}

export function generateLicenseKey(tier: "BASIC" | "PRO" | "ENTERPRISE"): string {
  const prefix = tier === "ENTERPRISE" ? "SUNDA-ENT" : tier === "PRO" ? "SUNDA-PRO" : "SUNDA-BASIC";
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${part1}-${part2}`;
}
