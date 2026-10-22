import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
interface MentorProfileNavigationProps { mentorName: string; }
export function MentorProfileNavigation({ mentorName }: MentorProfileNavigationProps) {
  return <nav aria-label={`Navegación del perfil de ${mentorName}`} className="mb-5"><Link href="/mentorship/mentors" className={buttonVariants({ variant: "ghost", className: "gap-2 px-0 text-text-secondary hover:bg-transparent hover:text-accent" })}><ArrowLeft aria-hidden="true" />Volver al directorio</Link></nav>;
}
