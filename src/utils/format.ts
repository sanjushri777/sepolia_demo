export function formatDataSize(bytes: string): string {
  const num = Number(bytes);
  if (isNaN(num)) return "-";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " GB";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " MB";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + " KB";
  return num + " B";
}