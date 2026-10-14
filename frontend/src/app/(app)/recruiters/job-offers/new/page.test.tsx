import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewJobOfferPage from "./page";

vi.mock("@/modules/job-offers", () => ({
  RegisterVacancyView: () => <div data-testid="register-view">Vista de Registro</div>,
}));

describe("NewJobOfferPage", () => {
  it("renderiza la vista de registro de vacantes", () => {
    render(<NewJobOfferPage />);

    expect(screen.getByTestId("register-view")).toBeInTheDocument();
  });
});
