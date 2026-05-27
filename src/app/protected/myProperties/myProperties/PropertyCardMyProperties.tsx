'use client';
import React from 'react';
import './PropertyCardMyProperties.scss';
import { CreateProperty, OPERATION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import { formatNumbers, setImagePath } from '@/utils/utils';
import { PROPERTY_NO_IMAGE } from '@/app/constants';

interface PropertyCardMyPropertiesProps {
  property: CreateProperty;
  onFavorite?: () => void;
}

const PropertyCardMyProperties: React.FC<PropertyCardMyPropertiesProps> = ({ property, onFavorite }) => {
  return (
    <div className="property-card-myProperties-list">
      <div className="card-content">
        <img 
          src={ property.images?.[0]?.url 
            ? setImagePath(property.images[0].url)
            : PROPERTY_NO_IMAGE} 
          alt={property.publication_title}
          className="property-image"
        />
        <div className="property-info">
          <div className='property-type'>{PROPERTY_TYPE_LABELS[property.property_type]}</div>
          <div className='property-title'>{property.publication_title}</div>
          <div className='property-street'>{property.street}</div>
          <div className='property-type-price'>
            <span className='publication-type'>{OPERATION_TYPE_LABELS[property.operation_type]}</span>
            <span>{property.currency} {formatNumbers(property.price)}</span>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardMyProperties;
