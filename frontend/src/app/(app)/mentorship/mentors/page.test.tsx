import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMentorDirectory } from "@/modules/mentorship/services/mentor-directory.service";
import MentorDirectoryPage from "./page";

vi.mock("@/modules/mentorship/services/mentor-directory.service", () => ({
  getMentorDirectory: vi.fn(),
}));

let queryClient: ReturnType<typeof render>["client"] | undefined;

afterEach(() => {
  cleanup();
  queryClient?.clear();
  queryClient = undefined;
  vi.clearAllMocks();
});

describe("MentorDirectoryPage", () => {
  it("renderiza el directorio despues de resolver la consulta", async () => {
    const mentor = {
      id: "0424f370-00f0-43cf-9b8a-997af81840b9",
      fullName: "Ana Rojas",
      headline: "Desarrolladora Backend",
      technicalAreas: ["Backend"],
    };
    vi.mocked(getMentorDirectory).mockResolvedValue([mentor]);
    queryClient = render(<MentorDirectoryPage />).client;

    expect(
      await screen.findByRole("link", {
        name: `Ver perfil de ${mentor.fullName}`,
      }),
    ).toHaveAttribute("href", `/mentors/${mentor.id}`);
    expect(getMentorDirectory).toHaveBeenCalledExactlyOnceWith(
      expect.any(AbortSignal),
    );
    expect(queryClient.isFetching()).toBe(0);

    expect(
      screen.getByRole("heading", {
        name: "Directorio de mentores",
      }),
    ).toBeInTheDocument();
  });
});
