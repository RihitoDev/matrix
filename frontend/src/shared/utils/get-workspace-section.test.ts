import { describe, expect, it } from "vitest";
import { getWorkspaceSection } from "./get-workspace-section";
import { getWorkspaceTasks } from "./get-workspace-tasks";
import { getRouteRoles } from "./get-route-roles";
import { filterNavigationByRoles } from "./filter-navigation-by-roles";
import { SIDEBAR_NAVIGATION } from "@/shared/config/navigation.config";
import { WORKSPACE_SECTIONS } from "@/shared/config/workspace-sections.config";
import type { RoleTag } from "@/shared/types/role-tag.types";

describe("Unified navigation", () => {
  it.each<RoleTag>(["titulado", "estudiante", "mentor", "empresa", "administrativo"])("keeps every existing task reachable for %s", (role) => {
    const destinations = new Set([
      ...filterNavigationByRoles(SIDEBAR_NAVIGATION, [role]).map(({ href }) => href),
      ...WORKSPACE_SECTIONS.flatMap(({ items }) => items.filter(({ href }) => getRouteRoles(href).includes(role)).map(({ href }) => href)),
    ]);
    expect(getWorkspaceTasks([role]).every(({ href }) => destinations.has(href))).toBe(true);
  });
  it("resolves reports before the broader administrative area", () => {
    expect(getWorkspaceSection("/backoffice/reports/history", ["administrativo"])?.id).toBe("reports");
    expect(getWorkspaceSection("/backoffice/solicitudes/id", ["administrativo"])?.id).toBe("requests");
  });
  it("does not leak mentor-only settings into the student directory", () => {
    expect(getWorkspaceSection("/mentorship/mentors", ["estudiante"])?.items.map(({ href }) => href)).toEqual(["/mentorship/mentors"]);
    expect(getWorkspaceSection("/mentorship/mentors", ["mentor"])?.items.some(({ href }) => href === "/mentor/availability")).toBe(true);
  });
  it("excludes profile radar when a company has no permission", () => {
    const section = getWorkspaceSection("/profile/personal-info", ["empresa"]);
    expect(section?.items.some(({ href }) => href === "/profile/radar")).toBe(false);
  });
  it("does not infer an area from a partial route prefix", () => {
    expect(getWorkspaceSection("/mentorshipx", ["mentor"])).toBeNull();
  });
});
