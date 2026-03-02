'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPrice.scss';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import Checkbox from '@/ui/Checkbox/Checkbox';

const iconChevron = '/icons/chevron-up.svg';

const currencyOptions = ['$', 'USD', 'EUR'];

interface PublishPriceProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PublishPrice({
  wizardData,  
  updateWizardData,
  onNext,
  onBack,
}: PublishPriceProps) {
  const [rentCurrency, setRentCurrency] = useState(wizardData.price?.rentCurrency || '$');
  const [rentAmount, setRentAmount] = useState(wizardData.price?.rentAmount || '700000');
  const [expenseCurrency, setExpenseCurrency] = useState(wizardData.price?.expenseCurrency || '$');
  const [expenseAmount, setExpenseAmount] = useState(wizardData.price?.expenseAmount || '100000');
  const [withoutExpenses, setWithoutExpenses] = useState(wizardData.price?.withoutExpenses || false);

  const rentPlaceholder = useMemo(() => 'Ej. 700000', []);
  const expensePlaceholder = useMemo(() => 'Ej. 100000', []);

  const currencySelectOptions = currencyOptions.map(option => ({
    value: option,
    label: option,
  }));

  // Update wizard data when price data changes
  useEffect(() => {
    updateWizardData({
      price: {
        rentCurrency,
        rentAmount,
        expenseCurrency,
        expenseAmount,
        withoutExpenses,
      },
    });
  }, [rentCurrency, rentAmount, expenseCurrency, expenseAmount, withoutExpenses, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="publish-price">
      <div className="publish-price-inner">
        <div className="publish-price-card">
          <div className="publish-price-top">
            <div className="publish-price-route">
              {wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}<br />{wizardData.location?.address}
            </div>
            <button className="publish-price-link" type="button">
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
                <label>Alquiler*</label>
                <div className="publish-price-inputs">
                  <Select
                    options={currencySelectOptions}
                    value={rentCurrency}
                    onChange={(value) => setRentCurrency(value)}
                  />
                  <InputField
                    value={rentAmount}
                    onChange={(event) => setRentAmount(event.target.value)}
                    placeholder={rentPlaceholder}
                    type="number"
                  />
                </div>
              </div>

              <div className="publish-price-field">
                <label>Expensas</label>
                <div className="publish-price-inputs">
                  <Select
                    options={currencySelectOptions}
                    value={expenseCurrency}
                    onChange={(value) => setExpenseCurrency(value)}
                    disabled={withoutExpenses}
                  />
                  <InputField
                    value={expenseAmount}
                    onChange={(event) => setExpenseAmount(event.target.value)}
                    placeholder={expensePlaceholder}
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
