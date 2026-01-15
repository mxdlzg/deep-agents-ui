"use client";

import React, { useMemo, useState, useCallback } from "react";
import { SubAgentIndicator } from "@/app/components/SubAgentIndicator";
import { ToolCallBox } from "@/app/components/ToolCallBox";
import { MarkdownContent } from "@/app/components/MarkdownContent";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  SubAgent,
  ToolCall,
  ActionRequest,
  ReviewConfig,
} from "@/app/types/types";
import { Message } from "@langchain/langgraph-sdk";
import {
  extractSubAgentContent,
  extractStringFromMessageContent,
} from "@/app/utils/utils";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  toolCalls: ToolCall[];
  isLoading?: boolean;
  actionRequestsMap?: Map<string, ActionRequest>;
  reviewConfigsMap?: Map<string, ReviewConfig>;
  ui?: any[];
  stream?: any;
  onResumeInterrupt?: (value: any) => void;
  graphId?: string;
}

export const ChatMessage = React.memo<ChatMessageProps>(
  ({
    message,
    toolCalls,
    isLoading,
    actionRequestsMap,
    reviewConfigsMap,
    ui,
    stream,
    onResumeInterrupt,
    graphId,
  }) => {
    const isUser = message.type === "human";
    const messageContent = extractStringFromMessageContent(message);
    const hasContent = messageContent && messageContent.trim() !== "";
    const hasToolCalls = toolCalls.length > 0;
    const subAgents = useMemo(() => {
      return toolCalls
        .filter((toolCall: ToolCall) => {
          return (
            toolCall.name === "task" &&
            toolCall.args["subagent_type"] &&
            toolCall.args["subagent_type"] !== "" &&
            toolCall.args["subagent_type"] !== null
          );
        })
        .map((toolCall: ToolCall) => {
          const subagentType = (toolCall.args as Record<string, unknown>)[
            "subagent_type"
          ] as string;
          return {
            id: toolCall.id,
            name: toolCall.name,
            subAgentName: subagentType,
            input: toolCall.args,
            output: toolCall.result ? { result: toolCall.result } : undefined,
            status: toolCall.status,
          } as SubAgent;
        });
    }, [toolCalls]);

    const [expandedSubAgents, setExpandedSubAgents] = useState<
      Record<string, boolean>
    >({});
    const isSubAgentExpanded = useCallback(
      (id: string) => expandedSubAgents[id] ?? true,
      [expandedSubAgents]
    );
    const toggleSubAgent = useCallback((id: string) => {
      setExpandedSubAgents((prev) => ({
        ...prev,
        [id]: prev[id] === undefined ? false : !prev[id],
      }));
    }, []);

    return (
      <div
        className={cn(
          "flex w-full max-w-full overflow-x-hidden",
          isUser && "flex-row-reverse"
        )}
      >
        <div
          className={cn(
            "min-w-0 max-w-full",
            isUser ? "max-w-[70%]" : "w-full"
          )}
        >
          {hasContent && (
            <div className={cn("relative flex items-end gap-0")}>
              <div
                className={cn(
                  "mt-4 overflow-hidden break-words text-sm font-normal leading-[150%]",
                  isUser
                    ? "rounded-xl rounded-br-none border border-border px-3 py-2 text-foreground"
                    : "text-primary"
                )}
                style={
                  isUser
                    ? { backgroundColor: "var(--color-user-message-bg)" }
                    : undefined
                }
              >
                {isUser ? (
                  <p className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {messageContent}
                  </p>
                ) : hasContent ? (
                  <MarkdownContent content={messageContent} />
                ) : null}
              </div>
            </div>
          )}
          {hasToolCalls && (
            <div className="mt-4 flex w-full flex-col">
              {toolCalls.map((toolCall: ToolCall) => {
                if (toolCall.name === "task") return null;
                const toolCallGenUiComponent = ui?.find(
                  (u) => u.metadata?.tool_call_id === toolCall.id
                );
                const actionRequest = actionRequestsMap?.get(toolCall.name);
                const reviewConfig = reviewConfigsMap?.get(toolCall.name);
                return (
                  <ToolCallBox
                    key={toolCall.id}
                    toolCall={toolCall}
                    uiComponent={toolCallGenUiComponent}
                    stream={stream}
                    graphId={graphId}
                    actionRequest={actionRequest}
                    reviewConfig={reviewConfig}
                    onResume={onResumeInterrupt}
                    isLoading={isLoading}
                  />
                );
              })}
            </div>
          )}
          {!isUser && subAgents.length > 0 && (
            <div className="mt-4 flex w-fit max-w-full flex-col gap-4">
              {subAgents.map((subAgent) => {
                const isExecuting = subAgent.status === "active" || subAgent.status === "pending";
                const hasOutput = !!subAgent.output;
                
                return (
                  <div
                    key={subAgent.id}
                    className="flex w-full flex-col gap-2"
                  >
                    <div className="flex items-end gap-2">
                      <div className="w-full">
                        <SubAgentIndicator
                          subAgent={subAgent}
                          onClick={() => toggleSubAgent(subAgent.id)}
                          isExpanded={isSubAgentExpanded(subAgent.id)}
                        />
                      </div>
                    </div>
                    {isSubAgentExpanded(subAgent.id) && (
                      <div className="w-full max-w-full">
                        <div className="rounded-md border-2 border-purple-200 bg-purple-50/30 p-4 dark:border-purple-800 dark:bg-purple-950/20">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                            Input
                          </h4>
                          <div className="mb-4">
                            <MarkdownContent
                              content={extractSubAgentContent(subAgent.input)}
                            />
                          </div>
                          
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                            Output
                          </h4>
                          {isExecuting && !hasOutput ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full bg-purple-200/50 dark:bg-purple-800/30" />
                              <Skeleton className="h-4 w-5/6 bg-purple-200/50 dark:bg-purple-800/30" />
                              <Skeleton className="h-4 w-4/6 bg-purple-200/50 dark:bg-purple-800/30" />
                            </div>
                          ) : hasOutput ? (
                            <MarkdownContent
                              content={extractSubAgentContent(subAgent.output)}
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Waiting to execute...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
