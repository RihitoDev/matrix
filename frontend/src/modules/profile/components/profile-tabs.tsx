import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROFILE_TABS } from "../config/profile-tabs.config";
import type { ProfileTabsProps } from "../types/profile-tabs-props.types";

export function ProfileTabs({ activeTab }: ProfileTabsProps) {
  return (
    <nav aria-label="Secciones del perfil" className="mt-8 mb-8 border-b border-border">
      <ul className="flex gap-10">
        {PROFILE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <li key={tab.id}>
              {tab.isAvailable ? (
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "-mb-px block border-b-2 pb-3 text-[15px] transition-colors",
                    isActive
                      ? "border-accent font-semibold text-accent"
                      : "border-transparent text-text-secondary hover:text-ink",
                  )}
                >
                  {tab.label}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  title="Disponible próximamente"
                  className={cn("-mb-px block border-b-2 pb-3 text-[15px] transition-colors", "cursor-not-allowed border-transparent text-text-secondary")}
                >
                  {tab.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
