'use client';

import { useEffect, useRef, useState } from 'react';
import './BranchForm.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';

const iconArrowBack = '/icons/arrow.svg';

interface BranchFormProps {
  branchId?: string;
}

interface BranchFormData {
  name: string;
  contactEmail: string;
  contactPhone: string;
  sameForRent: boolean;
  address: string;
  province: string;
  city: string;
  neighborhood: string;
  logoFileName: string;
}

const provinceOptions = [
  { value: 'buenos-aires', label: 'Buenos Aires' },
  { value: 'cordoba', label: 'Cordoba' },
  { value: 'santa-fe', label: 'Santa Fe' },
];

const cityOptions = [
  { value: 'palermo', label: 'Palermo' },
  { value: 'recoleta', label: 'Recoleta' },
  { value: 'belgrano', label: 'Belgrano' },
];

const neighborhoodOptions = [
  { value: 'palermo-chico', label: 'Palermo Chico' },
  { value: 'palermo-soho', label: 'Palermo Soho' },
  { value: 'palermo-hollywood', label: 'Palermo Hollywood' },
];

const branchMockData: Record<string, BranchFormData> = {
  '17010603': {
    name: 'Estudio GALAS',
    contactEmail: 'ventas@galas.com',
    contactPhone: '1144556677',
    sameForRent: true,
    address: 'Cervino 4046',
    province: 'buenos-aires',
    city: 'palermo',
    neighborhood: 'palermo-chico',
    logoFileName: 'logo-galas.png',
  },
};

export default function BranchForm({ branchId }: BranchFormProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sameForRent, setSameForRent] = useState(false);
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(branchId);
  const pageTitle = isEditing ? 'Modificar sucursal' : 'Agregar sucursal';
  const formatPhone = (value: string) => value.replace(/\D/g, '');

  useEffect(() => {
    if (!branchId) return;
    const data = branchMockData[branchId];
    if (!data) return;
    setBranchName(data.name);
    setContactEmail(data.contactEmail);
    setContactPhone(formatPhone(data.contactPhone));
    setSameForRent(data.sameForRent);
    setAddress(data.address);
    setProvince(data.province);
    setCity(data.city);
    setNeighborhood(data.neighborhood);
    setLogoFileName(data.logoFileName);
  }, [branchId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: submit form payload
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoFileName(file?.name || '');
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`branch-form-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="branch-form-mobile-header">
          <button
            className="branch-form-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>{pageTitle}</span>
          </button>
        </div>

        <form className="branch-form-content" onSubmit={handleSubmit}>
          <div className="branch-form-header">
            <h1>{pageTitle}</h1>
            <Button
              label="Guardar sucursal"
              type="submit"
              variant="primary"
              buttonType="1"
              size="medium"
            />
          </div>

          <div className="branch-form-section">
            <label className="branch-form-label">Nombre de la sucursal</label>
            <InputField2
              label="Nombre de la sucursal"
              type="text"
              placeholder="Nombre de la sucursal"
              value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
              required={true}
            />
          </div>

          <div className="branch-form-section">
            <h2>Datos de contacto para venta</h2>
            <div className="branch-form-grid">
              <div className="branch-form-field">
                <label className="branch-form-label">Email (opcional)</label>
                <InputField2
                  label="Email (opcional)"
                  type="email"
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
              </div>
              <div className="branch-form-field">
                <label className="branch-form-label">Teléfono</label>
                <InputField2
                  label="Teléfono"
                  type="tel"
                  placeholder="Número de teléfono"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(formatPhone(event.target.value))}
                  required={true}
                />
                <button className="branch-form-link" type="button">
                  + Agregar otro teléfono
                </button>
              </div>
            </div>
            <Checkbox
              label="Los datos de contacto para venta son los mismos que para alquiler"
              checked={sameForRent}
              onChange={setSameForRent}
            />
          </div>

          <div className="branch-form-section">
            <h2>Agregar logo</h2>
            <div className="branch-form-logo">
              <div className="branch-form-logo-preview" />
              <button
                className="branch-form-logo-upload"
                type="button"
                onClick={handleLogoClick}
              >
                <span>{logoFileName || 'Agregar logo'}</span>
              </button>
              <input
                ref={logoInputRef}
                className="branch-form-logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
            <p className="branch-form-help">
              Tamaño recomendado 138px por 75px. Peso máximo 200 KB.
            </p>
          </div>

          <div className="branch-form-section">
            <div className="branch-form-grid">
              <div className="branch-form-field">
                <label className="branch-form-label">Dirección (opcional)</label>
                <InputField2
                  label="Dirección (opcional)"
                  type="text"
                  placeholder="Dirección"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <div className="branch-form-field">
                <label className="branch-form-label">Provincia (opcional)</label>
                <Select
                  label="Provincia (opcional)"
                  placeholder="Seleccionar"
                  value={province}
                  onChange={(value) => setProvince(value)}
                  options={provinceOptions}
                />
              </div>
              <div className="branch-form-field">
                <label className="branch-form-label">Ciudad (opcional)</label>
                <Select
                  label="Ciudad (opcional)"
                  placeholder="Seleccionar"
                  value={city}
                  onChange={(value) => setCity(value)}
                  options={cityOptions}
                />
              </div>
              <div className="branch-form-field">
                <label className="branch-form-label">Barrio (opcional)</label>
                <Select
                  label="Barrio (opcional)"
                  placeholder="Seleccionar"
                  value={neighborhood}
                  onChange={(value) => setNeighborhood(value)}
                  options={neighborhoodOptions}
                />
              </div>
            </div>
          </div>
        </form>

        <div className="branch-form-mobile-footer">
          <Button
            label="Guardar sucursal"
            type="submit"
            variant="primary"
            buttonType="1"
            fullWidth={true}
            size="medium"
          />
        </div>
      </div>
    </div>
  );
}
