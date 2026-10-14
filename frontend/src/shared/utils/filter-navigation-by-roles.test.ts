import { describe, expect, it } from "vitest";
import { SIDEBAR_NAVIGATION } from "@/shared/config/navigation.config";
import { filterNavigationByRoles } from "./filter-navigation-by-roles";

function getPaths(roles: Parameters<typeof filterNavigationByRoles>[1]) {
  return filterNavigationByRoles(SIDEBAR_NAVIGATION, roles).flatMap((item) =>
    item.children ? item.children.map((child) => child.href) : [item.href],
  );
}

describe("Role navigation", () => {
  it("gives graduates the participation entry without mentor-only availability", () => {
    const paths = getPaths(["titulado"]);
    expect(paths).toContain("/mentors/participation");
    expect(paths).not.toContain("/mentor/availability");
    expect(paths).not.toContain("/backoffice/solicitudes");
    expect(paths).not.toContain("/recruiters");
  });

  it("combines graduate and mentor functions without duplicate entries", () => {
    const paths = getPaths(["titulado", "mentor"]);
    expect(paths).toContain("/mentor/availability");
    expect(paths).toContain("/vacancies");
    expect(paths.filter((path) => path === "/chat")).toHaveLength(1);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("exposes recruiter functions only to company accounts", () => {
    const paths = getPaths(["empresa"]);
    expect(paths).not.toContain("/chat");
    expect(paths).toContain("/recruiters/job-offers/new");
    expect(paths).toContain("/matching");
    expect(paths).toContain("/profile");
    expect(paths).not.toContain("/profile/radar");
    expect(paths).not.toContain("/mentor/availability");
    expect(paths).not.toContain("/backoffice/solicitudes");
  });

  it("combines administrative and mentor functions", () => {
    const paths = getPaths(["administrativo", "mentor"]);
    expect(paths).toContain("/backoffice/solicitudes");
    expect(paths).toContain("/backoffice/reports/history");
    expect(paths).toContain("/mentor/availability");
    expect(paths).toContain("/chat");
  });

  it("hides chat from accounts with only the administrative role", () => {
    const paths = getPaths(["administrativo"]);
    expect(paths).not.toContain("/chat");
    expect(paths).not.toContain("/profile");
    expect(paths).toContain("/affinity-radar/review-queue");
  });

  it("hides empty groups from students and users without roles", () => {
    const paths = getPaths(["estudiante"]);
    expect(paths).toContain("/mentorship/mentors");
    expect(paths).not.toContain("/mentors/participation");
    expect(paths).not.toContain("/mentor/availability");
    expect(paths).not.toContain("/chat");
    expect(paths).not.toContain("/events");
    expect(filterNavigationByRoles(SIDEBAR_NAVIGATION, [])).toEqual([]);
  });
});
