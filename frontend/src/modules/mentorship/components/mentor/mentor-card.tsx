import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/shared/utils/get-initials";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { MentorDirectoryItem } from "../../types/mentor-directory.types";

type MentorCardProps = {
  mentor: MentorDirectoryItem;
};

export function MentorCard({ mentor }: MentorCardProps) {
  const hasTechnicalAreas = mentor.technicalAreas.length > 0;

  return (
    <Card
      className="h-full min-w-0 border-border bg-surface shadow-sm"
      aria-labelledby={`mentor-${mentor.id}`}
    >
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-1 basis-36 items-start gap-4">
            <Avatar className="size-14 shrink-0">
              {mentor.photoUrl ? (
                <AvatarImage
                  src={mentor.photoUrl}
                  alt={`Foto de ${mentor.fullName}`}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback>{getInitials(mentor.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2
                id={`mentor-${mentor.id}`}
                className="[overflow-wrap:anywhere] text-lg font-semibold text-ink"
              >
                {mentor.fullName}
              </h2>

              {mentor.headline ? (
                <p className="mt-1 [overflow-wrap:anywhere] text-sm text-text-secondary">
                  {mentor.headline}
                </p>
              ) : null}
              {mentor.education ? (
                <p className="mt-2 [overflow-wrap:anywhere] text-sm text-text-secondary">
                  {mentor.education.degree} · {mentor.education.institution}
                </p>
              ) : null}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`ml-auto gap-1.5 px-2.5 ${mentor.isAvailable ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-surface-soft text-text-secondary"}`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${mentor.isAvailable ? "bg-emerald-600" : "bg-text-secondary"}`}
            />
            {mentor.isAvailable ? "Disponible para mentoría" : "No disponible"}
          </Badge>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">
            Áreas técnicas
          </p>

          {hasTechnicalAreas ? (
            <ul className="flex flex-wrap gap-2">
              {mentor.technicalAreas.map((area) => (
                <li
                  key={area}
                  className="min-w-0 max-w-full [overflow-wrap:anywhere] rounded-md border border-border bg-surface-soft px-2.5 py-1 text-xs text-ink-soft"
                >
                  {area}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">
              Sin áreas registradas
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">
            Tipos de orientación
          </p>
          {mentor.orientationTypes.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {mentor.orientationTypes.map((orientationType) => (
                <li
                  key={orientationType}
                  className="min-w-0 max-w-full [overflow-wrap:anywhere] rounded-md border border-border bg-surface-soft px-2.5 py-1 text-xs text-ink-soft"
                >
                  {orientationType}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">
              Sin orientaciones registradas
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-end bg-surface">
        <Link
          href={`/mentors/${mentor.id}`}
          className={buttonVariants({
            variant: "outline",
            className: "max-w-full border-border-strong text-ink",
          })}
          aria-label={`Ver perfil de ${mentor.fullName}`}
        >
          Ver perfil
        </Link>
      </CardFooter>
    </Card>
  );
}
