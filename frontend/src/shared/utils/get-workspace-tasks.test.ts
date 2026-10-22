import { describe, expect, it } from "vitest";
import { getWorkspaceTasks, normalizeSearch } from "./get-workspace-tasks";
import { getRouteRoles } from "./get-route-roles";
import type { RoleTag } from "@/shared/types/role-tag.types";
describe("Workspace discovery", () => {
 it.each<RoleTag>(["titulado","mentor","estudiante","empresa","administrativo"])("shows only permitted destinations for %s",(role) => {
  const tasks = getWorkspaceTasks([role]);
  expect(tasks.length).toBeGreaterThan(0);
  expect(tasks.every((task) => getRouteRoles(task.href).includes(role))).toBe(true);
 });
 it("finds accented labels and common task names",() => {
  expect(normalizeSearch("  FORMACIÓN ")).toBe("formacion");
  expect(getWorkspaceTasks(["titulado"],"curriculum").map((task) => task.href)).toEqual(["/profile/documents"]);
  expect(getWorkspaceTasks(["titulado"],"formacion").some((task) => task.href === "/profile/trajectory/education")).toBe(true);
 });
 it("never reveals administration through search",() => {
  expect(getWorkspaceTasks(["titulado"],"aprobar")).toEqual([]);
  expect(getWorkspaceTasks([],"")).toEqual([]);
 });
 it("combines roles without duplicating destinations",() => {
  const tasks = getWorkspaceTasks(["administrativo","mentor"]);
  expect(tasks.some((task) => task.href === "/backoffice/solicitudes")).toBe(true);
  expect(tasks.some((task) => task.href === "/mentor/availability")).toBe(true);
  expect(new Set(tasks.map((task) => task.href)).size).toBe(tasks.length);
 });
});
