import { Button, Modal, type ModalProps } from 'antd';
import { CheckIcon } from 'lucide-react';
import { SkillScanPreview } from '../SkillScanPreview';
import { CreateSkillAiPanel } from './CreateSkillAiPanel';
import { CreateSkillGitHubPanel } from './CreateSkillGitHubPanel';
import { CreateSkillManualPanel } from './CreateSkillManualPanel';
import {
  CreateSkillModalTitleIcon,
  CreateSkillModeSelect,
  getCreateSkillModalTitle,
} from './CreateSkillModeSelect';
import { CreateSkillScanIntro } from './CreateSkillScanIntro';
import { useCreateSkillModal } from './useCreateSkillModal';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSkillModal({ isOpen, onClose }: IProps) {
  const { UnsavedLeaveDialog, ...modal } = useCreateSkillModal({ isOpen, onClose });

  if (!isOpen) {
    return null;
  }

  const createSkillModalTitle = (
    <span className='flex items-center gap-2'>
      <CreateSkillModalTitleIcon />
      <span>{getCreateSkillModalTitle(modal.mode)}</span>
    </span>
  );

  const createSkillModalFooter = modal.isGitHubMode ? (
    <div data-testid='github-mode-footer' className='flex justify-end gap-2'>
      <Button onClick={() => modal.setMode('select')}>{'返回'}</Button>
      <Button
        type='primary'
        loading={modal.isLoading}
        disabled={
          modal.isLoading || (modal.githubScanDone && modal.selectedGitHubSkills.size === 0)
        }
        icon={<CheckIcon className='h-4 w-4' />}
        onClick={
          modal.githubScanDone ? modal.handleImportSelectedGitHubSkills : modal.handleGitHubInstall
        }>
        {modal.githubScanDone ? '导入选中' : '扫描仓库'}
      </Button>
    </div>
  ) : modal.isManualMode ? (
    <div className='flex justify-end gap-2'>
      <Button onClick={() => modal.setMode('select')}>{'返回'}</Button>
      <Button
        type='primary'
        loading={modal.isLoading}
        disabled={modal.isLoading || modal.isGenerating || !modal.name.trim()}
        icon={<CheckIcon className='h-4 w-4' />}
        onClick={() => void modal.handleManualCreateClick()}>
        {'创建技能'}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <Modal
        open
        zIndex={100}
        data-testid='create-skill-modal-container'
        onCancel={modal.handleCloseRequest}
        title={createSkillModalTitle}
        width={modal.createSkillModalWidth}
        footer={createSkillModalFooter}
        centered={!modal.isManualMode}
        style={modal.isManualMode ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : undefined}
        styles={
          (modal.isManualMode
            ? {
                wrapper: { padding: 0 },
                content: {
                  margin: 0,
                  maxWidth: '100vw',
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  borderRadius: 0,
                },
                body: { flex: 1, minHeight: 0, overflow: 'auto', paddingTop: 8 },
              }
            : {
                body: {
                  maxHeight:
                    modal.isGitHubMode && modal.hasGitHubResults
                      ? 'min(85vh, 720px)'
                      : 'min(72vh, 520px)',
                  overflowY: 'auto',
                  paddingTop: 8,
                },
              }) as ModalProps['styles']
        }
        destroyOnClose={false}>
        <div
          className={`p-6 ${
            modal.isManualMode
              ? ''
              : modal.isGitHubMode || modal.isScanMode
                ? 'flex min-h-0 flex-col overflow-hidden'
                : ''
          }`}>
          {modal.error && (
            <div className='bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm'>
              {modal.error}
            </div>
          )}

          {modal.mode === 'select' && <CreateSkillModeSelect onSelectMode={modal.setMode} />}

          {modal.isGitHubMode && (
            <CreateSkillGitHubPanel
              githubUrl={modal.githubUrl}
              onGithubUrlChange={modal.setGithubUrl}
              hasResults={modal.hasGitHubResults}
              importNotice={modal.githubImportNotice}
              annotatedResults={modal.annotatedGitHubResults}
              selectableResults={modal.selectableGitHubResults}
              selectedSlugs={modal.selectedGitHubSkills}
              onToggleSkill={modal.toggleGitHubSkill}
              onToggleSelectAll={modal.handleToggleGitHubSelectAll}
            />
          )}

          {modal.mode === 'manual' && (
            <CreateSkillManualPanel
              form={modal.manualForm}
              existingTags={modal.existingTags}
              canGenerateWithAI={Boolean(modal.canGenerateWithAI)}
              isGenerating={modal.isGenerating}
              skillMdEditorRef={modal.skillMdEditorRef}
              skillMdToolbars={modal.skillMdToolbars}
              onFieldChange={modal.handleManualFieldChange}
              onMdFileUpload={modal.handleMdFileUpload}
              onAIPolish={() => void modal.handleAIPolish()}
              onDrop={modal.handleDrop}
              onUploadImg={modal.handleUploadImg}
            />
          )}

          {modal.mode === 'ai' && (
            <CreateSkillAiPanel
              name={modal.name}
              description={modal.description}
              canGenerateWithAI={Boolean(modal.canGenerateWithAI)}
              isGenerating={modal.isGenerating}
              onNameChange={modal.setName}
              onDescriptionChange={modal.setDescription}
              onBack={() => modal.setMode('select')}
              onGenerate={() => void modal.handleAICreate()}
            />
          )}

          {modal.isScanMode && !modal.showScanPreview && (
            <CreateSkillScanIntro
              isScanning={modal.isScanning}
              onStartScan={() => void modal.handleScanLocal()}
            />
          )}
        </div>
      </Modal>
      {modal.showScanPreview && (
        <SkillScanPreview
          scannedSkills={modal.scanResults}
          installedPaths={modal.installedScanPaths}
          onImport={modal.handleScanImport}
          onRescan={modal.handleScanRescan}
          onClose={modal.handleCloseScanPreview}
        />
      )}
      <UnsavedLeaveDialog />
    </>
  );
}
