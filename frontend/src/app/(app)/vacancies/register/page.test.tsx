import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegisterPage from "./page";

vi.mock("@/modules/vacancies", () => ({
  RegisterVacancyView: () => <div data-testid="register-view">Vista de Registro</div>,
}));

describe("RegisterPage", () => {
  it("renderiza la vista de registro de vacantes", () => {
    render(<RegisterPage />);

    expect(screen.getByTestId("register-view")).toBeInTheDocument();
  });
});
