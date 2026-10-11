import type { ProfilePageLayoutProps } from "../types/profile-page-layout-props.types";
import { ProfileHeader } from "./profile-header";
import { ProfileTabs } from "./profile-tabs";

export function ProfilePageLayout({ activeTab, title, description, children }: ProfilePageLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-surface-soft text-ink">
      <ProfileHeader title={title} />
      <main className="w-full px-10 py-10">
        <h1 className="font-tight text-[36px] leading-tight font-extrabold text-ink">{title}</h1>
        <p className="mt-2 text-[15px] text-text-secondary">{description}</p>
        <ProfileTabs activeTab={activeTab} />
        {children}
      </main>
    </div>
  );
}
