const KB = 1024;
const MB = KB * 1024;

// Tamaño legible en español: coma decimal y sin ",0" sobrante (por ejemplo "340 KB", "2,3 MB", "10 MB")
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
  const megabytes = Math.round((bytes / MB) * 10) / 10;
  return `${String(megabytes).replace(".", ",")} MB`;
}
