import type { ProfileTabId } from "./profile-tab-id.types";

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
  href: string;
  isAvailable: boolean;
}
