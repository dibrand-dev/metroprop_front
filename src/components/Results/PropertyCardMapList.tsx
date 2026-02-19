'use client';
import React from 'react';
import './PropertyCardMapList.scss';

interface Property {
  id: string;
  price: number;
  currency: 'USD' | 'ARS' | 'EUR';
  pricePerSqm?: number;
  title: string;
  address: string;
  rooms: number;
  bathrooms: number;
  area: number;
  image: string;
  agencyLogo?: string;
  isFavorite: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface PropertyCardMapListProps {
  property: Property;
  onFavorite?: () => void;
}

const PropertyCardMapList: React.FC<PropertyCardMapListProps> = ({ property, onFavorite }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop';

  return (
    <div className="property-card-map-list">
      <div className="card-content">
        <img 
          src={property.image || defaultImage} 
          alt={property.title}
          className="property-image"
        />
        
        <div className="property-info">
          <div className="title-row">
            <div className="price-section">
              {property.pricePerSqm && (
                <div className="price-per-sqm">
                  {property.currency} {property.pricePerSqm.toLocaleString()} m²
                </div>
              )}
              <div className="total-price">
                {property.currency} {property.price.toLocaleString()}
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
              {property.address}
            </div>
            <div className="specs">
              <span>{property.rooms} amb.</span>
              <span>{property.bathrooms} baños</span>
              <span>{property.area} m² tot.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardMapList;
