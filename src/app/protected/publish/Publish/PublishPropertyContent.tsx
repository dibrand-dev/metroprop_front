'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPropertyContent.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import { Brightness, BRIGHTNESS_LABELS, BRIGHTNESS_SELECT_OPTIONS, CreatePropertyDraft, GARAGE_COVERAGE_LABELS, GARAGE_SELECT_OPTIONS, GarageCoverage, OPERATION_TYPE_LABELS, Orientation, ORIENTATION_LABELS, ORIENTATION_SELECT_OPTIONS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';

const iconChevron = '/icons/chevron-up.svg';

interface PublishPropertyContentProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
}

const amenityGroups = [
  {
    key: 'rooms',
    title: 'Mas ambientes',
    options: [
      { id: 1, name: 'Cocina' },
      { id: 2, name: 'Comedor' },
      { id: 3, name: 'Jardin' },
      { id: 4, name: 'Lavadero' },
      { id: 5, name: 'Living comedor' },
      { id: 6, name: 'Patio' },
      { id: 7, name: 'Altillo' },
      { id: 8, name: 'Balcon' },
      { id: 9, name: 'Baulera' },
    ],
  },
  {
    key: 'services',
    title: 'Servicios',
    options: [
      { id: 10, name: 'Ascensor' },
      { id: 11, name: 'Encargado' },
      { id: 12, name: 'Internet / Wifi' },
      { id: 13, name: 'Ropa de cama' },
      { id: 14, name: 'Servicio de limpieza' },
      { id: 15, name: 'Toallas' },
    ],
  },
  {
    key: 'extras',
    title: 'Extras',
    options: [
      { id: 16, name: 'Aire acondicionado' },
      { id: 17, name: 'Alarma' },
      { id: 18, name: 'Amoblado' },
      { id: 19, name: 'Calefaccion' },
      { id: 20, name: 'Quincho' },
      { id: 21, name: 'Vigilancia' },
      { id: 22, name: 'Caldera' },
      { id: 23, name: 'Cancha de deportes' },
      { id: 24, name: 'Cocina equipada' },
    ],
  },
  {
    key: 'facilities',
    title: 'Facilidades',
    options: [
      { id: 25, name: 'Apto profesional' },
      { id: 26, name: 'Gimnasio' },
      { id: 27, name: 'Parrilla' },
      { id: 28, name: 'Permite mascotas' },
      { id: 29, name: 'Pileta' },
      { id: 30, name: 'Solarium' },
      { id: 31, name: 'Acceso para personas...' },
      { id: 32, name: 'Hidromasaje' },
    ],
  },
] as const;

type AmenityKey = (typeof amenityGroups)[number]['key'];

type DetailSelectKey = 'brightness' | 'orientation' | 'floors_amount' | 'garage_coverage';

type DetailOption = {
  key: DetailSelectKey;
  label: string;
  options: string[];
};

export default function PublishPropertyContent({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit
}: PublishPropertyContentProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<AmenityKey, boolean>>({
    rooms: false,
    services: false,
    extras: false,
    facilities: false,
  });

  const [selectedAmenities, setSelectedAmenities] = useState<number[] | undefined>(
    wizardData.tags || undefined
  );

  const [tags, setTags] = useState(wizardData.tags || undefined);
  const [orientation, setOrientation] = useState(wizardData.orientation || undefined);
  const [floors_amount, setFloors_amount] = useState(wizardData.floors_amount || undefined);
  const [garage_coverage, setGarage_coverage] = useState(wizardData.garage_coverage || undefined);
  const [brightness, setBrightness] = useState(wizardData.brightness || undefined);
  const [surface_front, setSurface_front] = useState(wizardData.surface_front || undefined);
  const [surface_length, setSurface_length] = useState(wizardData.surface_length || undefined);
  const [semiroofed_surface, setSemiroofed_surface] = useState(wizardData.semiroofed_surface || undefined);

  // Update wizard data when property content changes
  useEffect(() => {
    updateWizardData({
      /*selectedAmenities: Object.fromEntries(
        Object.entries(selectedAmenities).map(([key, value]) => [key, Array.from(value)])
      ),
      details,*/
      tags,
      brightness,
      orientation,
      floors_amount,
      garage_coverage,
      surface_front,
      surface_length,
      semiroofed_surface
    });
  }, [ /*selectedAmenities,*/ tags, brightness, orientation, floors_amount, garage_coverage, surface_front, surface_length, semiroofed_surface, updateWizardData]);

  const handleToggleAmenity = (groupKey: AmenityKey, optionId: number) => {
    setSelectedAmenities((prev) => {
      const nextSet = new Set(prev[groupKey]);
      if (nextSet.has(optionId)) {
        nextSet.delete(optionId);
      } else {
        nextSet.add(optionId);
      }
      return {
        ...prev,
        [groupKey]: nextSet,
      };
    });
  };

  const handleToggleGroup = (groupKey: AmenityKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };  

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="publish-property-content">
      <div className="publish-property-content-inner">
        <div className="publish-property-content-card">
          <div className="publish-property-content-top">
            <div className="publish-property-content-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-property-content-link" type="button">
              Guardar y salir
            </button>
          </div>

          <div className="publish-property-content-status">
            <span className="publish-property-content-segment is-filled" />
            <span className="publish-property-content-segment is-partial" />
            <span className="publish-property-content-segment" />
          </div>

          <div className="publish-property-content-section">
            <div className="publish-property-content-header">
              <h1>Suma las comodidades adicionales</h1>
              <button className="publish-property-content-idea" type="button" aria-label="Idea">
                ?
              </button>
            </div>

            <div className="publish-property-content-groups">
              {amenityGroups.map((group) => {
                const selectedSet = selectedAmenities[group.key];
                const isExpanded = expandedGroups[group.key];
                const visibleItems = isExpanded ? group.options : group.options.slice(0, 9);

                return (
                  <div key={group.key} className="publish-property-content-group">
                    <h2>{group.title}</h2>
                    <div className="publish-property-content-chip-grid">
                      {visibleItems.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`publish-chip ${
                            selectedSet.has(option.id) ? 'publish-chip-active' : ''
                          }`}
                          onClick={() => handleToggleAmenity(group.key, option.id)}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="publish-property-content-more"
                      onClick={() => handleToggleGroup(group.key)}
                    >
                      {isExpanded ? 'Ver menos' : 'Ver mas'}
                      <img
                        src={iconChevron}
                        alt=""
                        className={isExpanded ? 'is-rotated' : ''}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="publish-property-content-details">
              <h2>Detalles de la propiedad</h2>
              <div className="publish-property-content-detail-grid">                
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Luminoso"
                    options={BRIGHTNESS_SELECT_OPTIONS}
                    value={brightness ? BRIGHTNESS_LABELS[brightness] : undefined}
                    onChange={(value) => setBrightness(value as unknown as Brightness)}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Orientación"
                    options={ORIENTATION_SELECT_OPTIONS}
                    value={orientation ? ORIENTATION_LABELS[orientation] : undefined}
                    onChange={(value) => setOrientation(value as unknown as Orientation)}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Cantidad de plantas"
                    options={[{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4+', value: '4+' }]}
                    value={floors_amount?.toString() ?? undefined}
                    onChange={(value) => setFloors_amount(value ? parseInt(value) : undefined)}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Cobertura cochera"
                    options={GARAGE_SELECT_OPTIONS}
                    value={garage_coverage ? GARAGE_COVERAGE_LABELS[garage_coverage] : undefined}
                    onChange={(value) => setGarage_coverage(value as unknown as GarageCoverage)}
                    placeholder="Seleccionar"
                  />
                </div>
              </div>
              <div className="publish-property-content-inputs">
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Frente del terreno (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={surface_front ?? ''}
                    onChange={(event) => setSurface_front(event.target.value ? parseInt(event.target.value) : undefined)}
                    type="number"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Largo del terreno (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={surface_length ?? ''}
                    onChange={(event) => setSurface_length(event.target.value ? parseInt(event.target.value) : undefined)}
                    type="number"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Superficie semicubierta (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={semiroofed_surface ?? ''}
                    onChange={(event) => setSemiroofed_surface(event.target.value ? parseInt(event.target.value) : undefined)}
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="publish-property-content-footer">
            <button className="publish-property-content-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button
              className="publish-property-content-continue"
              type="button"
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
