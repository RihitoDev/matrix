import { SectionCard } from "./section-card";

export function WritingTipsCard() {
  return (
    <SectionCard title="Para escribirla mejor">
      <ul className="flex list-disc flex-col gap-1 pl-4 text-[13px] text-text-secondary">
        <li>Usa un titular breve y concreto.</li>
        <li>Menciona tu especialidad.</li>
        <li>Explica qué oportunidades buscas.</li>
      </ul>
    </SectionCard>
  );
}
