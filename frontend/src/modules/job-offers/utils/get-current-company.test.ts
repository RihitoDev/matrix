import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken, saveAccessToken } from "@/shared/services/storage/access-token-storage";
import { DEFAULT_COMPANY_ID } from "../constants/vacancies.constants";
import { buildSessionToken } from "../testing/vacancy-fixtures";
import { getCurrentCompany } from "./get-current-company";

describe("getCurrentCompany", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    clearAccessToken();
  });

  it("usa la empresa del seed cuando la sesión es de empresa", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_NAME", "");
    saveAccessToken(buildSessionToken("empresa"));

    expect(getCurrentCompany()).toEqual({ id: DEFAULT_COMPANY_ID, name: "TechBolivia S.R.L.", initials: "TB" });
  });

  it("permite sobrescribir la empresa por entorno", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_ID", "  company-id  ");
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_NAME", "NovaSoft Bolivia");
    saveAccessToken(buildSessionToken("empresa"));

    expect(getCurrentCompany()).toEqual({ id: "company-id", name: "NovaSoft Bolivia", initials: "NS" });
  });

  it("no asocia empresa si la sesión es de otro rol", () => {
    saveAccessToken(buildSessionToken("titulado"));

    expect(getCurrentCompany().id).toBeNull();
  });

  it("no asocia empresa sin sesión", () => {
    expect(getCurrentCompany().id).toBeNull();
  });

  it("calcula iniciales aunque el nombre no tenga mayúsculas", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_COMPANY_NAME", "acme");

    expect(getCurrentCompany().initials).toBe("AC");
  });
});
