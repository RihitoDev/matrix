import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/shared/components/layout";
import { MENTOR_PROFILE_BREADCRUMB_ITEMS } from "../../constants/mentor-profile-breadcrumb.constants";

type MentorProfileNavigationProps = {
  mentorName: string;
};

export function MentorProfileNavigation({
  mentorName,
}: MentorProfileNavigationProps) {
  const breadcrumbItems = [
    ...MENTOR_PROFILE_BREADCRUMB_ITEMS,
    { label: mentorName },
  ];

  return (
    <div className="mb-6 [&>nav]:mb-0 [&>nav]:text-umssy-secondary [&_svg]:size-4 [&_[aria-current=page]]:text-umssy-ink">
      <Link
        href="/mentorship/mentors"
        className={buttonVariants({
          variant: "outline",
          className:
            "mb-4 h-auto gap-2 rounded-lg border-umssy-border bg-white px-4 py-2 text-sm font-semibold text-umssy-ink shadow-sm transition hover:bg-umssy-background hover:text-umssy-ink hover:shadow-md active:translate-y-0 focus-visible:ring-2 focus-visible:ring-umssy-red",
        })}
      >
        <ArrowLeft size={16} />
        Volver al directorio
      </Link>

      <Breadcrumbs items={breadcrumbItems} />
    </div>
  );
}
