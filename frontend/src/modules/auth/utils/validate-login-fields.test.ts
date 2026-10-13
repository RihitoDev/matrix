import { describe, expect, it } from "vitest";
import { validateLoginFields } from "./validate-login-fields";

describe("validateLoginFields", () => {
  it("acepta un correo y una contraseña con valor", () => {
    expect(validateLoginFields("lionel.messi@gmail.com", "Clave-Segura-9")).toEqual({});
  });

  it("acepta un correo con espacios alrededor", () => {
    expect(validateLoginFields("  lionel.messi@gmail.com  ", "Clave-Segura-9")).toEqual({});
  });

  it("pide el correo cuando está vacío o solo tiene espacios", () => {
    expect(validateLoginFields("", "Clave-Segura-9").email).toBe("Ingresa tu correo electrónico");
    expect(validateLoginFields("   ", "Clave-Segura-9").email).toBe("Ingresa tu correo electrónico");
  });

  it.each(["sin-arroba", "a@b", "a b@c.com", "@gmail.com"])("rechaza el correo %s", (email) => {
    expect(validateLoginFields(email, "Clave-Segura-9").email).toBe("Ingresa un correo electrónico válido");
  });

  it("pide la contraseña cuando está vacía", () => {
    expect(validateLoginFields("lionel.messi@gmail.com", "").password).toBe("Ingresa tu contraseña");
  });

  it("informa los dos campos a la vez", () => {
    expect(validateLoginFields("", "")).toEqual({
      email: "Ingresa tu correo electrónico",
      password: "Ingresa tu contraseña",
    });
  });
});
