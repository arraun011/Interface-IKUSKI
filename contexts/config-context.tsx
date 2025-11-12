"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface AppConfig {
  // Model Configuration
  model: {
    activeModel: "yolov8n" | "yolov8s" | "yolov8m" | "yolov8l"
    confidenceThreshold: number
    iouThreshold: number
    imageSize: "320" | "640" | "1280"
    enablePHash: boolean
    enableCLAHE: boolean
  }

  // API Keys
  apiKeys: {
    openai: string
    azure: string
  }

  // Paths
  paths: {
    datasets: string
    models: string
    reports: string
  }

  // Appearance
  appearance: {
    theme: "light" | "dark" | "auto"
    language: "es" | "eu" | "en"
  }

  // Severity thresholds
  severity: {
    low: { min: number; max: number }
    medium: { min: number; max: number }
    high: { min: number; max: number }
  }
}

const defaultConfig: AppConfig = {
  model: {
    activeModel: "yolov8n",
    confidenceThreshold: 0.5,
    iouThreshold: 0.45,
    imageSize: "640",
    enablePHash: true,
    enableCLAHE: true
  },
  apiKeys: {
    openai: "",
    azure: ""
  },
  paths: {
    datasets: "C:/IKUSKI/data/datasets",
    models: "C:/IKUSKI/data/models",
    reports: "C:/IKUSKI/reports"
  },
  appearance: {
    theme: "light",
    language: "es"
  },
  severity: {
    low: { min: 0, max: 30 },
    medium: { min: 30, max: 70 },
    high: { min: 70, max: 100 }
  }
}

interface ConfigContextType {
  config: AppConfig
  updateConfig: (newConfig: Partial<AppConfig>) => void
  resetConfig: () => void
  saveConfig: () => void
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load config from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedConfig = localStorage.getItem("ikuski-config")
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig)
          setConfig({ ...defaultConfig, ...parsed })
        }
      } catch (error) {
        console.error("Error loading config from localStorage:", error)
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever config changes (after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("ikuski-config", JSON.stringify(config))
      } catch (error) {
        console.error("Error saving config to localStorage:", error)
      }
    }
  }, [config, isLoaded])

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => {
      // Deep merge for nested objects
      const merged = { ...prev }

      Object.keys(newConfig).forEach((key) => {
        const configKey = key as keyof AppConfig
        if (typeof newConfig[configKey] === "object" && !Array.isArray(newConfig[configKey])) {
          merged[configKey] = { ...prev[configKey], ...newConfig[configKey] } as any
        } else {
          merged[configKey] = newConfig[configKey] as any
        }
      })

      return merged
    })
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
    if (typeof window !== "undefined") {
      localStorage.removeItem("ikuski-config")
    }
  }

  const saveConfig = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ikuski-config", JSON.stringify(config))
        return true
      } catch (error) {
        console.error("Error saving config:", error)
        return false
      }
    }
    return false
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider")
  }
  return context
}

// Helper hook to get specific config sections
export function useModelConfig() {
  const { config } = useConfig()
  return config.model
}

export function useApiKeys() {
  const { config } = useConfig()
  return config.apiKeys
}

export function usePaths() {
  const { config } = useConfig()
  return config.paths
}

export function useAppearance() {
  const { config } = useConfig()
  return config.appearance
}

export function useSeverityThresholds() {
  const { config } = useConfig()
  return config.severity
}
