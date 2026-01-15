"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2, CircleCheckBig, AlertCircle, PlayCircle } from "lucide-react";
import type { SubAgent } from "@/app/types/types";
import { cn } from "@/lib/utils";

interface SubAgentIndicatorProps {
  subAgent: SubAgent;
  onClick: () => void;
  isExpanded?: boolean;
}

export const SubAgentIndicator = React.memo<SubAgentIndicatorProps>(
  ({ subAgent, onClick, isExpanded = true }) => {
    const getStatusIcon = () => {
      switch (subAgent.status) {
        case "active":
        case "pending":
          return <Loader2 size={16} className="animate-spin text-purple-600 dark:text-purple-400" />;
        case "completed":
          return <CircleCheckBig size={16} className="text-green-600 dark:text-green-400" />;
        case "error":
          return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />;
        default:
          return <PlayCircle size={16} className="text-purple-600 dark:text-purple-400" />;
      }
    };

    const getStatusText = () => {
      switch (subAgent.status) {
        case "active":
          return "Running...";
        case "pending":
          return "Pending...";
        case "completed":
          return "Completed";
        case "error":
          return "Error";
        default:
          return "";
      }
    };

    const isExecuting = subAgent.status === "active" || subAgent.status === "pending";

    return (
      <div className={cn(
        "w-full overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-200",
        isExecuting
          ? "border-purple-400 bg-purple-100/80 dark:border-purple-500 dark:bg-purple-900/60"
          : "border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 dark:border-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/50"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className="flex w-full items-center justify-between gap-3 border-none px-4 py-2.5 text-left shadow-none outline-none transition-colors duration-200 hover:bg-transparent"
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="flex-shrink-0">
                {getStatusIcon()}
              </div>
              <span className="flex-1 truncate font-sans text-[15px] font-bold leading-[140%] tracking-[-0.6px] text-purple-900 dark:text-purple-100">
                {subAgent.subAgentName}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp
                size={14}
                className="shrink-0 text-purple-600 dark:text-purple-400"
              />
            ) : (
              <ChevronDown
                size={14}
                className="shrink-0 text-purple-600 dark:text-purple-400"
              />
            )}
          </div>
        </Button>
      </div>
    );
  }
);

SubAgentIndicator.displayName = "SubAgentIndicator";
