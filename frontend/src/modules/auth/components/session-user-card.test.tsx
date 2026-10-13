import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { profileService } from "@/modules/profile";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { SessionUserCard } from "./session-user-card";

vi.mock("@/modules/profile", () => ({ profileService: { getProfile: vi.fn() } }));
vi.mock("@/shared/services/storage/access-token-storage", () => ({ getAccessToken: vi.fn() }));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><SessionUserCard /></QueryClientProvider>);
}

describe("SessionUserCard", () => {
  it("shows the authenticated profile and role", async () => {
    vi.mocked(getAccessToken).mockReturnValue(`header.${btoa(JSON.stringify({ roleTag: "titulado" }))}.signature`);
    vi.mocked(profileService.getProfile).mockResolvedValue({ firstName: "Usuario", lastName: "De Prueba" } as Awaited<ReturnType<typeof profileService.getProfile>>);
    renderCard();
    expect(await screen.findByText("Usuario De Prueba")).toBeInTheDocument();
    expect(screen.getByText("Titulado")).toBeInTheDocument();
  });

  it("keeps a visible fallback when the profile request fails", async () => {
    vi.mocked(getAccessToken).mockReturnValue("invalid-token");
    vi.mocked(profileService.getProfile).mockRejectedValue(new Error("Unavailable"));
    renderCard();
    await waitFor(() => expect(screen.getByText("Usuario")).toBeInTheDocument());
    expect(screen.getByText("Usuario autenticado")).toBeInTheDocument();
  });

  it("does not request a profile without a session", () => {
    vi.mocked(getAccessToken).mockReturnValue(null);
    const { container } = renderCard();
    expect(container).toBeEmptyDOMElement();
    expect(profileService.getProfile).not.toHaveBeenCalled();
  });
});
