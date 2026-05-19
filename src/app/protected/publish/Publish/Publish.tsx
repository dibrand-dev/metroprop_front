'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import './Publish.scss';
import { API_BASE_URL } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiFetch';

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
import { OperationType, OPERATION_TYPE_LABELS, CreatePropertyDraft, PropertyType } from '@/types/propiedad';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { Plan } from '@/types/plan';
import PublishEmprendimientoAmenidades from './PublishEmprendimientoAmenidades';
import PublishEmprendimientoPreview from './PublishEmprendimientoPreview';
import PublishEmprendimientoUnidades from './PublishEmprendimientoUnidades';
import PublishPlansEmprendimiento from './PublishEmprendimientoPlan';
import { EmprendimientoStep } from './EmprendimientoTabs';

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
  EMPRENDIMIENTO = 'emprendimiento',
  EMPRENDIMIENTO_AMENITIES = 'emprendimiento-amenities',
  EMPRENDIMIENTO_UNITS = 'emprendimiento-units',
  EMPRENDIMIENTO_PLANS = 'emprendimiento-plans',
  EMPRENDIMIENTO_PREVIEW = 'emprendimiento-preview'
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
  WizardStep.EMPRENDIMIENTO,
  WizardStep.EMPRENDIMIENTO_AMENITIES,
  WizardStep.EMPRENDIMIENTO_UNITS,
  WizardStep.EMPRENDIMIENTO_PLANS,
  WizardStep.EMPRENDIMIENTO_PREVIEW
];

export default function Publish({ propertyId }: { propertyId?: string } = {}) {
  const isEditMode = !!propertyId;
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.INITIAL);
  const [wizardData, setWizardData] = useState<CreatePropertyDraft>({} as CreatePropertyDraft);
  const [planToBuy, setPlanToBuy] = useState<Plan & { branchId: number } | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const { data: sessionData } = useSession();
  const [showSuccessModal, setShowSuccessModal] = useState(false);  

  // ── Load existing property into wizard when editing
  useEffect(() => {
    if (!propertyId) return;
    setIsLoadingProperty(true);
    apiFetch(`${API_BASE_URL}/properties/${propertyId}`)
      .then(data => {
        // Map the property to the wizard draft shape.
        // draft_id = property id so all PATCH / multimedia calls target the right endpoint.
        setWizardData({ ...data, draft_id: (data as any).id });
        if ((data as any).operation_type === OperationType.EMPRENDIMIENTO) {
          setCurrentStep(WizardStep.EMPRENDIMIENTO);
        } else {
          // Skip steps 1 and 2 (operation type & property type) when editing
          setCurrentStep(WizardStep.LOCATION);
        }
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

  const goToBuyPlanEmprendimiento = useCallback((plan: Plan, branchId?: number) => {
    setPlanToBuy({ ...plan, branchId: branchId ?? 0 });
    setCurrentStep(WizardStep.EMPRENDIMIENTO_PREVIEW); // Ir directamente al paso de checkout detail
  }, [getCurrentFlow, getCurrentStepIndex]);

  const goToBuyPlan= useCallback((plan: Plan, branchId?: number) => {
    setPlanToBuy({ ...plan, branchId: branchId ?? 0 });
    setCurrentStep(WizardStep.CHECKOUT_DETAIL); // Ir directamente al paso de checkout detail
  }, [getCurrentFlow, getCurrentStepIndex]);


  const updateWizardData = useCallback((stepData: Partial<CreatePropertyDraft>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  }, []);

  const handleSelect = async (option: OperationType) => {
    updateWizardData({ operation_type: option });
    if (option === OperationType.EMPRENDIMIENTO) {
      saveDraftProperty(true).then(() => {
        setCurrentStep(WizardStep.EMPRENDIMIENTO);
      });
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

      return apiFetch(`${API_BASE_URL}/properties/draft`, {
        method: 'POST',
        body: {
          user_id,
          organization_id,
          branch_id,
          operation_type: draftData.operation_type,
          property_type: draftData.property_type,
          is_development: draftData.is_development,
          ...(draftData.property_subtype && { property_subtype: draftData.property_subtype }),
        },
      });
    }
  });

  const saveDraftProperty = async (is_development= false) => {
    if (!is_development && (!wizardData.operation_type || !wizardData.property_type)) {
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

    const _wizardData = {...wizardData};
    if (is_development) {
      _wizardData.operation_type = OperationType.VENTA;
      _wizardData.property_type = PropertyType.EMPRENDIMIENTO;
      _wizardData.is_development = true;
    }

    // Create mode: create a new draft
    try {
      const draftData = await createDraftMutation.mutateAsync(_wizardData);
      updateWizardData({ draft_id: draftData.id });
      goToNextStep();
    } catch (error: any) {
      console.error('Error creating draft:', error?.message || error);
      goToNextStep();
    }
  };
  
  const updatePropertyMutation = useMutation({
    mutationFn: async (updateData: Partial<CreatePropertyDraft>) => {
      return apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}`, {
        method: 'PATCH',
        body: updateData,
      });
    }
  });

  const updateEmprendimientoMutation = useMutation({
    mutationFn: async (updateData: Partial<CreatePropertyDraft>) => {
      return apiFetch(`${API_BASE_URL}/properties/development/${wizardData.draft_id}`, {
        method: 'PATCH',
        body: updateData,
      });
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

  const saveCurrentStepEmprendimiento = async (wizardDataUpdate: Partial<CreatePropertyDraft>, nextStep: boolean) => {
    const _wizardDataUpdate = {...wizardDataUpdate};    
    delete _wizardDataUpdate.draft_id;
    _wizardDataUpdate.operation_type = OperationType.VENTA;
    try {
      await updateEmprendimientoMutation.mutateAsync(_wizardDataUpdate);
    } catch (error: any) {
      console.error('Error updating property:', error?.message || error);
    }
    if (nextStep) {
      goToNextStep();
    }
  }

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
            isEditMode={isEditMode}
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
          <>
            <PublishFinalReview
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={(wizardData) => saveCurrentStep(wizardData, false).then(() => {
                // show message under button "Propiedad publicada con éxito" for 3 seconds before redirecting to myProperties page
                setShowSuccessModal(true);
                setTimeout(() => {
                  window.location.href = '/protected/myProperties';
                }, 3000);
              })}
              onBack={goToPreviousStep}
              onSaveAndExit={(wizardData) => saveCurrentStep(wizardData, false)}
              isEditMode={isEditMode}
            />
            {showSuccessModal && <SuccessModal title="¡Propiedad publicada con éxito!" text="Tu propiedad ya está disponible en el sitio. Serás redirigido a Mis Propiedades en unos segundos." />}
          
          </>
        );

      case WizardStep.PLANS:
        return (
          <PublishPlans
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(plansUpdate) => saveCurrentStep(plansUpdate, true)}
            onBack={goToPreviousStep}
            onComprar={(plan, branchId) => goToBuyPlan(plan, branchId)}
            onSaveAndExit={(plansUpdate) => saveCurrentStep(plansUpdate, false)}
          />
        );

      case WizardStep.CHECKOUT_DETAIL:
        return (
          <PublishCheckoutDetail
            planToBuy={planToBuy}
            onNext={() => setCurrentStep(WizardStep.CHECKOUT_PAYMENT)}
            onBack={() => setCurrentStep(WizardStep.PLANS)}
          />
        );

      case WizardStep.CHECKOUT_PAYMENT:
        return (
          <PublishCheckoutPayment
            planToBuy={planToBuy}
            branchID={planToBuy?.branchId}
            onNext={() => setCurrentStep(WizardStep.CHECKOUT_SUCCESS)}
            onBack={() => setCurrentStep(WizardStep.CHECKOUT_DETAIL)}
          />
        );

      case WizardStep.CHECKOUT_SUCCESS:
        return (
          <PublishCheckoutSuccess
            planToBuy={planToBuy}
            onFinish={() => setCurrentStep(WizardStep.PLANS)}
          />
        );

      case WizardStep.EMPRENDIMIENTO:
        return (
          <PublishEmprendimiento
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(emprendimientoUpdate) => saveCurrentStepEmprendimiento(emprendimientoUpdate, true)}
            onSaveAndExit={(plansUpdate) => saveCurrentStepEmprendimiento(plansUpdate, false)}
            goToStep={(step: EmprendimientoStep) => setCurrentStep(step as WizardStep)}
          />
        );

      case WizardStep.EMPRENDIMIENTO_AMENITIES:
        return (
          <PublishEmprendimientoAmenidades
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(emprendimientoUpdate) => saveCurrentStepEmprendimiento(emprendimientoUpdate, true)}
            onSaveAndExit={(plansUpdate) => saveCurrentStepEmprendimiento(plansUpdate, false)}
            goToStep={(step: EmprendimientoStep) => setCurrentStep(step as WizardStep)}
          />
        );

      case WizardStep.EMPRENDIMIENTO_UNITS:
        return (
          <PublishEmprendimientoUnidades
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={() => goToNextStep()}
            onSaveAndExit={(plansUpdate) => saveCurrentStepEmprendimiento(plansUpdate, false)}
            goToStep={(step: EmprendimientoStep) => setCurrentStep(step as WizardStep)}
          />
        );

      case WizardStep.EMPRENDIMIENTO_PLANS:
        return (
          <PublishPlansEmprendimiento
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onNext={(emprendimientoUpdate) => saveCurrentStepEmprendimiento(emprendimientoUpdate, true)}
            // onBack={goToPreviousStep}
            goToStep={(step: EmprendimientoStep) => setCurrentStep(step as WizardStep)}
            onComprar={(plan, branchId) => goToBuyPlanEmprendimiento(plan, branchId)}
            onSaveAndExit={(plansUpdate) => saveCurrentStepEmprendimiento(plansUpdate, false)}
          />
        );
      
      case WizardStep.EMPRENDIMIENTO_PREVIEW:
        return (
          <>
            <PublishEmprendimientoPreview
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={(wizardData) => saveCurrentStep(wizardData, false).then(() => {
                setShowSuccessModal(true);
                setTimeout(() => {
                  window.location.href = '/protected/myProperties';
                }, 3000);
              })}
              onBack={goToPreviousStep}
              onSaveAndExit={(wizardData) => saveCurrentStepEmprendimiento(wizardData, false)}
              isEditMode={isEditMode}
              goToStep={(step: EmprendimientoStep) => setCurrentStep(step as WizardStep)}
            />
            {showSuccessModal && <SuccessModal title="¡Propiedad publicada con éxito!" text="Tu propiedad ya está disponible en el sitio. Serás redirigido a Mis Propiedades en unos segundos." />}
          
          </>);

      default:
        return null;
    }
  };

  return renderCurrentStep();
}
