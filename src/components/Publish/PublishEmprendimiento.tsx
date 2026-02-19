'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import './PublishEmprendimiento.scss';

export default function PublishEmprendimiento() {
  const router = useRouter();

  // General data state
  const [nombreEmprendimiento, setNombreEmprendimiento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tipoEmprendimiento, setTipoEmprendimiento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [totalUnidades, setTotalUnidades] = useState('');
  const [entrega, setEntrega] = useState('');

  // Location state
  const [calleNumero, setCalleNumero] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [provincia, setProvincia] = useState('');
  const [ciudadUbicacion, setCiudadUbicacion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [zona, setZona] = useState('');
  const [mostrarUbicacionExacta, setMostrarUbicacionExacta] = useState(false);

  // Images state
  const [fotos, setFotos] = useState<File[]>([]);
  const [planos, setPlanos] = useState<File[]>([]);
  const [recorrido360, setRecorrido360] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

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

  const handleGuardarBorrador = () => {
    // TODO: Implement save as draft logic
    console.log('Guardar como borrador');
    router.push('/protected/publish');
  };

  const handleContinuar = () => {
    // TODO: Implement continue logic (validation and save)
    console.log('Continuar');
    router.push('/protected/publish/emprendimiento/amenidades');
  };

  return (
    <div className="publish-emprendimiento">
      <div className="publish-emprendimiento-container">
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
            className="tab active"
          >
            Datos principales
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/amenidades')}
          >
            Amenidades
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/unidades')}
          >
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
          {/* General Data Section */}
          <section className="section">
            <h2 className="section-title">Datos generales del emprendimiento</h2>

            <div className="form-group">
              <div className="form-field full-width">
                <InputField2
                  label="Nombre del emprendimiento*"
                  placeholder="Nombre del emprendimiento*"
                  value={nombreEmprendimiento}
                  onChange={(e) => setNombreEmprendimiento(e.target.value)}
                  required
                />
                <span className="character-count">{nombreEmprendimiento.length}/100</span>
              </div>
            </div>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Descripción*</label>
                <textarea
                  className="textarea-field"
                  placeholder="Contanos sobre el emprendimiento"
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

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Agregar logo del emprendimiento</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="file-input"
                  />
                  <label htmlFor="logo-upload" className="file-label">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Agregar foto</span>
                  </label>
                  {logoFile && <span className="file-name">{logoFile.name}</span>}
                </div>
                <span className="helper-text">
                  Tamaño recomendado 138px por 75px. Peso máximo 200 KB.
                </span>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <Select
                    label="Tipo de emprendimiento"
                    options={[
                      { value: 'edificio', label: 'Edificio' },
                      { value: 'barrio-privado', label: 'Barrio privado' },
                      { value: 'country', label: 'Country' },
                    ]}
                    value={tipoEmprendimiento}
                    onChange={setTipoEmprendimiento}
                    placeholder="Seleccionar"
                  />
                </div>
                <div className="form-field half-width">
                  <Select
                    label="Ciudad*"
                    options={[
                      { value: 'caba', label: 'CABA' },
                      { value: 'la-plata', label: 'La Plata' },
                      { value: 'rosario', label: 'Rosario' },
                    ]}
                    value={ciudad}
                    onChange={setCiudad}
                    placeholder="Seleccionar"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <InputField2
                    label="Total de unidades"
                    placeholder="Total de unidades"
                    value={totalUnidades}
                    onChange={(e) => setTotalUnidades(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="form-field half-width">
                  <Select
                    label="Entrega"
                    options={[
                      { value: 'inmediata', label: 'Inmediata' },
                      { value: '2024', label: '2024' },
                      { value: '2025', label: '2025' },
                      { value: '2026', label: '2026' },
                    ]}
                    value={entrega}
                    onChange={setEntrega}
                    placeholder="Seleccionar"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="section">
            <h2 className="section-title">Ubicación del emprendimiento</h2>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <InputField2
                    label="Calle y número*"
                    placeholder="Calle y número*"
                    value={calleNumero}
                    onChange={(e) => setCalleNumero(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field half-width">
                  <InputField2
                    label="Código postal"
                    placeholder="Código postal"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <Select
                    label="Provincia*"
                    options={[
                      { value: 'buenos-aires', label: 'Buenos Aires' },
                      { value: 'cordoba', label: 'Córdoba' },
                      { value: 'santa-fe', label: 'Santa Fe' },
                    ]}
                    value={provincia}
                    onChange={setProvincia}
                    placeholder="Seleccionar"
                    required
                  />
                </div>
                <div className="form-field half-width">
                  <Select
                    label="Ciudad*"
                    options={[
                      { value: 'caba', label: 'CABA' },
                      { value: 'la-plata', label: 'La Plata' },
                      { value: 'rosario', label: 'Rosario' },
                    ]}
                    value={ciudadUbicacion}
                    onChange={setCiudadUbicacion}
                    placeholder="Seleccionar"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <InputField2
                    label="Barrio"
                    placeholder="Barrio"
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                  />
                </div>
                <div className="form-field half-width">
                  <InputField2
                    label="Zona"
                    placeholder="Zona"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="form-group">
              <div className="map-section">
                <div className="map-header">
                  <h3 className="map-title">Vista previa del aviso</h3>
                  <div className="map-toggle">
                    <span className="toggle-label">Mostrar la ubicación exacta</span>
                    <SwitchToggle
                      checked={mostrarUbicacionExacta}
                      onChange={setMostrarUbicacionExacta}
                    />
                  </div>
                </div>
                <div className="map-container">
                  <div className="map-placeholder">
                    <svg
                      width="189"
                      height="189"
                      viewBox="0 0 189 189"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M94.5 165.375C94.5 165.375 157.5 126 157.5 78.75C157.5 43.9429 128.807 15.75 94.5 15.75C60.1929 15.75 31.5 43.9429 31.5 78.75C31.5 126 94.5 165.375 94.5 165.375Z"
                        stroke="#006AFF"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M94.5 102.375C107.792 102.375 118.562 91.6042 118.562 78.3125C118.562 65.0208 107.792 54.25 94.5 54.25C81.2083 54.25 70.4375 65.0208 70.4375 78.3125C70.4375 91.6042 81.2083 102.375 94.5 102.375Z"
                        stroke="#006AFF"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Images Section */}
          <section className="section">
            <h2 className="section-title">Agregar imágenes del emprendimiento</h2>

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
                      xmlns="http://www.w3.org/2000/svg"
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
                    <span className="file-count">{fotos.length} archivo(s) seleccionado(s)</span>
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
                      xmlns="http://www.w3.org/2000/svg"
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
                    <span className="file-count">{planos.length} archivo(s) seleccionado(s)</span>
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
          </section>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Guardar como borrador"
            variant="secondary"
            buttonType="2"
            onClick={handleGuardarBorrador}
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
