import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { WeekDayList } from "./week-day-list";
import { EMPTY_DAY_LABEL } from "../../constants/week-grid.constants";
import type { AvailabilityBlock } from "../../types/availability-block.types";

const DAY_DATES = [
  "2026-10-05",
  "2026-10-06",
  "2026-10-07",
  "2026-10-08",
  "2026-10-09",
  "2026-10-10",
  "2026-10-11",
];

function makeBlock(overrides: Partial<AvailabilityBlock>): AvailabilityBlock {
  return {
    id: "1",
    mentorId: "mentor-1",
    startAt: "2026-10-06T22:00:00.000Z",
    endAt: "2026-10-06T23:00:00.000Z",
    state: "free",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const lateFree = makeBlock({ id: "1" });
const earlyPending = makeBlock({
  id: "2",
  startAt: "2026-10-06T14:00:00.000Z",
  endAt: "2026-10-06T15:00:00.000Z",
  state: "pending",
});

function blocksOnTuesday(blocks: AvailabilityBlock[]): AvailabilityBlock[][] {
  return DAY_DATES.map((_, dayIndex) => (dayIndex === 1 ? blocks : []));
}

describe("WeekDayList", () => {
  afterEach(() => {
    cleanup();
  });

  it("agrupa los bloques por día y los ordena por hora", () => {
    render(
      <WeekDayList
        blocksByDay={blocksOnTuesday([lateFree, earlyPending])}
        dayDates={DAY_DATES}
        variant="owner"
        onBlockClick={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Martes 6 de octubre" })).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Martes 6 de octubre, 10:00 a 11:00, pendiente",
      "Martes 6 de octubre, 18:00 a 19:00, libre",
    ]);
  });

  it("muestra Sin bloques en los días vacíos", () => {
    render(
      <WeekDayList
        blocksByDay={blocksOnTuesday([lateFree])}
        dayDates={DAY_DATES}
        variant="public"
        onBlockClick={vi.fn()}
      />
    );

    expect(screen.getAllByText(EMPTY_DAY_LABEL)).toHaveLength(6);
  });

  it("solo permite clic en los bloques libres según la variante", () => {
    const onBlockClick = vi.fn();
    render(
      <WeekDayList
        blocksByDay={blocksOnTuesday([lateFree, earlyPending])}
        dayDates={DAY_DATES}
        variant="selectable"
        onBlockClick={onBlockClick}
      />
    );

    const pending = screen.getByRole("button", { name: /pendiente$/ });
    expect(pending).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /libre$/ }));
    expect(onBlockClick).toHaveBeenCalledWith(lateFree);
  });

  it("deshabilita todos los bloques en la variante public", () => {
    render(
      <WeekDayList
        blocksByDay={blocksOnTuesday([lateFree])}
        dayDates={DAY_DATES}
        variant="public"
        onBlockClick={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /libre$/ })).toBeDisabled();
  });

  it("resalta el bloque seleccionado", () => {
    render(
      <WeekDayList
        blocksByDay={blocksOnTuesday([lateFree, earlyPending])}
        dayDates={DAY_DATES}
        variant="selectable"
        selectedBlockId="1"
        onBlockClick={vi.fn()}
      />
    );

    const selected = screen.getByRole("button", { name: /libre$/ });
    expect(selected).toHaveAttribute("aria-pressed", "true");
    expect(selected).toHaveClass("ring-accent");
    expect(screen.getByRole("button", { name: /pendiente$/ })).not.toHaveAttribute("aria-pressed");
  });

  it("solo se muestra en pantallas menores a md", () => {
    const { container } = render(
      <WeekDayList
        blocksByDay={blocksOnTuesday([])}
        dayDates={DAY_DATES}
        variant="public"
        onBlockClick={vi.fn()}
      />
    );

    expect(container.firstChild).toHaveClass("md:hidden");
  });
});
