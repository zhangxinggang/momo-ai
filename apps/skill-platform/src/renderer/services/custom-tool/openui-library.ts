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
    'Native file selection button. Use for every file/attachment upload field instead of Input or TextArea. In chat, selected original files are added to the chat composer for the next message. accept is an optional extension/MIME filter; multiple defaults to false. Never ask users to type file paths.',
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
  ],
  componentGroups: [
    ...openuiLibrary.componentGroups,
    {
      name: 'Workspace',
      components: ['SplitPane', 'FilePreview', 'PlainText', 'FileInput'],
      notes: [
        'Use supplied attachment source IDs only. Business layout and content come from the user and selected skill.',
      ],
    },
  ],
  root: openuiLibrary.root,
  id: 'momo-openui',
});
