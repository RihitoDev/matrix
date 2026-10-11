import { MentorAvailabilityView } from "@/modules/availability";

export default async function MentorAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string | string[] }>;
}) {
  const { week } = await searchParams;
  return (
    <MentorAvailabilityView initialWeekStart={typeof week === "string" ? week : undefined} />
  );
}
