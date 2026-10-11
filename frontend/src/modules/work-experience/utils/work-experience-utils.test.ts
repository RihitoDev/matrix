import { describe, expect, it } from "vitest";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import { formatWorkPeriod } from "./format-work-period";
import { sortWorkExperiences } from "./sort-work-experiences";

function createExperience(
  id: string,
  startDate: string,
  isCurrent: boolean,
): WorkExperienceItem {
  return {
    id,
    companyName: "Synapse Labs",
    position: `Position ${id}`,
    startDate,
    endDate: isCurrent ? null : "2024-12-01",
    isCurrent,
    description: null,
  };
}

describe("formatWorkPeriod", () => {
  it("shows Actualidad for a current job", () => {
    expect(formatWorkPeriod("2024-07-01", null, true)).toBe("Jul 2024 – Actualidad");
  });

  it("shows the year once when both dates are in the same year", () => {
    expect(formatWorkPeriod("2024-07-01", "2024-12-01", false)).toBe("Jul – Dic 2024");
  });

  it("shows both years when the dates are in different years", () => {
    expect(formatWorkPeriod("2023-03-01", "2024-12-01", false)).toBe("Mar 2023 – Dic 2024");
  });
});

describe("sortWorkExperiences", () => {
  it("orders current jobs first and then from the most recent", () => {
    const current = createExperience("current", "2025-03-01", true);
    const recent = createExperience("recent", "2024-07-01", false);
    const oldest = createExperience("oldest", "2023-03-01", false);

    const sorted = sortWorkExperiences([oldest, recent, current]);

    expect(sorted.map((experience) => experience.id)).toEqual(["current", "recent", "oldest"]);
  });
});
