import { describe, expect, it } from 'vitest';

import {
  clearAiChatGenerationActivity,
  hasActiveAiChatGeneration,
  setAiChatGenerationActivity,
} from './generation-activity';

describe('AI chat generation activity registry', () => {
  it('queries activity by module and clears owners independently', () => {
    const chatOwner = Symbol('chat');
    const workflowOwner = Symbol('workflow');

    setAiChatGenerationActivity(chatOwner, 'chat', true);
    setAiChatGenerationActivity(workflowOwner, 'workflow', true);

    expect(hasActiveAiChatGeneration()).toBe(true);
    expect(hasActiveAiChatGeneration('chat')).toBe(true);
    expect(hasActiveAiChatGeneration('prompt')).toBe(false);

    setAiChatGenerationActivity(chatOwner, 'chat', false);
    expect(hasActiveAiChatGeneration('chat')).toBe(false);
    expect(hasActiveAiChatGeneration('workflow')).toBe(true);

    clearAiChatGenerationActivity(workflowOwner);
    expect(hasActiveAiChatGeneration()).toBe(false);
  });
});
