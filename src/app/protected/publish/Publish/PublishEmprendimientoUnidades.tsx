'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import Checkbox from '@/ui/Checkbox/Checkbox';
import './PublishContent.scss';
import './PublishEmprendimientoUnidades.scss';
import { CreateProperty, CreatePropertyDraft, currencySelectOptions, OperationType, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_SELECT_OPTIONS, PropertyStatus, PropertyType, roomsConfig, unitSelectOptions } from '@/types/propiedad';
import InputField from '@/ui/InputField/InputField';
import EmprendimientoImages, { EmprendimientoImagesRef } from './EmprendimientoImages';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, setImagePath, formatCurrency, formatNumbers } from '@/utils/utils';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';

interface PublishEmprendimientoProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: () => void;
  goToStep: (step: EmprendimientoStep) => void;
}

type RoomKey = (typeof roomsConfig)[number]['key'];
const iconEdit = '/icons/pencil.svg';
const iconTrash = '/icons/trash.svg';
export default function PublishEmprendimientoUnidades({
  wizardData,
  updateWizardData,
  onNext,
  goToStep,
}: PublishEmprendimientoProps) {
  // Images component ref
  const imagesRef = useRef<EmprendimientoImagesRef>(null);  
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('¡Unidad agregada con éxito!');
  const [submitted, setSubmitted] = useState(false);
  const [hasImages, setHasImages] = useState(false);

  const handleImagesStatusChange = useCallback((status: { hasImages: boolean; hasPlans: boolean }) => {
    setHasImages(status.hasImages);
  }, []);
  
  // Form state for new unit
  const [publication_title, setPublicationTitle] = useState('');
  const [description, setDescription] = useState('');
  const [property_type, setPropertyType] = useState<PropertyType | undefined>(undefined);
   
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
  const [units, setUnits] = useState<CreateProperty[]>(wizardData.development_units ?? []);
  const [editingUnitId, setEditingUnitId] = useState<number | undefined>(undefined);
  const [unitThumbnails, setUnitThumbnails] = useState<Record<number, string>>(wizardData.unitThumbnails ?? {});
  const [pendingDeleteId, setPendingDeleteId] = useState<number | undefined>(undefined);


  const isFormValid = publication_title.trim() !== '' && !!property_type && !!total_surface && !!roofed_surface && hasImages;
  const isDirty = publication_title.trim() !== '' || !!property_type || !!total_surface || !!roofed_surface || hasImages || !!price || description.trim() !== '';

  const getUnitThumbnail = (unit: CreateProperty): string | undefined => {
    if (unit.id && unitThumbnails[unit.id]) {
      return unitThumbnails[unit.id];
    }

    const firstImageUrl = unit.images?.[0]?.url;
    if (firstImageUrl) {
      return setImagePath(firstImageUrl);
    }

    return undefined;
  };

  // Keep local units in sync when wizard data is hydrated/updated from parent.
  useEffect(() => {
    setUnits(wizardData.development_units ?? []);
  }, [wizardData.development_units]);

  const agregarUnidad = async () => {
    setSubmitted(true);
    if (!isFormValid) return;
    const nuevaUnidad: CreateProperty = {
      publication_title,
      description,
      property_type,
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
      development_available_unit_count: development_units_total,
      operation_type: OperationType.VENTA,
      reference_code: "UNIT-" + Date.now(), // This should ideally be generated by the backend
      status: PropertyStatus.DISPONIBLE
    };
    const formData = new FormData();

    // Append unit data fields
    Object.entries(nuevaUnidad).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Append images and plans from the images component
    const files = imagesRef.current?.getFiles();
    if (files) {
      files.images.forEach(file => formData.append('images', file));
      files.plans.forEach(file => formData.append('attached', file));
    }

    const savedUnit = await apiFetch<CreateProperty>(`${API_BASE_URL}/properties/development/${wizardData.draft_id}/units`, {
      method: 'POST',
      body: formData,
    });

    const unitId = (savedUnit as any)?.data?.id ?? (savedUnit as any)?.id;
    const unitData: CreateProperty = (savedUnit as any)?.data ?? savedUnit;

    const newThumbnails = (files && files.images.length > 0 && unitId)
      ? { ...unitThumbnails, [unitId]: URL.createObjectURL(files.images[0]) }
      : unitThumbnails;
    const newUnits = [...units, unitData];
    setUnitThumbnails(newThumbnails);
    setUnits(newUnits);
    updateWizardData({ development_units: newUnits, unitThumbnails: newThumbnails });    
  };

  const handleContinuar = async (goToNextStep: boolean) => {
    setIsUploading(true);
    try {
      await agregarUnidad();
      if (goToNextStep) {
        onNext();
      } else {
        resetForm();
        setSuccessModalTitle('¡Unidad agregada con éxito!');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (error: any) {
      console.error('Error creating unit:', error?.message || error);      
    } finally {
      setIsUploading(false);
    }
  }

  const resetForm = () => {
    // Reset form
    setSubmitted(false);
    setEditingUnitId(undefined);
    setPublicationTitle('');
    setDescription('');
    setPropertyType(undefined);
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
    imagesRef.current?.resetFiles();
  }

  const handleCounterChange = (key: RoomKey, delta: number) => {
    setRooms((prev) => {
      const nextValue = Math.max(0, prev[key] + delta);
      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  const handleEdit = async (unitId: number) => {
    let unit: CreateProperty | undefined = units.find(u => u.id === unitId);
    try {
      const fetched = await apiFetch<CreateProperty>(
        `${API_BASE_URL}/properties/development/${wizardData.draft_id}/units/${unitId}`,
      );
      unit = (fetched as any)?.data ?? fetched;
      // Sync the fetched data back into the units list so wizardData stays fresh
      const newUnits = units.map(u => u.id === unitId ? { ...u, ...unit } : u);
      setUnits(newUnits);
      updateWizardData({ development_units: newUnits });
    } catch (error: any) {
      console.error('Error fetching unit:', error?.message || error);
    }
    if (!unit) return;
    setEditingUnitId(unitId);
    setPublicationTitle(unit.publication_title ?? '');
    setDescription(unit.description ?? '');
    setPropertyType(unit.property_type as PropertyType | undefined);
    setPrice(unit.price);
    setCurrency(unit.currency ?? 'ARS');
    setExpenses(unit.expenses ?? undefined);
    setCurrency_expenses(unit.currency_expenses ?? 'ARS');
    setWithoutExpenses(unit.expenses === 0);
    setRooms({
      room_amount: unit.room_amount ?? 0,
      suite_amount: unit.suite_amount ?? 0,
      bathroom_amount: unit.bathroom_amount ?? 0,
      toilet_amount: unit.toilet_amount ?? 0,
      parking_lot_amount: unit.parking_lot_amount ?? 0,
    });
    setSurface_measurement(unit.surface_measurement ?? 'M2');
    setRoofed_surface_measurement(unit.roofed_surface_measurement ?? 'M2');
    setTotal_surface(unit.total_surface ?? '');
    setRoofed_surface(unit.roofed_surface ?? '');
    setDevelopment_units_total(unit.development_available_unit_count ?? undefined);
    setSubmitted(false);
    imagesRef.current?.setExistingImages(unit.images ?? [], unit.attached ?? unit.plans ?? []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditarUnidad = async () => {
    setSubmitted(true);
    if (!isFormValid || !editingUnitId) return;
    const updatedUnit: Partial<CreateProperty> = {
      publication_title,
      description,
      property_type,
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
      development_available_unit_count: development_units_total,
    };
    try {
      setIsUploading(true);

      // Step 1: PATCH unit data as JSON (the endpoint does not accept multipart)
      const saved = await apiFetch<CreateProperty>(
        `${API_BASE_URL}/properties/development/${wizardData.draft_id}/units/${editingUnitId}`,
        { method: 'PATCH', body: updatedUnit },
      );

      // Step 2: save media — existing URLs are re-sent to preserve them, new files are appended
      const mediaFormData = new FormData();
      imagesRef.current?.appendFilesToFormData(mediaFormData);
      await apiFetch(`${API_BASE_URL}/properties/${editingUnitId}/save-multimedia`, {
        method: 'POST',
        body: mediaFormData,
      });

      const files = imagesRef.current?.getFiles();
      const savedData: CreateProperty = (saved as any)?.data ?? saved;
      let newThumbnails = unitThumbnails;
      if (files && files.images.length > 0) {
        newThumbnails = { ...unitThumbnails, [editingUnitId]: URL.createObjectURL(files.images[0]) };
        setUnitThumbnails(newThumbnails);
      }
      const newUnits = units.map(u => u.id === editingUnitId ? { ...u, ...savedData } : u);
      setUnits(newUnits);
      updateWizardData({ development_units: newUnits, unitThumbnails: newThumbnails });
      resetForm();
      setSuccessModalTitle('Unidad editada con exito');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      console.error('Error updating unit:', error?.message || error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (unitId: number) => {
    try {
      await apiFetch(`${API_BASE_URL}/properties/development/${wizardData.draft_id}/units/${unitId}`, {
        method: 'DELETE',
      });
      const newUnits = units.filter(u => u.id !== unitId);
      setUnits(newUnits);
      updateWizardData({ development_units: newUnits });
      if (editingUnitId === unitId) resetForm();
    } catch (error: any) {
      console.error('Error deleting unit:', error?.message || error);
    } finally {
      setPendingDeleteId(undefined);
    }
  };

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
        <EmprendimientoTabs currentStep="emprendimiento-units" goToStep={async (step) => { await agregarUnidad(); goToStep(step); }} disabled={isUploading || (isDirty && !isFormValid)} />

        {units.length > 0 && (
          <div className="unit-list">
            {units.map((unit) => {
              const unitData: CreateProperty = unit;
              const thumbnailSrc = getUnitThumbnail(unitData);
              return (
              <div key={unit.id} className="unit-list-item">
                {thumbnailSrc ? (
                  <img className="unit-list-thumbnail" src={thumbnailSrc} alt="" />
                ) : (
                  <div className="unit-list-thumbnail unit-list-thumbnail--empty" />
                )}
                <div className="unit-list-title" title={unitData.publication_title}>{unitData.publication_title}</div>
                <div className="unit-list-type">{PROPERTY_TYPE_LABELS[unitData.property_type as PropertyType] ?? unitData.property_type}</div>
                <div className="unit-list-price">{formatCurrency(unitData.currency)} {formatNumbers(unitData.price)}</div>
                <div className="unit-list-rooms">{unitData.room_amount ?? 0} amb.</div>
                <div className="unit-list-surface">{formatNumbers(unitData.total_surface)} {unitData.surface_measurement}</div>
                <div className="unit-list-actions">
                  <button
                    className="collaborators-action-button"
                    type="button"
                    aria-label="Guardar y finalizar"
                    onClick={() => handleEdit(unitData.id!)}
                  >
                    <img src={iconEdit} alt="" />
                  </button>
                  <button
                    className="collaborators-action-button"
                    type="button"
                    aria-label="Eliminar unidad"
                    onClick={() => setPendingDeleteId(unitData.id!)}
                  >
                    <img src={iconTrash} alt="" />
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}




        {/* Main Content */}
        <div className="main-content">
          {/* Agregar unidad section */}
          <section className="section">
            <h2 className="section-title">Agregar unidad</h2>

            {/* Unit Name */}
            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Nombre de la unidad*</label>
                <p className="field-description">
                  Incluye el tipo de propiedad y su característica principal
                </p>
                <InputField
                  placeholder="Ej: Departamento 2 ambientes con balcón"
                  value={publication_title}
                  onChange={(e) => setPublicationTitle(e.target.value)}
                  error={submitted && !publication_title.trim() ? 'Este campo es obligatorio' : ''}
                />
                <span className="character-count">{publication_title.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Descripción</label>
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
                  label="Tipo de unidad*"
                  options={PROPERTY_TYPE_SELECT_OPTIONS}
                  value={property_type ? String(property_type) : undefined}
                  onChange={(value) => setPropertyType(value ? parseInt(value) as PropertyType : undefined)}
                  placeholder="Seleccionar"
                  error={submitted && !property_type ? 'Este campo es obligatorio' : ''}
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
                  <InputField
                    value={price ?? ''}
                    onChange={(event) => setPrice(Number(event.target.value) || undefined)}
                    placeholder={'Ej. 700000'}
                    type="number"
                    error={submitted && !price ? ' ' : ''}
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
                    value={expenses ?? ''}
                    onChange={(event) => setExpenses(Number(event.target.value) || undefined)}
                    placeholder="Ej. 100000"
                    type="number"
                    disabled={withoutExpenses}
                    error={submitted && !expenses ? ' ' : ''}
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
              <h2>Ambientes principales</h2>
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
                      label="Total*"
                      options={unitSelectOptions}
                      value={surface_measurement}
                      onChange={(value) => setSurface_measurement(value)}
                      placeholder=""
                    />
                    <InputField
                      placeholder="Ingresar superficie"
                      type="number"
                      value={total_surface ? String(total_surface) : ''}
                      onChange={(event) => setTotal_surface(parseInt(event.target.value))}
                      error={submitted && !total_surface ? ' ' : ''}
                    />
                  </div>
                </div>

                <div className="publish-main-info-surface-item">
                  <div className="publish-main-info-input-row">
                    <Select
                      label="Cubierta*"
                      options={unitSelectOptions}
                      value={roofed_surface_measurement}
                      onChange={(value) => setRoofed_surface_measurement(value)}
                      placeholder=""
                    />
                    <InputField
                      placeholder="Ingresar superficie"
                      type="number"
                      value={roofed_surface ? String(roofed_surface) : ''}
                      onChange={(event) => setRoofed_surface(parseInt(event.target.value))}
                      error={submitted && !roofed_surface ? ' ' : ''}
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
            onUploadStatusChange={handleImagesStatusChange}
            units
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {editingUnitId ? (
            <>
              <Button
                label="Cancelar"
                variant="secondary"
                buttonType="1"
                onClick={() => resetForm()}
                disabled={isUploading}
              />
              <Button
                label={isUploading ? 'Guardando...' : 'Editar unidad'}
                variant="primary"
                buttonType="1"
                onClick={handleEditarUnidad}
                disabled={isUploading}
              />
            </>
          ) : (
            <>
              <Button
                label={isUploading ? 'Subiendo...' : "Guardar y agregar otra unidad"}  
                variant="secondary"
                buttonType="1"
                onClick={() => handleContinuar(false)}
                disabled={isUploading || !isFormValid}
              />
              <Button
                label={isUploading ? 'Subiendo...' : "Guardar y finalizar"}
                variant="primary"
                buttonType="1"
                onClick={() => handleContinuar(true)}
                disabled={isUploading || !isFormValid}
              />
            </>
          )}
        </div>
      </div>
      {showSuccessModal && <SuccessModal title={successModalTitle} text="La unidad fue guardada correctamente." />}
      {pendingDeleteId !== undefined && (
        <AreYouSureModal
          title="Eliminar unidad"
          text="¿Estás seguro de que querés eliminar esta unidad? Esta acción no se puede deshacer."
          acceptText="Eliminar"
          cancelText="Cancelar"
          onAccept={() => handleDelete(pendingDeleteId)}
          onCancel={() => setPendingDeleteId(undefined)}
        />
      )}
    </div>
  );
}
