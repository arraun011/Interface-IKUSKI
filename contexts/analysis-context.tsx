"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface ImageItem {
  id: string
  url: string
  filename: string
  size?: string
  timestamp?: string
}

export interface Detection {
  id: number
  image: string
  filename: string
  severity: string
  confidence: number
  bbox: { x: number; y: number; w: number; h: number }
  timestamp: string
}

export interface AnalysisState {
  // Imágenes cargadas
  loadedImages: ImageItem[]
  selectedImageId: string | null

  // Detecciones
  detections: Detection[]

  // Modelo
  selectedModel: string
  modelPath: string

  // Umbrales y filtros
  confidenceThreshold: number
  iouThreshold: number
  severityFilter: string[]

  // Imágenes marcadas para el informe
  markedForReport: string[] // Array de IDs de imágenes
}

const defaultState: AnalysisState = {
  loadedImages: [],
  selectedImageId: null,
  detections: [],
  selectedModel: "",
  modelPath: "",
  confidenceThreshold: 0.25,
  iouThreshold: 0.45,
  severityFilter: ["alto", "medio", "bajo"],
  markedForReport: []
}

interface AnalysisContextType {
  state: AnalysisState
  updateState: (newState: Partial<AnalysisState>) => void
  resetState: () => void

  // Helper methods
  addImages: (images: ImageItem[]) => void
  removeImage: (imageId: string) => void
  setSelectedImage: (imageId: string | null) => void
  setDetections: (detections: Detection[]) => void
  setModel: (modelName: string, modelPath: string) => void
  setThresholds: (confidence?: number, iou?: number) => void
  setSeverityFilter: (filter: string[]) => void

  // Report methods
  toggleMarkForReport: (imageId: string) => void
  markAllForReport: () => void
  unmarkAllForReport: () => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from sessionStorage on mount (se mantiene durante la sesión del navegador)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = sessionStorage.getItem("ikuski-analysis-state")
        if (savedState) {
          const parsed = JSON.parse(savedState)
          setState({ ...defaultState, ...parsed })
        }
      } catch (error) {
        console.error("Error loading analysis state from sessionStorage:", error)
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to sessionStorage whenever state changes (after initial load)
  // IMPORTANTE: Solo guardamos configuración esencial, NO las imágenes ni detecciones
  // para evitar QuotaExceededError
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        // Guardar solo configuración esencial (sin imágenes ni detecciones)
        const essentialState = {
          selectedImageId: state.selectedImageId,
          selectedModel: state.selectedModel,
          modelPath: state.modelPath,
          confidenceThreshold: state.confidenceThreshold,
          iouThreshold: state.iouThreshold,
          severityFilter: state.severityFilter,
          markedForReport: state.markedForReport,
          // No guardar loadedImages ni detections para ahorrar espacio
          loadedImages: [],
          detections: []
        }
        sessionStorage.setItem("ikuski-analysis-state", JSON.stringify(essentialState))
      } catch (error) {
        console.error("Error saving state to sessionStorage:", error)
        // Si aún falla, simplemente no guardar nada
        try {
          sessionStorage.removeItem("ikuski-analysis-state")
        } catch (e) {
          // Ignorar errores al limpiar
        }
      }
    }
  }, [
    state.selectedImageId,
    state.selectedModel,
    state.modelPath,
    state.confidenceThreshold,
    state.iouThreshold,
    state.severityFilter,
    state.markedForReport,
    isLoaded
  ])

  const updateState = (newState: Partial<AnalysisState>) => {
    setState((prev) => ({ ...prev, ...newState }))
  }

  const resetState = () => {
    setState(defaultState)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ikuski-analysis-state")
    }
  }

  const addImages = (images: ImageItem[]) => {
    setState((prev) => ({
      ...prev,
      loadedImages: [...prev.loadedImages, ...images]
    }))
  }

  const removeImage = (imageId: string) => {
    setState((prev) => ({
      ...prev,
      loadedImages: prev.loadedImages.filter(img => img.id !== imageId),
      selectedImageId: prev.selectedImageId === imageId ? null : prev.selectedImageId
    }))
  }

  const setSelectedImage = (imageId: string | null) => {
    setState((prev) => ({ ...prev, selectedImageId: imageId }))
  }

  const setDetections = (detections: Detection[]) => {
    setState((prev) => ({ ...prev, detections }))
  }

  const setModel = (modelName: string, modelPath: string) => {
    setState((prev) => ({ ...prev, selectedModel: modelName, modelPath }))
  }

  const setThresholds = (confidence?: number, iou?: number) => {
    setState((prev) => ({
      ...prev,
      ...(confidence !== undefined && { confidenceThreshold: confidence }),
      ...(iou !== undefined && { iouThreshold: iou })
    }))
  }

  const setSeverityFilter = (filter: string[]) => {
    setState((prev) => ({ ...prev, severityFilter: filter }))
  }

  const toggleMarkForReport = (imageId: string) => {
    setState((prev) => ({
      ...prev,
      markedForReport: prev.markedForReport.includes(imageId)
        ? prev.markedForReport.filter(id => id !== imageId)
        : [...prev.markedForReport, imageId]
    }))
  }

  const markAllForReport = () => {
    setState((prev) => ({
      ...prev,
      markedForReport: prev.loadedImages.map(img => img.id)
    }))
  }

  const unmarkAllForReport = () => {
    setState((prev) => ({ ...prev, markedForReport: [] }))
  }

  return (
    <AnalysisContext.Provider
      value={{
        state,
        updateState,
        resetState,
        addImages,
        removeImage,
        setSelectedImage,
        setDetections,
        setModel,
        setThresholds,
        setSeverityFilter,
        toggleMarkForReport,
        markAllForReport,
        unmarkAllForReport
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysisState() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error("useAnalysisState must be used within an AnalysisProvider")
  }
  return context
}
