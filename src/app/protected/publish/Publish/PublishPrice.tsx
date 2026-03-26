'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPrice.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';

const iconChevron = '/icons/chevron-up.svg';

const currencyOptions = ['ARS', 'USD', 'EUR'];

interface PublishPriceProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (priceData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: () => void;
}

export default function PublishPrice({
  wizardData,  
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit
}: PublishPriceProps) {
  const [currency, setCurrency] = useState(wizardData.currency || 'ARS');
  const [price, setPrice] = useState<number | undefined>(wizardData.price || undefined);
  const [expenses, setExpenses] = useState<number | undefined>(wizardData.expenses || undefined);
  const [currency_expenses, setCurrency_expenses] = useState(wizardData.currency_expenses || 'ARS');
  const [withoutExpenses, setWithoutExpenses] = useState(false);

  const currencySelectOptions = currencyOptions.map(option => ({
    value: option,
    label: option,
  }));

  // Update wizard data when price data changes
  useEffect(() => {
    updateWizardData({
      currency,
      currency_expenses,
      price,
      expenses: withoutExpenses ? 0 : expenses
    });
  }, [currency, price, expenses, currency_expenses, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext({
      currency,
      price,
      currency_expenses,
      expenses: withoutExpenses ? 0 : expenses
    });
  };

  return (
    <div className="publish-price">
      <div className="publish-price-inner">
        <div className="publish-price-card">
          <div className="publish-price-top">
            <div className="publish-price-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-price-link" type="button" onClick={onSaveAndExit}>
              Guardar y salir
            </button>
          </div>

          <div className="publish-price-status">
            <span className="publish-price-segment is-filled" />
            <span className="publish-price-segment is-filled" />
            <span className="publish-price-segment is-partial" />
          </div>

          <div className="publish-price-section">
            <div className="publish-price-header">
              <h1>Ingresa el precio</h1>
              <span>Datos obligatorios(*)</span>
            </div>

            <div className="publish-price-fields">
              <div className="publish-price-field">
                <label>{wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''}*</label>
                <div className="publish-price-inputs">
                  <Select
                    options={currencySelectOptions}
                    value={currency}
                    onChange={(value) => setCurrency(value)}
                  />
                  <InputField
                    value={price ?? null}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    placeholder={'Ej. 700000'}
                    type="number"
                  />
                </div>
              </div>

              <div className="publish-price-field">
                <label>Expensas</label>
                <div className="publish-price-inputs">
                  <Select
                    options={currencySelectOptions}
                    value={currency_expenses}
                    onChange={(value) => setCurrency_expenses(value)}
                    disabled={withoutExpenses}
                  />
                  <InputField
                    value={expenses ?? null}
                    onChange={(event) => setExpenses(Number(event.target.value))}
                    placeholder="Ej. 100000"
                    type="number"
                    disabled={withoutExpenses}
                  />
                </div>
                <Checkbox
                  label="Sin expensas"
                  checked={withoutExpenses}
                  onChange={(checked) => setWithoutExpenses(checked)}
                />
              </div>
            </div>
          </div>

          <div className="publish-price-footer">
            <button className="publish-price-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button className="publish-price-continue" type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
