import { useToast } from '@renderer/components/ui/Toast';
import {
  formatSkillTranslationError,
  resolveSkillDescription,
} from '@renderer/services/skill/detail-utils';
import { computeSkillContentFingerprint } from '@renderer/services/skill/store-update';
import {
  isSkillTranslationStale,
  readSkillTranslationSidecar,
  writeSkillTranslationSidecar,
  type ISkillTranslationSidecar,
} from '@renderer/services/skill/translation-sidecar';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface IUseSkillContentTranslationOptions {
  cacheKey: string;
  sourceContent: string;
  targetLang?: string;
  /** 有值时才读写 sidecar 文件 */
  sidecarSkillId?: string;
  fallbackDescription?: string;
  resetKey?: string;
}

export function useSkillContentTranslation(options: IUseSkillContentTranslationOptions) {
  const targetLang = options.targetLang ?? '中文';
  const { showToast } = useToast();
  const translationMode = useSettingsStore((state) => state.translationMode);
  const translateContent = useSkillStore((state) => state.translateContent);
  const getTranslationState = useSkillStore((state) => state.getTranslationState);
  const clearTranslation = useSkillStore((state) => state.clearTranslation);

  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationSidecar, setTranslationSidecar] = useState<ISkillTranslationSidecar | null>(
    null,
  );
  const [isRetranslatePromptOpen, setIsRetranslatePromptOpen] = useState(false);
  const stalePromptFingerprintRef = useRef<string | null>(null);

  const fingerprint = useMemo(
    () => computeSkillContentFingerprint(options.sourceContent),
    [options.sourceContent],
  );
  const translationState = getTranslationState(options.cacheKey, fingerprint);
  const hasStaleTranslation = translationSidecar
    ? isSkillTranslationStale(translationSidecar, options.sourceContent)
    : translationState.isStale;
  const cachedTranslation = hasStaleTranslation
    ? null
    : (translationSidecar?.content ?? translationState.value);
  const hasSavedTranslation =
    Boolean(translationSidecar?.content) || translationState.hasTranslation;
  const hasDisplayableTranslation = Boolean(cachedTranslation);
  const effectiveContent =
    showTranslation && cachedTranslation ? cachedTranslation : options.sourceContent;
  const resolvedDescription = useMemo(
    () => resolveSkillDescription(effectiveContent) || options.fallbackDescription || '',
    [effectiveContent, options.fallbackDescription],
  );

  useEffect(() => {
    stalePromptFingerprintRef.current = null;
    setShowTranslation(false);
    setIsRetranslatePromptOpen(false);
    setTranslationSidecar(null);
  }, [options.resetKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadTranslationSidecar() {
      if (!options.sidecarSkillId) {
        setTranslationSidecar(null);
        return;
      }

      try {
        const sidecar = await readSkillTranslationSidecar(
          options.sidecarSkillId,
          targetLang,
          translationMode,
        );
        if (!cancelled) {
          setTranslationSidecar(sidecar);
        }
      } catch {
        if (!cancelled) {
          setTranslationSidecar(null);
        }
      }
    }

    void loadTranslationSidecar();

    return () => {
      cancelled = true;
    };
  }, [options.sidecarSkillId, targetLang, translationMode]);

  useEffect(() => {
    if (!options.sourceContent.trim()) {
      setShowTranslation(false);
      return;
    }

    if (hasStaleTranslation) {
      setShowTranslation(false);
      return;
    }

    setShowTranslation(hasSavedTranslation);
  }, [hasSavedTranslation, hasStaleTranslation, options.sourceContent, options.resetKey]);

  useEffect(() => {
    if (!options.sourceContent.trim()) {
      stalePromptFingerprintRef.current = null;
      return;
    }

    if (!hasStaleTranslation) {
      stalePromptFingerprintRef.current = null;
      return;
    }

    if (stalePromptFingerprintRef.current === fingerprint) {
      return;
    }

    stalePromptFingerprintRef.current = fingerprint;
    setIsRetranslatePromptOpen(true);
  }, [fingerprint, hasStaleTranslation, options.sourceContent]);

  const handleTranslate = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && hasDisplayableTranslation && !hasStaleTranslation) {
        setShowTranslation((prev) => !prev);
        return;
      }

      setIsTranslating(true);
      try {
        if (forceRefresh) {
          clearTranslation(options.cacheKey);
        }

        const translated = await translateContent(
          options.sourceContent,
          options.cacheKey,
          targetLang,
          {
            forceRefresh,
            sourceFingerprint: fingerprint,
          },
        );

        if (!translated) {
          throw new Error('TRANSLATION_EMPTY');
        }

        if (options.sidecarSkillId && options.sourceContent.trim()) {
          const nextSidecar = await writeSkillTranslationSidecar({
            skillId: options.sidecarSkillId,
            sourceContent: options.sourceContent,
            translatedContent: translated,
            targetLanguage: targetLang,
            translationMode,
          });
          setTranslationSidecar(nextSidecar);
        }

        setShowTranslation(true);
        setIsRetranslatePromptOpen(false);
        showToast(forceRefresh ? '翻译已刷新' : '翻译完成', 'success');
      } catch (error: unknown) {
        showToast(formatSkillTranslationError(error), 'error');
      } finally {
        setIsTranslating(false);
      }
    },
    [
      clearTranslation,
      fingerprint,
      hasDisplayableTranslation,
      hasStaleTranslation,
      options.cacheKey,
      options.sidecarSkillId,
      options.sourceContent,
      showToast,
      targetLang,
      translateContent,
      translationMode,
    ],
  );

  return {
    targetLang,
    isTranslating,
    showTranslation,
    setShowTranslation,
    hasStaleTranslation,
    hasSavedTranslation,
    hasDisplayableTranslation,
    cachedTranslation,
    effectiveContent,
    resolvedDescription,
    isRetranslatePromptOpen,
    setIsRetranslatePromptOpen,
    handleTranslate,
  };
}
