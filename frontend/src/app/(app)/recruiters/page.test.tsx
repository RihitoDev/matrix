import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RecruitersPage from "./page";

vi.mock("@/modules/recruiters", () => ({
  RecruitersHomeView: () => <div data-testid="recruiters-home">Portal de empresas</div>,
}));

describe("RecruitersPage", () => {
  it("renderiza el inicio del portal de empresas", () => {
    render(<RecruitersPage />);

    expect(screen.getByTestId("recruiters-home")).toBeInTheDocument();
  });
});
