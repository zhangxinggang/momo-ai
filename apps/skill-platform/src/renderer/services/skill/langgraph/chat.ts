import type { IAIConfig, IChatMessage } from '@renderer/services/ai';
import { chatCompletion } from '@renderer/services/ai';
import { canExecuteSkillWorkspace, executeSkillWorkspace, getSkillRepoPath, isSkillApiAvailable } from '@renderer/services/skill/api';
import { writeWorkflowNodeArtifacts } from '@renderer/services/workflow/agent-files';
import { findMissingArtifactScripts, parseSkillArtifacts, writeSessionArtifacts } from '../skill-artifacts';
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
2. 分析技能工作区中已有的脚本和文件结构（会话临时目录，非原仓库）
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
   a. 先用带路径的代码块写入数据与脚本（格式见下）
   b. 再用 \`\`\`skill-run 块执行该脚本
   c. 脚本应将产出写入 process.env.SKILL_OUTPUT_DIR 或工作区 output/ 目录

## 文件写入格式（重要）

写入工作区文件时使用 **语言:相对路径** 或 **artifact:相对路径**，例如：
\`\`\`json:data/input.json
{ "title": "示例" }
\`\`\`
\`\`\`javascript:scripts/generate_ppt.js
// 脚本内容
\`\`\`
也支持 \`\`\`artifact:scripts/generate.js 格式。脚本 require 的本地文件（如 theme-colors.json）必须一并写入。

## 工作区说明（重要）
- 所有 artifact 与脚本产出写入**会话临时工作区**，**禁止**修改原始技能仓库
- artifact 路径为相对于会话工作区的相对路径
- 脚本在会话工作区内执行（已从技能仓库种子拷贝，含 scripts/ 等）
- **禁止臆造 scripts/ 下不存在的脚本名**；skill-run 必须调用 SKILL 仓库内已有脚本，或先用 artifact 块写入该脚本

## 命令执行格式

skill-run **只写一条主生成命令**（如 node 脚本），**禁止**包含：
- npm/pip install（依赖由 ISkill 运行时自动安装）
- mkdir/cd 等 shell 前置步骤（output 目录由运行时自动创建）
- soffice/markitdown/pdftoppm 等 QA 验证
- mv/cp/echo 等 shell 后处理

示例：
\`\`\`skill-run
node scripts/generate.js data/input.json output
\`\`\`

## 脚本参数处理（重要）

如果脚本需要命令行参数（如 \`generate_svg.py <input.json> <output_dir>\`），必须：
1. 先用 \`\`\`artifact: 块写入所需的数据文件（如 JSON 输入文件）
2. 在 skill-run 命令中提供完整参数，例如：
   \`\`\`skill-run
   python scripts/generate_svg.py data/input.json output
   \`\`\`
3. 输出目录应使用 \`output\` 或 \`dist\` 等标准目录名
4. **禁止**执行不带必要参数的脚本

## 脚本运行环境
- 脚本在 **headless 环境**执行（无浏览器、无完整前端构建），必须**严格遵循 SKILL 指令**指定的工具链与已有脚本
- 不要自行引入 SKILL 未要求的依赖（如 React SSR、前端组件库等）

## 运行时说明
- Node / Python 脚本依赖会由应用自动扫描并安装到全局 ISkill 运行时；若仓库有 package.json 或 requirements.txt 也会自动安装
- 无需在技能仓库内手动执行 npm install 或 pip install
- 原始技能仓库只读，不会被本对话修改

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
  /** SKILL 对话会话 id，用于 temp/<sessionId> 工作区 */
  sessionId?: string;
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
  const sessionId = input.sessionId?.trim();
  let repoPath: string | null = null;
  try {
    if (isSkillApiAvailable()) {
      const pathResult = await getSkillRepoPath(skillId);
      repoPath = typeof pathResult === 'string' && pathResult.trim() ? pathResult.trim() : null;
    }
  } catch {
    repoPath = null;
  }

  const artifacts = parseSkillArtifacts(reply);
  const workflowOut = input.workflowOutput;
  let writtenPaths: string[] = [];
  let sessionWorkspaceDir: string | null = null;

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
  } else if (sessionId) {
    const sessionWrite = await writeSessionArtifacts(skillId, sessionId, artifacts);
    writtenPaths = sessionWrite.writtenPaths;
    sessionWorkspaceDir = sessionWrite.workspaceDir;
    if (writtenPaths.length > 0) {
      next += `\n\n---\n\n**已写入会话工作区：**\n${writtenPaths.map((p) => `- \`${p}\``).join('\n')}`;
      if (sessionWorkspaceDir) {
        next += `\n\n工作区路径：\`${sessionWorkspaceDir}\``;
      }
    }

    const missingArtifactScripts = findMissingArtifactScripts(reply, writtenPaths);
    if (missingArtifactScripts.length > 0) {
      next += `\n\n---\n\n**警告：** 以下脚本在回复中声明但未成功写入工作区：${missingArtifactScripts.map((p) => `\`${p}\``).join(', ')}`;
    }
  }

  if (!canExecuteSkillWorkspace()) {
    return next;
  }

  try {
    const runCommands = parseSkillRunCommands(reply);
    if (sessionId && runCommands.length > 0 && writtenPaths.length === 0 && artifacts.length > 0) {
      next += `\n\n---\n\n**技能执行已跳过：** 检测到 ${artifacts.length} 个待写入文件但均未成功落盘，请重试或检查工作区权限。`;
      return next;
    }
    const exec = await executeSkillWorkspace(skillId, input.userInput, {
      commands: runCommands.length > 0 ? runCommands : undefined,
      outputDir: workflowOut?.outputDir,
      sessionId: sessionId || undefined,
    });
    if (!exec.attempted) {
      if (exec.hint && writtenPaths.length === 0) {
        next += `\n\n---\n\n**技能执行说明：** ${exec.hint}`;
        if (sessionWorkspaceDir) {
          next += `\n\n工作区路径：\`${sessionWorkspaceDir}\``;
        } else if (repoPath) {
          next += `\n\n仓库路径：\`${repoPath}\``;
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
    if (sessionWorkspaceDir) {
      sections.push(`会话工作区：\`${sessionWorkspaceDir}\``);
    } else if (repoPath) {
      sections.push(`仓库：\`${repoPath}\``);
    }
    if (exec.exitCode !== null) {
      sections.push(`退出码：${exec.exitCode}`);
    }
    if (exec.skillRuntimeDir) {
      sections.push(`ISkill 运行时：\`${exec.skillRuntimeDir}\``);
    }
    if (exec.skippedCommandNotes?.length) {
      sections.push(
        `\n已跳过命令：\n${exec.skippedCommandNotes.map((note) => `- ${note}`).join('\n')}`,
      );
    }
    if (exec.optionalFailures?.length) {
      sections.push(
        `\n可选步骤失败（已忽略）：\n${exec.optionalFailures.map((c) => `- \`${c}\``).join('\n')}`,
      );
    }
    if (exec.dependencySetup) {
      sections.push(`\n依赖安装：\n\`\`\`\n${exec.dependencySetup.slice(0, 1500)}\n\`\`\``);
    }
    if (exec.stdout) {
      sections.push(`\n输出：\n\`\`\`\n${exec.stdout.slice(0, 2000)}\n\`\`\``);
    }
    if (exec.stderr && exec.exitCode !== 0) {
      sections.push(`\n错误输出：\n\`\`\`\n${exec.stderr.slice(0, 1000)}\n\`\`\``);
    } else if (exec.stderr) {
      sections.push(`\n警告：\n\`\`\`\n${exec.stderr.slice(0, 500)}\n\`\`\``);
    }
    if (exec.tempOutputFiles?.length) {
      sections.push(
        `\n已生成文件：\n${exec.tempOutputFiles.map((p) => `- \`${p}\``).join('\n')}`,
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
