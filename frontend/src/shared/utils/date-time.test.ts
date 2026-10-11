import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addWeeks,
  formatBlockRange,
  getWeekRange,
  toBoliviaTime,
  toUtcIso,
} from "./date-time";

describe("toUtcIso", () => {
  it("guarda un bloque de 18:00 Bolivia como 22:00Z", () => {
    expect(toUtcIso("2026-10-10", "18:00")).toBe("2026-10-10T22:00:00.000Z");
  });

  it("pasa al día siguiente en UTC cuando la hora de Bolivia es 20:00 o más", () => {
    expect(toUtcIso("2026-10-10", "20:00")).toBe("2026-10-11T00:00:00.000Z");
  });

  it("convierte la medianoche de Bolivia a las 04:00Z", () => {
    expect(toUtcIso("2026-10-10", "00:00")).toBe("2026-10-10T04:00:00.000Z");
  });

  it("cruza el cambio de año en UTC", () => {
    expect(toUtcIso("2026-12-31", "22:30")).toBe("2027-01-01T02:30:00.000Z");
  });

  it.each([
    ["2026-02-31", "10:00"],
    ["2026-13-01", "10:00"],
    ["2026-10-10", "24:00"],
    ["2026-10-10", "10:60"],
    ["10/10/2026", "10:00"],
    ["2026-10-10", "9:00"],
  ])("rechaza la entrada inválida %s %s", (date, time) => {
    expect(() => toUtcIso(date, time)).toThrow(RangeError);
  });
});

describe("toBoliviaTime", () => {
  it("devuelve 22:00Z como 18:00 Bolivia del mismo día", () => {
    expect(toBoliviaTime("2026-10-10T22:00:00.000Z")).toEqual({
      year: 2026,
      month: 10,
      day: 10,
      hours: 18,
      minutes: 0,
      weekday: 6,
      date: "2026-10-10",
      time: "18:00",
    });
  });

  it("hace el viaje de ida y vuelta 18:00 -> 22:00Z -> 18:00", () => {
    const stored = toUtcIso("2026-10-10", "18:00");
    expect(toBoliviaTime(stored)).toMatchObject({
      date: "2026-10-10",
      time: "18:00",
    });
  });

  it("mantiene en su día un bloque de 20:00 aunque en UTC sea el día siguiente", () => {
    expect(toBoliviaTime("2026-10-11T00:00:00.000Z")).toMatchObject({
      date: "2026-10-10",
      time: "20:00",
      weekday: 6,
    });
  });

  it("devuelve 7 para el domingo", () => {
    expect(toBoliviaTime("2026-10-04T15:00:00.000Z").weekday).toBe(7);
  });

  it("acepta objetos Date", () => {
    expect(toBoliviaTime(new Date("2026-10-01T12:00:00Z")).time).toBe("08:00");
  });

  it("rechaza fechas inválidas", () => {
    expect(() => toBoliviaTime("no-es-fecha")).toThrow(RangeError);
  });
});

describe("getWeekRange", () => {
  const WEEK_OF_SEP_28 = {
    startAt: "2026-09-28T04:00:00.000Z",
    endAt: "2026-10-05T03:59:59.999Z",
  };

  it("devuelve de lunes 00:00 a domingo 23:59:59.999 de Bolivia en UTC", () => {
    expect(getWeekRange("2026-10-01T12:00:00Z")).toEqual(WEEK_OF_SEP_28);
  });

  it("incluye ambos meses cuando la semana cruza el cambio de mes", () => {
    expect(getWeekRange("2026-09-29T15:00:00Z")).toEqual(WEEK_OF_SEP_28);
  });

  it("cuenta el lunes 00:00 de Bolivia como el inicio de la semana", () => {
    expect(getWeekRange("2026-09-28T04:00:00.000Z")).toEqual(WEEK_OF_SEP_28);
  });

  it("cuenta el domingo 23:30 de Bolivia en la misma semana aunque en UTC ya sea lunes", () => {
    expect(getWeekRange("2026-10-05T03:30:00Z")).toEqual(WEEK_OF_SEP_28);
  });

  it("empieza una semana nueva el lunes 00:00 de Bolivia", () => {
    expect(getWeekRange("2026-10-05T04:00:00Z")).toEqual({
      startAt: "2026-10-05T04:00:00.000Z",
      endAt: "2026-10-12T03:59:59.999Z",
    });
  });

  it("cruza el cambio de año", () => {
    expect(getWeekRange("2027-01-01T12:00:00Z")).toEqual({
      startAt: "2026-12-28T04:00:00.000Z",
      endAt: "2027-01-04T03:59:59.999Z",
    });
  });

  it("rechaza fechas inválidas", () => {
    expect(() => getWeekRange("no-es-fecha")).toThrow(RangeError);
  });
});

describe("addWeeks", () => {
  it("avanza a la semana siguiente cruzando el cambio de mes", () => {
    expect(addWeeks("2026-09-28T04:00:00.000Z", 1)).toBe(
      "2026-10-05T04:00:00.000Z",
    );
  });

  it("retrocede semanas con valores negativos", () => {
    expect(addWeeks("2026-10-05T04:00:00.000Z", -2)).toBe(
      "2026-09-21T04:00:00.000Z",
    );
  });

  it("mantiene el inicio de semana al encadenarse con getWeekRange", () => {
    const { startAt } = getWeekRange("2026-12-30T12:00:00Z");
    expect(getWeekRange(addWeeks(startAt, 1)).startAt).toBe(
      "2027-01-04T04:00:00.000Z",
    );
  });
});

describe("formatBlockRange", () => {
  it("muestra las horas de Bolivia", () => {
    expect(
      formatBlockRange("2026-10-10T22:00:00.000Z", "2026-10-10T23:30:00.000Z"),
    ).toBe("18:00 - 19:30");
  });

  it("muestra 20:00 - 22:00 aunque en UTC el bloque caiga al día siguiente", () => {
    expect(
      formatBlockRange("2026-10-11T00:00:00.000Z", "2026-10-11T02:00:00.000Z"),
    ).toBe("20:00 - 22:00");
  });
});

describe("independencia de la zona horaria del navegador", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["Asia/Tokyo", "Europe/Madrid", "America/La_Paz"])(
    "muestra la hora de Bolivia aunque el navegador esté en %s",
    (timeZone) => {
      vi.stubEnv("TZ", timeZone);
      expect(toBoliviaTime("2026-10-11T00:00:00.000Z")).toMatchObject({
        date: "2026-10-10",
        time: "20:00",
      });
      expect(getWeekRange("2026-10-05T03:30:00Z").startAt).toBe(
        "2026-09-28T04:00:00.000Z",
      );
    },
  );
});
