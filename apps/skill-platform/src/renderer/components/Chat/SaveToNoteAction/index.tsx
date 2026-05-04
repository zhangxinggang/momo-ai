import type { INoteTreeNode } from '@/types/modules/note';
import type { IChatMessage } from '@momo/aichat';
import { App, Button, Input, Modal, TreeSelect } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface INoteTreeSelectNode {
  title: string;
  value: string;
  isLeaf?: boolean;
  selectable?: boolean;
  children?: INoteTreeSelectNode[];
}

function buildNoteTreeOptions(nodes: INoteTreeNode[], parentId = ''): INoteTreeSelectNode[] {
  const children = nodes.filter((node) => {
    const parent = node.id.includes('/') ? node.id.slice(0, node.id.lastIndexOf('/')) : '';
    return parent === parentId;
  });

  return children.map((node) => {
    const childNodes = buildNoteTreeOptions(nodes, node.id);
    const isFile = node.kind === 'file';
    return {
      title: node.name,
      value: node.id,
      isLeaf: isFile,
      selectable: true,
      children: childNodes.length > 0 ? childNodes : undefined,
    };
  });
}

function flattenNoteTree(nodes: INoteTreeNode[]): INoteTreeNode[] {
  const flat: INoteTreeNode[] = [];
  const walk = (items: INoteTreeNode[]) => {
    for (const item of items) {
      flat.push(item);
      if (item.children?.length) {
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return flat;
}

interface IProps {
  message: IChatMessage;
}

/** AI 对话助手消息：保存到笔记 */
export function SaveToNoteAction({ message }: IProps) {
  const { message: toast } = App.useApp();
  const [open, setOpen] = useState(false);
  const [treeNodes, setTreeNodes] = useState<INoteTreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const flatNodes = useMemo(() => flattenNoteTree(treeNodes), [treeNodes]);
  const treeOptions = useMemo(() => buildNoteTreeOptions(flatNodes), [flatNodes]);

  const selectedNode = useMemo(
    () => flatNodes.find((node) => node.id === selectedPath),
    [flatNodes, selectedPath],
  );

  const loadTree = useCallback(async () => {
    const list = await window.api?.note?.listTree?.();
    if (!Array.isArray(list)) {
      setTreeNodes([]);
      return;
    }
    setTreeNodes(list as INoteTreeNode[]);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    void loadTree();
  }, [loadTree, open]);

  const handleSave = async () => {
    if (!selectedPath || !window.api?.note) {
      toast.warning('请选择保存位置');
      return;
    }
    const content = message.content?.trim();
    if (!content) {
      toast.warning('没有可保存的内容');
      return;
    }

    setSaving(true);
    try {
      if (selectedNode?.kind === 'folder') {
        const name = newName.trim();
        if (!name) {
          toast.warning('请输入文件名称');
          return;
        }
        const created = await window.api.note.createFile(selectedPath, name, 'text');
        const filePath = typeof created === 'string' ? created : created.id;
        await window.api.note.writeFile(filePath, content);
      } else {
        const existingFile = await window.api.note.readFile(selectedPath);
        const existing =
          typeof existingFile === 'string' ? existingFile : (existingFile?.content ?? '');
        const merged = `${existing}\n\n${content}`;
        await window.api.note.writeFile(selectedPath, merged);
      }
      toast.success('保存成功');
      setOpen(false);
      setSelectedPath(undefined);
      setNewName('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '保存失败';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button type='link' size='small' onClick={() => setOpen(true)}>
        {'保存到笔记'}
      </Button>
      <Modal
        open={open}
        title={'请选择保存的位置'}
        onCancel={() => setOpen(false)}
        onOk={() => void handleSave()}
        confirmLoading={saving}
        okText={'保存'}
        cancelText={'取消'}
        destroyOnClose>
        <TreeSelect
          className='w-full'
          placeholder={'选择笔记文件夹或文件'}
          treeData={treeOptions}
          value={selectedPath}
          onChange={(value) => setSelectedPath(value)}
          treeDefaultExpandAll
          showSearch
          allowClear
        />
        {selectedNode?.kind === 'folder' ? (
          <Input
            className='mt-3'
            placeholder={'输入新文件名称'}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        ) : selectedNode?.kind === 'file' ? (
          <p className='text-muted-foreground mt-3 text-xs'>{'将追加到当前文件下方'}</p>
        ) : null}
      </Modal>
    </>
  );
}
