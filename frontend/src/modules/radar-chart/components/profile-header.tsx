"use client";

import { useState } from "react";
import Image from "next/image";
import { getInitials } from "@/shared/utils/get-initials";
import type { ProfileHeaderProps } from "../types/radar-profile-components.types";
import { RadarCard } from "./radar-card";

const PHOTO_SIZE = 80;

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [hasPhotoError, setHasPhotoError] = useState(false);

  return (
    <RadarCard className="overflow-hidden">
      <div className="h-[3px] bg-accent" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-5 p-6">
        {hasPhotoError ? (
          <span
            role="img"
            aria-label={profile.name}
            className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-ink font-heading text-2xl font-semibold text-surface"
          >
            {getInitials(profile.name)}
          </span>
        ) : (
          <Image
            src={profile.photoUrl}
            alt={profile.name}
            width={PHOTO_SIZE}
            height={PHOTO_SIZE}
            priority
            onError={() => setHasPhotoError(true)}
            className="size-20 shrink-0 rounded-2xl border border-border object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            Análisis de perfil profesional con IA
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight break-words text-ink">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {profile.title} · {profile.yearsOfExperience} años de experiencia
          </p>
          <ul aria-label="Tecnologías" className="mt-3 flex min-w-0 flex-wrap gap-1.5">
            {profile.technologies.map((technology) => (
              <li
                key={technology}
                className="max-w-full rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium break-words text-ink-soft hover:border-border-strong motion-safe:transition-colors"
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RadarCard>
  );
}
