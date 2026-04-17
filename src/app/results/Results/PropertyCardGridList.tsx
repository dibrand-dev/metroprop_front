'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PropertyCardGridList.scss';
import { CreateProperty } from '@/types/propiedad';
import { formatNumbers } from '@/utils/utils';
import { AWS_S3_BUCKET_URL, PROPERTY_NO_IMAGE } from '@/app/constants';
import GalleryModal from '@/app/propertyDetail/[id]/PropertyDetail/GalleryModal/GalleryModal';

interface PropertyCardGridListProps {
  property: CreateProperty;
  onFavorite?: () => void;
}

const PropertyCardGridList: React.FC<PropertyCardGridListProps> = ({ property, onFavorite }) => {
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const images = property.images?.map(img =>
    img.url.includes('http') ? img.url : `${AWS_S3_BUCKET_URL}/${img.url}`
  ) ?? [];

  return (
    <>
    <div className="property-card-grid-list">
      <div className="image-section">
        <img 
          src={property.images?.[0]?.url 
            ? property.images[0].url.includes('http') ? property.images[0].url : `${AWS_S3_BUCKET_URL}/${property.images[0].url}`
            : PROPERTY_NO_IMAGE} 
          alt={property.publication_title}
          className="property-image"
        />
        <div className="hover-overlay">
          <button
            className="overlay-btn"
            onClick={() => router.push(`/propertyDetail/${property.id}`)}
            aria-label="Ver detalle"
          >
            Ver detalle
          </button>
          <button
            className="overlay-btn"
            onClick={() => setGalleryOpen(true)}
            aria-label="Ver fotos"
          >
            Ver fotos
          </button>
        </div>
      </div>
      
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
              {property.total_surface && property.total_surface > 0 ? <span>{formatNumbers(property.total_surface)} m² tot.</span> 
                : property.surface &&  property.surface > 0 ? <span>{formatNumbers(property.surface)} m²</span> : null}
              {property.room_amount && property.room_amount > 0 && <span>{property.room_amount} amb.</span>}
              {property.bathroom_amount && property.bathroom_amount > 0 && <span>{property.bathroom_amount} baños</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
    <GalleryModal
      isOpen={galleryOpen}
      onClose={() => setGalleryOpen(false)}
      images={images}
      videos={[]}
      plans={[]}
      gallery360={[]}
    />
    </>
  );
};

export default PropertyCardGridList;
