'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishPropertyContent.scss';

const iconChevron = '/icons/chevron-up.svg';
const iconBack = '/icons/arrow.svg';

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

export default function PublishPropertyContent() {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Record<AmenityKey, boolean>>({
    rooms: false,
    services: false,
    extras: false,
    facilities: false,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<Record<AmenityKey, Set<string>>>(
    () => ({
      rooms: new Set(['Cocina']),
      services: new Set(['Internet / Wifi']),
      extras: new Set([]),
      facilities: new Set([]),
    })
  );
  const [openSelect, setOpenSelect] = useState<DetailSelectKey | null>(null);
  const [details, setDetails] = useState<Record<DetailSelectKey, string>>({
    brightness: '',
    orientation: '',
    floors: '',
    parking: '',
  });
  const [frontSize, setFrontSize] = useState('');
  const [depthSize, setDepthSize] = useState('');
  const [semiCoveredSize, setSemiCoveredSize] = useState('');

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

  const handleSelectToggle = (key: DetailSelectKey) => {
    setOpenSelect((prev) => (prev === key ? null : key));
  };

  const handleSelectOption = (key: DetailSelectKey, value: string) => {
    setDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
    setOpenSelect(null);
  };

  const handleBack = () => {
    router.push('/protected/publish/main-info');
  };

  const handleContinue = () => {
    router.push('/protected/publish/description');
  };

  const propertyRoute = useMemo(
    () => ({ type: 'Venta', property: 'Casa Duplex', address: 'Juncal 2345' }),
    []
  );

  return (
    <div className="publish-property-content">
      <div className="publish-property-content-inner">
        <div className="publish-property-content-card">
          <div className="publish-property-content-top">
            <div className="publish-property-content-route">
              <p>
                {propertyRoute.type} - {propertyRoute.property}
              </p>
              <p>{propertyRoute.address}</p>
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
                          className={`publish-property-content-chip ${
                            selectedSet.has(option) ? 'is-active' : ''
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
                {detailSelects.map((detail) => (
                  <div key={detail.key} className="publish-property-content-detail-field">
                    <label>{detail.label}</label>
                    <div className="publish-property-content-select">
                      <button
                        type="button"
                        className={`publish-property-content-select-button ${
                          details[detail.key] ? 'is-selected' : ''
                        } ${openSelect === detail.key ? 'is-open' : ''}`}
                        onClick={() => handleSelectToggle(detail.key)}
                      >
                        <span>{details[detail.key] || 'Seleccionar'}</span>
                        <img src={iconChevron} alt="" />
                      </button>
                      {openSelect === detail.key ? (
                        <div className="publish-property-content-options">
                          {detail.options.map((option) => (
                            <button
                              key={`${detail.key}-${option}`}
                              type="button"
                              onClick={() => handleSelectOption(detail.key, option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="publish-property-content-inputs">
                <div className="publish-property-content-detail-field">
                  <label>Frente del terreno (m2)</label>
                  <input
                    type="text"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={frontSize}
                    onChange={(event) => setFrontSize(event.target.value)}
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <label>Largo del terreno (m2)</label>
                  <input
                    type="text"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={depthSize}
                    onChange={(event) => setDepthSize(event.target.value)}
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <label>Superficie semicubierta (m2)</label>
                  <input
                    type="text"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={semiCoveredSize}
                    onChange={(event) => setSemiCoveredSize(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="publish-property-content-footer">
            <button className="publish-property-content-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
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
