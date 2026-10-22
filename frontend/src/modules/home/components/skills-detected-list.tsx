"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"

interface SkillsDetectedProps {
  skills: string[];
  processingTime: number;
}

export const SkillsDetectedList: React.FC<SkillsDetectedProps> = ({
  skills,
  processingTime
}) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-4 font-sans">
      <h3 className="text-[17px] font-bold text-ink">
        Habilidades detectadas automáticamente
      </h3>

      <div className="flex items-center gap-2 flex-wrap">
        {skills.map((skill, index) => {
          return (
            <Badge key={index} className="border-border bg-surface-soft text-ink-soft">
              {skill}
            </Badge>
          );
        })}
      </div>

      <span className="text-[12.5px] font-semibold text-text-secondary">
        Análisis completado en {processingTime} s
      </span>
    </div>
  )
}
