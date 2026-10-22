import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardView } from "./dashboard-view";
import type { RoleTag } from "@/shared/types/role-tag.types";
const state=vi.hoisted(()=>({roles:["titulado"] as RoleTag[]}));
vi.mock("@/shared/contexts/auth-context",()=>({useAuth:()=>state}));
afterEach(()=>{cleanup();state.roles=["titulado"];});
describe("Task dashboard",()=>{
 it("keeps tasks visible and finds CV by common wording",()=>{
  render(<DashboardView />);
  expect(screen.getByRole("link",{name:"Documentos y CV"})).toHaveAttribute("href","/profile/documents");
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"curriculum"}});
  expect(screen.getByRole("link",{name:"Documentos y CV"})).toBeInTheDocument();
  expect(screen.queryByRole("link",{name:"Vacantes"})).not.toBeInTheDocument();
 });
 it("clears empty search results",()=>{
  render(<DashboardView />);
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"zzz"}});
  fireEvent.click(screen.getByRole("button",{name:"Limpiar búsqueda"}));
  expect(screen.getByRole("link",{name:"Vacantes"})).toBeInTheDocument();
 });
 it("offers company tasks without exposing administrative tasks",()=>{
  state.roles=["empresa"];render(<DashboardView />);
  expect(screen.getByRole("link",{name:"Publicar vacante"})).toBeInTheDocument();
  expect(screen.queryByRole("link",{name:"Solicitudes de acceso"})).not.toBeInTheDocument();
 });
});
