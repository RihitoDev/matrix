import { apiClient } from "@/shared/services/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { activateMentor } from "./mentor-activation.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("activateMentor", () => {
  it("posts only the selected catalog identifiers and returns the API data", async () => {
    const payload = {
      technicalAreaIds: ["550e8400-e29b-41d4-a716-446655440001"],
      orientationTypeIds: ["550e8400-e29b-41d4-a716-446655440002"],
    };
    const activation = {
      id: "550e8400-e29b-41d4-a716-446655440003",
    };
    const request = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        statusCode: 201,
        ok: true,
        detail: "Operación exitosa",
        data: activation,
      },
    });

    const result = await activateMentor(payload);
    const sentPayload = request.mock.calls[0]?.[1];

    expect(request).toHaveBeenCalledWith("/mentors/activate", payload);
    expect(sentPayload).toEqual({
      technicalAreaIds: payload.technicalAreaIds,
      orientationTypeIds: payload.orientationTypeIds,
    });
    expect(sentPayload).not.toHaveProperty("userId");
    expect(sentPayload).not.toHaveProperty("mentorId");
    expect(sentPayload).not.toHaveProperty("roleId");
    expect(result).toBe(activation);
  });
});
