import { describe, expect, it } from "vitest";
import { AREA_DETAILS, AREA_ORDER } from "../data/area-details.data";
import { getAreaDetail } from "./get-area-detail";

describe("getAreaDetail", () => {
  it.each(AREA_ORDER)("returns the detail of the %s area", (id) => {
    const detail = getAreaDetail(id);

    expect(detail).toBe(AREA_DETAILS[id]);
    expect(detail.id).toBe(id);
  });

  it("returns the name and score of the requested area", () => {
    const detail = getAreaDetail("cloud-devops");

    expect(detail.name).toBe("Cloud/DevOps");
    expect(detail.score).toBe(7);
  });
});
