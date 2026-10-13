import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AreaCertificationList } from "./area-certification-list";

const certifications = [
  {
    id: "cert-1",
    name: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services",
    year: 2023,
    credentialId: "AWS-DVA-7Q2K9X",
  },
  { id: "cert-2", name: "Professional Scrum Master I", issuer: "Scrum.org", year: 2021 },
];

describe("AreaCertificationList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders every certification as a gold card with issuer and year", () => {
    render(<AreaCertificationList certifications={certifications} />);

    const items = within(screen.getByRole("list", { name: "Certificaciones" })).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("AWS Certified Developer – Associate")).toBeDefined();
    expect(within(items[0]).getByText("Amazon Web Services · 2023")).toBeDefined();
    expect(within(items[1]).getByText("Scrum.org · 2021")).toBeDefined();
    items.forEach((item) => {
      expect(item.className).toContain("border-l-gold");
    });
  });

  it("shows the credential id only when it exists", () => {
    render(<AreaCertificationList certifications={certifications} />);

    const items = within(screen.getByRole("list", { name: "Certificaciones" })).getAllByRole("listitem");

    expect(within(items[0]).getByText("ID AWS-DVA-7Q2K9X").className).toContain("font-mono");
    expect(within(items[1]).queryByText(/^ID /)).toBeNull();
  });

  it("shows the subtitle and the empty message when there are no certifications", () => {
    render(<AreaCertificationList certifications={[]} />);

    expect(screen.getByText("Certificaciones")).toBeDefined();
    expect(screen.getByText("Sin información registrada")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
