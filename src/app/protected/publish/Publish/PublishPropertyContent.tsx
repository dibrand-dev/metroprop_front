'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCallback } from 'react';
import './PublishPropertyContent.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, Brightness, BRIGHTNESS_LABELS, BRIGHTNESS_SELECT_OPTIONS, CreatePropertyDraft, GARAGE_COVERAGE_LABELS, GARAGE_SELECT_OPTIONS, GarageCoverage, OPERATION_TYPE_LABELS, Orientation, ORIENTATION_LABELS, ORIENTATION_SELECT_OPTIONS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS, TEMPORAL_RENT_PERIOD_OPTIONS } from '@/types/propiedad';
import { API_BASE_URL } from '@/utils/utils';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import Button from '@/ui/Button/Button';

const iconChevron = '/icons/chevron-up.svg';

interface PublishPropertyContentProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (data: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<CreatePropertyDraft>) => void;
}

export default function PublishPropertyContent({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit
}: PublishPropertyContentProps) {
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<AmenityType, boolean>>({
    [AmenityType.Rooms]: false,
    [AmenityType.Services]: false,
    [AmenityType.Extras]: false
  });

  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    (wizardData.tags || []).map((t: any) => typeof t === 'number' ? t : t.tag_id)
  );
  const [orientation, setOrientation] = useState(wizardData.orientation || undefined);
  const [floors_amount, setFloors_amount] = useState(wizardData.floors_amount || undefined);
  const [garage_coverage, setGarage_coverage] = useState(wizardData.garage_coverage || undefined);
  const [brightness, setBrightness] = useState(wizardData.brightness || undefined);
  const [surface_front, setSurface_front] = useState(wizardData.surface_front || undefined);
  const [surface_length, setSurface_length] = useState(wizardData.surface_length || undefined);
  const [semiroofed_surface, setSemiroofed_surface] = useState(wizardData.semiroofed_surface || undefined);
  const [period, setPeriod] = useState(wizardData.period || '');

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
    }
  }, [tagsData]);

  // Update wizard data when property content changes
  useEffect(() => {
    updateWizardData({
      tags: selectedAmenities,
      brightness,
      orientation,
      floors_amount,
      garage_coverage,
      surface_front,
      surface_length,
      semiroofed_surface
    });
  }, [selectedAmenities, brightness, orientation, floors_amount, garage_coverage, surface_front, surface_length, semiroofed_surface, updateWizardData]);

  const handleToggleAmenity = useCallback((optionId: number) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  }, []);
  const handleToggleGroup = (type: AmenityType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    const propertyContentUpdate = { 
      tags: selectedAmenities,
      brightness,
      orientation,
      floors_amount,
      garage_coverage,
      surface_front,
      surface_length,
      semiroofed_surface,
      period: wizardData.operation_type === 3 ? period : undefined,
    }
    onNext(propertyContentUpdate);
  };

  return (
    <div className="publish-property-content">
      <div className="publish-property-content-inner">
        <div className="publish-property-content-card">
          <div className="publish-property-content-top">
            <div className="publish-property-content-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-property-content-link" type="button" onClick={onSaveAndExit}>
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
              <h1>Sumá las comodidades adicionales</h1>
              <button className="publish-property-content-idea" type="button" aria-label="Idea">
                ?
              </button>
            </div>

            <div className="publish-property-content-groups">
              {amenityGroups.map((group) => {
                const isExpanded = expandedGroups[group.type];
                const visibleItems = isExpanded ? group.options : group.options.slice(0, 8);
                return (
                  <div key={group.type} className="publish-property-content-group">
                    <h2>{group.title}</h2>
                    <div className="publish-property-content-chip-grid">
                      {visibleItems.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`publish-chip ${selectedAmenities.includes(option.id) ? 'publish-chip-active' : ''}`}
                          onClick={() => handleToggleAmenity(option.id)}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                    {group.options.length > 8 && <button
                      type="button"
                      className="publish-property-content-more"
                      onClick={() => handleToggleGroup(group.type)}
                    >
                      {isExpanded ? 'Ver menos' : 'Ver mas'}
                      <img
                        src={iconChevron}
                        alt=""
                        className={isExpanded ? 'is-rotated' : ''}
                      />
                    </button>}
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
                    value={brightness?.toString() ?? ''}
                    onChange={(value) => setBrightness(value as any)}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Orientación"
                    options={ORIENTATION_SELECT_OPTIONS}
                    value={orientation?.toString() ?? ''}
                    onChange={(value) => setOrientation(value as any)}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Cantidad de plantas"
                    options={[{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4+', value: '4+' }]}
                    value={floors_amount?.toString() ?? ''}
                    onChange={(value) => setFloors_amount(value ? parseInt(value) : undefined)}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <Select
                    label="Cobertura cochera"
                    options={GARAGE_SELECT_OPTIONS}
                    value={garage_coverage?.toString() ?? ''}
                    onChange={(value) => setGarage_coverage(value as any)}
                    placeholder="Seleccionar"
                  />
                </div>
              </div>
              {wizardData.operation_type === 3 ? <div className="publish-property-content-detail-grid">                
                <div className="publish-property-content-detail-field">
                  <Select
                    options={TEMPORAL_RENT_PERIOD_OPTIONS}
                    value={period}
                    onChange={(value) => setPeriod(value)}
                    label="Periodo de alquiler temporal*"
                  /> 
                </div>
              </div> : null}
              <div className="publish-property-content-inputs">
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Frente del terreno (mts)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={surface_front ?? null}
                    onChange={(event) => setSurface_front(parseInt(event.target.value) || undefined)}
                    type="number"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Largo del terreno (mts)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={surface_length ?? null}
                    onChange={(event) => setSurface_length(parseInt(event.target.value) || undefined)}
                    type="number"
                  />
                </div>
                <div className="publish-property-content-detail-field">
                  <InputField
                    label="Superficie semicubierta (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={semiroofed_surface ?? null}
                    onChange={(event) => setSemiroofed_surface(parseInt(event.target.value) || undefined)}
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
            <Button label="Continuar" variant="primary" onClick={handleContinue} disabled={period === '' && wizardData.operation_type === 3}/>
          </div>
        </div>
      </div>
    </div>
  );
}
