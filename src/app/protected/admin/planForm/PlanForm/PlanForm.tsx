'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PlanForm.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL, formatNumbers, handleChangeNumbersInput } from '@/utils/utils';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { apiFetch } from '@/lib/apiFetch';
import Select from '@/ui/Select/Select';
import { Plan, PlanUserType } from '@/types/plan';
import { currencySelectOptions } from '@/types/propiedad';
import InputField from '@/ui/InputField/InputField';

const iconArrowBack = '/icons/arrow.svg';

interface PlanFormProps {
  planId?: string;
}

export default function PlanForm({ planId }: PlanFormProps) {
  const router = useRouter();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [habilitado, setHabilitado] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [propertyLimit, setPropertyLimit] = useState('');
  const [highlightLimit, setHighlightLimit] = useState('');
  const [userType, setUserType] = useState<PlanUserType>(PlanUserType.COMPANY);
  const [fieldErrors, setFieldErrors] = useState({ name: '', description: '', price: '', currency: '', propertyLimit: '', highlightLimit: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEditing = Boolean(planId);
  const pageTitle = isEditing ? 'Modificar plan' : 'Agregar plan';
  const queryClient = useQueryClient();

  const { isLoading: isLoadingPlan, data: planData } = useQuery<Plan>({
    queryKey: ['plan', planId],
    queryFn: async () => apiFetch(`${API_BASE_URL}/plans/${planId}`),
    enabled: Boolean(planId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!planData) return;
    const plan:Plan = planData?.plan ?? planData;
    setName(plan.plan_name ?? '');
    setDescription(plan.plan_description ?? '');
    setHabilitado(plan.is_active);
    setPrice(plan.price ? String(plan.price) : '');
    setCurrency(plan.currency ?? '');
    setPropertyLimit(plan.visibility ? String(plan.visibility) : '');
    setHighlightLimit(plan.highlight_limit ? String(plan.highlight_limit) : '');
    setUserType(plan.user_type ?? PlanUserType.COMPANY);
  }, [planData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        plan_name: name.trim(),
        plan_description: description.trim(),
        is_active: habilitado ? 1 : 0,
        price: parseFloat(price),
        currency: currency.trim(),
        visibility: parseInt(propertyLimit),
        highlight_limit: parseInt(highlightLimit),
        user_type: userType,
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
      queryClient.invalidateQueries({ queryKey: ['plan'] });
      queryClient.invalidateQueries({ queryKey: [planId] });
      if (!isEditing) {
        setName('');
        setDescription('');
        setHabilitado(false);
        setPrice('');
        setCurrency('');
        setPropertyLimit('');
        setHighlightLimit('');
        setUserType(PlanUserType.COMPANY);
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/protected/admin/plans'); 
      }, 3000);
    },
  });

  const handleSubmit = () => {
    setFieldErrors({ name: '', description: '', price: '', currency: '', propertyLimit: '', highlightLimit: '', userType: '' });

    const errors = { name: '', description: '', price: '', currency: '', propertyLimit: '', highlightLimit: '', userType: '' };
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (!description.trim()) errors.description = 'La descripción es requerida';
    if (parseFloat(price) <= 0) errors.price = 'El precio es requerido';
    if (!currency.trim()) errors.currency = 'La moneda es requerida';
    if (parseFloat(propertyLimit) <= 0) errors.propertyLimit = 'El nivel de prioridad es requerido';
    if (parseFloat(highlightLimit) <= 0) errors.highlightLimit = 'El límite de destacados es requerido';
    if (!userType) errors.userType = 'El tipo de usuario es requerido';

    if (errors.name || errors.description || errors.price || errors.currency || errors.propertyLimit || errors.highlightLimit || errors.userType) {
      setFieldErrors(errors);
      return;
    }

    saveMutation.mutate();
  };

  return (
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

        <form className="partner-form-content" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
            <InputField              
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descripción"
              multiline
              rows={6}
              error={fieldErrors.description}
              required
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
                value={price !== undefined ? formatNumbers(Number(price)) : ""}
                onChange={(event) => handleChangeNumbersInput(event, (value: number | undefined) => setPrice(value))}
                required={true}
                error={fieldErrors.price}
              />
            </div>
          </div>
          <div className="partner-form-section">
            <label className="partner-form-label">Nivel de prioridad</label>
            <InputField2
              label="Nivel de prioridad"
              type="text"
              placeholder="Nivel de prioridad"
              value={propertyLimit !== undefined ? formatNumbers(Number(propertyLimit)) : ""}
              onChange={(event) => handleChangeNumbersInput(event, (value: number | undefined) => setPropertyLimit(value))}
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
              value={highlightLimit !== undefined ? formatNumbers(Number(highlightLimit)) : ""}
              onChange={(event) => handleChangeNumbersInput(event, (value: number | undefined) => setHighlightLimit(value))}
              required={true}
              error={fieldErrors.highlightLimit}
            />
          </div>
          <div className="partner-form-section">
            <label className="partner-form-label">Tipo de usuario</label>
            <Select
              options={[
                { value: PlanUserType.INDIVIDUAL, label: 'Individual' },
                { value: PlanUserType.COMPANY, label: 'Empresa' },
              ]}
              value={userType || PlanUserType.COMPANY}
              onChange={setUserType}
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
            type="button"
            variant="primary"
            buttonType="1"
            fullWidth={true}
            size="medium"
            onClick={handleSubmit}
          />
        </div>
      </div>
  );
}
