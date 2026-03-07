'use client';
import { useState } from 'react';
import './PropertyCard.scss';

export interface Property {
  id: string;
  price: number;
  rent: number;
  currency: 'USD' | 'ARS' | 'EUR';
  currencyRent: string;
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

export interface PropertyCardProps {
  property: Property;
  onFavorite?: () => void;
}

const heartIcon = "/icons/heart.svg";
const remaxLogo = "/images/remax.png";
const defaultImage = "/images/property-placeholder.png";

export default function PropertyCard({
  property,
  onFavorite,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="property-card-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="property-card-image">
        <img src={property.image || defaultImage} alt={property.title} />        
        <button 
          className="property-card-heart"
          onClick={onFavorite}
          aria-label="Add to favorites"
          style={{ display: 'none' }}
        >
          <img src={heartIcon} alt="Favorite" />
        </button>
      </div>

      {/* Info Section */}
      <div className="property-card-info">
        {/* Title */}
        <h3 className="property-card-title">{property.title}</h3>

        {/* Price & Logo */}
        <div className="property-card-price-section">
          <div>
            <p className="property-card-price">
              {property.currency} {property.price.toLocaleString('en-US')}
            </p>
            {property.rent && <p className="property-card-rent">
              Exp. {property.currencyRent} {property.rent.toLocaleString('en-US')}
            </p>}
          </div>
          <div className="property-card-logo">
            <img src={property.agencyLogo || remaxLogo} alt="Agency logo" />
          </div>
        </div>

        {/* Address & Location */}
        <div className="property-card-location-section">
          <p className="property-card-address">{property.address}</p>
          {property.pricePerSqm && (
            <p className="property-card-location">
              {property.currency} {property.pricePerSqm.toLocaleString('en-US')} m²
            </p>
          )}
        </div>

        {/* Property Details */}
        <div className="property-card-details">
          <span className="property-card-detail">{property.area} m² tot.</span>
          <span className="property-card-detail">{property.rooms} amb.</span>
          <span className="property-card-detail">{property.bathrooms} baños</span>
        </div>
      </div>
    </div>
  );
}
