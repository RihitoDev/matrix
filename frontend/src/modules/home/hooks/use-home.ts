"use client";

import { useEffect, useState } from "react";
import { homeService } from "../services/home.service";

export function useHome() {
  const [backendMessage, setBackendMessage] = useState<string>("Loading...");

  useEffect(() => {
    homeService
      .getWelcomeMessage()
      .then((data) => {
        setBackendMessage(data);
      })
      .catch(() => {
        setBackendMessage("Error connecting to backend");
      });
  }, []);

  return { backendMessage };
}