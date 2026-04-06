'use client';
import React from 'react';
import './PropertyCardMapList.scss';
import { CreateProperty } from '@/types/propiedad';
import { formatNumbers } from '@/utils/utils';
import { AWS_S3_BUCKET_URL } from '@/app/constants';

interface PropertyCardMapListProps {
  property: CreateProperty;
  onFavorite?: () => void;
}

const PropertyCardMapList: React.FC<PropertyCardMapListProps> = ({ property, onFavorite }) => {
  return (
    <div className="property-card-map-list">
      <div className="card-content">
        {property.images?.[0]?.url && <img 
          src={property.images[0].url.includes('http') ? property.images[0].url : `${AWS_S3_BUCKET_URL}/${property.images[0].url}`} 
          alt={property.publication_title}
          className="property-image"
        />}
        
        <div className="property-info">
          <div className="title-row">
            <div className="price-section">             
              <div className="total-price">
                {property.currency} {formatNumbers(property.price)}
              </div>
               <div className="price-per-meter">
                {property.currency} {property.price_square_meter ? formatNumbers(property.price_square_meter) : ''} m²
              </div>
            </div>
            
            <button 
              className="favorite-button"
              onClick={onFavorite}
              aria-label="Agregar a favoritos"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" 
                  stroke={property.isFavorite ? "#006AFF" : "#000000"}
                  fill={property.isFavorite ? "#006AFF" : "none"}
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
          
          <div className="details-row">
            <div className="address">
              {property.street}
            </div>
            <div className="specs">
              {property.room_amount && property.room_amount > 0 && <span>{property.room_amount} amb.</span>}
              {property.bathroom_amount && property.bathroom_amount > 0 && <span>{property.bathroom_amount} baños</span>}
              {property.total_surface && property.total_surface > 0 && <span>{formatNumbers(property.total_surface)} m² tot.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardMapList;
