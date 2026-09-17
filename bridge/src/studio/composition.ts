import { Context, type Fiber } from "@deepseek-ai/cordis";
import AgentRegistry from "@deepseek-ai/dsh-agent";
import AgentLoop from "@deepseek-ai/dsh-agent-loop";
import LocalAttachmentStore from "@deepseek-ai/dsh-attachment-local";
import SandboxBashExecutor from "@deepseek-ai/dsh-bash-sandbox";
import * as FsObservationPolicy from "@deepseek-ai/dsh-fs-observation-policy";
import SandboxedFileSystem from "@deepseek-ai/dsh-fs-sandbox";
import LocalSandboxProvider from "@deepseek-ai/dsh-sandbox-local";
import SandboxPolicyService from "@deepseek-ai/dsh-sandbox-policy";
import LlmRuntime from "@deepseek-ai/dsh-llm";
import * as LlmPiAi from "@deepseek-ai/dsh-llm-pi-ai";
import SessionStore from "@deepseek-ai/dsh-session";
import * as SessionCheckpointPolicy from "@deepseek-ai/dsh-session-checkpoint-policy";
import JsonlSessionPersistence from "@deepseek-ai/dsh-session-persistence-jsonl";
import * as ShellEnv from "@deepseek-ai/dsh-shell-env";
import LocalSubprocessRuntime from "@deepseek-ai/dsh-subprocess-local";
import SystemPrompt from "@deepseek-ai/dsh-system-prompt";
import * as ToolBash from "@deepseek-ai/dsh-tool-bash";
import { selectFsTools } from "../fs-tool-subset.js";
import ToolRuntime from "@deepseek-ai/dsh-tools";
import ApprovalService from "@deepseek-ai/dsh-user-approval";
import path from "node:path";
import { registerBridgeProofAdapter } from "./proof-llm-adapter.js";

export type RunningComposition = {
  context: Context;
  dispose(): Promise<void>;
};

export type CompositionOptions = {
  workspaceRoot: string;
  sessionPersistenceRoot?: string;
  enableBridgeProofAdapter?: boolean;
  modelRoute?: { apiKey?: string; baseURL?: string };
};

/** Boot the Host-owned DSH loop, filesystem and sandboxed Bash. */
export async function startComposition(options: CompositionOptions): Promise<RunningComposition> {
  const context = new Context();
  const fibers: Fiber[] = [];
  const workspaceRoot = path.resolve(options.workspaceRoot);

  try {
    fibers.push(await context.plugin(LlmRuntime));
    fibers.push(await context.plugin(SessionStore));
    fibers.push(await context.plugin(LocalAttachmentStore, {
      dshHome: path.join(workspaceRoot, ".dsh"),
    }));
    fibers.push(await context.plugin(SystemPrompt));
    fibers.push(await context.plugin(ApprovalService, { policy: "ask" }));
    fibers.push(await context.plugin(ToolRuntime, { mode: "native" }));
    fibers.push(await context.plugin(AgentRegistry));

    if (options.modelRoute) {
      const apiKey = options.modelRoute.apiKey;
      context.provide('credentials', { resolve: async (ref: string) => ref === 'DEEPSEEK_API_KEY' && apiKey ? { value: apiKey } : undefined } as never);
    }
    if (options.enableBridgeProofAdapter) registerBridgeProofAdapter(context);
    fibers.push(
      await context.plugin(LlmPiAi, {
        providers: {
          "deepseek-official": {
            displayName: "DeepSeek (OpenClaw route)",
            apiKeyEnv: "DEEPSEEK_API_KEY",
            api: "openai-completions",
            baseURL: options.modelRoute?.baseURL?.trim() || process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com",
            compat: {
              thinkingFormat: "deepseek",
              supportsReasoningEffort: true,
            },
            defaultContextWindow: 1_000_000,
            defaultMaxTokens: 384_000,
            defaultInput: ["text"],
            models: [
              {
                id: "deepseek-v4-flash",
                name: "DeepSeek V4 Flash",
                input: ["text"],
                contextWindow: 1_000_000,
                maxTokens: 384_000,
              },
              {
                id: "deepseek-v4-pro",
                name: "DeepSeek V4 Pro",
                input: ["text"],
                contextWindow: 1_000_000,
                maxTokens: 384_000,
              },
              {
                id: "deepseek-v4-flash-vision-exp",
                name: "DeepSeek V4 Flash Vision (Experimental)",
                input: ["text", "image"],
                contextWindow: 1_000_000,
                maxTokens: 384_000,
              },
            ],
          },
        },
      }),
    );

    // One policy controls both the in-process filesystem fence and kernel-backed Bash sandbox.
    fibers.push(
      await context.plugin(SandboxPolicyService, {
        mode: "workspace-write",
        workspaceRoot,
      }),
    );

    // Real DSH filesystem stack: provider + read-before-edit policy + model tools.
    fibers.push(await context.plugin(SandboxedFileSystem, { cwd: workspaceRoot }));
    fibers.push(await context.plugin(FsObservationPolicy));
    fibers.push(await context.plugin(selectFsTools("gateway"), {}));

    // Subprocess infrastructure remains required by Bash. Search is owned by the worker.
    fibers.push(await context.plugin(LocalSubprocessRuntime));

    // Real DSH shell stack. Background mode is disabled because this focused
    // composition intentionally does not mount the DSH jobs subsystem.
    fibers.push(await context.plugin(LocalSandboxProvider, {}));
    fibers.push(
      await context.plugin(SandboxBashExecutor, {
        cwd: workspaceRoot,
        timeoutMs: 30_000,
        maxTimeoutMs: 120_000,
      }),
    );
    fibers.push(
      await context.plugin(ShellEnv, {
        dshHome: path.join(workspaceRoot, ".dsh"),
      }),
    );
    fibers.push(await context.plugin(ToolBash, { enableRunInBackground: false }));
    fibers.push(
      await context.plugin(JsonlSessionPersistence, {
        root: path.resolve(
          options.sessionPersistenceRoot ?? path.join(workspaceRoot, ".dsh", "sessions"),
        ),
        compression: "none",
      }),
    );
    fibers.push(await context.plugin(SessionCheckpointPolicy));
    fibers.push(await context.plugin(AgentLoop, { agents: [], maxParallelToolCalls: 4 }));
  } catch (error) {
    await disposeFibers(fibers);
    throw error;
  }

  return {
    context,
    async dispose() {
      await disposeFibers(fibers);
    },
  };
}

async function disposeFibers(fibers: Fiber[]): Promise<void> {
  for (const fiber of fibers.splice(0).reverse()) {
    await fiber.dispose();
  }
}
