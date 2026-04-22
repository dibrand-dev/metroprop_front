'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import './Publish.scss';
import { API_BASE_URL } from '@/utils/utils';
import { useSession } from 'next-auth/react';

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

export default function Publish({ propertyId }: { propertyId?: string } = {}) {
  const isEditMode = !!propertyId;
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.INITIAL);
  const [wizardData, setWizardData] = useState<CreatePropertyDraft>({} as CreatePropertyDraft);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const { data: sessionData } = useSession();

  // ── Load existing property into wizard when editing
  useEffect(() => {
    if (!propertyId) return;
    setIsLoadingProperty(true);
    fetch(`${API_BASE_URL}/properties/${propertyId}`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching property');
        return res.json();
      })
      .then(data => {
        // Map the property to the wizard draft shape.
        // draft_id = property id so all PATCH / multimedia calls target the right endpoint.
        setWizardData({ ...data, draft_id: data.id });
        if (data.operation_type === OperationType.EMPRENDIMIENTO) {
          setCurrentStep(WizardStep.EMPRENDIMIENTO);
        }
        // For regular properties, stay at INITIAL so the operation type is shown pre-selected
      })
      .catch(err => console.error('Error loading property for edit:', err))
      .finally(() => setIsLoadingProperty(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);
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

  const createDraftMutation = useMutation({
    mutationFn: async (draftData: Partial<CreatePropertyDraft>) => {
      const user_id = sessionData?.user?.id;
      const organization_id = sessionData?.user?.organization_id ?? undefined;
      const branch_id = sessionData?.user?.branch_id;
      if (!user_id) throw new Error('User not authenticated');

      const response = await fetch(`${API_BASE_URL}/properties/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          organization_id,
          branch_id,
          operation_type: draftData.operation_type,
          property_type: draftData.property_type,
          ...(draftData.property_subtype && { property_subtype: draftData.property_subtype }),
        }),
      });
      if (!response.ok) throw new Error('Error creating draft');
      return response.json();
    }
  });

  const saveDraftProperty = async () => {
    if (!wizardData.operation_type || !wizardData.property_type) {
      console.error('Missing required data for draft creation');
      goToNextStep();
      return;
    }

    // Edit mode: property already exists, just PATCH and advance
    if (wizardData.draft_id) {
      try {
        await updatePropertyMutation.mutateAsync({
          operation_type: wizardData.operation_type,
          property_type: wizardData.property_type,
          ...(wizardData.property_subtype && { property_subtype: wizardData.property_subtype }),
        });
      } catch (error: any) {
        console.error('Error updating property type:', error?.message || error);
      }
      goToNextStep();
      return;
    }

    // Create mode: create a new draft
    try {
      const draftData = await createDraftMutation.mutateAsync(wizardData);
      updateWizardData({ draft_id: draftData.id });
      goToNextStep();
    } catch (error: any) {
      console.error('Error creating draft:', error?.message || error);
      goToNextStep();
    }
  };
  
  const updatePropertyMutation = useMutation({
    mutationFn: async (updateData: Partial<CreatePropertyDraft>) => {
      const response = await fetch(`${API_BASE_URL}/properties/${wizardData.draft_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Error updating property');
      return response.json();
    }
  });

  const saveCurrentStep = async (wizardDataUpdate: Partial<CreatePropertyDraft>, nextStep: boolean) => {
    const _wizardDataUpdate = {...wizardDataUpdate};

    if (!wizardData.draft_id) {
      const draftData = await createDraftMutation.mutateAsync(wizardData);
      updateWizardData({ draft_id: draftData.id });
    }
    
    try {
      await updatePropertyMutation.mutateAsync(_wizardDataUpdate);
    } catch (error: any) {
      console.error('Error updating property:', error?.message || error);
    }
    if (nextStep) {
      goToNextStep();
    }
  }
console.log('wizardData:', wizardData);
  const renderCurrentStep = () => {
    if (isLoadingProperty) {
      return (
        <div className="publish-page">
          <div className="publish-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p>Cargando propiedad...</p>
          </div>
        </div>
      );
    }
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
                    className={`publish-option${wizardData.operation_type === option ? ' publish-option--selected' : ''}`}
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
            onNext={(locationData) => saveCurrentStep(locationData, true)}
            onBack={goToPreviousStep}
            onSaveAndExit={(locationData) => saveCurrentStep(locationData, false)}
          />
        );

      case WizardStep.CONTENT:
        return (
          <PublishContent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => goToNextStep()}
            onBack={goToPreviousStep}
            onSaveAndExit={() => window.location.href = '/'}
          />
        );

      case WizardStep.DESCRIPTION:
        return (
          <PublishPropertyDescription
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(descriptionData) => saveCurrentStep(descriptionData, true)}
            onBack={goToPreviousStep}
            onSaveAndExit={(descriptionData) => saveCurrentStep(descriptionData, false)}
          />
        );

      case WizardStep.MAIN_INFO:
        return (
          <PublishMainInfo
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(mainData) => saveCurrentStep(mainData, true)}
            onBack={goToPreviousStep}
            onSaveAndExit={(mainData) => saveCurrentStep(mainData, false)}
          />
        );

      case WizardStep.PRICE:
        return (
          <PublishPrice
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(priceData) => saveCurrentStep(priceData, true)}
            onBack={goToPreviousStep}
            onSaveAndExit={(priceData) => saveCurrentStep(priceData, false)}
          />
        );

      case WizardStep.PROPERTY_CONTENT:
        return (
          <PublishPropertyContent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(propertyContentUpdate) => saveCurrentStep(propertyContentUpdate, true)}
            onBack={goToPreviousStep}
            onSaveAndExit={(propertyContentUpdate) => saveCurrentStep(propertyContentUpdate, false)}
          />
        );

      case WizardStep.FINAL_REVIEW:
        return (
          <PublishFinalReview
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(wizardData) => saveCurrentStep(wizardData, true)}
            onBack={goToPreviousStep}
            onSaveAndExit={(wizardData) => saveCurrentStep(wizardData, false)}
            isEditMode={isEditMode}
          />
        );

      case WizardStep.PLANS:
        return (
          <PublishPlans
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(plansUpdate) => saveCurrentStep(plansUpdate, true)}
            onBack={goToPreviousStep}
            onComprar={goToBuyPlan}
            onSaveAndExit={(plansUpdate) => saveCurrentStep(plansUpdate, false)}
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
