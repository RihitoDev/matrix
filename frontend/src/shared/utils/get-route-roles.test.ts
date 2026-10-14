import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SIDEBAR_NAVIGATION } from "@/shared/config/navigation.config";
import { getRouteRoles } from "./get-route-roles";

function getPageRoutes(directory: string, segments: string[] = []): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      const nextSegments = /^\(.+\)$/.test(entry.name) ? segments : [...segments, entry.name.replace(/^\[.+\]$/, "example-id")];
      return getPageRoutes(path.join(directory, entry.name), nextSegments);
    }
    return entry.name === "page.tsx" ? [`/${segments.join("/")}`] : [];
  });
}

describe("View role access", () => {
  it.each(getPageRoutes(path.resolve("src/app/(app)")))("defines permissions for %s", (route) => {
    expect(getRouteRoles(route).length).toBeGreaterThan(0);
  });

  it("denies unclassified routes and similar prefixes", () => {
    for (const route of ["/unknown", "/backofficex", "/recruitersx", "/eventsx", "/login"]) {
      expect(getRouteRoles(route)).toEqual([]);
    }
  });

  it.each([
    ["/vacancies/example-id", "/vacancies"],
    ["/profile/trajectory/education", "/profile"],
    ["/mentors/example-id", "/mentorship/mentors"],
    ["/mentors/example-id/availability", "/mentorship/mentors"],
    ["/recruiters/job-offers/new", "/recruiters"],
    ["/backoffice/solicitudes/example-id", "/backoffice/solicitudes"],
    ["/area-detail-preview", "/matching"],
    ["/area-detail-interaction-preview", "/matching"],
  ])("keeps %s within the permissions of its parent flow", (route, parent) => {
    expect(getRouteRoles(route)).toEqual(getRouteRoles(parent));
  });

  it("uses the same permissions for sidebar entries and direct URLs", () => {
    for (const item of SIDEBAR_NAVIGATION) {
      if (item.href) expect(item.roles).toEqual(getRouteRoles(item.href));
      for (const child of item.children ?? []) {
        expect(child.roles ?? item.roles).toEqual(getRouteRoles(child.href));
      }
    }
  });
});
