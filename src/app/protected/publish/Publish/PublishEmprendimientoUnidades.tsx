'use client';

import { useState, useRef, useCallback } from 'react';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import Checkbox from '@/ui/Checkbox/Checkbox';
import './PublishEmprendimientoUnidades.scss';
import { CreateProperty, CreatePropertyDraft, currencySelectOptions, OperationType, PropertyType, roomsConfig, unitSelectOptions } from '@/types/propiedad';
import InputField from '@/ui/InputField/InputField';
import EmprendimientoImages, { EmprendimientoImagesRef } from './EmprendimientoImages';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';

interface PublishEmprendimientoProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (emprendimientoUpdate: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  goToStep: (step: EmprendimientoStep) => void;
}

type RoomKey = (typeof roomsConfig)[number]['key'];

export default function PublishEmprendimientoUnidades({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  goToStep,
}: PublishEmprendimientoProps) {
  const { data: sessionData } = useSession();

  // Images component ref
  const imagesRef = useRef<EmprendimientoImagesRef>(null);  
  const [hasImages, setHasImages] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImagesStatusChange = useCallback((status: { hasImages: boolean; hasPlans: boolean }) => {
    setHasImages(status.hasImages);
    setHasPlans(status.hasPlans);
  }, []);
  
  // Form state for new unit
  const [publication_title, setPublicationTitle] = useState('');
  const [description, setDescription] = useState('');
  const [development_unit_type, setDevelopmentUnitType] = useState('');
   
  // Price state
  const [currency, setCurrency] = useState('ARS');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [expenses, setExpenses] = useState<number | undefined>(undefined);
  const [currency_expenses, setCurrency_expenses] = useState('ARS');
  const [withoutExpenses, setWithoutExpenses] = useState(false);
  
  /* Ambientes state */
  const [rooms, setRooms] = useState<Record<RoomKey, number>>({    
    room_amount: wizardData.room_amount || 0,
    suite_amount: wizardData.suite_amount || 0,
    bathroom_amount: wizardData.bathroom_amount || 0,
    toilet_amount: wizardData.toilet_amount || 0,
    parking_lot_amount: wizardData.parking_lot_amount || 0,    
  });
  const [surface_measurement, setSurface_measurement] = useState(wizardData.surface_measurement || "M2");
  const [roofed_surface_measurement, setRoofed_surface_measurement] = useState(wizardData.roofed_surface_measurement || "M2");
  const [total_surface, setTotal_surface] = useState(wizardData.total_surface || "");
  const [roofed_surface, setRoofed_surface] = useState(wizardData.roofed_surface || "");  
  const [development_units_total, setDevelopment_units_total] = useState<number | undefined>(undefined);
  // Units list
  const [unidades, setUnidades] = useState<CreateProperty[]>([]);
  const [draftId, setDraftId] = useState<string | undefined>();

  const handleAgregarUnidad = async (goToNextStep: boolean) => {
    const nuevaUnidad: CreateProperty = {
      publication_title,
      description,
      development_unit_type,
      price,
      currency,
      expenses: withoutExpenses ? 0 : expenses,
      currency_expenses,
      surface_measurement,
      roofed_surface_measurement,
      total_surface,
      roofed_surface,
      room_amount: rooms.room_amount,
      suite_amount: rooms.suite_amount,
      bathroom_amount: rooms.bathroom_amount,
      toilet_amount: rooms.toilet_amount,
      parking_lot_amount: rooms.parking_lot_amount,
      development_units_total,
      development_id: wizardData.draft_id || undefined,
      operation_type: OperationType.VENTA,
      property_type: PropertyType.DEPARTAMENTO,
    };

    try {
      setIsUploading(true);
      const draftData = await createDraftMutation.mutateAsync(nuevaUnidad);
      setDraftId(draftData.id);
      setUnidades([...unidades, nuevaUnidad]);

      if (hasImages || hasPlans) {
        await imagesRef.current?.submit();
        if (goToNextStep) {
          onNext();
        }       
      } else {
        onNext();
      }
    } catch (error: any) {
      console.error('Error creating draft:', error?.message || error);      
    } finally {
      setIsUploading(false);
      resetForm();
    }
    
  };

  const resetForm = () => {
    // Reset form
    setPublicationTitle('');
    setDescription('');
    setDevelopmentUnitType('');
    setPrice(undefined);
    setExpenses(undefined);
    setRooms({
      room_amount: 0,
      suite_amount: 0,
      bathroom_amount: 0,
      toilet_amount: 0,
      parking_lot_amount: 0,
    });
    setSurface_measurement("M2");
    setRoofed_surface_measurement("M2");
    setTotal_surface('');
    setRoofed_surface('');
    setDevelopment_units_total(undefined);
  }

  const handleVolver = () => {
    onBack();
  };

  const handleCounterChange = (key: RoomKey, delta: number) => {
    setRooms((prev) => {
      const nextValue = Math.max(0, prev[key] + delta);
      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  const createDraftMutation = useMutation({
    mutationFn: async (draftData: Partial<CreatePropertyDraft>) => {
      const user_id = sessionData?.user?.id;
      const organization_id = sessionData?.user?.organization_id ?? undefined;
      const branch_id = sessionData?.user?.branch_id;
      if (!user_id) throw new Error('User not authenticated');

      return apiFetch(`${API_BASE_URL}/properties/draft`, {
        method: 'POST',
        body: {
          user_id,
          organization_id,
          branch_id,
          //operation_type: draftData.operation_type,
          //property_type: draftData.property_type,
          // is_development: draftData.is_development,
          // ...(draftData.property_subtype && { property_subtype: draftData.property_subtype }),
          ...draftData
        },
      });
    }
  });
  
  return (
    <div className="publish-emprendimiento-unidades">
      <div className="publish-emprendimiento-unidades-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-text">Emprendimientos</span>
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="title">Publicar emprendimiento</h1>
          <span className="required-text">Datos obligatorios(*)</span>
        </div>

        {/* Secondary Menu / Tabs */}
        <EmprendimientoTabs currentStep="emprendimiento-units" goToStep={goToStep} />

        {/* Main Content */}
        <div className="main-content">
          {/* Agregar unidad section */}
          <section className="section">
            <h2 className="section-title">Agregar unidad</h2>

            {/* Unit Name */}
            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Nombre de la unidad</label>
                <p className="field-description">
                  Incluye el tipo de propiedad y su característica principal
                </p>
                <InputField2
                  placeholder="Ej: Departamento 2 ambientes con balcón"
                  value={publication_title}
                  onChange={(e) => setPublicationTitle(e.target.value)}
                />
                <span className="character-count">{publication_title.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Descripción*</label>
                <textarea
                  className="textarea-field"
                  placeholder="Describe las características de esta unidad"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={10000}
                />               
              </div>
            </div>
         
            <div className="form-group">
              <div className="form-field full-width">
                <Select
                  label="Tipo de unidad"
                  options={[
                    { value: 'departamento', label: 'Departamento' },
                    { value: 'casa', label: 'Casa' },
                    { value: 'ph', label: 'PH' },
                    { value: 'duplex', label: 'Duplex' },
                    { value: 'local', label: 'Local' },
                    { value: 'oficina', label: 'Oficina' },
                  ]}
                  value={development_unit_type}
                  onChange={setDevelopmentUnitType}
                  placeholder="Seleccionar"
                />
              </div>
            </div>            
          </section>

          {/* Price Section */}
          <section className="section">
            <h2 className="section-title">Precio</h2>
            <div className="publish-price-fields">
              <div className="publish-price-field">
                <label>Precio*</label>
                <div className="publish-price-inputs">
                  <Select
                    options={currencySelectOptions}
                    value={currency}
                    onChange={(value) => setCurrency(value)}
                  />
                  <InputField2
                    value={price ?? null}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    placeholder={'Ej. 700000'}
                    type="number"
                  />
                </div>
              </div>

              <div className="publish-price-field">
                <label>Expensas</label>
                <div className="publish-price-inputs">
                  <Select
                    options={currencySelectOptions}
                    value={currency_expenses}
                    onChange={(value) => setCurrency_expenses(value)}
                    disabled={withoutExpenses}
                  />
                  <InputField
                    value={expenses ?? null}
                    onChange={(event) => setExpenses(Number(event.target.value))}
                    placeholder="Ej. 100000"
                    type="number"
                    disabled={withoutExpenses}
                  />
                </div>
                <Checkbox
                  label="Sin expensas"
                  checked={withoutExpenses}
                  onChange={(checked) => setWithoutExpenses(checked)}
                />
              </div>
            </div>
          </section>

          {/* Ambientes Section */}
          <section className="section">
            <h2 className="section-title">Ambientes</h2>

            <div className="publish-main-info-block">
              <h2>Ambientes principales*</h2>
              <div className="publish-main-info-rooms">
                {roomsConfig.map((room) => (
                  <div key={room.key} className="publish-main-info-room">
                    <span>{room.label}</span>
                    <div className="publish-main-info-counter">
                      <button
                        type="button"
                        className="publish-main-info-counter-btn"
                        onClick={() => handleCounterChange(room.key, -1)}
                        disabled={rooms[room.key] === 0}
                        aria-label={`Restar ${room.label}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="14" viewBox="0 0 10 14" fill="none">
                          <path d="M9.98217 12.666V0.665958C9.98178 0.544464 9.94828 0.425374 9.88525 0.321507C9.82222 0.217641 9.73206 0.132931 9.62446 0.0764942C9.51687 0.0200586 9.39593 -0.00596619 9.27464 0.00122261C9.15336 0.00841141 9.03634 0.0485411 8.93617 0.117291L0.2695 6.11729C-0.0898333 6.36596 -0.0898333 6.96462 0.2695 7.21396L8.93617 13.214C9.03613 13.2834 9.15321 13.3241 9.2747 13.3317C9.39618 13.3393 9.51742 13.3134 9.62524 13.2569C9.73306 13.2005 9.82333 13.1155 9.88626 13.0113C9.94919 12.9071 9.98236 12.7877 9.98217 12.666Z" fill="#1E1E1E"/>
                        </svg>
                      </button>
                      <span className="publish-main-info-counter-value">
                        {rooms[room.key] === 0 ? '-' : rooms[room.key]}
                      </span>
                      <button
                        type="button"
                        className="publish-main-info-counter-btn is-active"
                        onClick={() => handleCounterChange(room.key, 1)}
                        aria-label={`Sumar ${room.label}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="14" viewBox="0 0 10 14" fill="none">
                          <path d="M0.000256538 0.667049V12.667C0.000637054 12.7885 0.0341463 12.9076 0.0971746 13.0115C0.160204 13.1154 0.250366 13.2001 0.357958 13.2565C0.465549 13.3129 0.586496 13.339 0.707778 13.3318C0.829061 13.3246 0.946085 13.2845 1.04626 13.2157L9.71292 7.21572C10.0723 6.96705 10.0723 6.36838 9.71292 6.11905L1.04626 0.119049C0.946294 0.049599 0.82921 0.00887192 0.707726 0.00129262C0.586242 -0.00628669 0.465004 0.0195717 0.357184 0.0760585C0.249365 0.132545 0.159087 0.2175 0.0961599 0.321692C0.0332336 0.425884 6.48499e-05 0.545329 0.000256538 0.667049Z" fill="#1E1E1E"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="superficie">
              <h3 className="subsection-title">Superficie</h3>
              <div className="publish-main-info-surface">
                <div className="publish-main-info-surface-item">
                  
                  <div className="publish-main-info-input-row">
                    <Select
                      label="Total"
                      options={unitSelectOptions}
                      value={surface_measurement}
                      onChange={(value) => setSurface_measurement(value)}
                      placeholder=""
                    />
                    <InputField
                      placeholder="Ingresar superficie"
                      type="number"
                      value={total_surface ?? undefined}
                      onChange={(event) => setTotal_surface(parseInt(event.target.value))}
                    />
                  </div>
                </div>

                <div className="publish-main-info-surface-item">
                  <div className="publish-main-info-input-row">
                    <Select
                      label="Cubierta"
                      options={unitSelectOptions}
                      value={roofed_surface_measurement}
                      onChange={(value) => setRoofed_surface_measurement(value)}
                      placeholder=""
                    />
                    <InputField
                      placeholder="Ingresar superficie"
                      type="number"
                      value={roofed_surface ?? undefined}
                      onChange={(event) => setRoofed_surface(parseInt(event.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Unidades disponibles */}          
          <section className="section">
            <h2 className="section-title">Unidades disponibles</h2>            
            <InputField
              placeholder="Ej 80"
              type="number"
              value={development_units_total ?? undefined}
              onChange={(event) => setDevelopment_units_total(parseInt(event.target.value))}
            />
          </section>

          {/* Images Section */}
          <EmprendimientoImages
            ref={imagesRef}
            draftId={draftId}
            onUploadStatusChange={handleImagesStatusChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label={isUploading ? 'Subiendo...' : "Guardar y agregar otra unidad"}  
            variant="secondary"
            buttonType="1"
            onClick={() => handleAgregarUnidad(false)}
            disabled={isUploading}
          />
          <Button
            label={isUploading ? 'Subiendo...' : "Guardar y finalizar"}
            variant="primary"
            buttonType="1"
            onClick={() => handleAgregarUnidad(true)}
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}
