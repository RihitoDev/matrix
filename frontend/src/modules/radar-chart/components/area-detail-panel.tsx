"use client";

import { useId } from "react";
import { Briefcase, GraduationCap, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { AREA_ORDER } from "../data/area-details.data";
import type { AreaDetailPanelProps } from "../types/area-detail-components.types";
import { AreaCertificationList } from "./area-certification-list";
import { AreaCourseList } from "./area-course-list";
import { AreaDetailHeader } from "./area-detail-header";
import { AreaExperienceTimeline } from "./area-experience-timeline";
import { AreaMetrics } from "./area-metrics";
import { AreaSection } from "./area-section";
import { AreaTags } from "./area-tags";

export function AreaDetailPanel({ area, onClose, className }: AreaDetailPanelProps) {
  const titleId = useId();

  return (
    <section
      key={area.id}
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface font-sans text-sm text-ink shadow-[0_1px_2px_rgba(11,31,46,0.04),0_8px_24px_-12px_rgba(11,31,46,0.12)] duration-200 fade-in slide-in-from-bottom-1 motion-safe:animate-in",
        className,
      )}
    >
      <div className="h-[3px] shrink-0 bg-accent" aria-hidden="true" />
      <AreaDetailHeader
        titleId={titleId}
        name={area.name}
        order={AREA_ORDER.indexOf(area.id) + 1}
        onClose={onClose}
      />
      <AreaMetrics
        score={area.score}
        level={area.level}
        gap={area.gap}
        globalAverage={area.globalAverage}
      />
      <div className="grid max-h-[60vh] min-w-0 grid-cols-1 divide-y divide-border overflow-y-auto [scrollbar-color:var(--color-border-strong)_transparent] [scrollbar-width:thin] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AreaSection
          title="Cursos y certificaciones"
          icon={GraduationCap}
          count={area.courses.length + area.certifications.length}
        >
          <AreaCourseList courses={area.courses} />
          <AreaCertificationList certifications={area.certifications} />
        </AreaSection>
        <AreaSection title="Experiencia" icon={Briefcase} count={area.experience.length}>
          <AreaExperienceTimeline experience={area.experience} />
        </AreaSection>
        <AreaSection title="Otros" icon={Tags} count={area.tags.length}>
          <AreaTags tags={area.tags} />
        </AreaSection>
      </div>
    </section>
  );
}
