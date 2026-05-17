'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/ui/Button/Button';
import type { Emprendimiento, API_ENDPOINTS } from '@/types/emprendimiento';
import './PublishEmprendimientoPreview.scss';
import { useLocations } from '@/lib/locations';
import { useSession } from 'next-auth/react';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';


interface Unit {
  nombre: string;
  tipo: string;
  piso: string;
  supTotal: string;
  supCubierta: string;
  banos: string;
  disposicion: string;
  precioM2: string;
  precioTotal: string;
}

interface UnitsByType {
  [key: string]: Unit[];
}


const iconChevron = '/icons/chevron-up.svg';

interface PublishFinalReviewProps {
  wizardData: CreatePropertyDraft;
  onNext: (data: Partial<CreatePropertyDraft>) => void;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<CreatePropertyDraft>) => void;
  isEditMode?: boolean;
  goToStep: (step: EmprendimientoStep) => void;
}

export default function PublishEmprendimientoPreview({
  wizardData,
  onNext,
  onBack,
  onSaveAndExit,
  updateWizardData,
  isEditMode = false,
  goToStep,
}: PublishFinalReviewProps) {

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: locations = [] } = useLocations();
  const { data: sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>('');
  const countryLabel = locations.find(l => l.id === wizardData.country_id)?.name;
  const stateLabel = locations.find(l => l.id === wizardData.state_id)?.name;
  const locationLabel = locations.find(l => l.id === wizardData.location_id)?.name;
  const subLocationLabel = locations.find(l => l.id === wizardData.sub_location_id)?.name;
  const addressParts = [wizardData.street, subLocationLabel, locationLabel, stateLabel, countryLabel].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Dirección no especificada';
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);

  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/tags`),
  });

  useEffect(() => {
    if (tagsData.length > 0) {
      const groups: AmenityGroup[] = Object.values(AmenityType).filter(v => typeof v === 'number').map(type => {
        const options = tagsData.filter((tag: AmenityTag) => tag.type === type);
        return {
          type: type as AmenityType,
          title: AMENITY_TYPE_LABELS[type as AmenityType],
          options,
        };
      });
      setAmenityGroups(groups);
      // Set activeTab to first group's type if available
      if (groups.length > 0) {
        setActiveTab(groups[0].type.toString());
      }
    }
  }, [tagsData]);
  
  useEffect(() => {
    if (wizardData.draft_id) {
      apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/multimedia`)
        .then(data => {
          const _wizardData = {...wizardData};
          _wizardData.images = (data as any)?.images || wizardData.images;
          _wizardData.attached = (data as any)?.attached || wizardData.attached;
          updateWizardData(_wizardData);
        })
        .catch(error => console.error('Error loading multimedia:', error));
    }
  }, []) 

  // Format price display
  const formatPrice = (amount: string, currency: string) => {
    if (!amount) return '';
    return `${currency} ${amount}`;
  };

  // Build amenity tabs from amenityGroups
  const amenityTabs = amenityGroups.map(group => ({
    key: group.type.toString(),
    label: group.title
  }));

  useEffect(() => {
    if (!wizardData) return;
    const hasDetails = !!(
      wizardData.expenses ||
      wizardData.floors_amount ||
      wizardData.garage_coverage ||
      wizardData.postal_code ||
      wizardData.semiroofed_surface ||
      wizardData.surface_front ||
      wizardData.surface_length
    );
    if (hasDetails) setActiveTab('4');
  }, [wizardData]);

























  // Mock data - in real app this would come from context/state management
  const emprendimientoData = {
    nombre: 'Arán Histórico',
    descripcion: '1, 2 y 4 Ambientes y Amenities',
    tipoOperacion: 'Venta',
    precioDesde: 'USD 657,000',
    direccion: 'Avenida Ceviño 4046, Palermo Chico, Palermo',
    descripcionCompleta: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
    imagenPrincipal: '/images/emprendimiento-main.jpg',
    imagenesSecundarias: [
      '/images/emprendimiento-1.jpg',
      '/images/emprendimiento-2.jpg',
      '/images/emprendimiento-3.jpg',
      '/images/emprendimiento-4.jpg',
    ],
    caracteristicas: [
      { icon: 'dormitorios', label: '1-4', text: 'Dormitorios' },
      { icon: 'banos', label: '1-2', text: 'Baños' },
      { icon: 'area', label: '38-167', text: 'm² totales' },
      { icon: 'cochera', label: '0-1', text: 'Cochera' },
      { icon: 'baulera', label: '0-1', text: 'Baulera' },
      { icon: 'piscina', label: 'Sí', text: 'Piscina' },
    ],
    amenidades: ['Seguridad 24hs', 'Sum', 'Parrilla', 'Gimnasio', 'Solarium', 'Jardín'],
  };

  const unidadesPorTipo: UnitsByType = {
    '1 ambiente': [
      {
        nombre: '1-A',
        tipo: '1 ambiente',
        piso: '10',
        supTotal: '38 m²',
        supCubierta: '35 m²',
        banos: '1',
        disposicion: 'Frente',
        precioM2: 'USD 6,500',
        precioTotal: 'USD 82,500',
      },
    ],
    '2 ambientes': [
      {
        nombre: '2-A',
        tipo: '2 ambientes',
        piso: '5',
        supTotal: '61 m²',
        supCubierta: '58 m²',
        banos: '1',
        disposicion: 'Frente',
        precioM2: 'USD 3,555',
        precioTotal: 'USD 216,859',
      },
      {
        nombre: '2-B',
        tipo: '2 ambientes',
        piso: '7',
        supTotal: '63 m²',
        supCubierta: '60 m²',
        banos: '1',
        disposicion: 'Contrafrente',
        precioM2: 'USD 3,444',
        precioTotal: 'USD 217,039',
      },
    ],
  };



  const handlePublish = async () => {
    setIsSubmitting(true);
    
    // Prepare data for API submission
    // In production, this data should come from a global state manager
    // that has been populated throughout the multi-step form
    const submissionData: Partial<Emprendimiento> = {
      // From step 1: Datos principales
      nombreEmprendimiento: emprendimientoData.nombre,
      descripcion: emprendimientoData.descripcionCompleta,
      tipoEmprendimiento: 'Residencial', // From form
      ubicacion: {
        direccion: emprendimientoData.direccion,
        ciudad: 'Buenos Aires', // From form
        provincia: 'Buenos Aires', // From form
        pais: 'Argentina',
      },
      // imagenesPrincipales: imageFiles, // From form file uploads
      
      // From step 2: Amenidades
      amenidades: emprendimientoData.amenidades.map(a => ({
        id: a.toLowerCase().replace(/\s+/g, '-'),
        nombre: a,
        categoria: 'servicios' as const,
      })),
      
      // From step 3: Unidades
      unidades: Object.values(unidadesPorTipo).flat().map(u => ({
        nombre: u.nombre,
        descripcion: '',
        tipo: u.tipo,
        piso: u.piso,
        orientacion: u.disposicion,
        precio: parseFloat(u.precioTotal.replace(/[^0-9.]/g, '')),
        moneda: 'USD' as const,
        expensas: false,
        dormitorios: parseInt(u.tipo.split(' ')[0]) || 1,
        banos: parseInt(u.banos) || 1,
        toilettes: 0,
        cochera: 0,
        baulera: 0,
        supConstruidos: parseFloat(u.supCubierta.replace(/[^0-9.]/g, '')),
        supTotales: parseFloat(u.supTotal.replace(/[^0-9.]/g, '')),
        fotos: [],
        planos: [],
      })),
      
      // From step 4: Vista al precio
      planSeleccionado: 'destacado', // From form
      colaboradorAsignado: '', // From form
      
      // Metadata
      estado: 'publicado' as const,
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    };

    try {
      // API Integration Point
      // Replace this with actual API call when backend is ready
      // 
      // Example implementation:
      // const response = await fetch('/api/emprendimientos', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`,
      //   },
      //   body: JSON.stringify(submissionData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Error publishing emprendimiento');
      // }
      // 
      // const result: EmprendimientoAPIResponse = await response.json();
      // 
      // if (result.success && result.data) {
      //   router.push(`/protected/emprendimientos/${result.data.id}`);
      // }
      
      console.log('📤 Publishing emprendimiento to API:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Emprendimiento published successfully');
      
      // Navigate to success page or listing
      router.push('/protected/publish/success');
    } catch (error) {
      console.error('❌ Error publishing emprendimiento:', error);
      alert('Error al publicar el emprendimiento. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnidadCount = (units: Unit[]) => units.length;
  const getPrecioDesde = (units: Unit[]) => {
    const precios = units.map(u => parseFloat(u.precioTotal.replace(/[^0-9.]/g, '')));
    return `USD ${Math.min(...precios).toLocaleString('es-AR')}`;
  };
  const getSupDesde = (units: Unit[]) => {
    const sups = units.map(u => parseFloat(u.supTotal.replace(/[^0-9.]/g, '')));
    return `${Math.min(...sups)} m²`;
  };

  return (
    <div className="publish-emprendimiento-preview">
      <div className="publish-emprendimiento-preview-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-text">Emprendimientos</span>
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="title">Publicar emprendimiento</h1>
        </div>

        {/* Secondary Menu / Tabs */}
        <EmprendimientoTabs currentStep="emprendimiento-preview" goToStep={goToStep} />

        {/* Main Content */}
        <div className="main-content">
          <h2 className="section-main-title">Vista previa</h2>
          <p className="preview-subtitle">Así se verá tu publicación</p>

          {/* Preview Card */}
          <div className="preview-card">
            {/* Header Section */}
            <div className="preview-header">
              <div className="property-chip">
                {emprendimientoData.tipoOperacion} desde {emprendimientoData.precioDesde}
              </div>
            </div>

            <h3 className="property-title">
              {emprendimientoData.nombre} - {emprendimientoData.descripcion}
            </h3>

            {/* Image Gallery */}
            <div className="image-gallery">
              <div className="main-image">
                <div className="image-placeholder">Imagen principal</div>
              </div>
              <div className="secondary-images">
                <div className="image-column">
                  <div className="image-placeholder small">Imagen 1</div>
                  <div className="image-placeholder small">Imagen 2</div>
                </div>
                <div className="image-column">
                  <div className="image-placeholder small">Imagen 3</div>
                  <div className="image-placeholder small">Imagen 4</div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="property-details">
              <h4 className="details-title">
                {emprendimientoData.nombre} - {emprendimientoData.descripcion}
              </h4>
              <div className="address">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <span>{emprendimientoData.direccion}</span>
              </div>

              {/* Features Icons */}
              <div className="features-grid">
                {emprendimientoData.caracteristicas.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon">
                      <span className="feature-value">{feature.label}</span>
                    </div>
                    <span className="feature-label">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="description-section">
              <h4 className="section-title">Sobre el emprendimiento</h4>
              <p className="description-text">{emprendimientoData.descripcionCompleta}</p>
            </div>

            {/* Map Section */}
            <div className="map-section">
              <div className="address">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <span>{emprendimientoData.direccion}</span>
              </div>
              <div className="map-placeholder">
                <div className="map-pin">
                  <svg width="60" height="56" viewBox="0 0 60 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 0C18.954 0 10 8.954 10 20c0 16.5 20 36 20 36s20-19.5 20-36c0-11.046-8.954-20-20-20zm0 27c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" fill="#006AFF"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Available Units Section */}
            <div className="units-section">
              <h4 className="section-title">Unidades disponibles</h4>
              
              {Object.entries(unidadesPorTipo).map(([tipo, unidades]) => (
                <div key={tipo} className="unit-type-group">
                  {/* Unit Type Header */}
                  <div className="unit-type-header">
                    <div className="unit-type-info">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      <div className="unit-type-details">
                        <div className="unit-type-title">
                          <span className="unit-type-name">{tipo}</span>
                          <span className="unit-type-desde">desde</span>
                          <span className="unit-type-price">{getPrecioDesde(unidades)}</span>
                        </div>
                        <div className="unit-type-superficie">
                          Superficie: desde {getSupDesde(unidades)}
                        </div>
                      </div>
                    </div>
                    <div className="unit-type-count">
                      <span className="count-number">{getUnidadCount(unidades)}</span>
                      <span className="count-label">unidades disponibles</span>
                    </div>
                  </div>

                  {/* Units Table */}
                  <div className="units-table">
                    <div className="table-header">
                      <div className="table-cell">Unidad</div>
                      <div className="table-cell">Sup. Total</div>
                      <div className="table-cell">Sup. Cubierta</div>
                      <div className="table-cell">Baños</div>
                      <div className="table-cell">Disposición</div>
                      <div className="table-cell">Precio m²</div>
                      <div className="table-cell">Precio total</div>
                    </div>
                    {unidades.map((unidad, index) => (
                      <div key={index} className="table-row">
                        <div className="table-cell">{unidad.nombre}</div>
                        <div className="table-cell">{unidad.supTotal}</div>
                        <div className="table-cell">{unidad.supCubierta}</div>
                        <div className="table-cell">{unidad.banos}</div>
                        <div className="table-cell">{unidad.disposicion}</div>
                        <div className="table-cell">{unidad.precioM2}</div>
                        <div className="table-cell">{unidad.precioTotal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info Section */}
            <div className="additional-info-section">
              <h4 className="section-title">Más sobre este emprendimiento</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Estado</span>
                  <span className="info-value">En obra</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Entrega</span>
                  <span className="info-value">Junio 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label={isSubmitting ? 'Publicando...' : 'Publicar'}
            variant="primary"
            onClick={handlePublish}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
