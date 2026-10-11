import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveAccessToken } from "@/shared/services/storage/access-token-storage";
import { useLogin } from "../hooks/use-login";
import { LoginView } from "./login-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../hooks/use-login", () => ({
  useLogin: vi.fn(),
}));

vi.mock("@/shared/services/storage/access-token-storage", () => ({
  saveAccessToken: vi.fn(),
}));

describe("LoginView", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it("stores the returned access token and redirects after a successful login", async () => {
    const login = vi.fn().mockResolvedValue({
      accessToken: "returned-token",
      roleTag: "titulado",
    });
    vi.mocked(useLogin).mockReturnValue({ login, isLoading: false, error: null });

    render(<LoginView />);

    fireEvent.change(screen.getByPlaceholderText("nombre@ejemplo.com"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "secret" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Iniciar sesión" }).closest("form")!);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "person@example.com",
        password: "secret",
        roleTag: "titulado",
      });
      expect(saveAccessToken).toHaveBeenCalledWith("returned-token");
      expect(push).toHaveBeenCalledWith("/");
    });
  });

  async function submitLogin(login: unknown) {
    vi.mocked(useLogin).mockReturnValue({ login: login as ReturnType<typeof useLogin>["login"], isLoading: false, error: null });
    render(<LoginView />);
    fireEvent.change(screen.getByPlaceholderText("nombre@ejemplo.com"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("********"), { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button", { name: "Iniciar sesión" }).closest("form")!);
  }

  it("el administrativo va a la bandeja del backoffice", async () => {
    await submitLogin(vi.fn().mockResolvedValue({ accessToken: "t-admin", roleTag: "administrativo" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/backoffice/solicitudes"));
    expect(push).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['/login?next=/events/my-passes', '/events/my-passes'],
    ['/login?next=https://example.com', '/'],
    ['/login?next=//example.com', '/'],
  ])('respeta el retorno seguro desde %s hacia %s', async (url, destination) => {
    window.history.replaceState({}, '', url);
    await submitLogin(vi.fn().mockResolvedValue({ accessToken: 't', roleTag: 'titulado' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith(destination));
    expect(saveAccessToken).toHaveBeenCalledWith('t');
  });

  it('mantiene el backoffice para administrativos aunque exista un retorno a pases', async () => {
    window.history.replaceState({}, '', '/login?next=/events/my-passes');
    await submitLogin(vi.fn().mockResolvedValue({ accessToken: 't-admin', roleTag: 'administrativo' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/backoffice/solicitudes'));
  });

  it.each(["titulado", "estudiante", "mentor", "empresa", "", "desconocido"])("el rol %j va a la ruta actual", async (roleTag) => {
    await submitLogin(vi.fn().mockResolvedValue({ accessToken: "t", roleTag }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("un login fallido no guarda el token ni redirige", async () => {
    await submitLogin(vi.fn().mockResolvedValue(null));

    await waitFor(() => expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument());
    expect(saveAccessToken).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("el token queda guardado antes de navegar", async () => {
    await submitLogin(vi.fn().mockResolvedValue({ accessToken: "t-admin", roleTag: "administrativo" }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(vi.mocked(saveAccessToken).mock.invocationCallOrder[0]).toBeLessThan(push.mock.invocationCallOrder[0]);
    expect(saveAccessToken).toHaveBeenCalledWith("t-admin");
  });

  it("muestra los campos con su etiqueta y el autocompletado correcto", () => {
    vi.mocked(useLogin).mockReturnValue({ login: vi.fn(), isLoading: false, error: null });
    render(<LoginView />);

    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("combobox", { name: "Rol" })).toHaveTextContent("Titulado");
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByText("Universidad para el futuro")).toBeInTheDocument();
  });

  it("enlaza a la solicitud de acceso", () => {
    vi.mocked(useLogin).mockReturnValue({ login: vi.fn(), isLoading: false, error: null });
    render(<LoginView />);

    expect(screen.getByRole("link", { name: "Solicita acceso" })).toHaveAttribute("href", "/request-access");
  });

  it("muestra el error en una alerta accesible", () => {
    vi.mocked(useLogin).mockReturnValue({ login: vi.fn(), isLoading: false, error: "Correo o contraseña incorrectos" });
    render(<LoginView />);

    expect(screen.getByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
  });

  it("no muestra alerta sin error", () => {
    vi.mocked(useLogin).mockReturnValue({ login: vi.fn(), isLoading: false, error: null });
    render(<LoginView />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deshabilita el botón y muestra el estado de carga", () => {
    vi.mocked(useLogin).mockReturnValue({ login: vi.fn(), isLoading: true, error: null });
    render(<LoginView />);

    const button = screen.getByRole("button", { name: "Ingresando..." });
    expect(button).toBeDisabled();
  });
});
