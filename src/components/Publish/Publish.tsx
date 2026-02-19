'use client';

import { useRouter } from 'next/navigation';
import './Publish.scss';

const operationOptions = ['Venta', 'Alquiler', 'Temporal', 'Emprendimiento'];

export default function Publish() {
  const router = useRouter();

  const handleSelect = (option: string) => {
    if (option === 'Emprendimiento') {
      router.push('/protected/publish/emprendimiento');
    } else {
      router.push('/protected/publish/property-type');
    }
  };

  return (
    <div className="publish-page">
      <div className="publish-card">
        <div className="publish-card-header">
          <h1>Que queres publicar?</h1>
          <p>Elegi un tipo de operacion para continuar</p>
        </div>
        <div className="publish-options">
          {operationOptions.map((option) => (
            <button
              key={option}
              className="publish-option"
              type="button"
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
