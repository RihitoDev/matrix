import { VacancyDetailView } from "@/modules/vacancies";
import type { VacancyDetailPageProps } from "@/modules/vacancies";

export default async function VacancyDetailPage({ params }: VacancyDetailPageProps) {
  const { id } = await params;
  return <VacancyDetailView id={id} />;
}
