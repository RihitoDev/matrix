import { MentorFreeBlocksView } from "@/modules/availability";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MentorFreeBlocksPage({ params }: PageProps) {
  const { id } = await params;
  return <MentorFreeBlocksView mentorId={id} />;
}
