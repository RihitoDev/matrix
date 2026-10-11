import { renderWithQuery as render } from "@/shared/testing/render-with-query";
import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as service from "@/modules/mentorship/services/mentor-profile.service";
import { MENTOR_PROFILE_FIXTURE } from "@/modules/mentorship/testing/mentor-profile.fixture";
import MentorProfilePage from "./page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MentorProfilePage", () => {
  it("conserva el UUID de la ruta al consultar el perfil", async () => {
    const request = vi
      .spyOn(service, "getMentorProfile")
      .mockResolvedValue(MENTOR_PROFILE_FIXTURE);
    const page = await MentorProfilePage({
      params: Promise.resolve({ id: MENTOR_PROFILE_FIXTURE.id }),
    });

    render(page);

    expect((await screen.findAllByText("Ana Rojas")).length).toBeGreaterThan(0);
    expect(screen.getByText("Arquitecta de Software")).toBeInTheDocument();
    expect(screen.getByText("Sobre mí")).toBeInTheDocument();
    expect(screen.getByText("Trayectoria profesional")).toBeInTheDocument();
    expect(screen.getByText("Áreas técnicas")).toBeInTheDocument();
    expect(screen.getByText("Tipos de orientación")).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith(
      MENTOR_PROFILE_FIXTURE.id,
      expect.any(AbortSignal),
    );
  });
});
