'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './PropertyCardGridList.scss';
import { CreateProperty } from '@/types/propiedad';
import { formatNumbers } from '@/utils/utils';
import { AWS_S3_BUCKET_URL, PROPERTY_NO_IMAGE } from '@/app/constants';
import GalleryModal, { GalleryVideo } from '@/app/propertyDetail/[id]/PropertyDetail/GalleryModal/GalleryModal';
import { CreateAttached } from '@/types/propiedad';

import { API_BASE_URL } from '@/utils/utils';

interface PropertyCardGridListProps {
  property: CreateProperty;
  onFavorite?: () => void;
  fromMap?: boolean
}

const PropertyCardGridList: React.FC<PropertyCardGridListProps> = ({ property, fromMap, onFavorite }) => {
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([]);
  const [galleryPlans, setGalleryPlans] = useState<CreateAttached[]>([]);
  const [gallery360, setGallery360] = useState<GalleryVideo[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

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
      className="property-card-grid-list"
      onClick={() => {
        router.push(`/propertyDetail/${property.id}`);
        if (!hasImages) router.push(`/propertyDetail/${property.id}`);
        return;
      }}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="image-section"
        onClick={(e) => {
          e.stopPropagation();
          if (hasImages && !fromMap) openGallery();
          else router.push(`/propertyDetail/${property.id}`);
          return;                
        }}
        title={fromMap ? "Ver detalle" : "Abrir galería"}
      >
        <img 
          src={property.images?.[0]?.url 
            ? property.images[0].url.includes('http') ? property.images[0].url : `${AWS_S3_BUCKET_URL}/${property.images[0].url}`
            : PROPERTY_NO_IMAGE} 
          alt={property.publication_title}
          className="property-image"
        />        
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

export default PropertyCardGridList;
