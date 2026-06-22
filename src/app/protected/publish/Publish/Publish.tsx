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
import { OperationType, OPERATION_TYPE_LABELS, CreateProperty, CreatePropertyDraft, PropertyType, CREATE_PROPERTY_PATCH_KEYS, operationOptions, WizardStep, EMPRENDIMIENTO_FLOW, REGULAR_FLOW } from '@/types/propiedad';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { Plan } from '@/types/plan';
import PublishEmprendimientoAmenidades from './PublishEmprendimientoAmenidades';
import PublishEmprendimientoUnidades from './PublishEmprendimientoUnidades';
import PublishPlansEmprendimiento from './PublishEmprendimientoPlan';
import { EmprendimientoStep } from './EmprendimientoTabs';
import PublishEmprendimientoFinalReview from './PublishEmprendimientoPreview';
import Image from 'next/image';



const toCreatePropertyPatch = (data: Partial<CreatePropertyDraft>): Partial<CreateProperty> => {
  const patch: Partial<CreateProperty> = {};

  for (const key of CREATE_PROPERTY_PATCH_KEYS) {
    const rawValue = data[key];
    const value = key === 'tags' && Array.isArray(rawValue)
      ? rawValue
          .map((item: any) => {
            if (typeof item === 'number') return item;
            if (item && typeof item === 'object' && typeof item.tag_id === 'number') return item.tag_id;
            return undefined;
          })
          .filter((item): item is number => typeof item === 'number')
      : rawValue;

    if (value !== undefined) {
      patch[key] = value as never;
    }
  }

  return patch;
};

const DEVELOPMENT_PATCH_EXCLUDED_KEYS: (keyof CreateProperty)[] = [
  'id',
  'currency',
  'property_subtype',
  'publication_title_en',
  'internal_comments',
  'suite_amount',
  'room_amount',
  'bathroom_amount',
  'toilet_amount',
  'parking_lot_amount',
  'surface',
  'roofed_surface',
  'unroofed_surface',
  'semiroofed_surface',
  'total_surface',
  'surface_measurement',
  'roofed_surface_measurement',
  'age',
  'property_condition',
  'brightness',
  'garage_coverage',
  'surface_front',
  'surface_length',
  'situation',
  'dispositions',
  'orientation',
  'floors_amount',
  'zonification',
  'construction_year',
  'last_renovation',
  'expenses',
  'commission',
  'network_share',
  'period',
  'price_square_meter',
  'producer_user',
  'key_contact',
  'key_agent_user',
  'key_location',
  'key_reference_code',
  'maintenance_user',
  'owner_name',
  'owner_phone',
  'owner_email',
  'network_information',
  'transaction_requirements',
  'currency_expenses',
  'view_count',
  'development_units',
  'images',
  'videos',
  'attached',
];

const toDevelopmentPatch = (data: Partial<CreatePropertyDraft>): Partial<CreateProperty> => {
  const patch = toCreatePropertyPatch(data);
  for (const key of DEVELOPMENT_PATCH_EXCLUDED_KEYS) {
    delete patch[key];
  }
  return patch;
};

export default function Publish({ propertyId }: { propertyId?: string } = {}) {
  const isEditMode = !!propertyId;
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.INITIAL);
  const [wizardData, setWizardData] = useState<CreatePropertyDraft & {withoutExpenses?: boolean}>({} as CreatePropertyDraft & {withoutExpenses?: boolean} );
  const [planToBuy, setPlanToBuy] = useState<Plan & { branchId: number, emprendimiento: boolean } | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const { data: sessionData } = useSession();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [authorizationError, setAuthorizationError] = useState(false);  

  // ── Load existing property into wizard when editing
  useEffect(() => {
    if (!propertyId) return;
    setIsLoadingProperty(true);
    apiFetch(`${API_BASE_URL}/properties/${propertyId}?format=edit`)
      .then(data => {
        const payload = (data as any)?.data ?? data;
        
        // Check authorization: user must own the property OR be the organization admin
        const loggedInUserId = Number.parseInt((sessionData?.user as any)?.id);
        const propertyUserId = (payload as any)?.user?.id;
        const userOrganizationId = (sessionData?.user as any)?.organization?.id;
        const userRoleId = (sessionData?.user as any)?.role_id;
        const propertyOrganizationId = (payload as any)?.organization?.id;
        
        const isOwner = loggedInUserId && propertyUserId && loggedInUserId == propertyUserId;
        const isOrganizationAdmin = userOrganizationId && (userRoleId === 1 || userRoleId === 2) && propertyOrganizationId && userOrganizationId == propertyOrganizationId;
       
        if (!isOwner && !isOrganizationAdmin && (!isNaN(loggedInUserId) && userRoleId !== 4)) {
          setAuthorizationError(true);
          setIsLoadingProperty(false);
          return;
        } 
        
        const normalizedUnits = Array.isArray((payload as any).development_units)
          ? (payload as any).development_units
          : (Array.isArray((payload as any).units) ? (payload as any).units : []);

        // Map the property to the wizard draft shape.
        // draft_id = property id so all PATCH / multimedia calls target the right endpoint.
        setWizardData({
          ...(payload as any),
          draft_id: (payload as any).id,
          development_units: normalizedUnits,
        });
        const isDevelopment = (payload as any).is_development === true || (payload as any).property_type === PropertyType.EMPRENDIMIENTO;
        if (isDevelopment) {
          setCurrentStep(WizardStep.EMPRENDIMIENTO);
        } else {
          // Skip steps 1 and 2 (operation type & property type) when editing
          setCurrentStep(WizardStep.LOCATION);
        }
      })
      .catch(err => console.error('Error loading property for edit:', err))
      .finally(() => setIsLoadingProperty(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, sessionData]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const getCurrentFlow = useCallback(() => {
    if (
      wizardData.operation_type === OperationType.EMPRENDIMIENTO ||
      wizardData.is_development === true ||
      wizardData.property_type === PropertyType.EMPRENDIMIENTO
    ) {
      return EMPRENDIMIENTO_FLOW;
    }
    return REGULAR_FLOW;
  }, [wizardData.operation_type, wizardData.is_development, wizardData.property_type]);

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

  const goToBuyPlan = useCallback((plan: Plan, branchId?: number, emprendimiento?: boolean) => {
    setPlanToBuy({ ...plan, branchId: branchId ?? 0, emprendimiento: emprendimiento ?? false });
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
      if (!user_id) throw new Error('User not authenticated');

      return apiFetch(`${API_BASE_URL}/properties/draft`, {
        method: 'POST',
        body: {
          user_id,
          organization_id,
          branch_id: draftData.branch_id,
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
    if (sessionData?.user.organization) {      
      for (const branch of sessionData.user.organization.branches ?? []) {
        const found = (branch.users ?? []).find((u: any) => String(u.id) === sessionData.user?.id);
        if (found) {
          _wizardData.branch_id = branch.id;
          break;
        }
      }
    }

    if (is_development) {
      _wizardData.operation_type = OperationType.VENTA;
      _wizardData.property_type = PropertyType.EMPRENDIMIENTO;
      _wizardData.is_development = true;
    }
    // Create mode: create a new draft
    try {
      const draftData = await createDraftMutation.mutateAsync(_wizardData);
      const _draftDataToUpdate = {
        draft_id: draftData.id
      }
      updateWizardData(_draftDataToUpdate);
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
    const _wizardDataUpdate = toCreatePropertyPatch(wizardDataUpdate);
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
    } else {
      // If not going to next step, show success modal for 2 seconds before hiding it (used for "Save and Exit" flow)
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        window.location.href = '/protected/myProperties';
      }, 2000);
    }
  }

  const saveCurrentStepEmprendimiento = async (wizardDataUpdate: Partial<CreatePropertyDraft>, nextStep: boolean) => {
    const _wizardDataUpdate = toDevelopmentPatch(wizardDataUpdate);
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
    
    if (authorizationError) {
      return (
        <div className="publish-page">
          <div className="publish-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#d32f2f' }}>No tenés permiso para ver esta propiedad</h2>
            <p>Solo el propietario de la publicación puede editarla.</p>
          </div>
        </div>
      );
    }
    
    switch (currentStep) {
      case WizardStep.INITIAL:
        return (
          <div className="publish-page">
            <Image
              src="/images/publicarBg.png"
              alt="Publicar fondo"              
              fill
              priority              
              style={{ objectFit: 'cover' }}
            />
            <div className="publish-card">
              <div className="publish-card-header">
                <h1>¿Qué querés publicar?</h1>
                <p>Elegí un tipo de operación para continuar</p>
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
            onComprar={(plan, branchId) => goToBuyPlan(plan, branchId, false)}
            onSaveAndExit={(plansUpdate) => saveCurrentStep(plansUpdate, false)}
          />
        );

      case WizardStep.CHECKOUT_DETAIL:
        return (
          <PublishCheckoutDetail
            planToBuy={planToBuy}
            onNext={() => setCurrentStep(WizardStep.CHECKOUT_PAYMENT)}
            onBack={(emprendimiento) => setCurrentStep(emprendimiento ? WizardStep.EMPRENDIMIENTO_PLANS : WizardStep.PLANS)}
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
            onComprar={(plan, branchId) => goToBuyPlan(plan, branchId, true)}
            onSaveAndExit={(plansUpdate) => saveCurrentStepEmprendimiento(plansUpdate, false)}
          />
        );
      
      case WizardStep.EMPRENDIMIENTO_PREVIEW:
        return (
          <>
            <PublishEmprendimientoFinalReview
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              onNext={(wizardData) => saveCurrentStep(wizardData, false).then(() => {
                setShowSuccessModal(true);
                setTimeout(() => {
                  window.location.href = '/protected/myProperties';
                }, 3000);
              })}
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
