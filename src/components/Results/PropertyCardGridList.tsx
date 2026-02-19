'use client';
import React from 'react';
import './PropertyCardGridList.scss';

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

interface PropertyCardGridListProps {
  property: Property;
  onFavorite?: () => void;
}

const PropertyCardGridList: React.FC<PropertyCardGridListProps> = ({ property, onFavorite }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop';
  const defaultLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/RE-MAX_logo.svg/200px-RE-MAX_logo.svg.png';

  return (
    <div className="property-card-grid-list">
      <div className="image-section">
        <img 
          src={property.image || defaultImage} 
          alt={property.title}
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
              {property.pricePerSqm && (
                <div className="price-per-sqm">
                  {property.currency} {property.pricePerSqm.toLocaleString()} m²
                </div>
              )}
            </div>
            
            <div className="address">
              {property.address}
            </div>
            
            <div className="specs-row">
              <span>{property.area} m² tot.</span>
              <span>{property.rooms} amb.</span>
              <span>{property.bathrooms} baños</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardGridList;
