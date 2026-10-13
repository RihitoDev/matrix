import Link from "next/link";
import { GraduationCap, UserPlus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { MentorProfile } from "../../types/mentor-profile.types";

type MentorProfileHeaderProps = {
  mentor: MentorProfile;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MentorProfileHeader({ mentor }: MentorProfileHeaderProps) {
  const primaryEducation = mentor.educations[0];

  return (
    <Card className="gap-0 overflow-visible rounded-xl border border-umssy-border bg-white py-0 text-base ring-0">
      <CardContent className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar className="size-24 shrink-0 text-2xl">
            {mentor.photoUrl ? (
              <AvatarImage
                src={mentor.photoUrl}
                alt={`Foto de ${mentor.fullName}`}
                className="border-2 border-umssy-border object-cover"
              />
            ) : null}
            <AvatarFallback className="border-2 border-umssy-border bg-white text-2xl font-bold text-umssy-ink shadow-sm">
              {getInitials(mentor.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="min-w-0 flex-1 basis-48 [overflow-wrap:anywhere] text-3xl font-extrabold text-umssy-ink">
                {mentor.fullName}
              </h1>
              <Badge
                variant="outline"
                className={`gap-1.5 px-2.5 ${mentor.isAvailable ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-surface-soft text-text-secondary"}`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-full ${mentor.isAvailable ? "bg-emerald-600" : "bg-text-secondary"}`}
                />
                {mentor.isAvailable ? "Disponible para mentoría" : "No disponible"}
              </Badge>
            </div>

            {mentor.headline && (
              <p className="mt-1 [overflow-wrap:anywhere] text-lg font-semibold text-umssy-secondary">
                {mentor.headline}
              </p>
            )}

            {primaryEducation && (
              <div className="mt-3 flex items-start gap-2 text-sm text-umssy-secondary">
                <GraduationCap
                  size={18}
                  className="mt-0.5 shrink-0 text-umssy-gold"
                />

                <p className="min-w-0 [overflow-wrap:anywhere]">
                  {primaryEducation.degree} · {primaryEducation.institution}
                </p>
              </div>
            )}
          </div>
        </div>

        {mentor.isAvailable ? (
          <Link
            href={`/mentors/${mentor.id}/availability`}
            className={cn(
              buttonVariants(),
              "h-auto w-full shrink-0 gap-2 rounded-lg border-0 bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-90 active:translate-y-0 sm:px-6 sm:text-base xl:w-auto",
            )}
          >
            <UserPlus className="size-5" />
            Solicitar mentoría
          </Link>
        ) : (
          <Button
            type="button"
            disabled
            className="h-auto w-full shrink-0 gap-2 rounded-lg border-0 bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-90 active:translate-y-0 sm:px-6 sm:text-base xl:w-auto"
          >
            <UserPlus className="size-5" />
            Solicitar mentoría
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
