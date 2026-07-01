'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPrice.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import Button from '@/ui/Button/Button';
import { formatNumbers } from '@/utils/utils';

const iconChevron = '/icons/chevron-up.svg';

const currencyOptions = ['ARS', 'USD', 'EUR'];

interface PublishPriceProps {
  wizardData: CreatePropertyDraft & {withoutExpenses?: boolean};
  updateWizardData: (data: Partial<CreatePropertyDraft & {withoutExpenses?: boolean}>) => void;
  onNext: (priceData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: (priceData: Partial<CreatePropertyDraft>) => void;
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
  const [withoutExpenses, setWithoutExpenses] = useState(wizardData.withoutExpenses || false);

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
      expenses: withoutExpenses ? 0 : expenses,
      withoutExpenses
    });
  }, [currency, price, expenses, currency_expenses, withoutExpenses, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = (continueFlag = true) => {
    if (!continueFlag) {
      onSaveAndExit({
        currency,
        price,
        currency_expenses,
        expenses: withoutExpenses ? 0 : expenses
      });
    } else {
      onNext({
        currency,
        price,
        currency_expenses,
        expenses: withoutExpenses ? 0 : expenses
      });
    }
  };

  const handleChangeNumbersInput = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    // limpiar todo lo que no sea número
    const raw = event.target.value.replace(/\D/g, "");

    if (raw === "") {
      if('price' === field) {
        setPrice(undefined);
      } else if('expenses' === field) {
        setExpenses(undefined);
      }

      return;
    }
    const parsed = parseInt(raw, 10);
    if('price' === field) {
      setPrice(isNaN(parsed) ? undefined : parsed);
    } else if('expenses' === field) {
      setExpenses(isNaN(parsed) ? undefined : parsed);
    }

      return;
  }

  return (
    <div className="publish-price">
      <div className="publish-price-inner">
        <div className="publish-price-card">
          <div className="publish-price-top">
            <div className="publish-price-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ?  '- ' + PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-price-link" type="button" onClick={() => handleContinue(false)}>
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
              <h1>Ingresá el precio</h1>
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
                  { /*
                  <InputField
                    value={price ?? null}
                    onChange={(event) => setPrice(Number(event.target.value) || undefined)}
                    placeholder={'Ej. 700000'}
                    type="number"
                  /> */}
                  <InputField
                    value={price !== undefined ? formatNumbers(Number(price)) : ""}
                    onChange={(event) => handleChangeNumbersInput(event, 'price')}
                    placeholder={'Ej. 700000'}
                    type="text"
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
                  { /*
                  <InputField
                    value={expenses ?? null}
                    onChange={(event) => setExpenses(Number(event.target.value) || undefined)}
                    placeholder="Ej. 100000"
                    type="number"
                    disabled={withoutExpenses}
                  /> */}
                  <InputField
                    value={expenses !== undefined ? formatNumbers(Number(expenses)) : ""}
                    onChange={(event) => handleChangeNumbersInput(event, 'expenses')}
                    placeholder="Ej. 100000"
                    type="text"
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
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-price-back"
            />
            <Button
              onClick={() => handleContinue(true)}
              label="Continuar" // isRole3
              disabled={!price || price <= 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
