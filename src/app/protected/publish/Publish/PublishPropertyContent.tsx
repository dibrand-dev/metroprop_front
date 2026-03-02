'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPropertyContent.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';

const iconChevron = '/icons/chevron-up.svg';

interface PublishPropertyContentProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const amenityGroups = [
  {
    key: 'rooms',
    title: 'Mas ambientes',
    options: [
      'Cocina',
      'Comedor',
      'Jardin',
      'Lavadero',
      'Living comedor',
      'Patio',
      'Altillo',
      'Balcon',
      'Baulera',
    ],
  },
  {
    key: 'services',
    title: 'Servicios',
    options: [
      'Ascensor',
      'Encargado',
      'Internet / Wifi',
      'Ropa de cama',
      'Servicio de limpieza',
      'Toallas',
    ],
  },
  {
    key: 'extras',
    title: 'Extras',
    options: [
      'Aire acondicionado',
      'Alarma',
      'Amoblado',
      'Calefaccion',
      'Quincho',
      'Vigilancia',
      'Caldera',
      'Cancha de deportes',
      'Cocina equipada',
    ],
  },
  {
    key: 'facilities',
    title: 'Facilidades',
    options: [
      'Apto profesional',
      'Gimnasio',
      'Parrilla',
      'Permite mascotas',
      'Pileta',
      'Solarium',
      'Acceso para personas...',
      'Hidromasaje',
    ],
  },
] as const;

type AmenityKey = (typeof amenityGroups)[number]['key'];

type DetailSelectKey = 'brightness' | 'orientation' | 'floors' | 'parking';

type DetailOption = {
  key: DetailSelectKey;
  label: string;
  options: string[];
};

const detailSelects: DetailOption[] = [
  { key: 'brightness', label: 'Luminoso', options: ['Si', 'No'] },
  { key: 'orientation', label: 'Orientacion', options: ['Norte', 'Sur', 'Este', 'Oeste'] },
  { key: 'floors', label: 'Cantidad de plantas', options: ['1', '2', '3', '4+'] },
  { key: 'parking', label: 'Cobertura cochera', options: ['Cubierta', 'Semi cubierta', 'Descubierta'] },
];

export default function PublishPropertyContent({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishPropertyContentProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<AmenityKey, boolean>>(
    wizardData.propertyContent?.expandedGroups || {
      rooms: false,
      services: false,
      extras: false,
      facilities: false,
    }
  );
  const [selectedAmenities, setSelectedAmenities] = useState<Record<AmenityKey, Set<string>>>(
    wizardData.propertyContent?.selectedAmenities || {
      rooms: new Set(['Cocina']),
      services: new Set(['Internet / Wifi']),
      extras: new Set([]),
      facilities: new Set([]),
    }
  );
  const [details, setDetails] = useState<Record<DetailSelectKey, string>>(
    wizardData.propertyContent?.details || {
      brightness: '',
      orientation: '',
      floors: '',
      parking: '',
    }
  );
  const [frontSize, setFrontSize] = useState(wizardData.propertyContent?.frontSize || '');
  const [depthSize, setDepthSize] = useState(wizardData.propertyContent?.depthSize || '');
  const [semiCoveredSize, setSemiCoveredSize] = useState(wizardData.propertyContent?.semiCoveredSize || '');

  // Update wizard data when property content changes
  useEffect(() => {
    updateWizardData({
      propertyContent: {
        expandedGroups,
        selectedAmenities: Object.fromEntries(
          Object.entries(selectedAmenities).map(([key, value]) => [key, Array.from(value)])
        ),
        details,
        frontSize,
        depthSize,
        semiCoveredSize,
      },
    });
  }, [expandedGroups, selectedAmenities, details, frontSize, depthSize, semiCoveredSize, updateWizardData]);

  const handleToggleAmenity = (groupKey: AmenityKey, option: string) => {
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

  const handleToggleGroup = (groupKey: AmenityKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleDetailChange = (key: DetailSelectKey, value: string) => {
    setDetails((prev) => ({
      ...prev,
      [key]: value,
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
              {wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}<br />{wizardData.location?.address}
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
                          key={option}
                          type="button"
                          className={`publish-chip ${
                            selectedSet.has(option) ? 'publish-chip-active' : ''
                          }`}
                          onClick={() => handleToggleAmenity(group.key, option)}
                        >
                          {option}
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
                {detailSelects.map((detail) => {
                  const selectOptions = detail.options.map(option => ({
                    value: option,
                    label: option,
                  }));

                  return (
                    <div key={detail.key} className="publish-property-content-detail-field">
                      <Select
                        label={detail.label}
                        options={selectOptions}
                        value={details[detail.key]}
                        onChange={(value) => handleDetailChange(detail.key, value)}
                        placeholder="Seleccionar"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="publish-property-content-inputs">
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Frente del terreno (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={frontSize}
                    onChange={(event) => setFrontSize(event.target.value)}
                    type="number"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Largo del terreno (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={depthSize}
                    onChange={(event) => setDepthSize(event.target.value)}
                    type="number"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Superficie semicubierta (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={semiCoveredSize}
                    onChange={(event) => setSemiCoveredSize(event.target.value)}
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
