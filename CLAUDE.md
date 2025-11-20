# CLAUDE.md - AI Assistant Guide for IKUSKI

## Project Overview

**IKUSKI** is a professional drone-based rust and corrosion detection system that combines web technologies (Next.js/React) with machine learning infrastructure (Python/YOLO). It provides a complete ML lifecycle workflow from data labeling through model training to deployment and reporting.

### Core Purpose
Industrial inspection application for detecting and documenting rust/corrosion damage using computer vision (YOLOv8/v11) with professional report generation capabilities.

### Key Capabilities
- **Interactive image annotation** with bounding boxes
- **ML model training** (YOLO integration)
- **Automated defect detection** with configurable confidence thresholds
- **Professional report generation** with AI-powered analysis
- **GPS/map integration** for location-aware documentation
- **Multi-language support** (Spanish, English, Portuguese)

---

## Technology Stack

### Frontend
- **Next.js 16.0.0** - App Router architecture
- **React 19.2.0** - Latest features with Server/Client Components
- **TypeScript 5** - Strict typing throughout
- **Tailwind CSS 4.1.9** - Utility-first CSS with custom design tokens
- **Radix UI** - 40+ accessible component primitives
- **Lucide React** - Icon library

### Backend & ML
- **Node.js API Routes** - Backend API endpoints
- **Python 3.x** - ML inference and training
- **Ultralytics YOLO** - YOLOv8/YOLOv11 for object detection
- **Child Processes** - Node.js spawns Python scripts for ML operations

### Key Libraries
- `docx` - Word document generation
- `js-yaml` - YAML parsing for dataset configs
- `react-zoom-pan-pinch` - Image viewer controls
- `react-resizable-panels` - Layout management
- `date-fns` - Date formatting
- `zod` - Schema validation
- `react-hook-form` - Form state management
- `sonner` - Toast notifications

### External Integrations
- **OpenAI/Azure OpenAI** - Vision model for AI-powered report analysis
- **Static Maps API** - Location mapping
- **Nominatim** - Reverse geocoding
- **Vercel Analytics** - Usage tracking

---

## Directory Structure

```
/home/user/Interface-IKUSKI/
├── app/                          # Next.js App Router pages & API routes
│   ├── page.tsx                  # Dashboard/home page
│   ├── etiquetado/              # Image labeling module
│   │   └── page.tsx
│   ├── entrenamiento/           # Model training module
│   │   └── page.tsx
│   ├── analisis/                # Image analysis/inference module
│   │   └── page.tsx
│   ├── informes/                # Report generation module
│   │   └── page.tsx
│   ├── configuracion/           # Settings page
│   │   └── page.tsx
│   ├── api/                     # Backend API routes
│   │   ├── analyze/
│   │   ├── train/
│   │   ├── models/
│   │   ├── map-proxy/
│   │   └── dataset-export/
│   ├── layout.tsx               # Root layout with navigation
│   └── globals.css              # Global styles & Tailwind imports
│
├── components/                   # React components
│   ├── ui/                      # Radix UI shadcn components (40+)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── sidebar-nav.tsx          # Main navigation sidebar
│   ├── image-viewer.tsx         # Image display with zoom/pan
│   ├── annotation-image-viewer.tsx  # Labeling canvas
│   ├── detection-panel.tsx      # Detection results display
│   └── ...
│
├── lib/                         # Utility libraries
│   ├── utils.ts                 # Core utilities (cn helper)
│   ├── image-compression.ts     # Image optimization
│   ├── image-with-boxes.ts      # Draw bounding boxes on images
│   ├── phash-utils.ts           # Perceptual hashing for duplicates
│   ├── exif-utils.ts            # GPS metadata extraction
│   ├── maps-utils.ts            # Map URL generation
│   ├── report-export.ts         # Word document generation
│   ├── report-translations.ts   # i18n for reports
│   ├── session-storage.ts       # Session persistence
│   ├── library-storage.ts       # Library import/export
│   ├── image-storage.ts         # Image data management
│   └── logo-utils.ts            # Logo handling
│
├── contexts/                    # React Context providers
│   ├── config-context.tsx       # Global app configuration
│   └── analysis-context.tsx     # Analysis session state
│
├── hooks/                       # Custom React hooks
│   └── use-toast.ts             # Toast notification hook
│
├── dataset/                     # Training data storage
│   ├── images/                  # Training images
│   └── labels/                  # YOLO format annotations (.txt)
│
├── peso/                        # Trained model weights (.pt files)
│
├── public/                      # Static assets
│   └── ikuski-logo.png         # App logo
│
├── styles/                      # Additional CSS files
│
├── detect.py                    # YOLO inference script
├── train.py                     # YOLO training script
├── verify-maps.js              # Map integration testing
│
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
├── postcss.config.mjs          # PostCSS config for Tailwind
└── components.json             # shadcn/ui configuration
```

---

## Core Concepts & Domain Logic

### Application Modules

#### 1. ETIQUETADO (Labeling) - `/app/etiquetado`
**Purpose:** Interactive bounding box annotation for training data preparation

**Key Features:**
- Canvas-based annotation tool with zoom/pan
- Multi-class support with dynamic class management
- Three default severity levels: `bajo` (low), `medio` (medium), `alto` (high)
- YAML annotation import/export
- YOLO format dataset generation
- Train/validation split (80/20)

**Data Flow:**
1. Load images from file system
2. Draw bounding boxes with class labels
3. Export annotations as YAML or YOLO format
4. Save to `/dataset` directory for training

#### 2. ENTRENAMIENTO (Training) - `/app/entrenamiento`
**Purpose:** Train YOLO models using labeled datasets

**Key Features:**
- YOLOv8/v11 model training via Python integration
- Configurable hyperparameters (epochs, batch size, image size, learning rate)
- Model versioning and storage in `/peso` directory
- Real-time training progress monitoring
- YAML dataset configuration generation

**Data Flow:**
1. Select dataset from `/dataset`
2. Configure training parameters
3. API route spawns `train.py` Python script
4. Model weights saved to `/peso/*.pt`

**Important Files:**
- `/train.py` - Python training script
- `/app/api/train/route.ts` - Training API endpoint

#### 3. ANÁLISIS (Analysis) - `/app/analisis`
**Purpose:** Run inference on images using trained models

**Key Features:**
- ML inference using YOLO models from `/peso`
- Image loading (individual files or entire folders)
- **pHash duplicate detection** - find similar images using perceptual hashing
- **CLAHE image enhancement** - contrast adjustment preprocessing
- Confidence and IoU threshold controls
- Severity filtering (alto/medio/bajo)
- Session management (save/load analysis sessions)
- Library export/import (portable JSON format)
- File search functionality
- Image marking for report generation
- Real-time detection visualization

**Data Flow:**
1. Load images into browser
2. Convert to base64 for API transfer
3. `/api/analyze` spawns `detect.py` with model
4. Results displayed with bounding boxes
5. Filter and review detections
6. Mark images for reporting

**Important Files:**
- `/detect.py` - Python inference script (accepts base64 images)
- `/app/api/analyze/route.ts` - Analysis API endpoint
- `/contexts/analysis-context.tsx` - Session state management
- `/lib/phash-utils.ts` - Duplicate detection

#### 4. INFORMES (Reports) - `/app/informes`
**Purpose:** Generate professional inspection reports with AI analysis

**Key Features:**
- Rich text editor (Word-like formatting)
- **AI-powered analysis** - Claude vision model integration for automated descriptions
- GPS metadata extraction from EXIF data
- **Map integration** - static maps with detection coordinates
- Multi-language support (ES, EN, PT)
- Export to Word (.docx) format
- Print functionality with custom styling
- Custom branding (logos, cover images)
- Geocoding (reverse location lookup)
- Session drafts (save/load report state)

**Data Flow:**
1. Import marked images from Analysis module
2. Extract GPS coordinates from EXIF data
3. Generate static maps with markers
4. Use AI to analyze images and generate descriptions
5. Edit content in rich text editor
6. Export to Word or print

**Important Files:**
- `/app/informes/page.tsx` - Report editor
- `/lib/report-export.ts` - Word document generation
- `/lib/report-translations.ts` - i18n translations
- `/lib/exif-utils.ts` - GPS extraction
- `/lib/maps-utils.ts` - Map URL generation
- `/app/api/map-proxy/route.ts` - CORS proxy for maps

---

## Data Models

### Core Interfaces

```typescript
// Image representation
interface ImageItem {
  id: string              // Unique identifier
  url: string             // base64 data URL
  filename: string        // Original filename
  filePath?: string       // Full file path
  size?: string           // File size (formatted)
  timestamp?: string      // Import timestamp
}

// Detection result
interface Detection {
  id: number              // Detection ID
  image: string           // Reference to ImageItem URL
  filename: string        // Source image filename
  severity: "alto" | "medio" | "bajo"  // Severity classification
  confidence: number      // Confidence score (0-1)
  bbox: {                 // Bounding box coordinates
    x: number             // Center X (normalized)
    y: number             // Center Y (normalized)
    w: number             // Width (normalized)
    h: number             // Height (normalized)
  }
  timestamp: string       // Detection timestamp
}

// Application configuration
interface AppConfig {
  model: {
    activeModel: string           // Selected model name
    confidenceThreshold: number   // Min confidence (0-1)
    iouThreshold: number          // IoU threshold for NMS
    imageSize: number             // Input image size (pixels)
    enablePHash: boolean          // Enable duplicate detection
    enableCLAHE: boolean          // Enable contrast enhancement
  }
  apiKeys: {
    openai?: string               // OpenAI API key
    azure?: string                // Azure OpenAI key
  }
  paths: {
    datasets: string              // Dataset directory path
    models: string                // Model weights directory
    reports: string               // Report output directory
  }
  appearance: {
    theme: "light" | "dark"       // UI theme
    language: "es" | "en" | "pt"  // Interface language
  }
  severity: {
    low: number                   // Low severity threshold
    medium: number                // Medium severity threshold
    high: number                  // High severity threshold
  }
}

// Annotation (for labeling)
interface Annotation {
  id: string
  class: string           // Class name (bajo, medio, alto)
  bbox: BoundingBox       // Box coordinates
  color: string           // Display color
}

// Report section
interface ReportSection {
  id: string
  type: "title" | "paragraph" | "image" | "map"
  content: string | ImageData | MapData
  metadata?: {
    gps?: { lat: number; lon: number }
    address?: string
    detections?: Detection[]
  }
}
```

---

## State Management

### ConfigContext (`/contexts/config-context.tsx`)
**Purpose:** Global application configuration

**Responsibilities:**
- Stores app settings (model config, API keys, paths, appearance)
- Persists to localStorage
- Provides update functions
- Manages severity thresholds

**Usage:**
```typescript
const { config, updateConfig } = useConfig()
updateConfig({ model: { activeModel: 'yolov8n.pt' } })
```

### AnalysisContext (`/contexts/analysis-context.tsx`)
**Purpose:** Manages analysis session state

**Responsibilities:**
- Stores loaded images
- Manages detection results
- Tracks filter state (severity, confidence)
- Maintains marked images for reports
- Session save/load functionality

**Usage:**
```typescript
const {
  images,
  detections,
  addImages,
  clearImages,
  markedImages,
  toggleMarkImage
} = useAnalysisState()
```

### Storage Strategy
- **localStorage** - App configuration (persistent across sessions)
- **sessionStorage** - Analysis session state (temporary)
- **JSON Export/Import** - Portable library format
- **Component State** - UI-specific state (form inputs, dialogs)

---

## Styling Conventions

### Tailwind CSS v4 Patterns

**Utility-First Approach:**
```tsx
<div className="flex items-center gap-2 p-4 rounded-lg bg-background border">
```

**Design Tokens (CSS Variables):**
Located in `/app/globals.css`:
```css
:root {
  /* Severity colors */
  --severity-low: oklch(0.85 0.15 140);
  --severity-medium: oklch(0.75 0.20 60);
  --severity-high: oklch(0.65 0.25 25);

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Theme colors */
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0 0);
  --primary: oklch(0.45 0.20 264);
  /* ... */
}
```

**cn() Helper Function:**
Use for conditional className merging:
```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // Allow prop overrides
)} />
```

**Component Variants:**
Use `class-variance-authority` for variant management:
```typescript
const buttonVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
      }
    }
  }
)
```

### Dark Mode
- Class-based strategy (`.dark` class on html element)
- Automatic theme switching via `next-themes`
- All colors defined with light/dark variants

---

## Common Development Tasks

### Adding a New UI Component

1. **Install from shadcn/ui:**
```bash
npx shadcn@latest add [component-name]
```

2. **Import and use:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Click me</Button>
```

3. **Customize in `/components/ui/[component].tsx`**

### Adding a New Page

1. **Create route directory:**
```bash
mkdir app/nueva-pagina
```

2. **Create page component:**
```tsx
// app/nueva-pagina/page.tsx
"use client"

export default function NuevaPaginaPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Nueva Página</h1>
      {/* Content */}
    </div>
  )
}
```

3. **Add navigation link in `/components/sidebar-nav.tsx`:**
```tsx
const navItems = [
  // ...
  {
    title: "Nueva Página",
    href: "/nueva-pagina",
    icon: IconComponent
  }
]
```

### Adding an API Route

1. **Create route directory:**
```bash
mkdir -p app/api/nueva-ruta
```

2. **Create route handler:**
```typescript
// app/api/nueva-ruta/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Process request
    const result = await processData(body)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

3. **Call from client:**
```typescript
const response = await fetch('/api/nueva-ruta', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
const result = await response.json()
```

### Working with Python ML Scripts

**Python Script Pattern:**
```python
# detect.py or train.py
import sys
import json

def main():
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())

    # Process with YOLO
    results = run_inference(input_data)

    # Output JSON to stdout
    print(json.dumps(results))

if __name__ == "__main__":
    main()
```

**Node.js API Integration:**
```typescript
import { spawn } from 'child_process'

const python = spawn('python', ['detect.py'])

// Send data to Python
python.stdin.write(JSON.stringify(inputData))
python.stdin.end()

// Receive results
let output = ''
python.stdout.on('data', (data) => {
  output += data.toString()
})

python.on('close', (code) => {
  const results = JSON.parse(output)
  // Handle results
})
```

### Image Processing with pHash

**Duplicate Detection:**
```typescript
import { calculatePHash, hammingDistance } from '@/lib/phash-utils'

// Calculate hash for each image
const hash1 = await calculatePHash(imageUrl1)
const hash2 = await calculatePHash(imageUrl2)

// Compare hashes (lower distance = more similar)
const distance = hammingDistance(hash1, hash2)
const isDuplicate = distance < 10  // Threshold
```

### Working with GPS Data

**Extract from EXIF:**
```typescript
import { extractGPSFromImage } from '@/lib/exif-utils'

const gps = await extractGPSFromImage(imageFile)
// { latitude: 43.123, longitude: -2.456 }
```

**Generate Map URL:**
```typescript
import { generateMapUrl, reverseGeocode } from '@/lib/maps-utils'

const mapUrl = generateMapUrl(latitude, longitude, zoom)
const address = await reverseGeocode(latitude, longitude)
```

### Report Generation

**Export to Word:**
```typescript
import { generateWordReport } from '@/lib/report-export'

const sections = [
  { type: 'title', content: 'Inspection Report' },
  { type: 'paragraph', content: 'Summary text...' },
  {
    type: 'image',
    content: { url: base64Image, detections: [...] }
  }
]

const doc = await generateWordReport(sections, config)
// Returns Blob for download
```

---

## Important Conventions

### Naming Conventions

- **Files:** kebab-case (`analysis-context.tsx`, `phash-utils.ts`)
- **Components:** PascalCase (`ImageViewer`, `DetectionPanel`)
- **Variables/Functions:** camelCase (`activeModel`, `calculatePHash`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_CONFIDENCE`, `MAX_IMAGE_SIZE`)
- **Python Scripts:** snake_case (`detect.py`, `train.py`)
- **Domain Terms:** Spanish (`etiquetado`, `entrenamiento`, `analisis`, `informes`)

### File Organization

- One component per file
- Co-locate types with implementations
- Group related utilities in same file
- API routes follow RESTful patterns
- Test files alongside source (if applicable)

### Component Patterns

**Client Components (Interactive):**
```tsx
"use client"

import { useState } from 'react'

export default function InteractiveComponent() {
  const [state, setState] = useState()
  // Component logic
}
```

**Server Components (Static):**
```tsx
// No "use client" directive
export default async function StaticComponent() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

**Compound Components:**
```tsx
export function ImageViewer({ children }) {
  return <div className="viewer-container">{children}</div>
}

ImageViewer.Controls = function Controls() {
  return <div className="controls">...</div>
}
```

### Error Handling

**API Routes:**
```typescript
try {
  const result = await riskyOperation()
  return NextResponse.json({ success: true, data: result })
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { error: error.message || 'Internal error' },
    { status: 500 }
  )
}
```

**Client Components:**
```typescript
try {
  await performAction()
  toast.success('Operation completed')
} catch (error) {
  console.error(error)
  toast.error('Operation failed: ' + error.message)
}
```

### Type Safety

- Always define interfaces for complex data structures
- Use `zod` for runtime validation of API inputs
- Avoid `any` type - use `unknown` if necessary
- Leverage TypeScript strict mode

---

## Development Workflow

### Setup & Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Python Environment Setup

```bash
# Install Python dependencies
pip install ultralytics pillow pyyaml numpy opencv-python

# Verify installation
python -c "import ultralytics; print(ultralytics.__version__)"
```

### Typical Development Flow

1. **Data Preparation (Etiquetado):**
   - Load images into labeling interface
   - Draw bounding boxes with severity classes
   - Export annotations to `/dataset` directory

2. **Model Training (Entrenamiento):**
   - Configure training parameters (epochs, batch size)
   - Start training job (spawns Python process)
   - Monitor training progress
   - Trained model saved to `/peso`

3. **Analysis (Análisis):**
   - Select trained model from `/peso`
   - Load images for inference
   - Run analysis with configured thresholds
   - Review and filter detections
   - Mark images for reporting

4. **Report Generation (Informes):**
   - Import marked images from Analysis
   - AI generates image descriptions
   - Extract GPS data and generate maps
   - Edit report content in rich text editor
   - Export to Word or print

### Testing Maps Integration

```bash
node verify-maps.js
```

Verifies:
- Map URL generation
- Coordinate formatting
- API proxy functionality

---

## Critical Gotchas & Known Issues

### Image Data Transfer

**Issue:** Large images can cause memory issues when converting to base64
**Solution:** Compress images before transfer using `/lib/image-compression.ts`

**Issue:** Base64 encoding increases data size by ~33%
**Solution:** Process images in batches, implement progress indicators

### Python Process Management

**Issue:** Child processes can hang if stdin/stdout buffers overflow
**Solution:** Always handle `data` events incrementally, use `end()` on stdin

**Issue:** Python errors may not propagate to Node.js
**Solution:** Wrap Python code in try-except, output errors as JSON

### Storage Limitations

**Issue:** localStorage has 5-10MB limit, images quickly exceed this
**Solution:** Store only essential state in localStorage, use sessionStorage for images

**Issue:** Session data lost on page refresh
**Solution:** Implement session export/import for important work

### CORS & External APIs

**Issue:** Map APIs have CORS restrictions
**Solution:** Use `/api/map-proxy` route to proxy requests

**Issue:** OpenAI API keys exposed in client-side code
**Solution:** Store in config context, consider moving to server-side API routes

### File Path Handling

**Issue:** Windows vs Linux path separators
**Solution:** Use Node.js `path` module, normalize paths in API routes

**Issue:** Relative paths break when running from different directories
**Solution:** Use absolute paths, resolve relative to project root

### Model Loading

**Issue:** YOLO models take time to initialize (cold start)
**Solution:** Implement loading indicators, consider model caching

**Issue:** Model file not found errors
**Solution:** Verify `/peso` directory exists, validate model paths before inference

### TypeScript & Build Errors

**Issue:** Build fails due to type errors
**Current Config:** TypeScript errors ignored during build (see `next.config.mjs`)
**Best Practice:** Fix type errors during development, don't rely on ignored errors

### Hydration Errors

**Issue:** React hydration mismatches with theme/dark mode
**Recent Fix:** Corrected in AlertDialogs (commit 2f7e9e6)
**Prevention:** Avoid conditional rendering based on client-only state during SSR

---

## Git Workflow

### Branch Strategy

- **Main Branch:** `main` (production-ready code)
- **Feature Branches:** `claude/claude-md-[session-id]` (AI-generated branches)
- **Convention:** Always work on feature branches, never commit directly to main

### Making Changes

```bash
# Check current branch
git status

# Create feature branch (if not exists)
git checkout -b claude/claude-md-[session-id]

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to remote (with upstream tracking)
git push -u origin claude/claude-md-[session-id]
```

### Commit Message Conventions

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no functional changes)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons)
- `test:` - Add or modify tests
- `chore:` - Build process or tooling changes

### Recent Commits (Reference)
```
2f7e9e6 fix: corregir error de hidratación en AlertDialogs
1581562 fix: quitar compresión de imágenes en impresión y editor
7eedc77 feat: optimización de exportación a Word con compresión de imágenes
736d36d feat: UI mejorada con iconos y tooltips en Informes
e471812 feat: añadir búsqueda inteligente de archivos en Análisis
```

### Network Retry Logic

**Git Push:** Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
**Git Fetch/Pull:** Same retry logic for network failures

---

## Performance Considerations

### Image Optimization

- Compress images before displaying in UI
- Use lazy loading for large image galleries
- Implement virtual scrolling for long lists
- Store thumbnails separately from full-resolution images

### State Management

- Avoid storing large objects in Context
- Use refs for DOM manipulation instead of state updates
- Debounce expensive operations (image processing, API calls)
- Memoize expensive computations with `useMemo`

### Bundle Size

- Code-split large dependencies
- Lazy load modules not needed on initial render
- Tree-shake unused exports
- Monitor bundle size with `npm run build`

### Python Performance

- Batch image processing when possible
- Reuse model instances (avoid reloading)
- Use appropriate image sizes (larger = slower but more accurate)
- Consider GPU acceleration for training/inference

---

## Security Considerations

### API Keys

- Never commit API keys to repository
- Store in config context (localStorage)
- Consider environment variables for server-side keys
- Implement key rotation strategy

### Input Validation

- Validate all user inputs with `zod`
- Sanitize file paths to prevent directory traversal
- Limit file upload sizes
- Validate image formats before processing

### XSS Prevention

- React automatically escapes output
- Avoid `dangerouslySetInnerHTML` unless necessary
- Sanitize HTML content in rich text editor
- Use CSP headers in production

### Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Future Improvements & TODOs

### Code Quality
- [ ] Add TypeScript strict mode fixes
- [ ] Implement unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Improve error boundaries for better error handling

### Features
- [ ] Real-time training progress (WebSocket integration)
- [ ] Model comparison tool
- [ ] Batch export for multiple reports
- [ ] Advanced filtering (date ranges, location-based)
- [ ] User authentication and multi-tenancy

### Performance
- [ ] Implement image caching strategy
- [ ] Optimize Python subprocess management
- [ ] Add service worker for offline support
- [ ] Database integration (replace file-based storage)

### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Environment-specific configs
- [ ] Monitoring and logging infrastructure

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Python
python detect.py              # Run inference (requires stdin input)
python train.py               # Run training (requires stdin input)
node verify-maps.js           # Test map integration

# Git
git status                    # Check branch and changes
git log --oneline -10         # View recent commits
git diff                      # View unstaged changes
git push -u origin [branch]   # Push with upstream tracking

# Package Management
npm install [package]         # Install dependency
npm uninstall [package]       # Remove dependency
npm outdated                  # Check for updates
npm update                    # Update dependencies

# shadcn/ui
npx shadcn@latest add [component]     # Add UI component
npx shadcn@latest add --all           # Add all components
```

---

## Resources & Documentation

### Official Docs
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Radix UI: https://www.radix-ui.com/primitives
- Ultralytics YOLO: https://docs.ultralytics.com

### Internal Documentation
- Component examples in `/components/ui`
- Utility function documentation in `/lib`
- API route examples in `/app/api`

### Key Files to Reference
- `/app/globals.css` - Design tokens and theme variables
- `/lib/utils.ts` - Core utility functions
- `/contexts/config-context.tsx` - App configuration patterns
- `/components/ui/button.tsx` - Component variant patterns

---

## Contact & Support

For questions or issues with the IKUSKI codebase:
1. Check this CLAUDE.md file first
2. Review relevant code examples in the codebase
3. Consult official documentation for third-party libraries
4. Check recent commit history for similar changes

---

## Changelog

### 2025-11-20
- Initial CLAUDE.md creation
- Comprehensive codebase documentation
- Development workflow guidelines
- Architecture and patterns documentation

---

**Last Updated:** 2025-11-20
**Version:** 1.0.0
**Maintained by:** AI Assistants (Claude)
