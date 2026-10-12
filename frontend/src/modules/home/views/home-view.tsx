"use client";

import Link from "next/link";
import { useHome } from "../hooks/use-home";
import { Button } from "@/components/ui/button";
import { MissingRequirements } from "@/modules/matching/components/missing-requirements";
import { MatchScoreBar } from "@/modules/matching/components/match-score-bar.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { SkillsDetectedList } from "../components/skills-detected-list";

export function HomeView() {
  const { backendMessage, requirements, compatibilityScore } = useHome();

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-soft p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle> UMSSY</CardTitle>
          <CardDescription>
            Respuesta del backend: <strong>{backendMessage}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          
          <SkillsDetectedList
            skills={["Python", "Django", "Scrum"]}
            processingTime={1.5}
          />

          {}
          <MatchScoreBar score={compatibilityScore} />

          <Button>Botón de ejemplo</Button>

          <Link href="/vacancies" passHref>
            <Button className="w-full">Vacantes</Button>
          </Link>
          
          {}
          <MissingRequirements requirements={requirements} />  
        </CardContent>
      </Card>
    </div>
  );
}
