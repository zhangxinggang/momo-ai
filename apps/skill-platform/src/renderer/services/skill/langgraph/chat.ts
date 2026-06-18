import type { IAIConfig, IChatMessage } from '@renderer/services/ai';
import { chatCompletion } from '@renderer/services/ai';
import { writeWorkflowNodeArtifacts } from '@renderer/services/workflow/agent-files';
import { ensureSkillRepoPath, parseSkillArtifacts, writeSkillArtifacts } from '../skill-artifacts';
import { parseSkillRunCommands } from '../skill-run-commands';

interface ISkillChatState {
  userInput: string;
  skillsSummary: string;
  activeSkillLine: string;
  activeSkillInstructions: string;
  activeSkillId: string;
  priorTranscript: string;
  knowledgeContext: string;
  workflowPlan: string;
}

function buildPlanMessages(state: ISkillChatState): IChatMessage[] {
  const skillBody = state.activeSkillInstructions.trim();
  const system = skillBody
    ? `你是 SKILL 执行规划助手。你的任务是分析用户选中的 SKILL 完整指令，结合用户目标，输出一份**可直接执行**的实施计划。

规划要求：
1. 仔细阅读 SKILL 完整指令，理解技能的工作方式（脚本、模板、工具链等）
2. 分析技能仓库中已有的脚本和文件结构
3. 输出 3～8 步有序列表，每一步必须包含：
   - 要做什么（明确动作）
   - 用哪个脚本/工具（如 SKILL 指令中提到的）
   - 预期产出（文件路径或交付物）
4. 如果 SKILL 指令要求生成脚本但仓库中还没有，规划中要包含「编写生成脚本」这一步
5. 如果脚本需要命令行参数（如 input.json、output_dir），规划中必须包含：
   - 先用 artifact 块写入数据文件的步骤
   - 执行时提供完整参数的说明
6. 最后一步应包含「执行生成脚本」并说明用 \`\`\`skill-run 代码块触发
7. 输出目录统一使用 output/ 或 dist/ 等标准目录
8. 只输出规划本身，不要寒暄，不要重复 SKILL 原文`
    : `你是工作流规划助手。根据「用户目标」与「可用 SKILL 列表」，用中文输出一份简洁的 Markdown 工作流（建议 3～8 步，使用有序列表）。只输出规划本身，不要寒暄。`;

  const blocks = [
    state.priorTranscript.trim() ? `对话上文：\n${state.priorTranscript.trim()}` : '',
    state.knowledgeContext?.trim() ? `知识库参考：\n${state.knowledgeContext.trim()}` : '',
    `用户目标：\n${state.userInput.trim()}`,
    `可用技能摘要：\n${state.skillsSummary.trim()}`,
    `当前聚焦技能：\n${state.activeSkillLine.trim()}`,
  ];

  if (skillBody) {
    blocks.push(`当前技能完整指令：\n${skillBody}`);
  }

  return [
    { role: 'system', content: system },
    { role: 'user', content: blocks.filter(Boolean).join('\n\n') },
  ];
}

function buildAnswerMessages(state: ISkillChatState): IChatMessage[] {
  const skillBody = state.activeSkillInstructions.trim();
  const system = skillBody
    ? `你是 SKILL 执行引擎。你必须严格按照用户选中的 SKILL 指令完成用户的任务，并产出实际可交付的文件。

## 核心原则
1. **必须产出可执行内容**：不能只输出建议或说明，必须实际编写代码/脚本/文件
2. **严格遵循 SKILL 指令**：SKILL 中提到的脚本、工具、流程必须照做
3. **生成二进制交付物（PPT/Office/PDF/压缩包/SVG等）时**，必须：
   a. 先用 \`\`\`artifact: 块编写生成脚本（如 JS/Python 脚本）
   b. 再用 \`\`\`skill-run 块执行该脚本
   c. 脚本应将产出写入 process.env.SKILL_OUTPUT_DIR 或仓库 output/ 目录

## 命令执行格式

需要执行仓库内命令时，使用 skill-run 代码块（每行一条命令）：
\`\`\`skill-run
node scripts/generate.js
\`\`\`

**禁止**在 skill-run 中使用 find/cat/ls/head/tail 等只读探索命令。

## 脚本参数处理（重要）

如果脚本需要命令行参数（如 \`generate_svg.py <input.json> <output_dir>\`），必须：
1. 先用 \`\`\`artifact: 块写入所需的数据文件（如 JSON 输入文件）
2. 在 skill-run 命令中提供完整参数，例如：
   \`\`\`skill-run
   python scripts/generate_svg.py data/input.json output
   \`\`\`
3. 输出目录应使用 \`output\` 或 \`dist\` 等标准目录名
4. **禁止**执行不带必要参数的脚本

## 运行时说明
- Node 脚本依赖（如 pptxgenjs、playwright、sharp 等）会由应用自动安装到全局 ISkill 运行时
- Python 脚本依赖（如 Pillow、python-pptx 等）会在执行前自动扫描 import 并通过 pip 安装；若仓库有 requirements.txt 也会自动安装
- 无需在技能仓库内手动执行 npm install 或 pip install
- 脚本中可直接 require/import 常见 npm 包和 Python 库

--- SKILL 完整指令开始 ---
${skillBody}
--- SKILL 完整指令结束 ---`
    : `你是技能平台的对话助手。请严格依据「工作流计划」组织回答，并充分结合 SKILL 摘要与当前聚焦技能；使用 Markdown，条理清晰。如果计划中包含生成脚本或文件的步骤，请直接编写对应代码。`;

  const blocks = [
    state.priorTranscript.trim() ? `对话上文：\n${state.priorTranscript.trim()}` : '',
    state.knowledgeContext?.trim() ? `知识库参考：\n${state.knowledgeContext.trim()}` : '',
    `工作流计划：\n${state.workflowPlan.trim()}`,
    `用户最新输入：\n${state.userInput.trim()}`,
    `可用技能摘要：\n${state.skillsSummary.trim()}`,
    `当前聚焦技能：\n${state.activeSkillLine.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: blocks },
  ];
}

export interface IRunSkillLangGraphChatInput {
  userInput: string;
  skillsSummary: string;
  activeSkillLine: string;
  activeSkillInstructions?: string;
  activeSkillId?: string;
  priorTranscript: string;
  knowledgeContext?: string;
  /** 工作流节点产出目录（技能执行与 artifact 写入） */
  workflowOutput?: {
    workflowName: string;
    businessId: string;
    nodeName: string;
    outputDir: string;
  };
}

async function appendSkillExecutionResults(
  reply: string,
  input: IRunSkillLangGraphChatInput,
): Promise<string> {
  const skillId = input.activeSkillId?.trim();
  if (!skillId) {
    return reply;
  }

  let next = reply;
  const repoPath = await ensureSkillRepoPath(skillId);

  const artifacts = parseSkillArtifacts(reply);
  const workflowOut = input.workflowOutput;
  let writtenPaths: string[] = [];

  if (workflowOut) {
    writtenPaths = await writeWorkflowNodeArtifacts(
      workflowOut.workflowName,
      workflowOut.businessId,
      workflowOut.nodeName,
      artifacts,
    );
    if (writtenPaths.length > 0) {
      next += `\n\n---\n\n**已写入工作流节点目录：**\n${writtenPaths.map((p) => `- \`${p}\``).join('\n')}`;
      next += `\n\n产出目录：\`${workflowOut.outputDir}\``;
    }
  } else {
    writtenPaths = await writeSkillArtifacts(skillId, artifacts);
    if (writtenPaths.length > 0) {
      next += `\n\n---\n\n**已写入技能仓库：**\n${writtenPaths.map((p) => `- \`${p}\``).join('\n')}`;
      if (repoPath) {
        next += `\n\n仓库路径：\`${repoPath}\``;
      }
    }
  }

  if (typeof window.api?.skill?.executeWorkspace !== 'function') {
    return next;
  }

  try {
    const runCommands = parseSkillRunCommands(reply);
    const exec = await window.api.skill.executeWorkspace(skillId, input.userInput, {
      commands: runCommands.length > 0 ? runCommands : undefined,
      outputDir: workflowOut?.outputDir,
    });
    if (!exec.attempted) {
      if (exec.hint && writtenPaths.length === 0) {
        next += `\n\n---\n\n**技能执行说明：** ${exec.hint}`;
        if (repoPath) {
          next += `\n\n仓库路径：\`${repoPath}\`（可在技能文件编辑器中查看）`;
        }
      }
      return next;
    }

    const sections: string[] = ['\n\n---\n\n**技能脚本执行**'];
    if (exec.commands?.length) {
      sections.push(`命令：\n${exec.commands.map((c) => `- \`${c}\``).join('\n')}`);
    } else if (exec.command) {
      sections.push(`命令：\`${exec.command}\``);
    }
    if (exec.outputDir) {
      sections.push(`产出目录：\`${exec.outputDir}\``);
    }
    if (repoPath) {
      sections.push(`仓库：\`${repoPath}\``);
    }
    if (exec.exitCode !== null) {
      sections.push(`退出码：${exec.exitCode}`);
    }
    if (exec.skillRuntimeDir) {
      sections.push(`ISkill 运行时：\`${exec.skillRuntimeDir}\``);
    }
    if (exec.dependencySetup) {
      sections.push(`\n依赖安装：\n\`\`\`\n${exec.dependencySetup.slice(0, 1500)}\n\`\`\``);
    }
    if (exec.stdout) {
      sections.push(`\n输出：\n\`\`\`\n${exec.stdout.slice(0, 2000)}\n\`\`\``);
    }
    if (exec.stderr) {
      sections.push(`\n错误输出：\n\`\`\`\n${exec.stderr.slice(0, 1000)}\n\`\`\``);
    }
    if (exec.tempOutputFiles?.length) {
      sections.push(
        `\n已生成文件（temp）：\n${exec.tempOutputFiles.map((p) => `- \`${p}\``).join('\n')}`,
      );
    } else if (exec.outputFiles?.length) {
      sections.push(`\n产出文件：\n${exec.outputFiles.map((p) => `- \`${p}\``).join('\n')}`);
    }
    if (exec.error) {
      sections.push(`\n${exec.error}`);
    }
    next += sections.join('\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    next += `\n\n---\n\n**技能脚本执行失败：** ${msg}`;
  }

  return next;
}

/** 规划 → 回答 两步对话，返回助手正文 */
export async function runSkillLangGraphChat(
  aiConfig: IAIConfig,
  input: IRunSkillLangGraphChatInput,
) {
  const chatState: ISkillChatState = {
    userInput: input.userInput,
    skillsSummary: input.skillsSummary,
    activeSkillLine: input.activeSkillLine,
    activeSkillInstructions: input.activeSkillInstructions ?? '',
    activeSkillId: input.activeSkillId ?? '',
    priorTranscript: input.priorTranscript,
    knowledgeContext: input.knowledgeContext ?? '',
    workflowPlan: '',
  };

  const planResult = await chatCompletion(aiConfig, buildPlanMessages(chatState), {
    stream: false,
    maxTokens: 2048,
  });
  chatState.workflowPlan = planResult.content ?? '';

  const answerResult = await chatCompletion(aiConfig, buildAnswerMessages(chatState), {
    stream: false,
    maxTokens: 8192,
  });
  const reply = answerResult.content ?? '';
  return appendSkillExecutionResults(reply, input);
}
