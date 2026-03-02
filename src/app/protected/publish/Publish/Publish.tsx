'use client';

import { useState, useCallback } from 'react';
import './Publish.scss';

// Import all step components
import PublishPropertyType from './PublishPropertyType';
import PublishLocation from './PublishLocation';
import PublishContent from './PublishContent';
import PublishPropertyDescription from './PublishPropertyDescription';
import PublishMainInfo from './PublishMainInfo';
import PublishPrice from './PublishPrice';
import PublishPropertyContent from './PublishPropertyContent';
import PublishFinalReview from './PublishFinalReview';
import PublishPlans from './PublishPlans';
import PublishCheckoutDetail from './PublishCheckoutDetail';
import PublishCheckoutPayment from './PublishCheckoutPayment';
import PublishCheckoutSuccess from './PublishCheckoutSuccess';
import PublishEmprendimiento from './PublishEmprendimiento';

const operationOptions = ['Venta', 'Alquiler', 'Temporal', 'Emprendimiento'];

// Define wizard steps
enum WizardStep {
  INITIAL = 'initial',
  PROPERTY_TYPE = 'property-type',
  LOCATION = 'location',
  CONTENT = 'content',
  DESCRIPTION = 'description',
  MAIN_INFO = 'main-info',
  PRICE = 'price',
  PROPERTY_CONTENT = 'property-content',
  FINAL_REVIEW = 'final-review',
  PLANS = 'plans',
  CHECKOUT_DETAIL = 'checkout-detail',
  CHECKOUT_PAYMENT = 'checkout-payment',
  CHECKOUT_SUCCESS = 'checkout-success',
  EMPRENDIMIENTO = 'emprendimiento'
}

// Define step flow based on operation type
const REGULAR_FLOW = [
  WizardStep.INITIAL,
  WizardStep.PROPERTY_TYPE,
  WizardStep.LOCATION,
  WizardStep.CONTENT,
  WizardStep.MAIN_INFO,
  WizardStep.PROPERTY_CONTENT,
  WizardStep.DESCRIPTION,
  WizardStep.PRICE, 
  WizardStep.PLANS,
  WizardStep.FINAL_REVIEW,
  WizardStep.CHECKOUT_DETAIL,
  WizardStep.CHECKOUT_PAYMENT,
  WizardStep.CHECKOUT_SUCCESS
];

const EMPRENDIMIENTO_FLOW = [
  WizardStep.INITIAL,
  WizardStep.EMPRENDIMIENTO
];

interface WizardData {
  operation?: string;
  propertyType?: string;
  propertySubtype?: string;
  location?: any;
  content?: any;
  description?: any;
  mainInfo?: any;
  price?: any;
  propertyContent?: any;
}

export default function Publish() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.INITIAL);
  const [wizardData, setWizardData] = useState<WizardData>({});

  const getCurrentFlow = useCallback(() => {
    if (wizardData.operation === 'Emprendimiento') {
      return EMPRENDIMIENTO_FLOW;
    }
    return REGULAR_FLOW;
  }, [wizardData.operation]);

  const getCurrentStepIndex = useCallback(() => {
    const flow = getCurrentFlow();
    return flow.indexOf(currentStep);
  }, [currentStep, getCurrentFlow]);

  const goToNextStep = useCallback(() => {
    const flow = getCurrentFlow();
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < flow.length - 1) {
      setCurrentStep(flow[currentIndex + 1]);
    }
  }, [getCurrentFlow, getCurrentStepIndex]);

  const goToPreviousStep = useCallback(() => {
    const flow = getCurrentFlow();
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(flow[currentIndex - 1]);
    }
  }, [getCurrentFlow, getCurrentStepIndex]);

  const goToBuyPlan = useCallback(() => {
    setCurrentStep(WizardStep.CHECKOUT_DETAIL); // Ir directamente al paso de checkout detail
  }, [getCurrentFlow, getCurrentStepIndex]);

  const updateWizardData = useCallback((stepData: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  }, []);

  const handleSelect = (option: string) => {
    updateWizardData({ operation: option });
    if (option === 'Emprendimiento') {
      setCurrentStep(WizardStep.EMPRENDIMIENTO);
    } else {
      setCurrentStep(WizardStep.PROPERTY_TYPE);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case WizardStep.INITIAL:
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

      case WizardStep.PROPERTY_TYPE:
        return (
          <PublishPropertyType
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.LOCATION:
        return (
          <PublishLocation
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.CONTENT:
        return (
          <PublishContent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.DESCRIPTION:
        return (
          <PublishPropertyDescription
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.MAIN_INFO:
        return (
          <PublishMainInfo
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.PRICE:
        return (
          <PublishPrice
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.PROPERTY_CONTENT:
        return (
          <PublishPropertyContent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.FINAL_REVIEW:
        return (
          <PublishFinalReview
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.PLANS:
        return (
          <PublishPlans
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onComprar={goToBuyPlan}
          />
        );

      case WizardStep.CHECKOUT_DETAIL:
        return (
          <PublishCheckoutDetail
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => setCurrentStep(WizardStep.CHECKOUT_PAYMENT)}
            onBack={() => setCurrentStep(WizardStep.PLANS)}
          />
        );

      case WizardStep.CHECKOUT_PAYMENT:
        return (
          <PublishCheckoutPayment
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => setCurrentStep(WizardStep.CHECKOUT_SUCCESS)}
            onBack={() => setCurrentStep(WizardStep.CHECKOUT_DETAIL)}
          />
        );

      case WizardStep.CHECKOUT_SUCCESS:
        return (
          <PublishCheckoutSuccess
            onFinish={() => setCurrentStep(WizardStep.PLANS)}
          />
        );

      case WizardStep.EMPRENDIMIENTO:
        return (
          <PublishEmprendimiento
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentStep();
}
