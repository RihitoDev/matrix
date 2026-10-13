import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentCompany } from "./get-current-company";

describe("getCurrentCompany", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lee la empresa configurada por entorno", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "  company-id  ");
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_NAME", "TechBolivia S.R.L.");

    expect(getCurrentCompany()).toEqual({ id: "company-id", name: "TechBolivia S.R.L.", initials: "TB" });
  });

  it("devuelve id nulo y el nombre por defecto si no hay configuración", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_NAME", "");

    expect(getCurrentCompany()).toMatchObject({ id: null, name: "TechBolivia S.R.L." });
  });

  it("calcula iniciales aunque el nombre no tenga mayúsculas", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_NAME", "acme");

    expect(getCurrentCompany().initials).toBe("AC");
  });
});
