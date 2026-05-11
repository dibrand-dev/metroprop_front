'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateProperty, CreateAttached } from '@/types/propiedad';
import { formatNumbers, HeartIcon, setImagePath } from '@/utils/utils';
import { PROPERTY_NO_IMAGE } from '@/app/constants';
import GalleryModal, { GalleryVideo } from '@/app/propertyDetail/[id]/PropertyDetail/GalleryModal/GalleryModal';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';
import './PropertyCard.scss';
import './PropertyCardGridList.scss';
import './PropertyCardMapList.scss';
import './PropertyCardFavoritesList.scss';
import Button from '@/ui/Button/Button';

export type PropertyCardType = 'home' | 'gridList' | 'map' | 'favorites' | 'contacts';

export interface PropertyCardProps {
  property: CreateProperty;
  cardType: PropertyCardType;
  onFavorite?: (id: number) => void;
  isLoggedIn?: boolean;
  /** When true, image click navigates to detail instead of opening gallery */
  fromMap?: boolean;
  onWhatsapp?: () => void;
}

function useGallery(property: CreateProperty, fromMap?: boolean) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [plans, setPlans] = useState<CreateAttached[]>([]);
  const [gallery360, setGallery360] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(false);

  const baseImages = (property.images ?? []).map(img => setImagePath(img.url));
  const hasImages = baseImages.length > 0;
  const firstImage = hasImages ? baseImages[0] : PROPERTY_NO_IMAGE;

  const openGallery = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fromMap || !hasImages) {
      router.push(`/propertyDetail/${property.id}`);
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const data = await apiFetch<any>(`${API_BASE_URL}/properties/${property.id}/multimedia`);
      const fetched: string[] = (data?.images ?? []).map((img: { url: string }) => setImagePath(img.url));
      setImages(fetched.length > 0 ? fetched : baseImages);
      setVideos((data?.videos ?? []).map((url: string, i: number) => ({ id: i, url, order: i })));
      setPlans(data?.attached ?? []);
      setGallery360((data?.multimedia360 ?? []).map((url: string, i: number) => ({ id: i, url, order: i })));
    } catch {
      setImages(baseImages);
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setOpen(false); setImages([]); setVideos([]); setPlans([]); setGallery360([]); };

  return { open, images, videos, plans, gallery360, loading, firstImage, hasImages, openGallery, close };
}

export default function PropertyCard({ property, cardType, onFavorite, isLoggedIn = false, fromMap = false, onWhatsapp }: PropertyCardProps) {
  const router = useRouter();
  const gallery = useGallery(property, fromMap);
  const isFavorite = (property as any).isFavorite as boolean | undefined;

  const goToDetail = () => router.push(`/propertyDetail/${property.id}`);
  const handleFavorite = (e: React.MouseEvent) => { e.stopPropagation(); onFavorite?.(property.id ?? 0); };
  const showFavoriteBtn = isLoggedIn;
  const org = (property as any).organization;
  const galleryModal = (
    <GalleryModal
      isOpen={gallery.open}
      onClose={gallery.close}
      images={gallery.images}
      videos={gallery.videos}
      plans={gallery.plans}
      gallery360={gallery.gallery360}
      isLoading={gallery.loading}
    />
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (cardType === 'home') {
    return (
      <>
        <div className="property-card-wrapper" onClick={goToDetail}>
          <div className="property-card-image">
            <img
              src={gallery.firstImage}
              alt={property.publication_title}
              onClick={gallery.openGallery}
              style={{ cursor: gallery.hasImages ? 'pointer' : 'default' }}
            />
            {showFavoriteBtn && (<button className="property-card-heart" onClick={handleFavorite} aria-label="Add to favorites">
              <HeartIcon isFavorite={isFavorite} />
            </button>)}
          </div>
          <div className="property-card-info">
            <h3 className="property-card-title">{property.publication_title}</h3>
            <div className="property-card-price-section">
              <div>
                <p className="property-card-price">{property.currency} {formatNumbers(property.price)}</p>
                {(property.expenses ?? 0) > 0 && (
                  <p className="property-card-rent">Exp. {property.currency} {formatNumbers(property.expenses ?? 0)}</p>
                )}
              </div>
              {org?.company_logo && (
                <div className="property-card-logo">
                  <img src={setImagePath(org.company_logo)} alt="Agency logo" />
                </div>
              )}
            </div>
            <div className="property-card-location-section">
              <p className="property-card-address">{property.street}</p>
              {property.price_square_meter && (
                <p className="property-card-location">{property.currency} {formatNumbers(property.price_square_meter)} m²</p>
              )}
            </div>
            <div className="property-card-details">
              {(property.total_surface ?? 0) > 0 && <span className="property-card-detail">{formatNumbers(property.total_surface!)} m² tot.</span>}
              {(property.room_amount ?? 0) > 0 && <span className="property-card-detail">{property.room_amount} amb.</span>}
              {(property.bathroom_amount ?? 0) > 0 && <span className="property-card-detail">{property.bathroom_amount} baños</span>}
            </div>
          </div>
        </div>
        {galleryModal}
      </>
    );
  }

  // ── GRID LIST ─────────────────────────────────────────────────────────────
  if (cardType === 'gridList') {
    return (
      <>
        <div className="property-card-grid-list" onClick={goToDetail}>
          <div
            className="image-section"
            onClick={gallery.openGallery}
            title={fromMap ? 'Ver detalle' : 'Abrir galería'}
          >
            <img src={gallery.firstImage} alt={property.publication_title} className="property-image" />
            {showFavoriteBtn && (
              <button className="favorite-button" onClick={handleFavorite} aria-label="Agregar a favoritos">
                <HeartIcon isFavorite={isFavorite} />
              </button>
            )}
          </div>
          <div className="info-section">
            <div className="content-wrapper">
              {org?.company_logo && (
                <img src={setImagePath(org.company_logo)} alt="Agency logo" className="agency-logo" />
              )}
              <div className="property-details">
                <div className="price-row">
                  <div className="main-price">{property.currency ?? ''} {formatNumbers(property.price)}</div>
                  {(property.price_square_meter ?? 0) > 0 && (
                    <div className="price-per-sqm">{property.currency ?? ''} {formatNumbers(property.price_square_meter!)}</div>
                  )}
                </div>
                <div className="address">{property.street}</div>
                <div className="specs-row">
                  {(property.total_surface ?? 0) > 0 ? <span>{formatNumbers(property.total_surface!)} m² tot.</span>
                    : (property.surface ?? 0) > 0 ? <span>{formatNumbers(property.surface!)} m²</span> : null}
                  {(property.room_amount ?? 0) > 0 && <span>{property.room_amount} amb.</span>}
                  {(property.bathroom_amount ?? 0) > 0 && <span>{property.bathroom_amount} baños</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
        {galleryModal}
      </>
    );
  }

  if (cardType === 'map') {
    return (
      <>
        <div className="property-card-map-list" onClick={goToDetail}>
          <div className="card-content">
            <img
              src={gallery.firstImage}
              alt={property.publication_title}
              className="property-image"
              onClick={gallery.openGallery}
              title="Abrir galería"
            />
            <div className="property-info">
              <div className="title-row">
                <div className="price-section">
                  <div className="total-price">{property.currency} {formatNumbers(property.price)}</div>
                  {(property.price_square_meter ?? 0) > 0 && (
                    <div className="price-per-meter">{property.currency} {formatNumbers(property.price_square_meter!)}</div>
                  )}
                </div>
                {showFavoriteBtn && (
                  <button className="favorite-button" onClick={handleFavorite} aria-label="Agregar a favoritos">
                    <HeartIcon isFavorite={isFavorite} />
                  </button>
                )}
              </div>
              <div className="details-row">
                <div className="address">{property.street}</div>
                <div className="specs">
                  {(property.room_amount ?? 0) > 0 && <span>{property.room_amount} amb.</span>}
                  {(property.bathroom_amount ?? 0) > 0 && <span>{property.bathroom_amount} baños</span>}
                  {(property.total_surface ?? 0) > 0 ? <span>{formatNumbers(property.total_surface!)} m² tot.</span>
                    : (property.surface ?? 0) > 0 ? <span>{formatNumbers(property.surface!)} m²</span> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        {galleryModal}
      </>
    );
  }

  if (cardType === 'favorites') {
    return (
      <>
        <div className="property-card-favorites-list" onClick={goToDetail}>
          <div className="card-content">
            <img
              src={gallery.firstImage}
              alt={property.publication_title}
              className="property-image"
              onClick={gallery.openGallery}
              title="Abrir galería"
            />
            <div className="property-info">
              {org?.company_logo && (
                <div>
                  <img src={setImagePath(org.company_logo)} alt="Agency logo" className="agency-logo" />
                </div>
              )}
              <div className="title-row">
                <div className="price-section">
                  <div className="total-price">{property.currency} {formatNumbers(property.price)}</div>
                  {property.price_square_meter! > 0 && (
                    <div className="price-per-meter">{property.currency} {formatNumbers(property.price_square_meter!)}</div>
                  )}
                </div>
                {property.expenses! > 0 && (
                  <div className="expenses">{property.currency} {formatNumbers(property.expenses!)} expensas</div>
                )}
                {showFavoriteBtn && (
                  <button className="favorite-button" onClick={handleFavorite} aria-label="Agregar a favoritos">
                    <HeartIcon isFavorite={true} />
                  </button>
                )}
              </div>
              <div className="details-row">
                <div className="address">{property.street}</div>
                <div className="specs">
                  {(property.total_surface ?? 0) > 0 ? <span>{formatNumbers(property.total_surface!)} m² tot.</span>
                    : (property.surface ?? 0) > 0 ? <span>{formatNumbers(property.surface!)} m²</span> : null}
                  {(property.room_amount ?? 0) > 0 && <span>{property.room_amount} amb.</span>}
                  {(property.bathroom_amount ?? 0) > 0 && <span>{property.bathroom_amount} baños</span>}
                </div>
                <p>{property.publication_title}</p>
                <Button label="Contactar" variant="primary" buttonType="1" size="small" onClick={goToDetail} />
              </div>
            </div>
          </div>
        </div>
        {galleryModal}
      </>
    );
  }

  if (cardType === 'contacts') {
    return (
      <>
        <div className="property-card-favorites-list" onClick={goToDetail}>
          <div className="card-content">
            <img
              src={gallery.firstImage}
              alt={property.publication_title}
              className="property-image"
              onClick={gallery.openGallery}
              title="Abrir galería"
            />
            <div className="property-info">
              {org?.company_logo && (
                <div>
                  <img src={setImagePath(org.company_logo)} alt="Agency logo" className="agency-logo" />
                </div>
              )}
              <div className="title-row">
                <div className="price-section">
                  <div className="total-price">{property.currency} {formatNumbers(property.price)}</div>
                  {property.price_square_meter! > 0 && (
                    <div className="price-per-meter">{property.currency} {formatNumbers(property.price_square_meter!)}</div>
                  )}
                </div>
                {property.expenses! > 0 && (
                  <div className="expenses">{property.currency} {formatNumbers(property.expenses!)} expensas</div>
                )}
                {showFavoriteBtn && (
                  <button className="favorite-button" onClick={handleFavorite} aria-label="Agregar a favoritos">
                    <HeartIcon isFavorite={true} />
                  </button>
                )}
              </div>
              <div className="details-row">
                <div className="address">{property.street}</div>
                <div className="specs">
                  {(property.total_surface ?? 0) > 0 ? <span>{formatNumbers(property.total_surface!)} m² tot.</span>
                    : (property.surface ?? 0) > 0 ? <span>{formatNumbers(property.surface!)} m²</span> : null}
                  {(property.room_amount ?? 0) > 0 && <span>{property.room_amount} amb.</span>}
                  {(property.bathroom_amount ?? 0) > 0 && <span>{property.bathroom_amount} baños</span>}
                </div>
                <p>{property.publication_title}</p>
                <div className="contacts-button-container">
                  <Button label={property.user ? property.user.phone : property.owner_phone ?? ''} variant="secondary" buttonType="1" size="small" onClick={() => {}} />
                  <Button label="Contactar" variant="primary" buttonType="1" size="small" onClick={onWhatsapp} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {galleryModal}
      </>
    );
  }
}

