'use client';
import React from 'react';
import './PropertyCardGridList.scss';
import { CreateProperty } from '@/types/propiedad';

interface PropertyCardGridListProps {
  property: CreateProperty;
  onFavorite?: () => void;
}

const PropertyCardGridList: React.FC<PropertyCardGridListProps> = ({ property, onFavorite }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop';
  const defaultLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/RE-MAX_logo.svg/200px-RE-MAX_logo.svg.png';

  return (
    <div className="property-card-grid-list">
      <div className="image-section">
        <img 
          src={property.images?.[0]?.url || defaultImage} 
          alt={property.publication_title}
          className="property-image"
        />
      </div>
      
      <div className="info-section">
        <div className="content-wrapper">
          <img 
            src={property.agencyLogo || defaultLogo} 
            alt="Agency logo"
            className="agency-logo"
          />
          
          <div className="property-details">
            <div className="price-row">
              <div className="main-price">
                {property.currency} {property.price.toLocaleString()}
              </div>
              {property.price_square_meter && (
                <div className="price-per-sqm">
                  {property.currency} {property.price_square_meter.toLocaleString()} m²
                </div>
              )}
            </div>
            
            <div className="address">
              {property.street}
            </div>
            
            <div className="specs-row">
              <span>{property.total_surface} m² tot.</span>
              <span>{property.room_amount} amb.</span>
              <span>{property.bathroom_amount} baños</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardGridList;
