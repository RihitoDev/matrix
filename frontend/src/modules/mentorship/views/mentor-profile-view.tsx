"use client";

import { MentorProfileHeader } from "../components/mentor/mentor-profile-header";
import { MentorAbout } from "../components/mentor/mentor-about";
import { MentorCareer } from "../components/mentor/mentor-career";
import { MentorGuidanceTypes } from "../components/mentor/mentor-guidance-types";
import { MentorTechnicalAreas } from "../components/mentor/mentor-technical-areas";
import { useMentorProfile } from "../hooks/use-mentor-profile";
import { MentorQueryFeedback } from "../components/mentor/mentor-query-feedback";
import { MentorQuerySkeleton } from "../components/mentor/mentor-query-skeleton";
import { MentorProfileNavigation } from "../components/mentor/mentor-profile-navigation";

type MentorProfileViewProps = {
  mentorId: string;
};

export function MentorProfileView({ mentorId }: MentorProfileViewProps) {
  const { data: mentor, isPending, isError, isFetching, refetch } =
    useMentorProfile(mentorId);

  if (isPending || (isError && isFetching)) {
    return (
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-8">
        <MentorQuerySkeleton isProfile />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-8">
        <MentorQueryFeedback
          title="No pudimos cargar el perfil"
          description="Ocurrió un problema al consultar este perfil. Puedes reintentar o volver al directorio."
          onRetry={() => {
            void refetch();
          }}
          showDirectoryLink
        />
      </main>
    );
  }

  if (!mentor) {
    return (
      <main className="min-h-screen bg-surface-soft p-8">
        <MentorQueryFeedback
          title="Mentor no encontrado"
          description="No se pudo encontrar el perfil solicitado."
          showDirectoryLink
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-soft p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <MentorProfileNavigation mentorName={mentor.fullName} />
        <MentorProfileHeader mentor={mentor} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            {mentor.aboutMe && <MentorAbout description={mentor.aboutMe} />}

            <MentorGuidanceTypes
              key={mentor.id}
              orientationTypes={mentor.orientationTypes}
            />
          </div>

          <div className="flex flex-col gap-8 lg:col-span-4">
            <MentorCareer mentor={mentor} />

            <MentorTechnicalAreas areas={mentor.technicalAreas} />
          </div>
        </div>
      </div>
    </main>
  );
}
