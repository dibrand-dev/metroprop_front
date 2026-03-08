'use client';

import { useState, useCallback } from 'react';
import './Publish.scss';
import { API_BASE_URL } from '@/utils/utils';

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
import { OperationType, OPERATION_TYPE_LABELS, CreatePropertyDraft } from '@/types/propiedad';

const operationOptions: OperationType[] = [OperationType.VENTA, OperationType.ALQUILER, OperationType.ALQUILER_TEMPORAL, OperationType.EMPRENDIMIENTO];

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

export default function Publish() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.INITIAL);
  const [wizardData, setWizardData] = useState<CreatePropertyDraft>({} as CreatePropertyDraft);

  const getCurrentFlow = useCallback(() => {
    if (wizardData.operation_type === OperationType.EMPRENDIMIENTO) {
      return EMPRENDIMIENTO_FLOW;
    }
    return REGULAR_FLOW;
  }, [wizardData.operation_type]);

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

  const updateWizardData = useCallback((stepData: Partial<CreatePropertyDraft>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  }, []);

  const handleSelect = (option: OperationType) => {
    updateWizardData({ operation_type: option });
    if (option === OperationType.EMPRENDIMIENTO) {
      setCurrentStep(WizardStep.EMPRENDIMIENTO);
    } else {
      setCurrentStep(WizardStep.PROPERTY_TYPE);
    }
  };

  const saveDraftProperty = async () => {
    // Ensure we have minimum required data
    if (!wizardData.operation_type || !wizardData.property_type) {
      console.error('Missing required data for draft creation');
      goToNextStep();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/properties/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          operation_type: wizardData.operation_type,
          property_type: wizardData.property_type,
          ...(wizardData.property_subtype && { property_subtype: wizardData.property_subtype }),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Error creating property draft';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        console.error('Draft creation failed:', errorMessage);
        // Continue to next step even if draft creation fails
        goToNextStep();
        return;
      }

      const draftData = await response.json();
      
      // Store draft ID in wizard data for future updates
      updateWizardData({ draft_id: draftData.id });
      
      goToNextStep();
    } catch (error) {
      console.error('Error creating draft:', error);
      // Continue to next step even if draft creation fails
      goToNextStep();
    }
  };
  
  const saveCurrentStep = async (wizardDataUpdate: Partial<CreatePropertyDraft>) => {
    const _wizardDataUpdate = { ...wizardDataUpdate };   
    const response = await fetch(`${API_BASE_URL}/properties/${wizardData.draft_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_wizardDataUpdate),
    });
    goToNextStep();
  }

  const saveAndExit = async () => {
    if (wizardData.draft_id) {
      try {
        await fetch(`${API_BASE_URL}/properties/${wizardData.draft_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wizardData),
        });
        console.log('Draft saved successfully');
        // Navigate to properties list or home page
        window.location.href = '/';
      } catch (error) {
        console.error('Error saving draft:', error);
        // Still navigate away even if save fails
        window.location.href = '/';
      }
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
                    {OPERATION_TYPE_LABELS[option]}
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
            onNext={saveDraftProperty}
            onBack={goToPreviousStep}
          />
        );

      case WizardStep.LOCATION:
        return (
          <PublishLocation
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(locationData) => saveCurrentStep(locationData)}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.CONTENT:
        return (
          <PublishContent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => goToNextStep()}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.DESCRIPTION:
        return (
          <PublishPropertyDescription
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => saveCurrentStep(wizardData)}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.MAIN_INFO:
        return (
          <PublishMainInfo
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => saveCurrentStep(wizardData)}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.PRICE:
        return (
          <PublishPrice
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => saveCurrentStep(wizardData)}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.PROPERTY_CONTENT:
        return (
          <PublishPropertyContent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => saveCurrentStep(wizardData)}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.FINAL_REVIEW:
        return (
          <PublishFinalReview
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => saveCurrentStep(wizardData)}
            onBack={goToPreviousStep}
            onSaveAndExit={saveAndExit}
          />
        );

      case WizardStep.PLANS:
        return (
          <PublishPlans
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => saveCurrentStep(wizardData)}
            onBack={goToPreviousStep}
            onComprar={goToBuyPlan}
            onSaveAndExit={saveAndExit}
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
