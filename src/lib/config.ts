export interface StandaloneConfig {
  deploymentUrl: string;
  assistantId: string;
  langsmithApiKey?: string;
}

const CONFIG_KEY = "deep-agent-config";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getProductionConfig(): StandaloneConfig {
  if (typeof window === "undefined") {
    return {
      deploymentUrl: "http://localhost:18019",
      assistantId: "research",
    };
  }
  
  const url = new URL(window.location.href);
  const deploymentUrl = `${url.protocol}//${url.hostname}:18019`;
  
  return {
    deploymentUrl,
    assistantId: "research",
  };
}

export function getConfig(): StandaloneConfig | null {
  if (typeof window === "undefined") return null;

  // 在生产环境下，直接返回固定配置
  if (isProduction()) {
    return getProductionConfig();
  }

  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveConfig(config: StandaloneConfig): void {
  if (typeof window === "undefined") return;
  // 在生产环境下不保存配置
  if (isProduction()) return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
