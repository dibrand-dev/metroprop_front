'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './PropertyCardMapList.scss';
import { CreateProperty } from '@/types/propiedad';
import { formatNumbers } from '@/utils/utils';
import { AWS_S3_BUCKET_URL, PROPERTY_NO_IMAGE } from '@/app/constants';
import GalleryModal, { GalleryVideo } from '@/app/propertyDetail/[id]/PropertyDetail/GalleryModal/GalleryModal';
import { CreateAttached } from '@/types/propiedad';

import { API_BASE_URL } from '@/utils/utils';

interface PropertyCardMapListProps {
  property: CreateProperty;
  onFavorite?: () => void;
}

const PropertyCardMapList: React.FC<PropertyCardMapListProps> = ({ property, onFavorite }) => {
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([]);
  const [galleryPlans, setGalleryPlans] = useState<CreateAttached[]>([]);
  const [gallery360, setGallery360] = useState<GalleryVideo[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const overlayShownAtRef = useRef(0);

  const images = property.images?.map(img =>
    img.url.includes('http') ? img.url : `${AWS_S3_BUCKET_URL}/${img.url}`
  ) ?? [];

  const openGallery = async () => {
    setGalleryOpen(true);
    setGalleryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${property.id}/multimedia`);
      const data = await res.json();
      const fetchedImages: string[] = (data?.images ?? []).map((img: { url: string }) =>
        img.url.includes('http') ? img.url : `${AWS_S3_BUCKET_URL}/${img.url}`
      );
      setGalleryImages(fetchedImages.length > 0 ? fetchedImages : images);
      setGalleryVideos((data?.videos ?? []).map((url: string, i: number) => ({ id: i, url, order: i })));
      setGalleryPlans(data?.attached ?? []);
      setGallery360((data?.multimedia360 ?? []).map((url: string, i: number) => ({ id: i, url, order: i })));
    } catch {
      setGalleryImages(images);
      setGalleryVideos([]);
      setGalleryPlans([]);
      setGallery360([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const hasImages = (images.length > 0);

  return (
    <>
    <div
      className="property-card-map-list"
      onClick={!hasImages ? () => router.push(`/propertyDetail/${property.id}`) : () => setOverlayVisible(v => {
        if (!v) overlayShownAtRef.current = Date.now();
        return !v;
      })}
      onMouseLeave={() => setOverlayVisible(false)}
      style={!hasImages ? { cursor: 'pointer' } : undefined}
    >
      <div className="card-content">
        <img 
          src={property.images?.[0]?.url 
            ? property.images[0].url.includes('http') ? property.images[0].url : `${AWS_S3_BUCKET_URL}/${property.images[0].url}`
            : PROPERTY_NO_IMAGE} 
          alt={property.publication_title}
          className="property-image"
        />
        <div className="property-info">
          <div className="title-row">
            <div className="price-section">             
              <div className="total-price">
                {property.currency} {formatNumbers(property.price)}
              </div>              
              {property.price_square_meter && property.price_square_meter > 0 && <div className="price-per-meter">
                {`${property.currency} ${formatNumbers(property.price_square_meter)}`}
              </div>}
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
              {property.total_surface && property.total_surface > 0
                ? <span>{formatNumbers(property.total_surface)} m² tot.</span> 
                : property.surface &&  property.surface > 0 ? <span>{formatNumbers(property.surface)} m²</span> : null}
            </div>
          </div>
        </div>
      </div>
      {hasImages && (
      <div className={`hover-overlay${overlayVisible ? ' overlay-active' : ''}`}>
        <button
          className="overlay-btn"
          onClick={(e) => { e.stopPropagation(); if (Date.now() - overlayShownAtRef.current < 400) return; router.push(`/propertyDetail/${property.id}`); }}
          aria-label="Ver detalle"
        >
          Ver detalle
        </button>
        <button
          className="overlay-btn"
          onClick={(e) => { e.stopPropagation(); if (Date.now() - overlayShownAtRef.current < 400) return; openGallery(); }}
          aria-label="Ver fotos"
        >
          Ver fotos
        </button>
      </div>
      )}
    </div>
    <GalleryModal
      isOpen={galleryOpen}
      onClose={() => { setGalleryOpen(false); setGalleryImages([]); setGalleryVideos([]); setGalleryPlans([]); setGallery360([]); }}
      images={galleryImages}
      videos={galleryVideos}
      plans={galleryPlans}
      gallery360={gallery360}
      isLoading={galleryLoading}
    />
    </>
  );
};

export default PropertyCardMapList;
