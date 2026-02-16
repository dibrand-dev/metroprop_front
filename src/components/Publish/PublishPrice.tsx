'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishPrice.scss';

const iconChevron = '/icons/chevron-up.svg';
const iconBack = '/icons/arrow.svg';

const currencyOptions = ['$', 'USD', 'EUR'];

export default function PublishPrice() {
  const router = useRouter();
  const [rentCurrency, setRentCurrency] = useState('$');
  const [rentAmount, setRentAmount] = useState('700000');
  const [expenseCurrency, setExpenseCurrency] = useState('$');
  const [expenseAmount, setExpenseAmount] = useState('100000');
  const [withoutExpenses, setWithoutExpenses] = useState(false);
  const [openCurrency, setOpenCurrency] = useState<'rent' | 'expense' | null>(null);

  const rentPlaceholder = useMemo(() => 'Ej. 700000', []);
  const expensePlaceholder = useMemo(() => 'Ej. 100000', []);

  const toggleCurrency = (field: 'rent' | 'expense') => {
    setOpenCurrency((prev) => (prev === field ? null : field));
  };

  const handleCurrencySelect = (field: 'rent' | 'expense', value: string) => {
    if (field === 'rent') {
      setRentCurrency(value);
    } else {
      setExpenseCurrency(value);
    }
    setOpenCurrency(null);
  };

  const handleBack = () => {
    router.push('/protected/publish/description');
  };

  const handleContinue = () => {
    router.push('/protected/publish/plans');
  };

  return (
    <div className="publish-price">
      <div className="publish-price-inner">
        <div className="publish-price-card">
          <div className="publish-price-top">
            <div className="publish-price-route">
              <p>Venta - Casa Duplex</p>
              <p>Juncal 2345</p>
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
                  <div className="publish-price-select">
                    <button
                      type="button"
                      className="publish-price-select-button"
                      onClick={() => toggleCurrency('rent')}
                    >
                      <span>{rentCurrency}</span>
                      <img src={iconChevron} alt="" />
                    </button>
                    {openCurrency === 'rent' ? (
                      <div className="publish-price-options">
                        {currencyOptions.map((option) => (
                          <button
                            key={`rent-${option}`}
                            type="button"
                            onClick={() => handleCurrencySelect('rent', option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    value={rentAmount}
                    onChange={(event) => setRentAmount(event.target.value)}
                    placeholder={rentPlaceholder}
                  />
                </div>
              </div>

              <div className="publish-price-field">
                <label>Expensas</label>
                <div className="publish-price-inputs">
                  <div className="publish-price-select">
                    <button
                      type="button"
                      className="publish-price-select-button"
                      onClick={() => toggleCurrency('expense')}
                    >
                      <span>{expenseCurrency}</span>
                      <img src={iconChevron} alt="" />
                    </button>
                    {openCurrency === 'expense' ? (
                      <div className="publish-price-options">
                        {currencyOptions.map((option) => (
                          <button
                            key={`expense-${option}`}
                            type="button"
                            onClick={() => handleCurrencySelect('expense', option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    value={expenseAmount}
                    onChange={(event) => setExpenseAmount(event.target.value)}
                    placeholder={expensePlaceholder}
                    disabled={withoutExpenses}
                  />
                </div>
                <label className="publish-price-checkbox">
                  <input
                    type="checkbox"
                    checked={withoutExpenses}
                    onChange={(event) => setWithoutExpenses(event.target.checked)}
                  />
                  <span>Sin expensas</span>
                </label>
              </div>
            </div>
          </div>

          <div className="publish-price-footer">
            <button className="publish-price-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
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
