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
import { useLocations } from '@/lib/locations';

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

const starIcon = <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
<path d="M4.84586 15.8735L8.99989 13.242L13.1539 15.9081L12.066 10.9221L15.7255 7.59811L10.9121 7.14798L8.99989 2.43898L7.08772 7.11336L2.27431 7.56348L5.93382 10.9221L4.84586 15.8735ZM8.99989 14.8721L4.21286 17.908C4.0722 17.981 3.94164 18.0105 3.8212 17.9967C3.70163 17.9819 3.58514 17.9385 3.47173 17.8665C3.35744 17.7926 3.27128 17.6883 3.21326 17.5535C3.15523 17.4187 3.14996 17.2714 3.19743 17.1117L4.47133 11.4193L0.257958 7.58287C0.139271 7.48131 0.0610263 7.35989 0.0232224 7.21862C-0.0145815 7.07735 -0.00622944 6.94208 0.0482785 6.81281C0.102786 6.68355 0.175317 6.57736 0.265871 6.49426C0.357303 6.41393 0.480386 6.35946 0.635118 6.33083L6.19493 5.82115L8.36294 0.430735C8.42272 0.278385 8.50888 0.168508 8.62141 0.101105C8.73394 0.0337016 8.8601 0 8.99989 0C9.13968 0 9.26627 0.0337016 9.37969 0.101105C9.4931 0.168508 9.57882 0.278385 9.63684 0.430735L11.8048 5.82115L17.3633 6.33083C17.519 6.35853 17.6425 6.41347 17.7339 6.49565C17.8253 6.5769 17.8983 6.68262 17.9528 6.81281C18.0064 6.94208 18.0144 7.07735 17.9766 7.21862C17.9388 7.35989 17.8605 7.48131 17.7418 7.58287L13.5284 11.4193L14.8023 17.1117C14.8516 17.2696 14.8467 17.4164 14.7878 17.5521C14.7289 17.6878 14.6423 17.7922 14.528 17.8651C14.4155 17.939 14.299 17.9828 14.1786 17.9967C14.059 18.0105 13.9289 17.981 13.7882 17.908L8.99989 14.8721Z" fill="#1E1E1E"/>
</svg>

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

  const { data: locations = [] } = useLocations();

  const devLocationId = property.is_development
    ? (property.sub_location_id ?? property.state_id ?? property.location_id ?? null)
    : null;
  const devFullLocation = devLocationId
    ? (locations.find(l => l.id === devLocationId)?.full_location ?? null)
    : null;

  const uniqueRoomAmounts = [...new Set((property?.units ?? []).map(u => u.room_amount ?? 0))].sort((a, b) => a - b);

  const getPrecioDesde = (units: CreateProperty[]) => {
    const prices = units.map(u => u.price ?? 0).filter(p => p > 0);
    const pricesSq2 = units.map(u => u.price_square_meter ?? 0).filter(p => p > 0);
    if (prices.length === 0) return '-';
    const currency = units[0]?.currency ?? '';
    return <div className="development-prices"><div className="main-price">{`${currency} ${formatNumbers(Math.min(...prices))}`}</div>
      <div className="price-per-sqm">{currency} {formatNumbers(Math.min(...pricesSq2))}</div>
    </div>
  };

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
            {showFavoriteBtn && <button className="property-card-heart" onClick={handleFavorite} aria-label="Add to favorites">
              <HeartIcon isFavorite={isFavorite} />
            </button>}
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
          {property.is_development && <div className="entrega-delivery-date">
            <span>Emprendimiento</span>
            {showFavoriteBtn && <button className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`} onClick={handleFavorite} aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"} >
              <img src={`/icons/${isFavorite ? "starIsFavorite" : "star"}.svg`} alt="Icono de favorito" />
            </button>}
          </div>}
          <div
            className="image-section"
            onClick={gallery.openGallery}
            title={fromMap ? 'Ver detalle' : 'Abrir galería'}
          >
            <img src={gallery.firstImage} alt={property.publication_title} className="property-image" />
            {!property.is_development && showFavoriteBtn && (
              <button className="favorite-button" onClick={handleFavorite} aria-label="Agregar a favoritos">
                <HeartIcon isFavorite={isFavorite} />
              </button>
            )}
          </div>
          {property.is_development && <div className="delivery-date-content">
              <img src={'/icons/crane_gray.svg'} alt="Crane Icon" />
              {`En construcción - Entrega ${property.delivery_date}`}
            </div>}
          <div className="info-section">                 
            {property.is_development
            ? <div className="content-wrapper">
                <div className="property-details property-details-development">
                  <div className="price-row">
                    <div>
                      <p>Desde</p>
                      {getPrecioDesde(property.units)}
                    </div>
                    {org?.company_logo && (<img src={setImagePath(org.company_logo)} alt="Agency logo" className="agency-logo" />)}
                  </div>
                  {devFullLocation && <div className="full_location">{devFullLocation}</div>}
                  <div className="address">{property.street}</div>
                  {!property.is_development 
                  ? <div className="specs-row">
                    {(property.total_surface ?? 0) > 0 ? <span>{formatNumbers(property.total_surface!)} m² tot.</span>
                      : (property.surface ?? 0) > 0 ? <span>{formatNumbers(property.surface!)} m²</span> : null}
                    {(property.room_amount ?? 0) > 0 && <span>{property.room_amount} amb.</span>}
                    {(property.bathroom_amount ?? 0) > 0 && <span>{property.bathroom_amount} baños</span>}
                  </div>
                  : <div className="specs-row">
                    {uniqueRoomAmounts.length > 0 && <span className="ambients"><img src="/icons/door.svg" alt="Door Icon" />{uniqueRoomAmounts.join(' - ')} amb.</span>}
                  </div>}
                </div>
              </div>
            : <div className="content-wrapper">
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
            </div>}
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
          {property.is_development && <div className="entrega-delivery-date">
            <div className="delivery-date-content">
              <img src={'/icons/crane.svg'} alt="Crane Icon" />
              {`En construcción - Entrega ${property.delivery_date}`}
            </div>
            {showFavoriteBtn && <button className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`} onClick={handleFavorite} aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"} >
              <img src={`/icons/${isFavorite ? "starIsFavorite" : "star"}.svg`} alt="Icono de favorito" />
            </button>}
          </div>}
          <div className="card-content">
            <img
              src={gallery.firstImage}
              alt={property.publication_title}
              className={`property-image ${property.is_development ? 'property-image-development' : ''}`}
              onClick={gallery.openGallery}
              title="Abrir galería"
            />
            <div className="property-info">
              {property.is_development && <span className="desde-text">Desde</span>}
              <div className="title-row">               
                <div className="price-section">                  
                  {property.is_development
                  ? getPrecioDesde(property.units)
                  : <><div className="total-price">{`${property.currency} ${formatNumbers(property.price)}`}</div>
                      {(property.price_square_meter ?? 0) > 0 && (
                        <div className="price-per-meter">{property.currency} {formatNumbers(property.price_square_meter!)}</div>
                      )}
                    </>}
                </div>
                {(!property.is_development && showFavoriteBtn) && (
                  <button className="favorite-button" onClick={handleFavorite} aria-label="Agregar a favoritos">
                    <HeartIcon isFavorite={isFavorite} />
                  </button>
                )}
              </div>
              <div className={`details-row ${property.is_development ? 'details-row-development' : ''}`}>
                <div className={`address ${property.is_development ? 'address-development' : ''}`}>{property.street}</div>
                {!property.is_development 
                ? <div className="specs">
                  {(property.room_amount ?? 0) > 0 && <span>{property.room_amount} amb.</span>}
                  {(property.bathroom_amount ?? 0) > 0 && <span>{property.bathroom_amount} baños</span>}
                  {(property.total_surface ?? 0) > 0 ? <span>{formatNumbers(property.total_surface!)} m² tot.</span>
                    : (property.surface ?? 0) > 0 ? <span>{formatNumbers(property.surface!)} m²</span> : null}
                </div>
                : <>
                  {devFullLocation && <div className="full_location">{devFullLocation}</div>} 
                  {uniqueRoomAmounts.length > 0 && <span>{uniqueRoomAmounts.join(' - ')} amb.</span>}
                </>}
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
                  <Button 
                    label={property.user ? property.user.phone : property.owner_phone ?? ''}
                    variant="secondary"
                    buttonType="1"
                    size="small"
                    icon={<img src="/icons/copy.svg" alt="" aria-hidden="true" />}
                    iconPosition="left"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const cleanNumber = (property.user ? property.user.phone : property.owner_phone ?? '').replace(/[^\d+#]/g, '');
                      window.location.href = `tel:${cleanNumber}`;
                    }}
                  />
                  {onWhatsapp && <Button
                    label="Whatsapp"
                    variant="primary"
                    buttonType="1"
                    size="small"
                    onClick={(e) => { 
                      e.stopPropagation();
                      onWhatsapp()
                    }}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12.0403 2.65039H12.0422C13.259 2.64636 14.4644 2.88412 15.5881 3.35059C16.7119 3.81709 17.7319 4.50265 18.5881 5.36719L18.5901 5.37012C20.3378 7.11788 21.3 9.44196 21.3 11.9199C21.3 17.0209 17.1412 21.1796 12.0403 21.1797C10.4899 21.1797 8.96604 20.7873 7.6106 20.0488L7.38403 19.9258L7.13501 19.9912L2.97192 21.085L4.07739 17.0312L4.14771 16.7705L4.01392 16.5371C3.20979 15.1346 2.78054 13.5456 2.78052 11.9102C2.78052 6.80914 6.93927 2.65039 12.0403 2.65039ZM12.0305 3.02051C7.13153 3.02051 3.13989 7.01117 3.13989 11.9102L3.14575 12.2236C3.20161 13.7855 3.66768 15.3072 4.49927 16.6348L4.50415 16.6426L4.54614 16.708L3.79321 19.4688L3.49634 20.5547L4.58521 20.2686L7.4397 19.5176L7.5061 19.5576L7.51001 19.5596C8.87926 20.3681 10.4432 20.7998 12.0403 20.7998C16.7845 20.7997 20.6814 17.0648 20.9006 12.374L20.9104 11.917C20.9142 10.7499 20.6863 9.59324 20.2405 8.51465C19.7939 7.43446 19.1364 6.45339 18.3079 5.62891C16.6361 3.94799 14.4017 3.02063 12.0305 3.02051ZM8.53052 7.98047H8.9563C8.96038 7.98949 8.96548 7.99899 8.96997 8.00977C9.1486 8.45604 9.5906 9.5336 9.72192 9.8291C9.67191 9.92813 9.65334 9.96213 9.60669 10.0166C9.45026 10.1991 9.35833 10.3225 9.27075 10.4102C9.2209 10.46 9.04768 10.6224 8.96216 10.8604C8.85568 11.1567 8.91375 11.4485 9.05298 11.6973L9.06274 11.7148C9.21741 11.9726 9.74916 12.8545 10.5667 13.584V13.585C11.3368 14.2731 12.0413 14.6227 12.4319 14.7959L12.7092 14.916C12.8764 15.0007 13.1091 15.0896 13.3762 15.0586C13.6748 15.024 13.8816 14.8576 14.0178 14.6973L14.0188 14.6982C14.1342 14.5664 14.4952 14.1347 14.7258 13.8291C15.0767 13.9903 16.0311 14.4574 16.2786 14.5762C16.3281 14.6 16.3755 14.6213 16.4153 14.6396C16.4017 14.7896 16.3625 14.9968 16.2786 15.2285L16.2756 15.2383C16.2497 15.3134 16.1111 15.4902 15.8088 15.6846C15.5255 15.8667 15.2492 15.9677 15.1301 15.9863C14.745 16.0401 14.3165 16.0582 13.8596 15.9111L13.8499 15.9082C13.5037 15.8024 13.0699 15.6609 12.512 15.415L12.5071 15.4131C10.2224 14.4272 8.6895 12.0918 8.55103 11.8955L8.54614 11.8877L8.54028 11.8799L8.35474 11.6162C8.2652 11.4804 8.15497 11.3012 8.04907 11.0928C7.83273 10.6668 7.6604 10.1733 7.6604 9.70996C7.66043 8.77227 8.11846 8.3373 8.3479 8.0791L8.34888 8.08008C8.39656 8.02833 8.43751 8.00523 8.46509 7.99414C8.49537 7.98197 8.52005 7.98047 8.53052 7.98047Z" fill="white" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>}
                    iconPosition="left"
                    className="whatsapp-button"
                  />}
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

