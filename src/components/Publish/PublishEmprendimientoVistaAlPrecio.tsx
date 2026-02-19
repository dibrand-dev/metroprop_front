'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from '@/ui/Select/Select';
import RadioButton from '@/ui/RadioButton/RadioButton';
import Button from '@/ui/Button/Button';
import './PublishEmprendimientoVistaAlPrecio.scss';

interface PlanCard {
  id: string;
  name: string;
  price: string;
  period: string;
  benefits: string[];
}

export default function PublishEmprendimientoVistaAlPrecio() {
  const router = useRouter();
  const [colaborador, setColaborador] = useState('');
  const [planSeleccionado, setPlanSeleccionado] = useState('');

  const colaboradores = [
    { value: 'colaborador1', label: 'Juan Pérez' },
    { value: 'colaborador2', label: 'María García' },
    { value: 'colaborador3', label: 'Carlos López' },
  ];

  const planesDisponibles = [
    { value: 'destacado', label: 'Destacado', description: 'Visibilidad baja', info: '' },
    { value: 'destacada', label: 'Destacada', description: 'Visibilidad alta', info: 'Cantidad disponible: 1' },
  ];

  const planesAdicionales: PlanCard[] = [
    {
      id: 'premium',
      name: '1 Premium',
      price: '$20.000,25',
      period: '/mes',
      benefits: [
        'Detalle o beneficio del plan a definir con producto',
        'Detalle o beneficio del plan a definir con producto',
        'Detalle o beneficio del plan a definir con producto',
      ],
    },
    {
      id: 'destacada-extra',
      name: '1 Destacada',
      price: '$20.000,25',
      period: '/mes',
      benefits: [
        'Detalle o beneficio del plan a definir con producto',
        'Detalle o beneficio del plan a definir con producto',
        'Detalle o beneficio del plan a definir con producto',
      ],
    },
    {
      id: 'simple',
      name: '1 Simple',
      price: '$20.000,25',
      period: '/mes',
      benefits: [
        'Detalle o beneficio del plan a definir con producto',
        'Detalle o beneficio del plan a definir con producto',
        'Detalle o beneficio del plan a definir con producto',
      ],
    },
  ];

  const tabs = [
    { id: 'datos-principales', label: 'Datos principales', path: '/protected/publish/emprendimiento' },
    { id: 'amenidades', label: 'Amenidades', path: '/protected/publish/emprendimiento/amenidades' },
    { id: 'caracteristicas', label: 'Características', path: '#' },
    { id: 'tipos-unidad', label: 'Tipo de aviso', path: '#' },
    { id: 'vista-precio', label: 'Vista precio del área', path: '/protected/publish/emprendimiento/vista-al-precio' },
  ];

  const handleTabClick = (path: string) => {
    if (path !== '#') {
      router.push(path);
    }
  };

  const handleContinuar = () => {
    // Handle form submission and navigation
    console.log('Continuar clicked', { colaborador, planSeleccionado });
  };

  const handleGuardarBorrador = () => {
    // Handle save as draft
    console.log('Guardar como borrador');
  };

  const handleComprarPlan = (planId: string) => {
    console.log('Comprar plan:', planId);
  };

  return (
    <div className="publish-emprendimiento-vista-al-precio">
      <div className="publish-emprendimiento-vista-al-precio-container">
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${tab.id === 'vista-precio' ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Title */}
          <h2 className="section-main-title">Ya casi terminás</h2>

          {/* Section 1: Asignar colaborador */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Asigná este aviso a un colaborador</h3>
            </div>
            <div className="form-group">
              <Select
                label="Tus colaboradores"
                options={colaboradores}
                value={colaborador}
                onChange={setColaborador}
                placeholder="Seleccioná un colaborador"
              />
            </div>
          </div>

          {/* Section 2: Elegir plan */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Elegí el plan con el que vas a publicar</h3>
            </div>
            <div className="form-group">
              <p className="subsection-title">Planes disponibles</p>
              <div className="planes-list">
                {planesDisponibles.map((plan) => (
                  <RadioButton
                    key={plan.value}
                    name="plan"
                    value={plan.value}
                    label={plan.label}
                    description={plan.description}
                    additionalInfo={plan.info}
                    checked={planSeleccionado === plan.value}
                    onChange={setPlanSeleccionado}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Más planes */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">Más planes para vos</h3>
            </div>
            <div className="planes-cards">
              {planesAdicionales.map((plan) => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-header">
                    <span className="plan-name">{plan.name}</span>
                    <div className="plan-price-container">
                      <span className="plan-price">{plan.price}</span>
                      <span className="plan-period">{plan.period}</span>
                    </div>
                  </div>
                  <div className="plan-benefits">
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="benefit-item">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="check-icon"
                        >
                          <path
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                            fill="#006AFF"
                          />
                        </svg>
                        <span className="benefit-text">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="plan-action">
                    <Button
                      label="Comprar"
                      variant="primary"
                      onClick={() => handleComprarPlan(plan.id)}
                      fullWidth
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Guardar como borrador"
            variant="secondary"
            onClick={handleGuardarBorrador}
          />
          <Button
            label="Continuar"
            variant="primary"
            onClick={handleContinuar}
          />
        </div>
      </div>
    </div>
  );
}
