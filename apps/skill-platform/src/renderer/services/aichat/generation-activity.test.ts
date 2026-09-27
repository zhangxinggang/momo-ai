import { describe, expect, it } from 'vitest';

import {
  clearAiChatGenerationActivity,
  hasActiveAiChatGeneration,
  setAiChatGenerationActivity,
} from './generation-activity';

describe('AI chat generation activity registry', () => {
  it('queries activity by module and clears owners independently', () => {
    const chatOwner = Symbol('chat');
    const noteOwner = Symbol('note');

    setAiChatGenerationActivity(chatOwner, 'chat', true);
    setAiChatGenerationActivity(noteOwner, 'note', true);

    expect(hasActiveAiChatGeneration()).toBe(true);
    expect(hasActiveAiChatGeneration('chat')).toBe(true);
    expect(hasActiveAiChatGeneration('skill')).toBe(false);

    setAiChatGenerationActivity(chatOwner, 'chat', false);
    expect(hasActiveAiChatGeneration('chat')).toBe(false);
    expect(hasActiveAiChatGeneration('note')).toBe(true);

    clearAiChatGenerationActivity(noteOwner);
    expect(hasActiveAiChatGeneration()).toBe(false);
  });
});
