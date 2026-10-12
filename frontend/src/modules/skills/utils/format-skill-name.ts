export function formatSkillName(name: string): string {
  return (name ?? "").trim().split(/\s+/).filter(Boolean).join(" ");
}
