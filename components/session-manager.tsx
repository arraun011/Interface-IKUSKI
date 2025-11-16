"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save, FolderOpen, Trash2, Calendar } from "lucide-react"
import {
  AnalysisSession,
  ReportDraft,
  getAnalysisSessions,
  getReportDrafts,
  deleteAnalysisSession,
  deleteReportDraft
} from "@/lib/session-storage"

interface SessionManagerProps {
  type: 'analysis' | 'report'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (name: string) => void
  onLoad?: (id: string) => void
  mode: 'save' | 'load'
}

export function SessionManager({
  type,
  open,
  onOpenChange,
  onSave,
  onLoad,
  mode
}: SessionManagerProps) {
  const [sessionName, setSessionName] = useState("")
  const [sessions, setSessions] = useState<(AnalysisSession | ReportDraft)[]>([])

  const loadSessions = () => {
    if (type === 'analysis') {
      setSessions(getAnalysisSessions())
    } else {
      setSessions(getReportDrafts())
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      loadSessions()
    }
    onOpenChange(newOpen)
  }

  const handleSave = () => {
    if (sessionName.trim() && onSave) {
      onSave(sessionName.trim())
      setSessionName("")
      onOpenChange(false)
    }
  }

  const handleLoad = (id: string) => {
    if (onLoad) {
      onLoad(id)
      onOpenChange(false)
    }
  }

  const handleDelete = (id: string) => {
    if (type === 'analysis') {
      deleteAnalysisSession(id)
    } else {
      deleteReportDraft(id)
    }
    loadSessions()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Guardar' : 'Cargar'} {type === 'analysis' ? 'Sesión de Análisis' : 'Informe'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save'
              ? `Guarda el estado actual para continuar más tarde`
              : `Selecciona una sesión guardada para cargar`
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'save' ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={type === 'analysis' ? 'Ej: Inspección Puente A' : 'Ej: Informe Mensual Octubre'}
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No hay sesiones guardadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handleLoad(session.id)}>
                      <h4 className="font-medium">{session.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.date)}
                        </span>
                        {'images' in session && (
                          <span>{session.images.length} imágenes</span>
                        )}
                        {'markedImages' in session && (
                          <span>{session.markedImages.length} imágenes</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(session.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {mode === 'save' && (
            <Button onClick={handleSave} disabled={!sessionName.trim()}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
