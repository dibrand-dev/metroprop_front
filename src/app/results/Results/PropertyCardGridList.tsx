'use client';
import React from 'react';
import './PropertyCardGridList.scss';
import { CreateProperty } from '@/types/propiedad';
import { formatNumbers } from '@/utils/utils';
import { AWS_S3_BUCKET_URL } from '@/app/constants';

interface PropertyCardGridListProps {
  property: CreateProperty;
  onFavorite?: () => void;
}

const PropertyCardGridList: React.FC<PropertyCardGridListProps> = ({ property, onFavorite }) => {
  return (
    <div className="property-card-grid-list">
      {property.images?.[0]?.url && <div className="image-section">
        <img 
          src={property.images[0].url.includes('http') ? property.images[0].url : `${AWS_S3_BUCKET_URL}/${property.images[0].url}`} 
          alt={property.publication_title}
          className="property-image"
        />
      </div>}
      
      <div className="info-section">
        <div className="content-wrapper">
          {property.organization?.company_logo && <img 
            src={property.organization?.company_logo.includes('http') ? property.organization?.company_logo : `${AWS_S3_BUCKET_URL}/${property.organization?.company_logo}`} 
            alt="Agency logo"
            className="agency-logo"
          />}
          <div className="property-details">
            <div className="price-row">
              <div className="main-price">
                {property.currency ?? ''} {formatNumbers(property.price)}
              </div>
              {property.price_square_meter && property.price_square_meter > 0 && <div className="price-per-sqm">
                 {`${property.currency ?? ''} ${formatNumbers(property.price_square_meter)}`}
              </div>}
            </div>
            
            <div className="address">
              {property.street}
            </div>
            
            <div className="specs-row">
              {property.total_surface && property.total_surface > 0 && <span>{formatNumbers(property.total_surface)} m² tot.</span>}
              {property.room_amount && property.room_amount > 0 && <span>{property.room_amount} amb.</span>}
              {property.bathroom_amount && property.bathroom_amount > 0 && <span>{property.bathroom_amount} baños</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardGridList;
