import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Tabs, TabsList, TabsTrigger } from "./tabs"

describe("Tabs", () => {
  afterEach(() => cleanup())

  it("muestra las pestañas y avisa del cambio de valor", () => {
    const onValueChange = vi.fn()
    render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList variant="line">
          <TabsTrigger value="a">Primera</TabsTrigger>
          <TabsTrigger value="b">Segunda</TabsTrigger>
        </TabsList>
      </Tabs>
    )

    expect(screen.getByRole("tab", { name: "Primera" })).toHaveAttribute("aria-selected", "true")
    fireEvent.click(screen.getByRole("tab", { name: "Segunda" }))
    expect(onValueChange).toHaveBeenCalledWith("b", expect.anything())
  })
})
