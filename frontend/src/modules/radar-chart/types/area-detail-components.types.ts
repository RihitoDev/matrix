import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  AreaDetail,
  AreaLevel,
  Certification,
  Course,
  ExperienceItem,
} from "./area-detail.types";

export interface AreaDetailPanelProps {
  area: AreaDetail;
  onClose: () => void;
  className?: string;
}

export interface AreaDetailHeaderProps {
  titleId: string;
  name: string;
  order: number;
  onClose: () => void;
}

export interface AreaMetricsProps {
  score: number;
  level: AreaLevel;
  gap: number;
  globalAverage: number;
}

export interface AreaScoreBarProps {
  score: number;
  globalAverage: number;
}

export interface AreaLevelBadgeProps {
  level: AreaLevel;
}

export interface AreaSectionProps {
  title: string;
  icon: LucideIcon;
  count: number;
  children: ReactNode;
}

export interface AreaCourseListProps {
  courses: Course[];
}

export interface AreaCertificationListProps {
  certifications: Certification[];
}

export interface AreaExperienceTimelineProps {
  experience: ExperienceItem[];
}

export interface AreaTagsProps {
  tags: string[];
}
