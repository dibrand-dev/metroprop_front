'use client';
import { useState } from 'react';
import './PropertyCard.scss';

export interface PropertyCardProps {
  title?: string;
  price?: string;
  address?: string;
  location?: string;
  sqMeters?: string;
  rooms?: string;
  bathrooms?: string;
  image?: string;
  logo?: string;
  onFavorite?: () => void;
}

const heartIcon = "https://www.figma.com/api/mcp/asset/d773b2a5-92df-46ea-bc71-fb721dff67d8";
const remaxLogo = "https://www.figma.com/api/mcp/asset/0d2a8448-a1a8-4a2c-9732-895b1b6c294c";
const defaultImage = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=264&h=152&fit=crop";

export default function PropertyCard({
  title = "Venta-Departamento",
  price = "$1.000.000",
  address = "Juan Francisco Segui 4500",
  location = "Palermo, Capital Federal",
  sqMeters = "310 m² tot.",
  rooms = "4 amb.",
  bathrooms = "2 baños",
  image = defaultImage,
  logo = remaxLogo,
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
        <img src={image} alt={title} />
        {isHovered && (
          <button 
            className="property-card-heart"
            onClick={onFavorite}
            aria-label="Add to favorites"
          >
            <img src={heartIcon} alt="Favorite" />
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="property-card-info">
        {/* Title */}
        <h3 className="property-card-title">{title}</h3>

        {/* Price & Logo */}
        <div className="property-card-price-section">
          <p className="property-card-price">{price}</p>
          <div className="property-card-logo">
            <img src={logo} alt="Agency logo" />
          </div>
        </div>

        {/* Address & Location */}
        <div className="property-card-location-section">
          <p className="property-card-address">{address}</p>
          <p className="property-card-location">{location}</p>
        </div>

        {/* Property Details */}
        <div className="property-card-details">
          <span className="property-card-detail">{sqMeters}</span>
          <span className="property-card-detail">{rooms}</span>
          <span className="property-card-detail">{bathrooms}</span>
        </div>
      </div>
    </div>
  );
}
