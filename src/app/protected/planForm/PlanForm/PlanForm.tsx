'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PlanForm.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { apiFetch } from '@/lib/apiFetch';
import Select from '@/ui/Select/Select';

const iconArrowBack = '/icons/arrow.svg';

interface PlanFormProps {
  planId?: string;
}

const currencyOptions = ['ARS', 'USD', 'EUR'];
const currencySelectOptions = currencyOptions.map(option => ({
  value: option,
  label: option,
}));

export default function PlanForm({ planId }: PlanFormProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [habilitado, setHabilitado] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [propertyLimit, setPropertyLimit] = useState('');
  const [highlightLimit, setHighlightLimit] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', description: '', price: '', currency: '', propertyLimit: '', highlightLimit: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEditing = Boolean(planId);
  const pageTitle = isEditing ? 'Modificar plan' : 'Agregar plan';
  const queryClient = useQueryClient();

  const { isLoading: isLoadingPlan, data: planData } = useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => apiFetch(`${API_BASE_URL}/plans/${planId}`),
    enabled: Boolean(planId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!planData) return;
    const plan = planData?.plan ?? planData;
    setName(plan.plan_name ?? '');
    setDescription(plan.plan_description ?? '');
    setHabilitado(plan.is_active);
    setPrice(plan.price ? String(plan.price) : '');
    setCurrency(plan.currency ?? '');
    setPropertyLimit(plan.property_limit ? String(plan.property_limit) : '');
    setHighlightLimit(plan.highlight_limit ? String(plan.highlight_limit) : '');
  }, [planData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        plan_name: name.trim(),
        plan_description: description.trim(),
        is_active: habilitado ? 1 : 0,
        price: parseFloat(price),
        currency: currency.trim(),
        property_limit: parseInt(propertyLimit),
        highlight_limit: parseInt(highlightLimit),
      };
      const url = isEditing
        ? `${API_BASE_URL}/plans/${planId}`
        : `${API_BASE_URL}/plans`;
      return apiFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      if (!isEditing) {
        setName('');
        setDescription('');
        setHabilitado(false);
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/protected/plans'); 
      }, 3000);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({ name: '', description: '', price: '', currency: '', propertyLimit: '', highlightLimit: '' });

    const errors = { name: '', description: '', price: '', currency: '', propertyLimit: '', highlightLimit: '' };
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (!description.trim()) errors.description = 'La descripción es requerida';

    if (errors.name || errors.description) {
      setFieldErrors(errors);
      return;
    }

    saveMutation.mutate();
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`partner-form-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="partner-form-mobile-header">
          <button
            className="partner-form-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>{pageTitle}</span>
          </button>
        </div>

        <form className="partner-form-content" onSubmit={handleSubmit}>
          <div className="partner-form-header">
            <h1>{pageTitle}</h1>
            <Button
              label="Guardar plan"
              type="submit"
              variant="primary"
              buttonType="1"
              size="medium"
            />
          </div>
          <div className="partner-form-section">
            <label className="partner-form-label">Nombre del plan</label>
            <InputField2
              label="Nombre del plan"
              type="text"
              placeholder="Nombre del plan"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
              required={true}
              error={fieldErrors.name}
            />
          </div>

          <div className="partner-form-section">
            <label className="partner-form-label">Descripción</label>
            <InputField2
              label="Descripción"
              type="text"
              placeholder="Descripción"
              value={description}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
              required={true}
              error={fieldErrors.description}
            />
          </div>

          <div className="partner-form-section">
            <label className="partner-form-label">Precio</label>
            <div className="currency-price-container">
              <Select
                options={currencySelectOptions}
                value={currency}
                onChange={(value) => setCurrency(value)}
              />
              <InputField2
                label="Precio"
                type="text"
                placeholder="Precio"
                value={price}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPrice(event.target.value)}
                required={true}
                error={fieldErrors.price}
              />
            </div>
          </div>
          <div className="partner-form-section">
            <label className="partner-form-label">Límite de propiedades</label>
            <InputField2
              label="Límite de propiedades"
              type="text"
              placeholder="Límite de propiedades"
              value={propertyLimit}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPropertyLimit(event.target.value)}
              required={true}
              error={fieldErrors.propertyLimit}
            />
          </div>

          <div className="partner-form-section">
            <label className="partner-form-label">Límite de destacados</label>
            <InputField2
              label="Límite de destacados"
              type="text"
              placeholder="Límite de destacados"
              value={highlightLimit}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setHighlightLimit(event.target.value)}
              required={true}
              error={fieldErrors.highlightLimit}
            />
          </div>



          <div className="partner-form-section">
            <Checkbox
              label="Habilitado"
              checked={habilitado}
              onChange={setHabilitado}
            />
          </div>
        </form>

        {showSuccessModal && (
          <SuccessModal
            title={isEditing ? 'Plan actualizado!' : '¡Plan creado!'}
            text={isEditing ? 'Los datos del plan fueron guardados exitosamente.' : 'El plan fue creado exitosamente.'}
          />
        )}

        <div className="partner-form-mobile-footer">
          <Button
            label="Guardar plan"
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
