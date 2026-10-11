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
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
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

          <div className="min-w-0">
            <h1 className="break-words text-3xl font-extrabold text-umssy-ink">
              {mentor.fullName}
            </h1>

            {mentor.headline && (
              <p className="mt-1 break-words text-lg font-semibold text-umssy-secondary">
                {mentor.headline}
              </p>
            )}

            {mentor.skills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-umssy-secondary">
                  Habilidades
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {mentor.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="h-auto rounded-lg border-umssy-border bg-umssy-background px-3 py-1 text-sm font-normal text-umssy-secondary"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {primaryEducation && (
              <div className="mt-3 flex items-start gap-2 text-sm text-umssy-secondary">
                <GraduationCap
                  size={18}
                  className="mt-0.5 shrink-0 text-umssy-gold"
                />

                <p className="break-words">
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
              "h-auto w-full shrink-0 gap-2 rounded-lg border-0 bg-accent px-6 py-3 text-base font-semibold text-white transition hover:brightness-90 active:translate-y-0 sm:w-auto",
            )}
          >
            <UserPlus className="size-5" />
            Solicitar mentoría
          </Link>
        ) : (
          <Button
            type="button"
            disabled
            className="h-auto w-full shrink-0 gap-2 rounded-lg border-0 bg-accent px-6 py-3 text-base font-semibold text-white transition hover:brightness-90 active:translate-y-0 sm:w-auto"
          >
            <UserPlus className="size-5" />
            Solicitar mentoría
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
