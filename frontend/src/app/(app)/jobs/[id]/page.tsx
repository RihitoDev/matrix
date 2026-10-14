import { JobMatchDetailView } from "@/modules/matching";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobMatchDetailView jobOfferId={id} />;
}
