import type { IFolder } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import { useFolderStore, usePromptStore } from '@renderer/store';
import {
  buildFolderTree,
  canCreateInParent,
  canSetParent,
  MAX_FOLDER_DEPTH,
  type IFolderTreeNode,
} from '@renderer/utils/folder/tree';
import { Button, Input, Modal, Radio } from 'antd';
import {
  AlertTriangleIcon,
  Archive,
  BookMarked,
  BookOpen,
  Briefcase,
  Bug,
  Calendar,
  Camera,
  CheckCircle,
  ChevronRightIcon,
  Circle,
  Cloud,
  Code,
  Coffee,
  Cpu,
  CreditCard,
  Crown,
  Database,
  FileText,
  Flame,
  Folder as FolderIconLucide,
  FolderOpen,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Hammer,
  Headphones,
  Heart,
  Home,
  Image,
  Inbox,
  Key,
  Layers,
  Lightbulb,
  Mail,
  Map,
  MessageSquare,
  Monitor,
  Moon,
  Music,
  Newspaper,
  Package,
  Palette,
  PenTool,
  Phone,
  Pizza,
  Plane,
  Play,
  Rocket,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
  Terminal,
  Trash2,
  TrashIcon,
  Trophy,
  Truck,
  Tv,
  Upload,
  Users,
  Video,
  Wallet,
  Watch,
  Wrench,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { renderFolderIcon } from '../FolderIconHelper';

// Optional folder icons - categorized
// 可选的文件夹图标 - 分类整理
const FOLDER_ICON_CATEGORIES = [
  {
    name: '常用',
    icons: [
      '📁',
      '📂',
      '🗂️',
      '📋',
      '📌',
      '⭐',
      '❤️',
      '🔥',
      '✨',
      '💎',
      '🎯',
      '🏆',
      '👑',
      '💯',
      '🌟',
    ],
  },
  {
    name: '工作',
    icons: [
      '💼',
      '📊',
      '📈',
      '📉',
      '💻',
      '🖥️',
      '⌨️',
      '🖱️',
      '🖨️',
      '📱',
      '☎️',
      '📞',
      '📠',
      '🔧',
      '⚙️',
      '🛠️',
      '⚡',
      '🔌',
      '💡',
      '🔦',
    ],
  },
  {
    name: '学习',
    icons: [
      '📚',
      '📖',
      '📕',
      '📗',
      '📘',
      '📙',
      '📓',
      '📔',
      '📒',
      '📝',
      '✏️',
      '✒️',
      '🖊️',
      '🖍️',
      '🖌️',
      '🎓',
      '🔬',
      '🧪',
      '🧬',
      '🔭',
      '🧠',
      '💭',
      '📐',
      '📏',
      '✂️',
    ],
  },
  {
    name: '创意',
    icons: [
      '🎨',
      '🖼️',
      '🎭',
      '🎬',
      '🎥',
      '📷',
      '📸',
      '📹',
      '📽️',
      '🎞️',
      '🎵',
      '🎶',
      '🎼',
      '🎹',
      '🎸',
      '🎺',
      '🎷',
      '🥁',
      '🎮',
      '🕹️',
      '🎲',
      '🎰',
      '🚀',
      '🌈',
      '🎪',
      '🎡',
      '🎢',
    ],
  },
  {
    name: '生活',
    icons: [
      '🏠',
      '🏡',
      '🏢',
      '🏬',
      '🏭',
      '🏗️',
      '🏘️',
      '🌍',
      '🌎',
      '🌏',
      '🗺️',
      '🧭',
      '🌸',
      '🌺',
      '🌻',
      '🌹',
      '🌷',
      '🌼',
      '🌱',
      '🍀',
      '🌿',
      '☘️',
      '☀️',
      '🌙',
      '⭐',
      '🌟',
      '✨',
      '⛅',
      '🌤️',
      '⛈️',
      '🌈',
      '🎁',
      '🎀',
      '🎉',
      '🎊',
      '🎈',
      '🎂',
      '🍰',
    ],
  },
  {
    name: '符号',
    icons: [
      '💬',
      '💭',
      '🗨️',
      '🗯️',
      '💡',
      '📢',
      '📣',
      '🔔',
      '🔕',
      '🔒',
      '🔓',
      '🔐',
      '🔑',
      '🗝️',
      '🏷️',
      '📎',
      '🖇️',
      '📍',
      '📌',
      '🔗',
      '⛓️',
      '🧲',
      '💰',
      '💵',
      '💴',
      '💶',
      '💷',
      '💳',
      '💸',
    ],
  },
  {
    name: '食物',
    icons: [
      '🍎',
      '🍊',
      '🍋',
      '🍌',
      '🍉',
      '🍇',
      '🍓',
      '🍒',
      '🍑',
      '🥝',
      '🥑',
      '🍅',
      '🥕',
      '🌽',
      '🥦',
      '🥒',
      '🍞',
      '🥐',
      '🥖',
      '🧀',
      '🍕',
      '🍔',
      '🌭',
      '🥪',
      '🌮',
      '🌯',
      '🍜',
      '🍝',
      '🍱',
      '🍛',
      '🍣',
      '🍤',
      '🍰',
      '🎂',
      '🍪',
      '🍩',
      '☕',
      '🍵',
      '🥤',
      '🍺',
      '🍷',
      '🥂',
    ],
  },
  {
    name: '动物',
    icons: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
      '🐧',
      '🐦',
      '🐤',
      '🦆',
      '🦅',
      '🦉',
      '🦇',
      '🐺',
      '🐗',
      '🐴',
      '🦄',
      '🐝',
      '🐛',
      '🦋',
      '🐌',
      '🐞',
      '🐜',
      '🦗',
      '🕷️',
      '🦂',
      '🐢',
      '🐍',
      '🦎',
      '🦖',
      '🦕',
      '🐙',
      '🦑',
      '🦐',
      '🦀',
      '🐡',
      '🐠',
      '🐟',
      '🐬',
      '🐳',
      '🐋',
      '🦈',
    ],
  },
  {
    name: '旅行',
    icons: [
      '✈️',
      '🛫',
      '🛬',
      '🚀',
      '🛸',
      '🚁',
      '🛶',
      '⛵',
      '🚤',
      '🛥️',
      '⛴️',
      '🚢',
      '🚂',
      '🚃',
      '🚄',
      '🚅',
      '🚆',
      '🚇',
      '🚈',
      '🚉',
      '🚊',
      '🚝',
      '🚞',
      '🚋',
      '🚌',
      '🚍',
      '🚎',
      '🚐',
      '🚑',
      '🚒',
      '🚓',
      '🚔',
      '🚕',
      '🚖',
      '🚗',
      '🚘',
      '🚙',
      '🚚',
      '🚛',
      '🚜',
      '🏎️',
      '🏍️',
      '🛵',
      '🚲',
      '🛴',
      '🛹',
      '⛷️',
      '🏂',
    ],
  },
  {
    name: '运动',
    icons: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🥎',
      '🎾',
      '🏐',
      '🏉',
      '🥏',
      '🎱',
      '🏓',
      '🏸',
      '🏒',
      '🏑',
      '🥍',
      '🏏',
      '🥅',
      '⛳',
      '🏹',
      '🎣',
      '🥊',
      '🥋',
      '🎽',
      '🛹',
      '🛷',
      '⛸️',
      '🥌',
      '🎿',
      '⛷️',
      '🏂',
      '🏋️',
      '🤸',
      '🤼',
      '🤺',
      '🤾',
      '🏌️',
      '🏇',
      '🧘',
      '🏊',
      '🤽',
      '🚣',
      '🧗',
      '🚴',
      '🚵',
      '🏆',
      '🥇',
      '🥈',
      '🥉',
      '🏅',
      '🎖️',
    ],
  },
  {
    name: '天气',
    icons: [
      '☀️',
      '🌤️',
      '⛅',
      '🌥️',
      '☁️',
      '🌦️',
      '🌧️',
      '⛈️',
      '🌩️',
      '🌨️',
      '❄️',
      '☃️',
      '⛄',
      '🌬️',
      '💨',
      '🌪️',
      '🌫️',
      '🌈',
      '☔',
      '⚡',
      '🔥',
      '💧',
      '🌊',
      '🌙',
      '⭐',
      '🌟',
      '✨',
      '💫',
    ],
  },
];

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: IFolder | null; // 编辑模式时传入
}

export function FolderModal({ isOpen, onClose, folder }: IProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'folder-only' | 'all-content'>('folder-only');
  const [promptsInFolder, setPromptsInFolder] = useState(0);
  const [iconMode, setIconMode] = useState<'emoji' | 'icon'>('emoji');
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [showParentSelect, setShowParentSelect] = useState(false);
  const { showToast } = useToast();

  const createFolder = useFolderStore((state) => state.createFolder);
  const updateFolder = useFolderStore((state) => state.updateFolder);
  const deleteFolder = useFolderStore((state) => state.deleteFolder);
  const folders = useFolderStore((state) => state.folders);
  const prompts = usePromptStore((state) => state.prompts);
  const updatePrompt = usePromptStore((state) => state.updatePrompt);
  const deletePrompt = usePromptStore((state) => state.deletePrompt);

  const isEditMode = !!folder;

  const saveFolder = async () => {
    if (isEditMode && folder) {
      await updateFolder(folder.id, {
        name: name.trim(),
        icon,
        isPrivate: false,
        parentId,
      });
    } else {
      await createFolder({
        name: name.trim(),
        icon,
        isPrivate: false,
        parentId,
      });
    }
    onClose();
  };

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setIcon(folder.icon || '📁');
      setParentId(folder.parentId);
    } else {
      setName('');
      setIcon('📁');
      setParentId(undefined);
    }
  }, [folder, isOpen]);

  // Build folder tree for parent selection
  // 构建文件夹树用于父级选择
  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  // Get available parent folders (exclude self and descendants in edit mode)
  // 获取可用的父级文件夹（编辑模式下排除自己和后代）
  const getAvailableParents = useMemo(() => {
    const result: { folder: IFolder; depth: number }[] = [];

    function traverse(nodes: IFolderTreeNode[]) {
      nodes.forEach((node) => {
        // In edit mode, exclude self and check if can be a valid parent
        const isValidParent =
          !isEditMode || (folder?.id !== node.id && canSetParent(folders, folder!.id, node.id));

        // Check depth limit
        const canHaveChildren = canCreateInParent(folders, node.id);

        if (isValidParent && canHaveChildren) {
          result.push({ folder: node, depth: node.depth });
        }

        traverse(node.children);
      });
    }

    traverse(folderTree);
    return result;
  }, [folders, folderTree, folder, isEditMode]);

  // Get current parent folder name
  const currentParentName = useMemo(() => {
    if (!parentId) return null;
    return folders.find((f) => f.id === parentId)?.name || null;
  }, [parentId, folders]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent, skipDuplicateCheck = false) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check for duplicate folder name (only when creating or renaming)
    // 检查文件夹名称是否重复（仅在创建或重命名时）
    if (!skipDuplicateCheck) {
      const trimmedName = name.trim();
      const isDuplicate = folders.some(
        (f) => f.name === trimmedName && (!isEditMode || f.id !== folder?.id),
      );

      if (isDuplicate) {
        setShowDuplicateConfirm(true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await saveFolder();
    } catch (error) {
      console.error('Failed to save folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateConfirm = () => {
    setShowDuplicateConfirm(false);
    handleSubmit({ preventDefault: () => {} } as any, true);
  };

  const handleDelete = async () => {
    if (!folder) return;

    // 检查文件夹内是否有 prompt
    const count = prompts.filter((p) => p.folderId === folder.id).length;
    setPromptsInFolder(count);

    if (count > 0) {
      setShowDeleteOptions(true);
    } else {
      try {
        await deleteFolder(folder.id);
        showToast('文件夹已删除', 'success');
        onClose();
      } catch (error) {
        console.error('Failed to delete folder:', error);
        showToast('删除失败', 'error');
      }
    }
  };

  const handleDeleteWithOptions = async () => {
    if (!folder) return;
    await executeDelete();
  };

  const executeDelete = async () => {
    if (!folder) return;

    try {
      if (deleteMode === 'all-content') {
        // 删除文件夹及所有内部 prompt
        const folderPrompts = prompts.filter((p) => p.folderId === folder.id);
        for (const prompt of folderPrompts) {
          await deletePrompt(prompt.id);
        }
        await deleteFolder(folder.id);
        showToast(`已删除文件夹及 ${folderPrompts.length} 个提示词`, 'success');
      } else {
        // 仅删除文件夹，保留 prompt 并解除关联
        const folderPrompts = prompts.filter((p) => p.folderId === folder.id);
        for (const prompt of folderPrompts) {
          await updatePrompt(prompt.id, { folderId: undefined });
        }
        await deleteFolder(folder.id);
        showToast(`已删除文件夹，${folderPrompts.length} 个提示词已移至根目录`, 'success');
      }
      setShowDeleteOptions(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      showToast('删除失败', 'error');
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        title={isEditMode ? '编辑文件夹' : '新建文件夹'}
        width={672}
        zIndex={50}
        footer={null}
        destroyOnClose={false}
        styles={{ body: { padding: 0, maxHeight: 'min(85vh, 760px)' } }}>
        <form onSubmit={handleSubmit} className='flex max-h-[min(85vh,760px)] min-h-0 flex-col'>
          <div className='min-h-0 flex-1 space-y-5 overflow-y-auto p-5'>
            {/* 图标选择 */}
            <div>
              <label className='mb-2 block text-sm font-medium'>{'图标'}</label>

              {/* Tab 切换 */}
              <div className='bg-muted mb-3 flex gap-1 rounded-lg p-1'>
                <Button
                  type='text'
                  block
                  className={
                    iconMode === 'emoji'
                      ? 'app-wallpaper-surface-strong !text-foreground shadow-sm'
                      : '!text-muted-foreground'
                  }
                  onClick={() => setIconMode('emoji')}>
                  Emoji
                </Button>
                <Button
                  type='text'
                  block
                  className={
                    iconMode === 'icon'
                      ? 'app-wallpaper-surface-strong !text-foreground shadow-sm'
                      : '!text-muted-foreground'
                  }
                  onClick={() => setIconMode('icon')}>
                  Icon
                </Button>
              </div>

              <div className='max-h-48 space-y-3 overflow-y-auto pr-2'>
                {iconMode === 'emoji' ? (
                  FOLDER_ICON_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <div className='text-muted-foreground mb-1.5 text-xs'>{category.name}</div>
                      <div className='flex flex-wrap gap-1.5'>
                        {category.icons.map((emoji) => (
                          <Button
                            key={emoji}
                            type='default'
                            className={`!h-9 !w-9 !min-w-0 p-0 text-lg ${
                              icon === emoji
                                ? '!border-primary !bg-primary !text-white'
                                : '!bg-muted hover:!bg-muted/80'
                            }`}
                            onClick={() => setIcon(emoji)}>
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='flex flex-wrap gap-1.5'>
                    {[
                      { name: 'folder', Icon: FolderIconLucide },
                      { name: 'folder-open', Icon: FolderOpen },
                      { name: 'book-open', Icon: BookOpen },
                      { name: 'book-marked', Icon: BookMarked },
                      { name: 'code', Icon: Code },
                      { name: 'database', Icon: Database },
                      { name: 'file-text', Icon: FileText },
                      { name: 'image', Icon: Image },
                      { name: 'music', Icon: Music },
                      { name: 'video', Icon: Video },
                      { name: 'archive', Icon: Archive },
                      { name: 'package', Icon: Package },
                      { name: 'briefcase', Icon: Briefcase },
                      { name: 'graduation-cap', Icon: GraduationCap },
                      { name: 'palette', Icon: Palette },
                      { name: 'rocket', Icon: Rocket },
                      { name: 'heart', Icon: Heart },
                      { name: 'star', Icon: Star },
                      { name: 'zap', Icon: Zap },
                      { name: 'coffee', Icon: Coffee },
                      { name: 'home', Icon: Home },
                      { name: 'settings', Icon: Settings },
                      { name: 'bug', Icon: Bug },
                      { name: 'calendar', Icon: Calendar },
                      { name: 'camera', Icon: Camera },
                      { name: 'check-circle', Icon: CheckCircle },
                      { name: 'circle', Icon: Circle },
                      { name: 'cloud', Icon: Cloud },
                      { name: 'cpu', Icon: Cpu },
                      { name: 'credit-card', Icon: CreditCard },
                      { name: 'crown', Icon: Crown },
                      { name: 'flame', Icon: Flame },
                      { name: 'gamepad-2', Icon: Gamepad2 },
                      { name: 'gift', Icon: Gift },
                      { name: 'globe', Icon: Globe },
                      { name: 'hammer', Icon: Hammer },
                      { name: 'headphones', Icon: Headphones },
                      { name: 'inbox', Icon: Inbox },
                      { name: 'key', Icon: Key },
                      { name: 'layers', Icon: Layers },
                      { name: 'lightbulb', Icon: Lightbulb },
                      { name: 'mail', Icon: Mail },
                      { name: 'map', Icon: Map },
                      { name: 'message-square', Icon: MessageSquare },
                      { name: 'monitor', Icon: Monitor },
                      { name: 'moon', Icon: Moon },
                      { name: 'newspaper', Icon: Newspaper },
                      { name: 'pen-tool', Icon: PenTool },
                      { name: 'phone', Icon: Phone },
                      { name: 'pizza', Icon: Pizza },
                      { name: 'plane', Icon: Plane },
                      { name: 'play', Icon: Play },
                      { name: 'search', Icon: Search },
                      { name: 'shield', Icon: Shield },
                      { name: 'shopping-cart', Icon: ShoppingCart },
                      { name: 'smartphone', Icon: Smartphone },
                      { name: 'sparkles', Icon: Sparkles },
                      { name: 'sun', Icon: Sun },
                      { name: 'tag', Icon: Tag },
                      { name: 'target', Icon: Target },
                      { name: 'terminal', Icon: Terminal },
                      { name: 'trash-2', Icon: Trash2 },
                      { name: 'trophy', Icon: Trophy },
                      { name: 'truck', Icon: Truck },
                      { name: 'tv', Icon: Tv },
                      { name: 'upload', Icon: Upload },
                      { name: 'users', Icon: Users },
                      { name: 'wallet', Icon: Wallet },
                      { name: 'watch', Icon: Watch },
                      { name: 'wrench', Icon: Wrench },
                    ].map(({ name, Icon }) => (
                      <Button
                        key={name}
                        type='default'
                        className={`!h-9 !w-9 !min-w-0 p-0 ${
                          icon === `icon:${name}`
                            ? '!border-primary !bg-primary !text-white'
                            : '!bg-muted text-foreground hover:!bg-muted/80'
                        }`}
                        onClick={() => setIcon(`icon:${name}`)}>
                        <Icon className='h-5 w-5' />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 名称输入 */}
            <div>
              <label className='mb-2 block text-sm font-medium'>
                {'名称'}
                <span className='text-destructive ml-1'>*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={'输入文件夹名称'}
                autoFocus
              />
            </div>

            {/* 父级文件夹选择 (Issue #14) */}
            <div>
              <label className='mb-2 block text-sm font-medium'>{'父级文件夹'}</label>
              <div className='relative'>
                <Button
                  type='default'
                  block
                  className='flex !h-10 justify-between text-left font-normal'
                  onClick={() => setShowParentSelect(!showParentSelect)}>
                  <span
                    className={currentParentName ? 'text-foreground' : 'text-muted-foreground/50'}>
                    {currentParentName || '无（根目录）'}
                  </span>
                  <ChevronRightIcon
                    className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${showParentSelect ? 'rotate-90' : ''}`}
                  />
                </Button>

                {showParentSelect && (
                  <div className='bg-popover border-border absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg'>
                    <Button
                      type='text'
                      block
                      className={`!h-auto justify-start rounded-none py-2 ${
                        !parentId ? 'bg-primary/10 !text-primary' : ''
                      }`}
                      onClick={() => {
                        setParentId(undefined);
                        setShowParentSelect(false);
                      }}
                      icon={<FolderIconLucide className='h-4 w-4' />}>
                      {'无（根目录）'}
                    </Button>

                    {getAvailableParents.map(({ folder: f, depth }) => (
                      <Button
                        key={f.id}
                        type='text'
                        block
                        className={`flex !h-auto items-center justify-start gap-2 rounded-none py-2 ${
                          parentId === f.id ? 'bg-primary/10 !text-primary' : ''
                        }`}
                        style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}
                        onClick={() => {
                          setParentId(f.id);
                          setShowParentSelect(false);
                        }}>
                        <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
                          {renderFolderIcon(f.icon)}
                        </span>
                        <span className='min-w-0 truncate'>{f.name}</span>
                      </Button>
                    ))}

                    {getAvailableParents.length === 0 && (
                      <div className='text-muted-foreground px-3 py-2 text-sm'>
                        {'没有可用的父级文件夹'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className='text-muted-foreground mt-1 text-xs'>
                {`最多支持 ${MAX_FOLDER_DEPTH} 层嵌套`}
              </p>
            </div>
          </div>
          {/* 操作按钮 */}
          <div className='border-border app-wallpaper-surface flex items-center justify-between border-t px-5 pb-5 pt-3'>
            {isEditMode ? (
              <Button
                danger
                type='default'
                icon={<TrashIcon className='h-4 w-4' />}
                onClick={handleDelete}>
                {'删除'}
              </Button>
            ) : (
              <div />
            )}
            <div className='flex gap-2'>
              <Button onClick={onClose}>{'取消'}</Button>
              <Button
                type='primary'
                htmlType='submit'
                disabled={!name.trim() || isSubmitting}
                loading={isSubmitting}>
                {'保存'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* 删除选项弹窗 */}
      <Modal
        open={showDeleteOptions}
        zIndex={1100}
        title={
          <div className='flex items-start gap-3 pr-8'>
            <div className='bg-destructive/10 shrink-0 rounded-lg p-2'>
              <AlertTriangleIcon className='text-destructive h-5 w-5' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-base font-semibold'>{`删除文件夹「${folder?.name || ''}」`}</div>
              <p className='text-muted-foreground mt-1 text-sm font-normal'>
                {`此文件夹包含 ${promptsInFolder} 个提示词`}
              </p>
            </div>
          </div>
        }
        onCancel={() => {
          setShowDeleteOptions(false);
          setDeleteMode('folder-only');
        }}
        footer={null}
        width={480}
        destroyOnClose>
        <Radio.Group
          className='flex w-full flex-col gap-2'
          value={deleteMode}
          onChange={(e) => setDeleteMode(e.target.value as 'folder-only' | 'all-content')}>
          <Radio
            value='folder-only'
            className={`border-border w-full rounded-lg border px-3 py-2.5 ${
              deleteMode === 'folder-only' ? 'border-primary bg-primary/5' : ''
            }`}>
            <div className='text-left'>
              <div className='text-sm font-medium'>{'仅删除文件夹'}</div>
              <div className='text-muted-foreground mt-0.5 text-xs'>
                {`保留 ${promptsInFolder} 个提示词，移至根目录`}
              </div>
            </div>
          </Radio>
          <Radio
            value='all-content'
            className={`border-border w-full rounded-lg border px-3 py-2.5 ${
              deleteMode === 'all-content' ? 'border-destructive bg-destructive/5' : ''
            }`}>
            <div className='text-left'>
              <div className='text-destructive text-sm font-medium'>{'删除所有内容'}</div>
              <div className='text-muted-foreground mt-0.5 text-xs'>
                {`删除文件夹及内部所有 ${promptsInFolder} 个提示词`}
              </div>
            </div>
          </Radio>
        </Radio.Group>
        <div className='mt-4 flex justify-end gap-2'>
          <Button
            onClick={() => {
              setShowDeleteOptions(false);
              setDeleteMode('folder-only');
            }}>
            {'取消'}
          </Button>
          <Button
            type='primary'
            danger={deleteMode === 'all-content'}
            onClick={() => void handleDeleteWithOptions()}>
            {'确认删除'}
          </Button>
        </div>
      </Modal>

      {/* 重复名称确认弹窗 */}
      <Modal
        open={showDuplicateConfirm}
        zIndex={1100}
        title={
          <div className='flex items-start gap-3 pr-8'>
            <div className='bg-primary/10 shrink-0 rounded-lg p-2'>
              <AlertTriangleIcon className='text-primary h-5 w-5' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-base font-semibold'>{'文件夹名称已存在'}</div>
              <p className='text-muted-foreground mt-1 text-sm font-normal'>
                {`已存在名为「${name.trim()}」的文件夹，是否仍要创建？`}
              </p>
            </div>
          </div>
        }
        onCancel={() => setShowDuplicateConfirm(false)}
        footer={null}
        destroyOnClose>
        <div className='flex justify-end gap-2'>
          <Button onClick={() => setShowDuplicateConfirm(false)}>{'取消'}</Button>
          <Button type='primary' onClick={handleDuplicateConfirm}>
            {'确认创建'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
