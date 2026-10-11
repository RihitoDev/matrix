import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FeedbackMessage } from "./feedback-message";

describe("FeedbackMessage", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a success message as a status with the check icon", () => {
    render(<FeedbackMessage feedback={{ type: "success", message: "Tu CV se cargó correctamente." }} />);

    const message = screen.getByRole("status");

    expect(message).toHaveTextContent("Tu CV se cargó correctamente.");
    expect(message.querySelector("svg.lucide-circle-check")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error message as an alert with the alert icon", () => {
    render(<FeedbackMessage feedback={{ type: "error", message: "El CV debe estar en formato PDF." }} />);

    const message = screen.getByRole("alert");

    expect(message).toHaveTextContent("El CV debe estar en formato PDF.");
    expect(message.querySelector("svg.lucide-circle-alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders nothing when there is no feedback", () => {
    const { container } = render(<FeedbackMessage feedback={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
