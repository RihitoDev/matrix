import { Injectable } from '@nestjs/common';
import { AppointmentStatusTitle } from '../enums/appointment-status-title.enum.js';
import type { AvailabilityBlockResponse } from '../types/availability-block-response.types.js';
import type { AvailabilityBlockState } from '../types/availability-block-state.types.js';
import type { AvailabilityBlockWithAppointments } from '../types/availability-block-with-appointments.types.js';
import type { DeletedBlockResponse } from '../types/deleted-block-response.types.js';

@Injectable()
export class AvailabilityMapper {
  toResponse(block: AvailabilityBlockWithAppointments): AvailabilityBlockResponse {
    return {
      id: block.id,
      mentorId: block.mentorId,
      startAt: block.startAt.toISOString(),
      endAt: block.endAt.toISOString(),
      state: this.toState(block),
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    };
  }

  toResponseList(blocks: AvailabilityBlockWithAppointments[]): AvailabilityBlockResponse[] {
    return blocks.map((block) => this.toResponse(block));
  }

  toDeletedResponse(block: AvailabilityBlockWithAppointments): DeletedBlockResponse {
    return { id: block.id };
  }

  private toState(block: AvailabilityBlockWithAppointments): AvailabilityBlockState {
    const statuses = block.appointments.map((appointment) => appointment.status.title);
    if (statuses.includes(AppointmentStatusTitle.CONFIRMED)) {
      return 'confirmed';
    }
    if (statuses.includes(AppointmentStatusTitle.PENDING)) {
      return 'pending';
    }
    return 'free';
  }
}
