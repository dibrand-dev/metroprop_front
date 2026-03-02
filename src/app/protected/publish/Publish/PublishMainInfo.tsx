'use client';

import { useState, useEffect } from 'react';
import './PublishMainInfo.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';

const iconChevron = '/icons/chevron-up.svg';

const unitOptions = ['m2', 'ha'];

const roomsConfig = [
  { key: 'ambientes', label: 'Ambientes*' },
  { key: 'dormitorios', label: 'Dormitorios*' },
  { key: 'banos', label: 'Baños*' },
  { key: 'toilets', label: 'Toilets*' },
  { key: 'cocheras', label: 'Cocheras*' },
] as const;

type RoomKey = (typeof roomsConfig)[number]['key'];

type UnitField = 'total' | 'covered';

type AntiquityOption = 'construction' | 'new' | 'years';

interface PublishMainInfoProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PublishMainInfo({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishMainInfoProps) {
  const [totalUnit, setTotalUnit] = useState(wizardData.mainInfo?.totalUnit || '');
  const [coveredUnit, setCoveredUnit] = useState(wizardData.mainInfo?.coveredUnit || '');
  const [surfaceTotal, setSurfaceTotal] = useState(wizardData.mainInfo?.surfaceTotal || '');
  const [surfaceCovered, setSurfaceCovered] = useState(wizardData.mainInfo?.surfaceCovered || '');
  const [antiquity, setAntiquity] = useState<AntiquityOption | null>(wizardData.mainInfo?.antiquity || null);
  const [antiquityYears, setAntiquityYears] = useState(wizardData.mainInfo?.antiquityYears || '');
  const [rooms, setRooms] = useState<Record<RoomKey, number>>(wizardData.mainInfo?.rooms || {
    ambientes: 0,
    dormitorios: 0,
    banos: 0,
    toilets: 0,
    cocheras: 0,
  });

  const propertyType = 'Casa Duplex';
  const showRooms = propertyType.toLowerCase() !== 'terreno';

  const unitSelectOptions = unitOptions.map(option => ({
    value: option,
    label: option,
  }));

  // Update wizard data when main info changes
  useEffect(() => {
    updateWizardData({
      mainInfo: {
        totalUnit,
        coveredUnit,
        surfaceTotal,
        surfaceCovered,
        antiquity,
        antiquityYears,
        rooms,
      },
    });
  }, [totalUnit, coveredUnit, surfaceTotal, surfaceCovered, antiquity, antiquityYears, rooms, updateWizardData]);

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

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="publish-main-info">
      <div className="publish-main-info-inner">
        <div className="publish-main-info-card">
          <div className="publish-main-info-top">
            <div className="publish-main-info-route">
              {wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}<br />{wizardData.location?.address}
            </div>
            <button className="publish-main-info-link" type="button">
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
                      value={totalUnit}
                      onChange={(value) => setTotalUnit(value)}
                      placeholder=""
                    />
                    <InputField
                      placeholder="Ingresar superficie"
                      value={surfaceTotal}
                      onChange={(event) => setSurfaceTotal(event.target.value)}
                    />
                  </div>
                </div>

                <div className="publish-main-info-surface-item">
                  <div className="publish-main-info-input-row">
                    <Select
                      label="Cubierta"
                      options={unitSelectOptions}
                      value={coveredUnit}
                      onChange={(value) => setCoveredUnit(value)}
                      placeholder=""
                    />
                    <InputField
                      placeholder="Ingresar superficie"
                      value={surfaceCovered}
                      onChange={(event) => setSurfaceCovered(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="publish-main-info-block">
              <h2>Antiguedad*</h2>
              <div className="publish-main-info-antiquity">
                <button
                  type="button"
                  className={`publish-chip ${
                    antiquity === 'construction' ? 'publish-chip-active' : ''
                  }`}
                  onClick={() => setAntiquity('construction')}
                >
                  En construccion
                </button>
                <button
                  type="button"
                  className={`publish-chip ${
                    antiquity === 'new' ? 'publish-chip-active' : ''
                  }`}
                  onClick={() => setAntiquity('new')}
                >
                  A estrenar
                </button>
                <button
                  type="button"
                  className={`publish-chip ${
                    antiquity === 'years' ? 'publish-chip-active' : ''
                  }`}
                  onClick={() => setAntiquity('years')}
                >
                  Años de la propiedad
                </button>
                <div className="publish-main-info-year">
                  <input
                    type="text"
                    placeholder="Seleccionar"
                    value={antiquityYears}
                    onChange={(event) => setAntiquityYears(event.target.value)}
                    disabled={antiquity !== 'years'}
                    className={`publish-main-info-input ${
                      antiquity === 'years' && antiquityYears ? 'is-active' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {showRooms ? (
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
            ) : null}
          </div>

          <div className="publish-main-info-footer">
            <button className="publish-main-info-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button
              className="publish-main-info-continue"
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
