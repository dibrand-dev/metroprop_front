'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishMainInfo.scss';

const iconChevron = '/icons/chevron-up.svg';
const iconBack = '/icons/arrow.svg';

const unitOptions = ['m2', 'ha'];

const roomsConfig = [
  { key: 'ambientes', label: 'Ambientes*' },
  { key: 'dormitorios', label: 'Dormitorios*' },
  { key: 'banos', label: 'Banos*' },
  { key: 'toilets', label: 'Toilets*' },
  { key: 'cocheras', label: 'Cocheras*' },
] as const;

type RoomKey = (typeof roomsConfig)[number]['key'];

type UnitField = 'total' | 'covered';

type AntiquityOption = 'construction' | 'new' | 'years';

export default function PublishMainInfo() {
  const router = useRouter();
  const [openUnitField, setOpenUnitField] = useState<UnitField | null>(null);
  const [totalUnit, setTotalUnit] = useState('');
  const [coveredUnit, setCoveredUnit] = useState('');
  const [surfaceTotal, setSurfaceTotal] = useState('');
  const [surfaceCovered, setSurfaceCovered] = useState('');
  const [antiquity, setAntiquity] = useState<AntiquityOption | null>(null);
  const [antiquityYears, setAntiquityYears] = useState('');
  const [rooms, setRooms] = useState<Record<RoomKey, number>>({
    ambientes: 0,
    dormitorios: 0,
    banos: 0,
    toilets: 0,
    cocheras: 0,
  });

  const propertyType = 'Casa Duplex';
  const showRooms = propertyType.toLowerCase() !== 'terreno';

  const handleUnitToggle = (field: UnitField) => {
    setOpenUnitField((prev) => (prev === field ? null : field));
  };

  const handleUnitSelect = (field: UnitField, value: string) => {
    if (field === 'total') {
      setTotalUnit(value);
    } else {
      setCoveredUnit(value);
    }
    setOpenUnitField(null);
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

  const handleBack = () => {
    router.push('/protected/publish/content');
  };

  const handleContinue = () => {
    router.push('/protected/publish/property-content');
  };

  return (
    <div className="publish-main-info">
      <div className="publish-main-info-inner">
        <div className="publish-main-info-card">
          <div className="publish-main-info-top">
            <div className="publish-main-info-route">
              <p>Venta - {propertyType}</p>
              <p>Juncal 2345</p>
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
              <h1>Ingresa la informacion principal</h1>
              <span>Datos obligatorios(*)</span>
            </div>

            <div className="publish-main-info-block">
              <h2>Superficie*</h2>
              <div className="publish-main-info-surface">
                <div className="publish-main-info-surface-item">
                  <label>Total</label>
                  <div className="publish-main-info-input-row">
                    <div className="publish-main-info-select">
                      <button
                        type="button"
                        className={`publish-main-info-select-button ${
                          totalUnit ? 'is-selected' : ''
                        } ${openUnitField === 'total' ? 'is-open' : ''}`}
                        onClick={() => handleUnitToggle('total')}
                      >
                        <span>{totalUnit || 'Seleccionar'}</span>
                        <img src={iconChevron} alt="" />
                      </button>
                      {openUnitField === 'total' ? (
                        <div className="publish-main-info-options">
                          {unitOptions.map((option) => (
                            <button
                              key={`total-${option}`}
                              type="button"
                              onClick={() => handleUnitSelect('total', option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      placeholder="Seleccionar"
                      value={surfaceTotal}
                      onChange={(event) => setSurfaceTotal(event.target.value)}
                      className={`publish-main-info-input ${surfaceTotal ? 'is-active' : ''}`}
                    />
                  </div>
                </div>

                <div className="publish-main-info-surface-item">
                  <label>Cubierta</label>
                  <div className="publish-main-info-input-row">
                    <div className="publish-main-info-select">
                      <button
                        type="button"
                        className={`publish-main-info-select-button ${
                          coveredUnit ? 'is-selected' : ''
                        } ${openUnitField === 'covered' ? 'is-open' : ''}`}
                        onClick={() => handleUnitToggle('covered')}
                      >
                        <span>{coveredUnit || 'Seleccionar'}</span>
                        <img src={iconChevron} alt="" />
                      </button>
                      {openUnitField === 'covered' ? (
                        <div className="publish-main-info-options">
                          {unitOptions.map((option) => (
                            <button
                              key={`covered-${option}`}
                              type="button"
                              onClick={() => handleUnitSelect('covered', option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      placeholder="Seleccionar"
                      value={surfaceCovered}
                      onChange={(event) => setSurfaceCovered(event.target.value)}
                      className={`publish-main-info-input ${
                        surfaceCovered ? 'is-active' : ''
                      }`}
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
                  className={`publish-main-info-chip ${
                    antiquity === 'construction' ? 'is-active' : ''
                  }`}
                  onClick={() => setAntiquity('construction')}
                >
                  En construccion
                </button>
                <button
                  type="button"
                  className={`publish-main-info-chip ${
                    antiquity === 'new' ? 'is-active' : ''
                  }`}
                  onClick={() => setAntiquity('new')}
                >
                  A estrenar
                </button>
                <button
                  type="button"
                  className={`publish-main-info-chip ${
                    antiquity === 'years' ? 'is-active' : ''
                  }`}
                  onClick={() => setAntiquity('years')}
                >
                  Anos de la propiedad
                </button>
              </div>
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
                          -
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
                          +
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
              <img src={iconBack} alt="" />
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
