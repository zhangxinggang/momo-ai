import type { IAIConfig, IChatMessage, IStreamCallbacks } from '@renderer/services/ai/types';
import { chatCompletion } from '../ai/chat';

const SKILL_CREATOR_SYSTEM_PROMPT = `You are a ISkill Creator that helps users create effective SKILL.md files following the Anthropic Agent Skills specification.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. They transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge.

## SKILL.md Structure

Every SKILL.md requires:
1. **YAML frontmatter** (between --- markers) with:
   - \`name\`: Human-friendly name (lowercase-with-hyphens, max 64 characters)
   - \`description\`: What the skill does and when to use it (max 200 characters) - CRITICAL: Claude uses this to determine when to invoke the skill
2. **Markdown body** with clear instructions

## Core Principles

1. **Concise is Key**: Only include information Claude doesn't already have. Challenge each piece: "Does Claude really need this?"
2. **Clear Description**: Include BOTH what the skill does AND specific triggers/contexts for when to use it
3. **Progressive Disclosure**: Keep SKILL.md lean (<500 lines), move detailed reference to separate files
4. **Appropriate Freedom**: Match instruction specificity to task fragility

## Output Format

Generate a complete SKILL.md with proper structure:

\`\`\`markdown
---
name: skill-name-here
description: Clear description of what this skill does and when to use it (max 200 chars)
---

# ISkill Title

## Overview
Brief explanation of the skill's purpose.

## When to Use
- Trigger condition 1
- Trigger condition 2

## Instructions
1. Step 1
2. Step 2
...

## Examples (if helpful)
...

## Guidelines
- Important constraint 1
- Best practice 2
\`\`\`

## Important Rules

1. Use imperative/infinitive form in instructions
2. Be specific about when the skill should be used in the description
3. Include examples when they clarify usage
4. Focus each skill on one specific workflow
5. Do NOT include extraneous documentation (README, CHANGELOG, etc.)
6. Output ONLY the SKILL.md content, no additional explanation`;

const SKILL_POLISH_SYSTEM_PROMPT = `You are a SKILL.md editor. Your job is to polish and restructure existing skill content to follow the Anthropic Agent Skills specification — while strictly preserving ALL core capabilities, instructions, and intent written by the user.

## Rules

1. **PRESERVE everything the user wrote** — do NOT remove, weaken, or change any core instruction, capability, workflow step, or constraint. You are polishing, not rewriting.
2. **Add YAML frontmatter** if missing (name + description ≤200 chars)
3. **Restructure** into clear sections: Overview, When to Use, Instructions, Guidelines, Examples (only if helpful)
4. **Improve clarity** — fix grammar, use imperative form, add bullet points, improve formatting
5. **Keep it concise** — remove redundancy but never remove unique information
6. **Output ONLY the polished SKILL.md** — no explanations, no commentary, no code fences wrapping the entire output
7. **Use the same language as the user's content** — if the user wrote in Chinese, output in Chinese; if English, output in English

## Important

- If the content already has good structure, make minimal changes
- Never invent new capabilities the user didn't describe
- The description in frontmatter should accurately summarize what the user wrote`;

/** 使用 AI 生成 SKILL.md 内容 */
export async function generateSkillContent(
  config: IAIConfig,
  skillName: string,
  skillPurpose: string,
  streamCallbacks?: IStreamCallbacks,
  customSystemPrompt?: string,
): Promise<string> {
  const userPrompt = `Create a SKILL.md file for the following skill:

**ISkill Name**: ${skillName}
**Purpose/Description**: ${skillPurpose}

Generate a complete, well-structured SKILL.md following the Anthropic Agent Skills specification. Output ONLY the SKILL.md content (including the YAML frontmatter), no additional explanation.`;

  const systemPrompt = customSystemPrompt || SKILL_CREATOR_SYSTEM_PROMPT;
  const messages: IChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(config, messages, {
    temperature: 0.7,
    maxTokens: 4096,
    stream: !!streamCallbacks,
    streamCallbacks,
  });

  return result.content;
}

/** AI 润色 SKILL.md 内容 */
export async function polishSkillContent(
  config: IAIConfig,
  existingContent: string,
  skillName?: string,
  streamCallbacks?: IStreamCallbacks,
): Promise<string> {
  const userPrompt = `Please polish the following SKILL.md content. Preserve ALL core capabilities and instructions. Only improve structure, formatting, and readability according to the SKILL.md standard.

${skillName ? `**ISkill Name**: ${skillName}\n` : ''}
**Existing Content**:
${existingContent}`;

  const messages: IChatMessage[] = [
    { role: 'system', content: SKILL_POLISH_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(config, messages, {
    temperature: 0.4,
    maxTokens: 4096,
    stream: !!streamCallbacks,
    streamCallbacks,
  });

  return result.content;
}
