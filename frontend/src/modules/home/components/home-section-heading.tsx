import { cn } from "cn";
import type { HomeSectionHeadingProps } from "../types/home-section-heading-props.types";
import { HOME_SECTION_TITLE_CLASS, HOME_SHIELD_LEFT_CLASS, HOME_SHIELD_RIGHT_CLASS } from "../constants/home.constants";

export function HomeSectionHeading({ title }: HomeSectionHeadingProps) {
  return (
    <div>
      <span className="mb-5 flex gap-1.5" aria-hidden="true">
        <span className={cn("h-4 w-10 bg-danger", HOME_SHIELD_LEFT_CLASS)} />
        <span className={cn("h-4 w-10 bg-danger", HOME_SHIELD_RIGHT_CLASS)} />
      </span>
      <h2 className={HOME_SECTION_TITLE_CLASS}>{title}</h2>
    </div>
  );
}
