import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RecruitersHomeView } from "./recruiters-home-view";

describe("RecruitersHomeView", () => {
  afterEach(() => cleanup());

  it("muestra el portal y un acceso al registro de vacantes", () => {
    render(<RecruitersHomeView />);

    expect(screen.getByRole("heading", { name: "Portal de empresas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registrar nueva vacante" })).toHaveAttribute(
      "href",
      "/recruiters/job-offers/new",
    );
  });
});
