'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import Checkbox from '@/ui/Checkbox/Checkbox';
import './PublishEmprendimientoUnidades.scss';
import { CreatePropertyDraft } from '@/types/propiedad';

interface Unit {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  pisoUnidad: string;
  orientacion: string;
  precio: string;
  moneda: string;
  expensas: boolean;
  expensasValor: string;
  dormitorios: number;
  banos: number;
  toilettes: number;
  cochera: number;
  baulera: number;
  supCubierta: string;
  supTotal: string;
  fotos: File[];
  planos: File[];
  recorrido360: string;
}

interface PublishEmprendimientoProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (emprendimientoUpdate: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
}

export default function PublishEmprendimientoUnidades({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishEmprendimientoProps) {
  const router = useRouter();
  
  // Form state for new unit
  const [nombreUnidad, setNombreUnidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoUnidad, setTipoUnidad] = useState('');
  const [pisoUnidad, setPisoUnidad] = useState('');
  const [orientacion, setOrientacion] = useState('');
  
  // Price state
  const [precioTotal, setPrecioTotal] = useState(true);
  const [moneda, setMoneda] = useState('USD');
  const [precio, setPrecio] = useState('');
  const [tieneExpensas, setTieneExpensas] = useState(false);
  const [expensasValor, setExpensasValor] = useState('');
  
  // Ambientes state
  const [dormitorios, setDormitorios] = useState(0);
  const [banos, setBanos] = useState(0);
  const [toilettes, setToilettes] = useState(0);
  const [cochera, setCochera] = useState(0);
  const [baulera, setBaulera] = useState(0);
  
  // Surface state
  const [supCubierta, setSupCubierta] = useState('');
  const [supTotal, setSupTotal] = useState('');
  
  // Images state
  const [fotos, setFotos] = useState<File[]>([]);
  const [planos, setPlanos] = useState<File[]>([]);
  const [recorrido360, setRecorrido360] = useState('');
  
  // Units list
  const [unidades, setUnidades] = useState<Unit[]>([]);

  const handleFotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files));
    }
  };

  const handlePlanosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPlanos(Array.from(e.target.files));
    }
  };

  const handleAgregarUnidad = () => {
    const nuevaUnidad: Unit = {
      id: Date.now().toString(),
      nombre: nombreUnidad,
      descripcion,
      tipo: tipoUnidad,
      pisoUnidad,
      orientacion,
      precio,
      moneda,
      expensas: tieneExpensas,
      expensasValor,
      dormitorios,
      banos,
      toilettes,
      cochera,
      baulera,
      supCubierta,
      supTotal,
      fotos,
      planos,
      recorrido360,
    };
    
    setUnidades([...unidades, nuevaUnidad]);
    
    // Reset form
    setNombreUnidad('');
    setDescripcion('');
    setTipoUnidad('');
    setPisoUnidad('');
    setOrientacion('');
    setPrecio('');
    setExpensasValor('');
    setDormitorios(0);
    setBanos(0);
    setToilettes(0);
    setCochera(0);
    setBaulera(0);
    setSupCubierta('');
    setSupTotal('');
    setFotos([]);
    setPlanos([]);
    setRecorrido360('');
  };

  const handleEliminarUnidad = (id: string) => {
    setUnidades(unidades.filter(u => u.id !== id));
  };

  const handleVolver = () => {
    onBack();
  };

  const handleContinuar = () => {
    onNext({ unidades });
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
        <div className="secondary-menu">
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento')}
          >
            Datos principales
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/amenidades')}
          >
            Amenidades
          </button>
          <button className="tab active">
            Unidades
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/tipos-de-unidad')}
          >
            Tipos de unidad
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/vista-al-precio')}
          >
            Vista al precio
          </button>
        </div>

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
                  value={nombreUnidad}
                  onChange={(e) => setNombreUnidad(e.target.value)}
                />
                <span className="character-count">{nombreUnidad.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Descripción*</label>
                <textarea
                  className="textarea-field"
                  placeholder="Describe las características de esta unidad"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={6}
                  maxLength={10000}
                />
                <div className="textarea-footer">
                  {descripcion.length < 150 && (
                    <span className="helper-text">
                      La descripción debe tener al menos 150 caracteres
                    </span>
                  )}
                  <span className="character-count">{descripcion.length}/10000</span>
                </div>
              </div>
            </div>

            {/* Type and Floor/Unit */}
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
                  value={tipoUnidad}
                  onChange={setTipoUnidad}
                  placeholder="Seleccionar"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <label className="field-label">Piso y unidad*</label>
                  <InputField2
                    label="Piso y unidad"
                    placeholder="Ej: 3° A"
                    value={pisoUnidad}
                    onChange={(e) => setPisoUnidad(e.target.value)}
                  />
                </div>
                <div className="form-field half-width">
                  <Select
                    label="Orientación"
                    options={[
                      { value: 'norte', label: 'Norte' },
                      { value: 'sur', label: 'Sur' },
                      { value: 'este', label: 'Este' },
                      { value: 'oeste', label: 'Oeste' },
                      { value: 'noreste', label: 'Noreste' },
                      { value: 'noroeste', label: 'Noroeste' },
                      { value: 'sureste', label: 'Sureste' },
                      { value: 'suroeste', label: 'Suroeste' },
                    ]}
                    value={orientacion}
                    onChange={setOrientacion}
                    placeholder="Seleccionar"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Price Section */}
          <section className="section">
            <h2 className="section-title">Precio</h2>

            <div className="form-group">
              <div className="form-row">
                






















                <div className="form-field half-width">
                  <div className="price-field">
                    <Checkbox
                      label="Precio*"
                      checked={precioTotal}
                      onChange={setPrecioTotal}
                    />
                    <div className="price-inputs">
                      <Select
                        label=""
                        options={[
                          { value: 'USD', label: 'USD' },
                          { value: 'ARS', label: 'ARS' },
                          { value: 'EUR', label: 'EUR' },
                        ]}
                        value={moneda}
                        onChange={setMoneda}
                      />
                      <InputField2
                        placeholder="0"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="expensas-checkbox">
                    <Checkbox
                      label="Expensas"
                      checked={tieneExpensas}
                      onChange={setTieneExpensas}
                    />
                  </div>
                </div>
                <div className="form-field half-width">
                  {tieneExpensas && (
                    <div className="expensas-field">
                      <label className="field-label">Valor de expensas</label>
                      <InputField2
                        placeholder="0"
                        value={expensasValor}
                        onChange={(e) => setExpensasValor(e.target.value)}
                        type="number"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Ambientes Section */}
          <section className="section">
            <h2 className="section-title">Ambientes</h2>

            <div className="ambientes-principales">
              <h3 className="subsection-title">Ambientes principales</h3>
              <div className="ambientes-list">
                <div className="ambiente-item">
                  <span className="ambiente-label">Dormitorios</span>
                  <div className="counter">
                    <button type="button" onClick={() => setDormitorios(Math.max(0, dormitorios - 1))}>-</button>
                    <span>{dormitorios}</span>
                    <button type="button" onClick={() => setDormitorios(dormitorios + 1)}>+</button>
                  </div>
                </div>
                <div className="ambiente-item">
                  <span className="ambiente-label">Baños</span>
                  <div className="counter">
                    <button type="button" onClick={() => setBanos(Math.max(0, banos - 1))}>-</button>
                    <span>{banos}</span>
                    <button type="button" onClick={() => setBanos(banos + 1)}>+</button>
                  </div>
                </div>
                <div className="ambiente-item">
                  <span className="ambiente-label">Toilettes</span>
                  <div className="counter">
                    <button type="button" onClick={() => setToilettes(Math.max(0, toilettes - 1))}>-</button>
                    <span>{toilettes}</span>
                    <button type="button" onClick={() => setToilettes(toilettes + 1)}>+</button>
                  </div>
                </div>
                <div className="ambiente-item">
                  <span className="ambiente-label">Cochera</span>
                  <div className="counter">
                    <button type="button" onClick={() => setCochera(Math.max(0, cochera - 1))}>-</button>
                    <span>{cochera}</span>
                    <button type="button" onClick={() => setCochera(cochera + 1)}>+</button>
                  </div>
                </div>
                <div className="ambiente-item">
                  <span className="ambiente-label">Baulera</span>
                  <div className="counter">
                    <button type="button" onClick={() => setBaulera(Math.max(0, baulera - 1))}>-</button>
                    <span>{baulera}</span>
                    <button type="button" onClick={() => setBaulera(baulera + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="superficie">
              <h3 className="subsection-title">Superficie</h3>
              <div className="form-row">
                <div className="form-field half-width">
                  <label className="field-label">M² construidos</label>
                  <div className="surface-input">
                    <span className="surface-unit">m²</span>
                    <InputField2
                      placeholder="0"
                      value={supCubierta}
                      onChange={(e) => setSupCubierta(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
                <div className="form-field half-width">
                  <label className="field-label">M² totales</label>
                  <div className="surface-input">
                    <span className="surface-unit">m²</span>
                    <InputField2
                      placeholder="0"
                      value={supTotal}
                      onChange={(e) => setSupTotal(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Unidades disponibles */}
          {unidades.length > 0 && (
            <section className="section">
              <h2 className="section-title">Unidades disponibles</h2>
              <div className="unidades-list">
                {unidades.map((unidad) => (
                  <div key={unidad.id} className="unidad-card">
                    <div className="unidad-info">
                      <span className="unidad-nombre">{unidad.nombre || 'Unidad sin nombre'}</span>
                      <span className="unidad-tipo">{unidad.tipo}</span>
                      <span className="unidad-precio">{unidad.moneda} {unidad.precio}</span>
                      <span className="unidad-ambientes">{unidad.dormitorios} Dormitorios</span>
                      <span className="unidad-superficie">{unidad.supTotal} m²</span>
                    </div>
                    <div className="unidad-actions">
                      <button type="button" className="icon-button" title="Editar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        className="icon-button delete" 
                        title="Eliminar"
                        onClick={() => handleEliminarUnidad(unidad.id)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Images Section */}
          <section className="section">
            <h2 className="section-title">Agregar imágenes de la unidad</h2>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Fotos</label>
                <span className="helper-text">
                  Formato JPG, JPEG, WEBP, máximo 20 MB.
                </span>
                <div className="file-upload">
                  <input
                    type="file"
                    id="fotos-upload"
                    accept=".jpg,.jpeg,.webp"
                    multiple
                    onChange={handleFotosUpload}
                    className="file-input"
                  />
                  <label htmlFor="fotos-upload" className="file-label">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Agregar fotos</span>
                  </label>
                  {fotos.length > 0 && (
                    <span className="file-count">{fotos.length} archivo(s)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Planos</label>
                <span className="helper-text">
                  Formato HEIC, JFIF, PNG, JPG, JPEG, WEBP, máximo 20 MB.
                </span>
                <div className="file-upload">
                  <input
                    type="file"
                    id="planos-upload"
                    accept=".heic,.jfif,.png,.jpg,.jpeg,.webp"
                    multiple
                    onChange={handlePlanosUpload}
                    className="file-input"
                  />
                  <label htmlFor="planos-upload" className="file-label">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Agregar planos</span>
                  </label>
                  {planos.length > 0 && (
                    <span className="file-count">{planos.length} archivo(s)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Recorrido 360°</label>
                <span className="helper-text">
                  Agregá un recorrido 360° para mostrar los detalles de la propiedad.
                </span>
                <div className="recorrido-360">
                  <InputField2
                    placeholder="Pegar link de recorrido 360°"
                    value={recorrido360}
                    onChange={(e) => setRecorrido360(e.target.value)}
                  />
                  <Button
                    label="Agregar plano"
                    variant="secondary"
                    buttonType="2"
                    onClick={() => console.log('Agregar plano')}
                  />
                </div>
              </div>
            </div>

            <div className="add-unit-button-container">
              <Button
                label="Agregar unidad"
                variant="secondary"
                buttonType="2"
                onClick={handleAgregarUnidad}
                fullWidth
              />
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Volver"
            variant="secondary"
            buttonType="2"
            onClick={handleVolver}
            fullWidth={false}
          />
          <Button
            label="Continuar"
            variant="primary"
            buttonType="2"
            onClick={handleContinuar}
            fullWidth={false}
          />
        </div>
      </div>
    </div>
  );
}
