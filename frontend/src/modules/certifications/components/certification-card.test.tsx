import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Certification } from "../types/certification.types";
import { CertificationCard } from "./certification-card";

const CERTIFICATION: Certification = {
  id: "certification-1",
  name: "AWS Certified Cloud Practitioner",
  issuingOrganization: "Amazon Web Services",
  issueDate: "2025-03-07",
  createdAt: "2025-03-08T10:00:00.000Z",
  updatedAt: "2025-03-08T10:00:00.000Z",
};

function renderCard(isBusy = false) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(
    <CertificationCard
      certification={CERTIFICATION}
      isBusy={isBusy}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  );
  return { onEdit, onDelete, user: userEvent.setup() };
}

describe("CertificationCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders markup in the name as plain text", () => {
    const { container } = render(
      <CertificationCard
        certification={{
          ...CERTIFICATION,
          name: "<script>alert(1)</script>",
          issuingOrganization: "O'Reilly \"Media\"",
        }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(screen.getByText(/O'Reilly "Media"/)).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders the name, the organization and the issue date", () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "AWS Certified Cloud Practitioner" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Amazon Web Services · Obtenida el/)).toBeInTheDocument();
    expect(screen.getByText("7 mar 2025")).toHaveAttribute("dateTime", "2025-03-07");
  });

  it("notifies when the certification is edited", async () => {
    const { onEdit, onDelete, user } = renderCard();

    await user.click(screen.getByRole("button", { name: "Editar AWS Certified Cloud Practitioner" }));

    expect(onEdit).toHaveBeenCalledWith(CERTIFICATION);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("notifies when the certification is deleted", async () => {
    const { onEdit, onDelete, user } = renderCard();

    await user.click(
      screen.getByRole("button", { name: "Eliminar AWS Certified Cloud Practitioner" }),
    );

    expect(onDelete).toHaveBeenCalledWith(CERTIFICATION);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("disables the actions while busy", () => {
    renderCard(true);

    expect(
      screen.getByRole("button", { name: "Editar AWS Certified Cloud Practitioner" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Eliminar AWS Certified Cloud Practitioner" }),
    ).toBeDisabled();
  });
});
