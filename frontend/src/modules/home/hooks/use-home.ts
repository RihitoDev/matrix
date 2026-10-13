"use client";

import { useEffect, useState } from "react";
import { homeService } from "../services/home.service";

interface Requirement {
  id: string;
  name: string;
  status: "cumple" | "pendiente";
}

export function useHome() {
  const [backendMessage, setBackendMessage] = useState<string>("Loading...");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(0);

  useEffect(() => {
    homeService
      .getWelcomeMessage()
      .then((data) => {
        setBackendMessage(data);

        setCompatibilityScore(65);
        setRequirements([
          { id: "1", name: "Licenciatura en Ingeniería de Sistemas", status: "cumple" },
          { id: "2", name: "3 años de experiencia en React", status: "pendiente" },
          { id: "3", name: "Inglés B2 (Intermedio alto)", status: "cumple" },
          { id: "4", name: "Certificación en AWS o Azure", status: "pendiente" }
        ]);
      })
      .catch(() => {
        setBackendMessage("Error connecting to backend");
      });
  }, []);

  return { backendMessage, requirements, compatibilityScore };
}