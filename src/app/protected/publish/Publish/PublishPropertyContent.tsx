'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCallback } from 'react';
import './PublishPropertyContent.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, Brightness, BRIGHTNESS_LABELS, BRIGHTNESS_SELECT_OPTIONS, CreatePropertyDraft, DISPOSITION_OPTIONS, GARAGE_COVERAGE_LABELS, GARAGE_SELECT_OPTIONS, GarageCoverage, OPERATION_TYPE_LABELS, Orientation, ORIENTATION_LABELS, ORIENTATION_SELECT_OPTIONS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS, PropertyType, TEMPORAL_RENT_PERIOD_OPTIONS } from '@/types/propiedad';
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
  const [disposition, setDisposition] = useState(wizardData.disposition || undefined);
  const [appartments_per_floor, setAppartments_per_floor] = useState(wizardData.appartments_per_floor || undefined);



  
  /*
  export enum PropertyType {
    CASA = 1,                   // Casa
    DEPARTAMENTO = 2,           // Departamento
    TERRENO = 3,                // Terreno
    PH = 4,                     // PH
    GALPON_BODEGA = 5,          // Galpón / Bodega
    BOVEDA_NICHO_PARCELA = 6,   // Bóveda / Nicho / Parcela
    CAMA_NAUTICA = 7,           // Cama náutica
    CAMPO = 8,                  // Campo
    CONSULTORIO = 9,            // Consultorio
    DEPOSITO = 10,              // Depósito
    EDIFICIO = 11,              // Edificio
    FONDO_DE_COMERCIO = 12,     // Fondo de comercio
    GARAGE = 13,                // Garage
    HOTEL = 14,                 // Hotel
    LOCAL_COMERCIAL = 15,       // Local comercial
    OFICINA_COMERCIAL = 16,     // Oficina comercial
    QUINTA_VACACIONAL = 17,     // Quinta vacacional
    EMPRENDIMIENTO = 18,          // Emprendimiento
  }
  */
  console.log("wizardData.property_type",wizardData.property_type)
  const _pt = Number(wizardData.property_type);
  const showLuminoso = _pt !== PropertyType.GALPON_BODEGA && _pt !== PropertyType.BOVEDA_NICHO_PARCELA && _pt !== PropertyType.CAMA_NAUTICA && _pt !== PropertyType.DEPOSITO &&  _pt !== PropertyType.TERRENO && _pt !== PropertyType.GARAGE && _pt !== PropertyType.HOTEL && _pt !== PropertyType.FONDO_DE_COMERCIO  ;
  const showOrientacion = _pt !== PropertyType.GALPON_BODEGA && _pt !== PropertyType.BOVEDA_NICHO_PARCELA && _pt !== PropertyType.CAMA_NAUTICA && _pt !== PropertyType.CONSULTORIO && _pt !== PropertyType.DEPOSITO  && _pt !== PropertyType.FONDO_DE_COMERCIO && _pt !== PropertyType.GARAGE && _pt !== PropertyType.HOTEL  && _pt !== PropertyType.LOCAL_COMERCIAL && _pt !== PropertyType.OFICINA_COMERCIAL && _pt !== PropertyType.TERRENO;
  const showCantidadDePlantas = _pt !== PropertyType.BOVEDA_NICHO_PARCELA && _pt !== PropertyType.CAMA_NAUTICA && _pt !== PropertyType.CONSULTORIO && _pt !== PropertyType.DEPOSITO  && _pt !== PropertyType.EDIFICIO && _pt !== PropertyType.GARAGE && _pt !== PropertyType.HOTEL && _pt !== PropertyType.LOCAL_COMERCIAL && _pt !== PropertyType.OFICINA_COMERCIAL && _pt !== PropertyType.TERRENO && _pt !== PropertyType.TERRENO;
  const showCoverturaCochera = _pt !== PropertyType.BOVEDA_NICHO_PARCELA && _pt !== PropertyType.CAMA_NAUTICA && _pt !== PropertyType.DEPOSITO && _pt !== PropertyType.FONDO_DE_COMERCIO && _pt !== PropertyType.LOCAL_COMERCIAL && _pt !== PropertyType.OFICINA_COMERCIAL  && _pt !== PropertyType.PH && _pt !== PropertyType.QUINTA_VACACIONAL && _pt !== PropertyType.TERRENO;









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
      semiroofed_surface,
      disposition,
      appartments_per_floor
    });
  }, [selectedAmenities, brightness, orientation, floors_amount, garage_coverage, surface_front, surface_length, semiroofed_surface, disposition, appartments_per_floor, updateWizardData]);

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

  const handleContinue = (continueFlag = true) => {
    const propertyContentUpdate = { 
      tags: selectedAmenities,
      brightness,
      orientation,
      floors_amount,
      garage_coverage,
      surface_front,
      surface_length,
      semiroofed_surface,
      disposition,
      appartments_per_floor,
      period: wizardData.operation_type === 3 ? period : undefined,
    }
    if (!continueFlag) {
      onSaveAndExit(propertyContentUpdate);
    } else {
      onNext(propertyContentUpdate);
    }
  };

  console.log("wizardData", wizardData)

  return (
    <div className="publish-property-content">
      <div className="publish-property-content-inner">
        <div className="publish-property-content-card">
          <div className="publish-property-content-top">
            <div className="publish-property-content-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ?  '- ' + PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-property-content-link" type="button" onClick={() => handleContinue(false)}>
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
                {showLuminoso &&<div className="publish-property-content-detail-field">
                  <Select
                    label="Luminoso"
                    options={BRIGHTNESS_SELECT_OPTIONS}
                    value={brightness?.toString() ?? ''}
                    onChange={(value) => setBrightness(value as any)}
                    placeholder="Seleccionar"
                  />
                </div>}
                {showOrientacion && <div className="publish-property-content-detail-field">
                  <Select
                    label="Orientación"
                    options={ORIENTATION_SELECT_OPTIONS}
                    value={orientation?.toString() ?? ''}
                    onChange={(value) => setOrientation(value as any)}
                    placeholder="Seleccionar"
                  />
                </div>}
                {showCantidadDePlantas && <div className="publish-property-content-detail-field">
                  <Select
                    label="Cantidad de plantas"
                    options={[{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4+', value: '4+' }]}
                    value={floors_amount?.toString() ?? ''}
                    onChange={(value) => setFloors_amount(value ? parseInt(value) : undefined)}
                    placeholder="Seleccionar"
                  />
                </div>}
                {showCoverturaCochera && <div className="publish-property-content-detail-field">
                  <Select
                    label="Cobertura cochera"
                    options={GARAGE_SELECT_OPTIONS}
                    value={garage_coverage?.toString() ?? ''}
                    onChange={(value) => setGarage_coverage(value as any)}
                    placeholder="Seleccionar"
                  />
                </div>}
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
                {(wizardData.property_type == PropertyType.CASA || wizardData.property_type == PropertyType.DEPARTAMENTO || wizardData.property_type == PropertyType.PH) && (<div className="publish-property-content-detail-field">
                  <InputField
                    label="Superficie semicubierta (m2)"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={semiroofed_surface ?? null}
                    onChange={(event) => setSemiroofed_surface(parseInt(event.target.value) || undefined)}
                    type="number"
                  />
                </div>)}
              </div>


              
                <div className="publish-property-content-inputs">
                  {(wizardData.property_type == PropertyType.DEPARTAMENTO || wizardData.property_type == PropertyType.PH) && (
                  <div className="publish-property-content-detail-field">
                    <Select
                      label="Orientación"
                      options={DISPOSITION_OPTIONS}
                      placeholder="Selecciona una opción"
                      value={disposition ?? null}
                      onChange={(value) => setDisposition(value as any)}
                    />
                  </div>)}
                {(wizardData.property_type == PropertyType.DEPARTAMENTO || wizardData.property_type == PropertyType.EDIFICIO) && (<div className="publish-property-content-detail-field">
                  <InputField
                    label="Cantidad de pisos en edificio"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={floors_amount ?? null}
                    onChange={(event) => setFloors_amount(parseInt(event.target.value) || undefined)}
                    type="number"
                  />
                </div>)}
                {(wizardData.property_type == PropertyType.DEPARTAMENTO || wizardData.property_type == PropertyType.EDIFICIO) && (<div className="publish-property-content-detail-field">
                  <InputField
                    label="Departamentos por piso"
                    placeholder="Ingresa un numero mayor o igual a 0"
                    value={appartments_per_floor ?? null}
                    onChange={(event) => setAppartments_per_floor(parseInt(event.target.value) || undefined)}
                    type="number"
                  />
                </div>)}
              </div>
            </div>
          </div>

          <div className="publish-property-content-footer">            
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-property-content-back"
            />
            <Button label="Continuar" variant="primary" onClick={() => handleContinue(true)} disabled={period === '' && wizardData.operation_type === 3}/>
          </div>
        </div>
      </div>
    </div>
  );
}
