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
  const defaultLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/RE-MAX_logo.svg/200px-RE-MAX_logo.svg.png';

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
          <img 
            src={property.agencyLogo ? (property.agencyLogo.includes('http') ? property.agencyLogo : `${AWS_S3_BUCKET_URL}/${property.agencyLogo}`) : defaultLogo}
            alt="Agency logo"
            className="agency-logo"
          />
          
          <div className="property-details">
            <div className="price-row">
              <div className="main-price">
                {property.currency} {formatNumbers(property.price)}
              </div>
              <div className="price-per-sqm">
                {property.currency} {property.price_square_meter ? formatNumbers(property.price_square_meter) : ''} m²
              </div>
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
