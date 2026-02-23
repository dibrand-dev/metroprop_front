# Emprendimiento Publishing Flow

This document describes the complete emprendimiento (real estate development) publishing system implemented in the Metroprop platform.

## Overview

The emprendimiento publishing flow is a multi-step wizard that allows real estate professionals to create and publish property development listings. The flow consists of 5 main steps:

1. **Datos principales** - Basic information (name, description, location, images)
2. **Amenidades** - Amenities selection (68+ options across 4 categories)
3. **Unidades** - Unit management (add multiple units with details)
4. **Vista al precio** - Pricing and plan selection
5. **Vista previa** - Final preview and submission

## File Structure

```
src/
├── app/protected/publish/emprendimiento/
│   ├── page.tsx                    # Step 1: Datos principales
│   ├── amenidades/page.tsx         # Step 2: Amenidades
│   ├── unidades/page.tsx           # Step 3: Unidades
│   ├── vista-al-precio/page.tsx    # Step 4: Vista al precio
│   └── preview/page.tsx            # Step 5: Preview & Submit
│
├── components/Publish/
│   ├── Publish.tsx                                # Entry point
│   ├── PublishEmprendimiento.tsx                  # Step 1 component
│   ├── PublishEmprendimiento.scss
│   ├── PublishEmprendimientoAmenidades.tsx        # Step 2 component
│   ├── PublishEmprendimientoAmenidades.scss
│   ├── PublishEmprendimientoUnidades.tsx          # Step 3 component
│   ├── PublishEmprendimientoUnidades.scss
│   ├── PublishEmprendimientoVistaAlPrecio.tsx     # Step 4 component
│   ├── PublishEmprendimientoVistaAlPrecio.scss
│   ├── PublishEmprendimientoPreview.tsx           # Step 5 component
│   └── PublishEmprendimientoPreview.scss
│
├── ui/
│   ├── Chip/               # Selectable chip component
│   └── RadioButton/        # Radio button with descriptions
│
└── types/
    └── emprendimiento.ts   # API types and contracts
```

## Step-by-Step Guide

### Step 1: Datos Principales

**Component**: `PublishEmprendimiento.tsx`  
**Route**: `/protected/publish/emprendimiento`

Collects basic information:
- Nombre del emprendimiento (required)
- Descripción (500 chars)
- Logo upload
- Tipo de emprendimiento (dropdown)
- Location (ciudad, provincia, barrio, zona)
- Map preview
- Image gallery upload

**State to preserve**:
```typescript
{
  nombreEmprendimiento: string;
  descripcion: string;
  logoFile: File | null;
  tipoEmprendimiento: string;
  ciudad: string;
  provincia: string;
  barrio: string;
  zona: string;
  imagenes: File[];
}
```

### Step 2: Amenidades

**Component**: `PublishEmprendimientoAmenidades.tsx`  
**Route**: `/protected/publish/emprendimiento/amenidades`

Features:
- 4 expandable groups (Servicios, Características generales, Ambientes, Características)
- 68+ selectable amenities
- Multi-select with Chip component
- "Ver más" functionality to expand groups

**State to preserve**:
```typescript
{
  amenidades: string[]; // Array of selected amenity IDs
}
```

### Step 3: Unidades

**Component**: `PublishEmprendimientoUnidades.tsx`  
**Route**: `/protected/publish/emprendimiento/unidades`

Add multiple units with:
- Basic info (nombre, descripción, tipo, piso, orientación)
- Pricing (currency selector, expensas checkbox)
- Ambientes (dormitorios, baños, toilettes, cochera, baulera)
- Surface (m² construidos, m² totales)
- Media (fotos, planos, recorrido 360)
- Units list with edit/delete

**State to preserve**:
```typescript
{
  unidades: Array<{
    nombre: string;
    descripcion: string;
    tipo: string;
    piso: string;
    orientacion: string;
    precio: number;
    moneda: 'USD' | 'ARS' | 'EUR';
    expensas: boolean;
    expensasValor?: number;
    dormitorios: number;
    banos: number;
    toilettes: number;
    cochera: number;
    baulera: number;
    supConstruidos: number;
    supTotales: number;
    fotos: File[];
    planos: File[];
    recorrido360?: string;
  }>;
}
```

### Step 4: Vista al Precio

**Component**: `PublishEmprendimientoVistaAlPrecio.tsx`  
**Route**: `/protected/publish/emprendimiento/vista-al-precio`

Features:
- Assign to collaborator (dropdown)
- Select publication plan (radio buttons)
- Additional plans cards (3 pricing tiers)

**State to preserve**:
```typescript
{
  colaboradorAsignado: string;
  planSeleccionado: string;
}
```

### Step 5: Vista Previa

**Component**: `PublishEmprendimientoPreview.tsx`  
**Route**: `/protected/publish/emprendimiento/preview`

Preview displays:
- Property header with price
- Image gallery
- Property details and features
- Description
- Location map
- Units table (grouped by type)
- Additional information

**Action**: Submit button triggers API call

## API Integration

### Type Definitions

All API types are defined in `src/types/emprendimiento.ts`

Key interfaces:
- `EmprendimientoSubmission` - Complete submission payload
- `EmprendimientoUnit` - Individual unit structure
- `EmprendimientoAmenidad` - Amenity structure
- `EmprendimientoLocation` - Location data
- `EmprendimientoAPIResponse` - API response format

### API Endpoints

```typescript
POST /api/emprendimientos
Body: EmprendimientoSubmission
Response: EmprendimientoAPIResponse

PUT /api/emprendimientos/:id
Body: Partial<EmprendimientoSubmission>
Response: EmprendimientoAPIResponse

POST /api/emprendimientos/:id/publish
Body: { planId: string }
Response: EmprendimientoAPIResponse

DELETE /api/emprendimientos/:id
Response: { success: boolean }

GET /api/emprendimientos/:id
Response: EmprendimientoAPIResponse
```

### Submission Flow

1. User completes all steps (data stored in state)
2. User clicks "Publicar" in preview step
3. Component gathers all data from state
4. Data is transformed to match `EmprendimientoSubmission` interface
5. POST request sent to `/api/emprendimientos`
6. On success, redirect to `/protected/publish/success` or listing page
7. On error, display error message to user

### Example API Call

```typescript
const response = await fetch('/api/emprendimientos', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify(submissionData),
});

if (!response.ok) {
  throw new Error('Error publishing emprendimiento');
}

const result: EmprendimientoAPIResponse = await response.json();

if (result.success && result.data) {
  router.push(`/protected/emprendimientos/${result.data.id}`);
}
```

## State Management Recommendations

### Current Implementation
- Each component manages its own local state
- Data is NOT persisted between steps
- Preview uses mock data

### Recommended Implementation

For production, implement global state management using one of:

#### Option 1: React Context API
```typescript
// contexts/EmprendimientoContext.tsx
const EmprendimientoContext = createContext<{
  data: EmprendimientoSubmission;
  updateData: (partial: Partial<EmprendimientoSubmission>) => void;
}>();
```

#### Option 2: Zustand
```typescript
// stores/emprendimientoStore.ts
const useEmprendimientoStore = create<EmprendimientoStore>((set) => ({
  data: initialData,
  updateData: (partial) => set((state) => ({ 
    data: { ...state.data, ...partial } 
  })),
}));
```

#### Option 3: Redux Toolkit
```typescript
// slices/emprendimientoSlice.ts
const emprendimientoSlice = createSlice({
  name: 'emprendimiento',
  initialState,
  reducers: {
    updateData: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});
```

## File Uploads

Handle file uploads with FormData:

```typescript
const formData = new FormData();
formData.append('data', JSON.stringify(emprendimientoData));

// Append files
imagenes.forEach((file, index) => {
  formData.append(`imagenes[${index}]`, file);
});

unidades.forEach((unidad, unitIndex) => {
  unidad.fotos.forEach((foto, fotoIndex) => {
    formData.append(`unidades[${unitIndex}].fotos[${fotoIndex}]`, foto);
  });
});

const response = await fetch('/api/emprendimientos', {
  method: 'POST',
  body: formData,
});
```

## Navigation Between Steps

Tab navigation is implemented in each component:
```typescript
const tabs = [
  { id: 'datos-principales', path: '/protected/publish/emprendimiento' },
  { id: 'amenidades', path: '/protected/publish/emprendimiento/amenidades' },
  { id: 'unidades', path: '/protected/publish/emprendimiento/unidades' },
  { id: 'vista-precio', path: '/protected/publish/emprendimiento/vista-al-precio' },
  { id: 'preview', path: '/protected/publish/emprendimiento/preview' },
];
```

## Responsive Design

All components are fully responsive:
- Desktop: 1087px max-width container
- Mobile: 358px max-width container
- Breakpoint: 768px

## UI Components Used

- `InputField2` - Text inputs with labels
- `Select` - Dropdown selectors
- `Button` - Primary and secondary buttons
- `Checkbox` - Checkboxes with labels
- `SwitchToggle` - Toggle switches
- `Chip` - Selectable chips for amenidades
- `RadioButton` - Radio buttons with descriptions

## TODO for Backend Integration

- [ ] Create `/api/emprendimientos` endpoints
- [ ] Implement file upload handling
- [ ] Add authentication middleware
- [ ] Implement data validation
- [ ] Add error handling and logging
- [ ] Create database schema/models
- [ ] Implement plan/pricing logic
- [ ] Add collaborator management
- [ ] Set up image storage service (S3, Cloudinary, etc.)
- [ ] Implement success/confirmation page

## Testing Checklist

- [ ] Form validation on all steps
- [ ] File upload size limits
- [ ] Image preview functionality
- [ ] Tab navigation preserves data
- [ ] Mobile responsive layout
- [ ] Error handling and display
- [ ] Loading states during submission
- [ ] Success/error notifications
- [ ] Browser back button handling
- [ ] Keyboard accessibility
- [ ] Screen reader compatibility

## Notes

- All monetary values should be stored in cents/smallest unit
- Dates should be stored in ISO 8601 format
- File size limits should be enforced on both frontend and backend
- Image optimization should be performed before storage
- Location coordinates should be validated
- Plan selection should check availability before submission
