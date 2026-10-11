import type { ReactNode } from "react";
import type { ProfileTabId } from "./profile-tab-id.types";

export interface ProfilePageLayoutProps {
  activeTab?: ProfileTabId;
  title: string;
  description: string;
  children: ReactNode;
}
