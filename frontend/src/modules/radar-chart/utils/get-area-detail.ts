import { AREA_DETAILS } from "../data/area-details.data";
import type { AreaDetail, AreaId } from "../types/area-detail.types";

export function getAreaDetail(id: AreaId): AreaDetail {
  return AREA_DETAILS[id];
}
