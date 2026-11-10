import { createLibrary, defineComponent } from '@openuidev/react-lang';
import { openuiLibrary } from '@openuidev/react-ui/genui-lib';
import { z } from 'zod/v4';

// Schema-only definitions keep generation and validation independent of host file access.
const SplitPane = defineComponent({
  name: 'SplitPane',
  props: z.object({
    left: z.array(z.any()),
    right: z.array(z.any()),
    leftPercent: z.number().min(25).max(75).optional(),
  }),
  description:
    'Responsive two-column layout. left/right are component arrays; leftPercent defaults to 50. Each side scrolls independently.',
  component: () => null,
});

const FilePreview = defineComponent({
  name: 'FilePreview',
  props: z.object({
    sourceId: z.string(),
    height: z.number().min(240).max(1200).optional(),
  }),
  description:
    'Read-only file preview using momo-file-editor. sourceId must come from host attachments or artifact_create result.sourceRef.sourceId for a generated document. Never use paths, URLs, base64 or fabricated IDs. height defaults to 640.',
  component: () => null,
});

const TabItem = defineComponent({
  name: 'TabItem',
  props: z.object({ value: z.string(), trigger: z.string(), content: z.array(z.any()) }),
  description:
    'Tab with a unique value, text trigger and component array content. Supports nested Tabs, SplitPane and FilePreview.',
  component: () => null,
});

const Tabs = defineComponent({
  name: 'Tabs',
  props: z.object({ items: z.array(TabItem.ref), variant: z.enum(['line', 'pill']).optional() }),
  description:
    'Switchable tabs; first item is selected initially and selection stays stable during streaming. Optional line/pill variant; navigation scrolls horizontally.',
  component: () => null,
});

const PlainText = defineComponent({
  name: 'PlainText',
  props: z.object({
    text: z.string(),
    emphasis: z.enum(['normal', 'heading', 'muted']).optional(),
  }),
  description:
    'Literal text preserving newlines. Does not interpret Markdown, HTML, links or scripts. Use for document quotations and templates.',
  component: () => null,
});

const FileInput = defineComponent({
  name: 'FileInput',
  props: z.object({
    name: z.string(),
    label: z.string().optional(),
    accept: z.string().optional(),
    multiple: z.boolean().optional(),
  }),
  description:
    'Native file selection button. Use for file upload fields instead of Input or TextArea. Inside AgentTask files belong to the task submission; otherwise they attach to the AI composer. accept is an optional extension/MIME filter; multiple defaults to false. Never ask users to type file paths.',
  component: () => null,
});

const FileTask = defineComponent({
  name: 'FileTask',
  props: z.object({
    title: z.string(),
    instruction: z.string(),
    skill: z.string().optional(),
    description: z.string().optional(),
    accept: z.string().optional(),
    previewOriginal: z.boolean().optional(),
    steps: z.array(z.string()).length(3).optional(),
  }),
  description:
    'A complete single-file task: upload card, upload/analyze/results steps, native Harness execution with approvals/questions, result Tabs and original-file preview. Use as the root for reusable document-processing tools. instruction describes analysis; skill is the exact installed skill command without /. File bytes and results are host-managed, never invent analysis on the upload screen.',
  component: () => null,
});

const AgentTask = defineComponent({
  name: 'AgentTask',
  props: z.object({
    title: z.string(),
    instruction: z.string(),
    children: z.array(z.any()),
    skill: z.string().optional(),
    steps: z.array(z.string()).length(3).optional(),
    previewOriginal: z.boolean().optional(),
  }),
  description:
    'Generic executable tool, use one AgentTask as the root. children contains a Form with any Input, Select, FileInput and Button components. On form submission the host sends real fields/files to Harness in an isolated session, shows approvals/questions and displays actual results. Works with or without files. instruction defines the business task, optional skill is an installed skill command. steps optionally renames the three stages. Use FileTask for a simple single-file upload card.',
  component: () => null,
});

const ExportDocx = defineComponent({
  name: 'ExportDocx',
  props: z.object({
    fileName: z.string().optional(),
    label: z.string().optional(),
  }),
  description:
    'Button that downloads the currently visible interface content as a DOCX document. Put it near the top of report interfaces.',
  component: () => null,
});

export const momoOpenuiLibrary = createLibrary({
  components: [
    ...Object.values(openuiLibrary.components).filter(
      (definition) => !['TabItem', 'Tabs'].includes(definition.name),
    ),
    TabItem,
    Tabs,
    SplitPane,
    FilePreview,
    PlainText,
    FileInput,
    FileTask,
    AgentTask,
    ExportDocx,
  ],
  componentGroups: [
    ...openuiLibrary.componentGroups,
    {
      name: 'Workspace',
      components: [
        'SplitPane',
        'FilePreview',
        'PlainText',
        'FileInput',
        'FileTask',
        'AgentTask',
        'ExportDocx',
      ],
      notes: [
        'Use supplied attachment source IDs only. Business layout and content come from the user and selected skill.',
      ],
    },
  ],
  root: openuiLibrary.root,
  id: 'momo-openui',
});
