import { describe, it, expect } from 'vitest';
import { MOCK_MESSAGES } from '../mocks/mock-messages';
import { MOCK_CONVERSATIONS } from '../mocks/mock-conversations';

describe('mock-messages', () => {
  it('debe tener al menos un mensaje', () => {
    expect(MOCK_MESSAGES.length).toBeGreaterThan(0);
  });

  it('cada mensaje debe referenciar una conversacion existente', () => {
    const conversationIds = new Set(
      MOCK_CONVERSATIONS.map((c) => c.id),
    );

    MOCK_MESSAGES.forEach((message) => {
      expect(
        conversationIds.has(message.conversationId),
      ).toBe(true);
    });
  });

  it('cada conversacion debe tener mensajes en el historial mock', () => {
    const conversationIdsWithMessages = new Set(
      MOCK_MESSAGES.map((message) => message.conversationId),
    );

    MOCK_CONVERSATIONS.forEach((conversation) => {
      expect(
        conversationIdsWithMessages.has(conversation.id),
      ).toBe(true);
    });
  });

  it('los ids de mensaje deben ser unicos', () => {
    const ids = MOCK_MESSAGES.map((message) => message.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});