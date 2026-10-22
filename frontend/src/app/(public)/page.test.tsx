import { screen } from "@testing-library/react";
import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { eventsService } from "@/modules/events";
import Home from "./page";
afterEach(() => vi.restoreAllMocks());
describe("Public landing", () => {
 it("offers discovery before requesting an account", async () => {
   vi.spyOn(eventsService,"getEvents").mockResolvedValue({data:[],page:1,offset:0});
   render(<Home />);
   expect(screen.getByRole("heading", {level:1})).toHaveTextContent("Tu comunidad.");
   expect(screen.getByRole("link", {name:"Explorar talleres"})).toHaveAttribute("href","#workshops");
   expect(await screen.findByText("Aún no hay talleres publicados. Vuelve pronto.")).toBeInTheDocument();
 });
 it("offers a retry when published workshops cannot be loaded", async () => {
   vi.spyOn(eventsService,"getEvents").mockRejectedValue(new Error("offline"));
   render(<Home />);
   expect(await screen.findByRole("button", {name:"Volver a intentar"})).toBeInTheDocument();
   expect(screen.queryByText("Botón de ejemplo")).not.toBeInTheDocument();
 });
});
