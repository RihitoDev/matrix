import { PublicWorkshopDetailView } from "@/modules/events";
export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 return <PublicWorkshopDetailView id={id} />;
}
