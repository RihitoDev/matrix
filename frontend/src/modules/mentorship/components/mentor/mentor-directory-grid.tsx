import { MentorCard } from "./mentor-card";
import type { MentorDirectoryItem } from "../../types/mentor-directory.types";

type MentorDirectoryGridProps = {
  mentors: MentorDirectoryItem[];
};

export function MentorDirectoryGrid({
  mentors,
}: MentorDirectoryGridProps) {
  return (
    <section
      aria-label="Listado de mentores"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </section>
  );
}
