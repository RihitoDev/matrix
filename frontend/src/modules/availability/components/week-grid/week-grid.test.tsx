import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { WeekGrid } from "./week-grid";
import type { AvailabilityBlock } from "../../types/availability-block.types";
import type { WeekRange } from "@/shared/types/week-range.types";

const WEEK_RANGE: WeekRange = {
  startAt: "2026-10-05T04:00:00.000Z",
  endAt: "2026-10-12T03:59:59.999Z",
};

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

const blocks: AvailabilityBlock[] = [
  makeBlock({ id: "1", startAt: "2026-10-06T22:00:00.000Z", endAt: "2026-10-06T23:00:00.000Z", state: "free" }), // martes 18:00 Bolivia
  makeBlock({ id: "2", startAt: "2026-10-07T23:00:00.000Z", endAt: "2026-10-08T00:00:00.000Z", state: "pending" }), // miércoles 19:00 Bolivia
  makeBlock({ id: "3", startAt: "2026-10-05T21:00:00.000Z", endAt: "2026-10-05T22:30:00.000Z", state: "confirmed" }), // lunes 17:00 Bolivia
];

describe("WeekGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra la leyenda con los 3 estados", () => {
    render(<WeekGrid blocks={[]} weekRange={WEEK_RANGE} variant="public" />);
    expect(screen.getByText("Libre")).toBeInTheDocument();
    expect(screen.getByText("Solicitud pendiente")).toBeInTheDocument();
    expect(screen.getByText("Cita confirmada")).toBeInTheDocument();
  });

  it("muestra el número del día en la cabecera de cada columna", () => {
    render(<WeekGrid blocks={[]} weekRange={WEEK_RANGE} variant="owner" />);
    expect(screen.getByRole("heading", { name: "LUN 5" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "DOM 11" })).toBeInTheDocument();
  });

  it("muestra Pendiente y Confirmada en los bloques con cita", () => {
    render(<WeekGrid blocks={blocks} weekRange={WEEK_RANGE} variant="owner" />);
    expect(screen.getByRole("button", { name: /^pendiente,/ })).toHaveTextContent("Pendiente");
    expect(screen.getByRole("button", { name: /^confirmada,/ })).toHaveTextContent("Confirmada");
  });

  it("en variant selectable, muestra la hora en los bloques libres y solo la leyenda del titulado", () => {
    render(<WeekGrid blocks={[blocks[0]]} weekRange={WEEK_RANGE} variant="selectable" />);
    expect(screen.getByRole("button", { name: "libre, 18:00 a 19:00" })).toHaveTextContent("18:00");
    expect(screen.getByText("Horario libre")).toBeInTheDocument();
    expect(screen.queryByText("Solicitud pendiente")).not.toBeInTheDocument();
    expect(screen.queryByText("Cita confirmada")).not.toBeInTheDocument();
  });

  it("muestra Tu selección en la leyenda solo en variant selectable", () => {
    render(<WeekGrid blocks={[]} weekRange={WEEK_RANGE} variant="selectable" />);
    expect(screen.getByText("Tu selección")).toBeInTheDocument();
    cleanup();

    render(<WeekGrid blocks={[]} weekRange={WEEK_RANGE} variant="owner" />);
    expect(screen.queryByText("Tu selección")).not.toBeInTheDocument();
  });

  it("en variant selectable, dispara onSelectBlock solo al hacer click en un bloque libre", () => {
    const onSelectBlock = vi.fn();
    render(
      <WeekGrid
        blocks={blocks}
        weekRange={WEEK_RANGE}
        variant="selectable"
        onSelectBlock={onSelectBlock}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^libre,/ }));
    expect(onSelectBlock).toHaveBeenCalledTimes(1);
    expect(onSelectBlock).toHaveBeenCalledWith(blocks[0]);
  });

  it("en variant selectable, resalta el bloque indicado en selectedBlockId", () => {
    const freeBlocks = [
      makeBlock({ id: "1" }),
      makeBlock({ id: "4", startAt: "2026-10-08T14:00:00.000Z", endAt: "2026-10-08T15:00:00.000Z" }),
    ];
    render(
      <WeekGrid
        blocks={freeBlocks}
        weekRange={WEEK_RANGE}
        variant="selectable"
        selectedBlockId="1"
      />
    );

    const selected = screen.getByRole("button", { name: "libre, 18:00 a 19:00" });
    const other = screen.getByRole("button", { name: "libre, 10:00 a 11:00" });
    expect(selected).toHaveAttribute("aria-pressed", "true");
    expect(selected).toHaveClass("ring-accent");
    expect(other).not.toHaveAttribute("aria-pressed");
    expect(other).not.toHaveClass("ring-accent");
  });

  it("en variant selectable, un bloque pendiente o confirmado está deshabilitado y no dispara el callback", () => {
    const onSelectBlock = vi.fn();
    render(
      <WeekGrid
        blocks={blocks}
        weekRange={WEEK_RANGE}
        variant="selectable"
        onSelectBlock={onSelectBlock}
      />
    );

    const pendingButton = screen.getByRole("button", {
      name: /pendiente, 19:00 a 20:00/,
    });
    expect(pendingButton).toBeDisabled();
    fireEvent.click(pendingButton);
    expect(onSelectBlock).not.toHaveBeenCalled();
  });

  it("en variant public, ningún bloque es interactivo", () => {
    const onSelectBlock = vi.fn();
    render(
      <WeekGrid
        blocks={blocks}
        weekRange={WEEK_RANGE}
        variant="public"
        onSelectBlock={onSelectBlock}
      />
    );

    expect(screen.getByRole("button", { name: /^libre,/ })).toBeDisabled();
  });

  it("en variant owner, dispara onEditBlock también sobre un bloque con cita", () => {
    const onEditBlock = vi.fn();
    render(
      <WeekGrid
        blocks={blocks}
        weekRange={WEEK_RANGE}
        variant="owner"
        onEditBlock={onEditBlock}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^libre,/ }));
    expect(onEditBlock).toHaveBeenCalledTimes(1);

    const confirmedButton = screen.getByRole("button", {
      name: /confirmada, 17:00 a 18:30/,
    });
    expect(confirmedButton).toBeEnabled();
    fireEvent.click(confirmedButton);
    expect(onEditBlock).toHaveBeenLastCalledWith(blocks[2]);
  });

  it("no renderiza bloques que no pertenecen a la semana mostrada", () => {
    const outOfWeekBlock = makeBlock({
      id: "4",
      startAt: "2026-10-13T22:00:00.000Z",
      endAt: "2026-10-13T23:00:00.000Z",
      state: "free",
    });
    render(
      <WeekGrid
        blocks={[...blocks, outOfWeekBlock]}
        weekRange={WEEK_RANGE}
        variant="public"
      />
    );
    expect(screen.getAllByRole("button", { name: /^libre,/ })).toHaveLength(1);
  });

  it("ubica un bloque cuya hora UTC cae al día siguiente en la columna del día correcto en Bolivia", () => {
    const crossDayBlock = makeBlock({
      id: "5",
      startAt: "2026-10-06T00:00:00.000Z",
      endAt: "2026-10-06T01:00:00.000Z",
      state: "confirmed",
    });
    render(
      <WeekGrid blocks={[crossDayBlock]} weekRange={WEEK_RANGE} variant="public" />
    );
    expect(
      screen.getByRole("button", { name: /confirmada, 20:00 a 21:00/ })
    ).toBeInTheDocument();
  });

  it("muestra la grilla desde md y la lista por día en pantallas chicas", () => {
    render(<WeekGrid blocks={blocks} weekRange={WEEK_RANGE} variant="owner" />);

    const grid = screen.getByRole("heading", { name: "LUN 5" }).closest("section")?.parentElement;
    expect(grid).toHaveClass("hidden", "md:grid");
    expect(screen.getByRole("heading", { name: "Lunes 5 de octubre" }).closest("ol")).toHaveClass(
      "md:hidden"
    );
  });

  it("en la lista por día, dispara onEditBlock en variant owner al tocar un bloque libre", () => {
    const onEditBlock = vi.fn();
    render(
      <WeekGrid blocks={blocks} weekRange={WEEK_RANGE} variant="owner" onEditBlock={onEditBlock} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Martes 6 de octubre, 18:00 a 19:00, libre" }));
    expect(onEditBlock).toHaveBeenCalledWith(blocks[0]);
  });
});
