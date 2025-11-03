import { SidebarNav } from "@/components/sidebar-nav"
import { ModuleCard } from "@/components/module-card"
import { Tag, Brain, Search, FileText } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex flex-1 flex-col overflow-auto">
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Sistema de Detección de Corrosión</h1>
              <p className="text-muted-foreground text-pretty">
                Plataforma integral para análisis de óxido mediante visión por computadora
              </p>
            </div>

            {/* Module Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <ModuleCard
                icon={Tag}
                title="IKUSKI-ETIQUETADO"
                description="Creador de Datasets"
                features={[
                  "Anotación con Bounding Box",
                  "Clasificación en 3 niveles (Bajo, Medio, Alto)",
                  "Generación automática formato YOLO",
                  "División train/val/test (80/10/10)",
                ]}
                color="blue"
              />

              <ModuleCard
                icon={Brain}
                title="IKUSKI-ENTRENAMIENTO"
                description="Gestión de Modelos"
                features={[
                  "Entrenamiento YOLOv8/v9",
                  "Fine-Tuning de modelos",
                  "Sistema MLOps automatizado",
                  "Métricas: mAP, Precision, Recall",
                ]}
                color="purple"
              />

              <ModuleCard
                icon={Search}
                title="IKUSKI-ANÁLISIS"
                description="Plataforma de Inspección"
                features={[
                  "Filtro de duplicados (pHash)",
                  "Corrección automática CLAHE",
                  "Inferencia ML.NET/ONNX",
                  "Extracción metadatos EXIF",
                ]}
                color="green"
              />

              <ModuleCard
                icon={FileText}
                title="IKUSKI-INFORMES"
                description="Generador de Documentos"
                features={[
                  "Filtrado por nivel de gravedad",
                  "Análisis con LLM",
                  "Editor de texto integrado",
                  "Exportación PDF/DOCX",
                ]}
                color="orange"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-semibold">1,247</div>
                <div className="text-sm text-muted-foreground">Imágenes Analizadas</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-semibold">8</div>
                <div className="text-sm text-muted-foreground">Modelos Entrenados</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-semibold">94.2%</div>
                <div className="text-sm text-muted-foreground">Precisión Actual</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-semibold">23</div>
                <div className="text-sm text-muted-foreground">Informes Generados</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
