'use client';

import { useState, useEffect } from 'react';
import './PublishMainInfo.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import { 
  CreatePropertyDraft, 
  OPERATION_TYPE_LABELS, 
  PROPERTY_TYPE_LABELS, 
  PROPERTY_SUBTYPE_LABELS, 
  roomsConfig,
  unitSelectOptions,
  PropertyType
} from '@/types/propiedad';
import Button from '@/ui/Button/Button';
import { formatNumbers } from '@/utils/utils';

const iconChevron = '/icons/chevron-up.svg';

type RoomKey = (typeof roomsConfig)[number]['key'];

type AntiquityOption = 'construction' | 'new' | 'years';

interface PublishMainInfoProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (mainInfo: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: (mainInfo: Partial<CreatePropertyDraft>) => void;
}

export default function PublishMainInfo({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit
}: PublishMainInfoProps) {
  const [surface_measurement, setSurface_measurement] = useState(wizardData.surface_measurement || "M2");
  const [roofed_surface_measurement, setRoofed_surface_measurement] = useState(wizardData.roofed_surface_measurement || "M2");
  const [total_surface, setTotal_surface] = useState(wizardData.total_surface || "");
  const [roofed_surface, setRoofed_surface] = useState(wizardData.roofed_surface || "");
  const [property_condition, setProperty_condition] = useState<AntiquityOption | string | undefined>(wizardData.age === -1 ? "construction" : wizardData.age === 0 ? "new" : wizardData.age ? "years" : undefined);
  const [age, setAge] = useState(wizardData.age || undefined);
  const [rooms, setRooms] = useState<Record<RoomKey, number>>({    
    room_amount: wizardData.room_amount || 0,
    suite_amount: wizardData.suite_amount || 0,
    bathroom_amount: wizardData.bathroom_amount || 0,
    toilet_amount: wizardData.toilet_amount || 0,
    parking_lot_amount: wizardData.parking_lot_amount || 0,    
  });
  const _pt = Number(wizardData.property_type);
  const showRooms = _pt !== PropertyType.TERRENO && _pt !== PropertyType.CAMPO && _pt !== PropertyType.BOVEDA_NICHO_PARCELA && _pt !== PropertyType.CAMA_NAUTICA && _pt !== PropertyType.GARAGE && _pt !== PropertyType.HOTEL && _pt !== PropertyType.QUINTA_VACACIONAL && _pt !== PropertyType.EDIFICIO;
  const showRoofedSurface = _pt !== PropertyType.TERRENO && _pt !== PropertyType.BOVEDA_NICHO_PARCELA && _pt !== PropertyType.CAMA_NAUTICA;

  // Update wizard data when main info changes
  useEffect(() => {
    updateWizardData({
        surface_measurement,
        roofed_surface_measurement,
        total_surface,
        roofed_surface,
        property_condition,
        age,
        room_amount: rooms.room_amount,
        suite_amount: rooms.suite_amount,
        bathroom_amount: rooms.bathroom_amount,
        toilet_amount: rooms.toilet_amount,
        parking_lot_amount: rooms.parking_lot_amount,
    });
  }, [surface_measurement, roofed_surface_measurement, total_surface, roofed_surface, property_condition, age, rooms, updateWizardData]);

  const handleCounterChange = (key: RoomKey, delta: number) => {
    setRooms((prev) => {
      const nextValue = Math.max(0, prev[key] + delta);
      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  const handleBack = () => {
    onBack();
  };

  const handleContinue = (continueFlag = true) => {
    const mainInfoUpdate = { 
      surface_measurement,
      roofed_surface_measurement,
      total_surface,
      roofed_surface,
      age: property_condition === "construction" ? -1 : property_condition === "new" ? 0 : age,
      room_amount: rooms.room_amount,
      suite_amount: rooms.suite_amount,
      bathroom_amount: rooms.bathroom_amount,
      toilet_amount: rooms.toilet_amount,
      parking_lot_amount: rooms.parking_lot_amount,
    }
    if (!continueFlag) {
      onSaveAndExit(mainInfoUpdate);
    } else {
      onNext(mainInfoUpdate);
    }
  };

  const handleChangeSurfaceInput = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    // limpiar todo lo que no sea número
    const raw = event.target.value.replace(/\D/g, "");

    if (raw === "") {
      if('roofed_surface' === field) {
        setRoofed_surface("");
      } else if('total_surface' === field) {
        setTotal_surface("");
      }

      return;
    }
    const parsed = parseInt(raw, 10);
    if('roofed_surface' === field) {
      setRoofed_surface(isNaN(parsed) ? "" : parsed);
    } else if('total_surface' === field) {
      setTotal_surface(isNaN(parsed) ? "" : parsed);
    }
  }

  return (
    <div className="publish-main-info">
      <div className="publish-main-info-inner">
        <div className="publish-main-info-card">
          <div className="publish-main-info-top">
            <div className="publish-main-info-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ?  '- ' + PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-main-info-link" type="button" onClick={() => handleContinue(false)}>
              Guardar y salir
            </button>
          </div>

          <div className="publish-main-info-status">
            <span className="publish-main-info-segment is-filled" />
            <span className="publish-main-info-segment is-partial" />
            <span className="publish-main-info-segment" />
          </div>

          <div className="publish-main-info-section">
            <div className="publish-main-info-title">
              <h1>Ingresá la información principal</h1>
              <span>Datos obligatorios(*)</span>
            </div>

            <div className="publish-main-info-block">
              <h2>Superficie*</h2>
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
                      type="text"
                      value={total_surface !== undefined && total_surface !== null && total_surface !== '' ? formatNumbers(Number(total_surface)) : ""}
                      onChange={(event) => handleChangeSurfaceInput(event, 'total_surface')}
                    />
                  </div>
                </div>

                {showRoofedSurface && <div className="publish-main-info-surface-item">
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
                      type="text"
                      value={roofed_surface !== undefined && roofed_surface !== null && roofed_surface !== '' ? formatNumbers(Number(roofed_surface)) : ""}
                      onChange={(event) => handleChangeSurfaceInput(event, 'roofed_surface')}
                    />
                  </div>
                </div>}
              </div>
            </div>

            <div className="publish-main-info-block">
              <h2>Antigüedad*</h2>
              <div className="publish-main-info-antiquity">
                <button
                  type="button"
                  className={`publish-chip ${
                    property_condition === 'construction' ? 'publish-chip-active' : ''
                  }`}
                  onClick={() => setProperty_condition('construction')}
                >
                  En construccion
                </button>
                <button
                  type="button"
                  className={`publish-chip ${
                    property_condition === 'new' ? 'publish-chip-active' : ''
                  }`}
                  onClick={() => setProperty_condition('new')}
                >
                  A estrenar
                </button>
                <button
                  type="button"
                  className={`publish-chip ${
                    property_condition === 'years' ? 'publish-chip-active' : ''
                  }`}
                  onClick={() => setProperty_condition('years')}
                >
                  Años de la propiedad
                </button>
                <div className="publish-main-info-year" style={{ display: property_condition !== 'years' ? 'none' : 'block' }}>
                  <InputField
                    placeholder="Ingresar antigüedad"
                    type="number"
                    value={age ?? ''}
                    onChange={(event) => setAge(parseInt(event.target.value))}
                  />
                </div>
              </div>
            </div>

            {showRooms ? (
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
            ) : null}
          </div>

          <div className="publish-main-info-footer">
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-content-back"
            />
            <Button
              label="Continuar"
              type="button" 
              onClick={() => handleContinue(true)}
              disabled={total_surface === undefined || total_surface <= 0 || isNaN(total_surface) || total_surface === '' || (showRoofedSurface && (roofed_surface === undefined || roofed_surface <= 0 || roofed_surface === '' || isNaN(roofed_surface))) || property_condition === undefined || (property_condition === 'years' && (age === undefined || age <= 0 || age === '' || isNaN(age)))} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
