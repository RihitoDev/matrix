import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { eventsService } from "../services/events.service";
import { PublicWorkshopsView } from "./public-workshops-view";
import { PublicWorkshopDetailView } from "./public-workshop-detail-view";
const event = {id:"taller-1",title:"Diseño de interfaces",category:{id:"cat",name:"Tecnología"},description:"Sesión práctica.",instructorName:"Ana",eventDate:"2026-11-10",startTime:"09:00",endTime:"12:00",location:"Aula 1",capacity:20,availableSpots:10,registrationCount:10,statusId:"open",modalityId:"m",modality:{id:"m",title:"Presencial"}};
afterEach(() => {cleanup();vi.restoreAllMocks();});
describe("Public workshops", () => {
 it("opens real details and applies search on submission",async () => {
  const get = vi.spyOn(eventsService,"getEvents").mockResolvedValue({data:[event],page:1,offset:0});
  render(<PublicWorkshopsView />);
  expect(await screen.findByRole("heading",{name:event.title})).toBeInTheDocument();
  expect(screen.getByRole("link",{name:"Ver taller"})).toHaveAttribute("href","/workshops/taller-1");
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"interfaces"}});
  fireEvent.click(screen.getByRole("button",{name:"Buscar"}));
  await waitFor(() => expect(get).toHaveBeenCalledWith({page:1,limit:9,search:"interfaces"},expect.any(AbortSignal)));
  fireEvent.click(screen.getByRole("button",{name:"Limpiar"}));
  expect(screen.getByRole("searchbox")).toHaveValue("");
 });
 it("recovers from a failed query without fabricated events",async () => {
  const get = vi.spyOn(eventsService,"getEvents").mockRejectedValueOnce(new Error("offline")).mockResolvedValue({data:[event],page:1,offset:0});
  render(<PublicWorkshopsView />);
  fireEvent.click(await screen.findByRole("button",{name:"Volver a intentar"}));
  expect(await screen.findByRole("heading",{name:event.title})).toBeInTheDocument();
  expect(get).toHaveBeenCalledTimes(2);
 });
 it("explains empty search results and prevents unnecessary next-page requests",async () => {
  vi.spyOn(eventsService,"getEvents").mockResolvedValue({data:[],page:1,offset:0});
  render(<PublicWorkshopsView />);
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"noexiste"}});
  fireEvent.click(screen.getByRole("button",{name:"Buscar"}));
  expect(await screen.findByText("No encontramos talleres con ese nombre")).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Siguiente"})).toBeDisabled();
 });
 it("shows public detail and a truthful sign-in destination",async () => {
  vi.spyOn(eventsService,"getEvent").mockResolvedValue(event);
  render(<PublicWorkshopDetailView id={event.id} />);
  expect(await screen.findByRole("heading",{name:event.title})).toBeInTheDocument();
  expect(screen.getByText("Sesión práctica.")).toBeInTheDocument();
  expect(screen.getAllByRole("link",{name:"Iniciar sesión"}).some((link)=>link.getAttribute("href")==="/login?next=%2Fevents")).toBe(true);
  expect(screen.queryByRole("button",{name:"Inscribirme"})).not.toBeInTheDocument();
 });
 it("provides a way back for unavailable detail",async () => {
  vi.spyOn(eventsService,"getEvent").mockRejectedValue(new Error("missing"));
  render(<PublicWorkshopDetailView id="missing" />);
  expect(await screen.findByRole("heading",{name:"No pudimos abrir este taller"})).toBeInTheDocument();
  expect(screen.getByRole("link",{name:"Todos los talleres"})).toHaveAttribute("href","/workshops");
 });
});
