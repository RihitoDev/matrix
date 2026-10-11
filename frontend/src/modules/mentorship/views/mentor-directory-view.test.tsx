import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as directoryService from "../services/mentor-directory.service";
import { MentorDirectoryView } from "./mentor-directory-view";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MentorDirectoryView", () => {
  it("renderiza el encabezado del directorio", () => {
    vi.spyOn(directoryService, "getMentorDirectory").mockResolvedValue([]);
    render(<MentorDirectoryView />);

    expect(
      screen.getByRole("heading", {
        name: "Directorio de mentores",
      }),
    ).toBeDefined();
  });

  it("renderiza enlaces hacia los perfiles de los mentores", async () => {
    vi.spyOn(directoryService, "getMentorDirectory").mockResolvedValue([
      {
        id: "0424f370-00f0-43cf-9b8a-997af81840b9",
        fullName: "María Fernanda Rodríguez",
        headline: "Desarrolladora Backend Senior",
        technicalAreas: ["Backend"],
      },
    ]);
    render(<MentorDirectoryView />);

    expect(
      (await screen.findAllByRole("link", {
        name: /Ver perfil de/i,
      })).length,
    ).toBeGreaterThan(0);
  });
});
