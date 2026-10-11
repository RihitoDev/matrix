import { describe, expect, it, vi } from 'vitest';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';

describe('AccessRequestsController', () => {
  const service = { create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  const controller = new AccessRequestsController(service as any);

  it('delega la creación al servicio', async () => {
    service.create.mockResolvedValue({ id: 'id-1' });
    const body = { firstName: 'Ana' } as any;

    await expect(controller.create(body)).resolves.toEqual({ id: 'id-1' });
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('delega la actualización al servicio con el id y el cuerpo', async () => {
    service.update.mockResolvedValue({ id: 'id-1' });

    await expect(controller.update('id-1', { phone: '71234567' })).resolves.toEqual({ id: 'id-1' });
    expect(service.update).toHaveBeenCalledWith('id-1', { phone: '71234567' });
  });

  it('delega la eliminación al servicio con el id', async () => {
    service.delete.mockResolvedValue({ id: 'id-1' });

    await expect(controller.delete('id-1')).resolves.toEqual({ id: 'id-1' });
    expect(service.delete).toHaveBeenCalledWith('id-1');
  });
});
