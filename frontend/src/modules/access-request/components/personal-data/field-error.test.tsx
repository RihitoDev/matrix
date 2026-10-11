import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  afterEach(() => cleanup());

  it("muestra el mensaje con el color destructivo del tema", () => {
    render(<FieldError id="email-error" message="El correo es obligatorio" />);

    const message = screen.getByText("El correo es obligatorio");
    expect(message).toHaveAttribute("id", "email-error");
    expect(message).toHaveClass("text-destructive");
  });

  it("no renderiza nada sin mensaje", () => {
    const { container } = render(<FieldError id="email-error" />);

    expect(container).toBeEmptyDOMElement();
  });
});
