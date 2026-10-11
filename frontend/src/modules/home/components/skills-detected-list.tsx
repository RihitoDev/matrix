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
      <h3 className="text-[17px] font-bold text-[#0B1F2E]">
        Habilidades detectadas automáticamente
      </h3>
      
      <div className="flex items-center gap-2 flex-wrap">
        {skills.map((skill, index) => {
          const isMethodology = skill.toLowerCase() === "scrum";
          const badgeClass = isMethodology 
            ? "bg-[#C9A227] hover:bg-[#C9A227]/90 text-white" 
            : "bg-[#E30613] hover:bg-[#E30613]/90 text-white";

          return (
            <Badge key={index} className={badgeClass}>
              {skill}
            </Badge>
          );
        })}
      </div>

      <span className="text-[12.5px] font-semibold text-[#5B6470]">
        Análisis completado en {processingTime} s
      </span>
    </div>
  )
}