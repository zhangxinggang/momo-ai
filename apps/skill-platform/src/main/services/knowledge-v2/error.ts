import type {
  EKnowledgeManualAction,
  EKnowledgeStage,
  IKnowledgeErrorShape,
} from '@/types/modules/kb';

export class KnowledgeError extends Error implements IKnowledgeErrorShape {
  readonly name = 'KnowledgeError' as const;
  readonly code: string;
  readonly stage: EKnowledgeStage;
  readonly documentId?: string;
  readonly jobId?: string;
  readonly providerRequestId?: string;
  readonly details?: Record<string, unknown>;
  readonly allowedManualActions: EKnowledgeManualAction[];

  constructor(input: Omit<IKnowledgeErrorShape, 'name'> & { cause?: unknown }) {
    super(input.message, { cause: input.cause });
    this.code = input.code;
    this.stage = input.stage;
    this.documentId = input.documentId;
    this.jobId = input.jobId;
    this.providerRequestId = input.providerRequestId;
    this.details = input.details;
    this.allowedManualActions = input.allowedManualActions;
  }

  toJSON(): IKnowledgeErrorShape {
    return {
      name: this.name,
      code: this.code,
      stage: this.stage,
      message: this.message,
      documentId: this.documentId,
      jobId: this.jobId,
      providerRequestId: this.providerRequestId,
      details: this.details,
      allowedManualActions: this.allowedManualActions,
    };
  }
}

export function toKnowledgeError(
  error: unknown,
  fallback: Omit<IKnowledgeErrorShape, 'name' | 'message'> & { message?: string },
): KnowledgeError {
  if (error instanceof KnowledgeError) {
    return error;
  }
  const message = error instanceof Error ? error.message : String(error);
  return new KnowledgeError({
    ...fallback,
    message: message || fallback.message || fallback.code,
    cause: error,
  });
}

export function fromKnowledgeErrorShape(shape: IKnowledgeErrorShape): KnowledgeError {
  return new KnowledgeError(shape);
}

export function serializeKnowledgeError(error: unknown): IKnowledgeErrorShape {
  if (error instanceof KnowledgeError) return error.toJSON();
  return {
    name: 'KnowledgeError',
    code: 'KNOWLEDGE_WORKER_CALL_FAILED',
    stage: 'initialize',
    message: error instanceof Error ? error.message : String(error),
    allowedManualActions: ['open_logs'],
  };
}
