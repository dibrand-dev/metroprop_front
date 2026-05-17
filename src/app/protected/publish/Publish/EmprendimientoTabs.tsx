'use client';

import './EmprendimientoTabs.scss';

export type EmprendimientoStep =
  | 'emprendimiento'
  | 'emprendimiento-amenities'
  | 'emprendimiento-units'
  | 'emprendimiento-plans'
  | 'emprendimiento-preview';

const tabs: { step: EmprendimientoStep; label: string }[] = [
  { step: 'emprendimiento', label: 'Datos principales' },
  { step: 'emprendimiento-amenities', label: 'Amenidades' },
  { step: 'emprendimiento-units', label: 'Unidades' },
  { step: 'emprendimiento-plans', label: 'Tipos de aviso' },
  { step: 'emprendimiento-preview', label: 'Vista previa del aviso' },
];

interface EmprendimientoTabsProps {
  currentStep: EmprendimientoStep;
  goToStep: (step: EmprendimientoStep) => void;
}

export default function EmprendimientoTabs({ currentStep, goToStep }: EmprendimientoTabsProps) {
  return (
    <div className="emprendimiento-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.step}
          className={`emprendimiento-tabs__tab ${tab.step === currentStep ? 'active' : ''}`}
          onClick={tab.step === currentStep ? undefined : () => goToStep(tab.step)}
          disabled={tab.step === currentStep}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
