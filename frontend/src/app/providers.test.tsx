import { cleanup, render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { Providers } from "./providers";

vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));

afterEach(cleanup);

function QueryConsumer() {
  const client = useQueryClient();
  return <p>{client.getDefaultOptions().queries?.retry === false ? "Reintento manual" : "Otro modo"}</p>;
}

it("provides the shared query client to child views", () => {
  render(<Providers><QueryConsumer /></Providers>);
  expect(screen.getByText("Reintento manual")).toBeInTheDocument();
});
