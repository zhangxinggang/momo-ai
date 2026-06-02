import { createNativeFullscreenBridge } from '@momo/utils';
import { useCallback, useState } from 'react';

export type EPromptFullscreenField = 'system' | 'user';

interface IPromptNativeFullscreenOptions {
  getFieldValue: (field: EPromptFullscreenField) => string;
  setFieldValue: (field: EPromptFullscreenField, value: string) => void;
  getFieldTitle: (field: EPromptFullscreenField) => string;
}

const nativeFullscreenBridge = createNativeFullscreenBridge();

export function usePromptNativeFullscreen({
  getFieldValue,
  setFieldValue,
  getFieldTitle,
}: IPromptNativeFullscreenOptions) {
  const [activeFullscreenField, setActiveFullscreenField] = useState<EPromptFullscreenField | null>(
    null,
  );
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  const enterNativeFullscreen = useCallback((field: EPromptFullscreenField) => {
    setActiveFullscreenField(field);
    setIsNativeFullscreen(true);
    nativeFullscreenBridge.enter();
  }, []);

  const exitNativeFullscreen = useCallback(() => {
    setActiveFullscreenField(null);
    setIsNativeFullscreen(false);
    nativeFullscreenBridge.exit();
  }, []);

  const fullscreenValue = activeFullscreenField ? getFieldValue(activeFullscreenField) : '';
  const fullscreenTitle = activeFullscreenField ? getFieldTitle(activeFullscreenField) : '';

  const updateFullscreenValue = useCallback(
    (value: string) => {
      if (!activeFullscreenField) return;
      setFieldValue(activeFullscreenField, value);
    },
    [activeFullscreenField, setFieldValue],
  );

  return {
    activeFullscreenField,
    fullscreenTitle,
    fullscreenValue,
    isNativeFullscreen,
    enterNativeFullscreen,
    exitNativeFullscreen,
    updateFullscreenValue,
  };
}
