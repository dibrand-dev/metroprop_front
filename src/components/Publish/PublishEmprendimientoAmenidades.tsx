'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Chip from '@/ui/Chip/Chip';
import Button from '@/ui/Button/Button';
import './PublishEmprendimientoAmenidades.scss';

// Amenity groups for emprendimiento
const amenityGroups = [
  {
    key: 'servicios',
    title: 'Servicios',
    options: [
      'Ascensor',
      'Encargado',
      'Seguridad 24 hs',
      'Internet / Wifi',
      'Portero eléctrico',
      'Video portero',
      'Servicio de limpieza',
      'Gas natural',
      'Agua corriente',
      'Cloacas',
      'Electricidad',
      'Calefacción central',
      'Aire acondicionado central',
    ],
  },
  {
    key: 'caracteristicas_generales',
    title: 'Características generales',
    options: [
      'Apto profesional',
      'Acceso para discapacitados',
      'Permite mascotas',
      'Admite crédito hipotecario',
      'Cochera cubierta',
      'Cochera descubierta',
      'Baulera',
      'Terraza propia',
      'Balcón',
      'Jardín',
      'Patio',
      'Parrilla',
      'Vista panorámica',
      'Laundry',
      'Depósito',
    ],
  },
  {
    key: 'ambientes',
    title: 'Ambientes',
    options: [
      'Living',
      'Comedor',
      'Living comedor',
      'Cocina',
      'Cocina equipada',
      'Office',
      'Toilette',
      'Lavadero',
      'Vestidor',
    ],
  },
  {
    key: 'caracteristicas',
    title: 'Características',
    options: [
      'Gimnasio',
      'Pileta',
      'Pileta climatizada',
      'Solarium',
      'Hidromasaje',
      'Sauna',
      'Spa',
      'Cancha de tenis',
      'Cancha de paddle',
      'Cancha de fútbol',
      'Cancha polideportiva',
      'Quincho',
      'Salón de usos múltiples',
      'Sum',
      'Sala de juegos',
      'Sala de cine',
      'Coworking',
      'Business center',
      'Sala de reuniones',
      'Playroom',
      'Jardín comunitario',
      'Parque',
      'Área verde',
      'Juegos infantiles',
      'Pet park',
      'Bicicletero',
      'Lavadero de autos',
      'Estacionamiento de visitas',
      'Parrillas comunitarias',
      'Roof top',
      'Deck',
      'Fogón',
    ],
  },
] as const;

type AmenityKey = (typeof amenityGroups)[number]['key'];

export default function PublishEmprendimientoAmenidades() {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    servicios: true,
    caracteristicas_generales: true,
    ambientes: true,
    caracteristicas: true,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, Set<string>>>({
    servicios: new Set(),
    caracteristicas_generales: new Set(),
    ambientes: new Set(),
    caracteristicas: new Set(),
  });

  const handleToggleAmenity = (groupKey: string, option: string) => {
    setSelectedAmenities((prev) => {
      const nextSet = new Set(prev[groupKey]);
      if (nextSet.has(option)) {
        nextSet.delete(option);
      } else {
        nextSet.add(option);
      }
      return {
        ...prev,
        [groupKey]: nextSet,
      };
    });
  };

  const handleToggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleGuardarBorrador = () => {
    // TODO: Implement save as draft logic
    console.log('Guardar como borrador');
    router.push('/protected/publish/emprendimiento');
  };

  const handleContinuar = () => {
    // TODO: Implement continue logic (validation and save)
    console.log('Continuar');
    // For now, navigate to unidades (will be implemented later)
    router.push('/protected/publish/emprendimiento');
  };

  const getVisibleOptions = (groupKey: string, options: readonly string[]) => {
    const isExpanded = expandedGroups[groupKey];
    return isExpanded ? options : options.slice(0, 6);
  };

  const hasMoreOptions = (options: readonly string[]) => options.length > 6;

  return (
    <div className="publish-emprendimiento-amenidades">
      <div className="publish-emprendimiento-amenidades-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-text">Emprendimientos</span>
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="title">Publicar emprendimiento</h1>
        </div>

        {/* Secondary Menu / Tabs */}
        <div className="secondary-menu">
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento')}
          >
            Datos principales
          </button>
          <button
            className="tab active"
          >
            Amenidades
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/unidades')}
          >
            Unidades
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/tipos-de-unidad')}
          >
            Tipos de unidad
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/vista-al-precio')}
          >
            Vista al precio
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h2 className="section-title">Agregar características del emprendimiento</h2>

          {/* Amenity Groups */}
          <div className="amenity-groups">
            {amenityGroups.map((group) => {
              const visibleOptions = getVisibleOptions(group.key, group.options);
              const isExpanded = expandedGroups[group.key];
              const hasMore = hasMoreOptions(group.options);

              return (
                <div key={group.key} className="amenity-group">
                  <h3 className="amenity-group-title">{group.title}</h3>
                  <div className="chips-container">
                    {visibleOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        selected={selectedAmenities[group.key]?.has(option)}
                        onClick={() => handleToggleAmenity(group.key, option)}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <button
                      type="button"
                      className="toggle-more-button"
                      onClick={() => handleToggleGroup(group.key)}
                    >
                      <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={isExpanded ? 'rotated' : ''}
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Volver"
            variant="secondary"
            buttonType="2"
            onClick={handleGuardarBorrador}
            fullWidth={false}
          />
          <Button
            label="Continuar"
            variant="primary"
            buttonType="2"
            onClick={handleContinuar}
            fullWidth={false}
          />
        </div>
      </div>
    </div>
  );
}
