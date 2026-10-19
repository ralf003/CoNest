/** Modules loaded together only when the optional full DSH composition starts. */
import * as JsonlSessionPersistenceModule from '@deepseek-ai/dsh-session-persistence-jsonl';
import type { Plugin } from '@deepseek-ai/cordis';

export { default as AgentLoop } from '@deepseek-ai/dsh-agent-loop';
export { default as LocalAttachmentStore } from '@deepseek-ai/dsh-attachment-local';
export { default as SandboxBashExecutor } from '@deepseek-ai/dsh-bash-sandbox';
export * as FsObservationPolicy from '@deepseek-ai/dsh-fs-observation-policy';
export { default as SandboxedFileSystem } from '@deepseek-ai/dsh-fs-sandbox';
export { default as LocalSandboxProvider } from '@deepseek-ai/dsh-sandbox-local';
export { default as SandboxPolicyService } from '@deepseek-ai/dsh-sandbox-policy';
export * as LlmPiAi from '@deepseek-ai/dsh-llm-pi-ai';
export * as SessionCheckpointPolicy from '@deepseek-ai/dsh-session-checkpoint-policy';

/**
 * DSH 0.2.x 起将 JSONL 持久化后端从 class 插件（default export）重构为
 * 插件对象形态（具名 apply + Config），0.1.x 仍为 default class。两种
 * 形态均为合法 cordis 插件，这里在运行时选择并统一导出，使 frozen SDK
 * 与 upstream 最新版本共享同一组合层。
 */
type JsonlSessionPersistenceModuleShape = {
  default?: Plugin;
  apply?: Plugin;
};
const jsonlSessionPersistenceModule =
  JsonlSessionPersistenceModule as unknown as JsonlSessionPersistenceModuleShape;
export const JsonlSessionPersistence: Plugin =
  (jsonlSessionPersistenceModule.default ?? jsonlSessionPersistenceModule) as Plugin;

export { default as SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection';
export * as ShellEnv from '@deepseek-ai/dsh-shell-env';
export * as ToolBash from '@deepseek-ai/dsh-tool-bash';
