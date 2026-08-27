'use client';

import { useCallback, useEffect, useState } from 'react';
import Chip from '@/ui/Chip/Chip';
import Button from '@/ui/Button/Button';
import './PublishEmprendimientoAmenidades.scss';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, CreatePropertyDraft } from '@/types/propiedad';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';
import { useQuery } from '@tanstack/react-query';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';

interface PublishEmprendimientoProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (emprendimientoUpdate: Partial<CreatePropertyDraft>) => void;
  onSaveAndExit: (emprendimientoUpdate: Partial<CreatePropertyDraft>) => void;
  goToStep: (step: EmprendimientoStep) => void;
}
const iconChevron = '/icons/chevron-up.svg';

export default function PublishEmprendimientoAmenidades({
  wizardData,
  updateWizardData,
  onNext,
  onSaveAndExit,
  goToStep,
}: PublishEmprendimientoProps) {
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<AmenityType, boolean>>({
    [AmenityType.Rooms]: false,
    [AmenityType.Services]: false,
    [AmenityType.Extras]: false
  });
  
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    (wizardData.tags || []).map((t: any) => typeof t === 'number' ? t : t.tag_id)
  );

  const { data: tagsData = [] } = useQuery<any>({
    queryKey: ['tags'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/tags`),
  });
  
  useEffect(() => {
    if (tagsData.length > 0) {
      const groups: AmenityGroup[] = Object.values(AmenityType).filter(v => typeof v === 'number').map(type => {
        const options = tagsData.filter((tag: AmenityTag) => tag.type === type);
        return {
          type: type as AmenityType,
          title: AMENITY_TYPE_LABELS[type as AmenityType],
          options,
        };
      });
      setAmenityGroups(groups);
    }
  }, [tagsData]);

  useEffect(() => {
    updateWizardData({
      tags: selectedAmenities,      
    });
  }, [selectedAmenities, updateWizardData]);
  

  const handleToggleAmenity = useCallback((optionId: number) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  }, []);

  const handleToggleGroup = useCallback((type: AmenityType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  const handleContinue = () => {
    const propertyContentUpdate = { 
      tags: selectedAmenities
    }
    onNext(propertyContentUpdate);
  };

  return (
    <div className="publish-emprendimiento-amenidades">
      <div className="publish-emprendimiento-amenidades-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-text">Emprendimientos</span>
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="title">Publicar emprendimiento</h1>
        </div>

        {/* Secondary Menu / Tabs */}
        <EmprendimientoTabs currentStep="emprendimiento-amenities" goToStep={goToStep} />

        {/* Main Content */}
        <div className="main-content">
          <h2 className="section-title">Agregar características del emprendimiento</h2>

          {/* Amenity Groups */}
          <div className="amenity-groups">
            {amenityGroups.map((group) => {
              const isExpanded = expandedGroups[group.type];
              const visibleItems = isExpanded ? group.options : group.options.slice(0, 8);
              return (
                <div key={group.type} className="publish-property-content-group">
                  <h2>{group.title}</h2>
                  <div className="publish-property-content-chip-grid">
                    {visibleItems.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`publish-chip ${selectedAmenities.includes(option.id) ? 'publish-chip-active' : ''}`}
                        onClick={() => handleToggleAmenity(option.id)}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                  {group.options.length > 8 && <button
                    type="button"
                    className="publish-property-content-more"
                    onClick={() => handleToggleGroup(group.type)}
                  >
                    {isExpanded ? 'Ver menos' : 'Ver mas'}
                    <img
                      src={iconChevron}
                      alt=""
                      className={isExpanded ? 'is-rotated' : ''}
                    />
                  </button>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Guardar como borrador"
            variant="secondary"
            buttonType="2"
            onClick={() => onSaveAndExit(wizardData)}
            fullWidth={false}            
          />
          <Button
            label="Continuar"
            variant="primary"
            buttonType="2"
            onClick={handleContinue}
            fullWidth={false}
          />
        </div>
      </div>
    </div>
  );
}
