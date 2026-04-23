'use client';

import { useState, useEffect, useRef } from 'react';
import { CreateAttached } from '@/types/propiedad';
import { AWS_S3_BUCKET_URL } from '@/app/constants';
import GalleryLightboxSection from './GalleryLightboxSection';
import '@/app/propertyDetail/[id]/PropertyDetail/PropertyDetail.scss';

const extractYouTubeId = (url: string | { id: number, is_360: boolean, order: number, url: string }): string | null => {
  if (!url) return null;
  let _url = "";
  if (typeof url === 'object' && url.url) _url = url.url; 
  else if (typeof url === 'string') _url = url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = _url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
const getYouTubeThumbnail = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
const getYouTubeEmbed = (videoId: string) => `https://www.youtube.com/embed/${videoId}?autoplay=1`;

export interface GalleryVideo {
  id: number | string;
  url: string;
  order: number;
}

export type GalleryTab = 'fotos' | 'videos' | 'planos' | '360';

export interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  videos: GalleryVideo[];
  plans: CreateAttached[];
  initialTab?: GalleryTab;
  initialIndex?: number;
  gallery360: GalleryVideo[];
  isLoading?: boolean;
}

export default function GalleryModal({
  isOpen,
  onClose,
  images,
  videos,
  plans,
  gallery360,
  initialTab = 'fotos',
  initialIndex = 0,
  isLoading = false,
}: GalleryModalProps) {
  const [galleryTab, setGalleryTab] = useState<GalleryTab>(initialTab);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(initialIndex);
  const [videoActiveIndex, setVideoActiveIndex] = useState(0);
  const [planActiveIndex, setPlanActiveIndex] = useState(0);
  const [gallery360ActiveIndex, setGallery360ActiveIndex] = useState(0);
  const galleryThumbsRef = useRef<HTMLDivElement>(null);

  // Sync internal state when modal opens with a specific tab / index
  useEffect(() => {
    if (isOpen) {
      setGalleryTab(initialTab);
      setGalleryActiveIndex(initialIndex);
      setVideoActiveIndex(0);
      setPlanActiveIndex(0);
      setGallery360ActiveIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') {
        if (galleryTab === 'fotos') setGalleryActiveIndex(prev => Math.min(prev + 1, images.length - 1));
        if (galleryTab === 'videos') setVideoActiveIndex(prev => Math.min(prev + 1, videos.length - 1));
        if (galleryTab === 'planos') setPlanActiveIndex(prev => Math.min(prev + 1, plans.length - 1));
        if (galleryTab === '360') setGallery360ActiveIndex(prev => Math.min(prev + 1, gallery360?.length ?? 0 - 1));
      }
      if (e.key === 'ArrowLeft') {
        if (galleryTab === 'fotos') setGalleryActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === 'videos') setVideoActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === 'planos') setPlanActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === '360') setGallery360ActiveIndex(prev => Math.max(prev - 1, 0));
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, galleryTab, images.length, videos.length, plans.length, gallery360?.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="property-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Galería de fotos">
      <div className="property-gallery-lightbox-backdrop" onClick={onClose} />
      {isLoading && (
        <div className="property-gallery-lightbox-loading">
          <div className="property-gallery-lightbox-spinner" />
        </div>
      )}
      <button
        type="button"
        className="property-detail-gallery-modal-close"
        aria-label="Cerrar"
        onClick={onClose}
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M6 6l12 12M18 6l-12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        />
        </svg>
    </button>

      {/* Tabs — hidden when only one tab exists */}
      {!isLoading && [images.length > 0, videos.length > 0, plans.length > 0, gallery360.length > 0].filter(Boolean).length > 1 && (
      <div className="property-gallery-lightbox-tabs">
        <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'fotos' ? 'active' : ''}`} onClick={() => { setGalleryTab('fotos'); setGalleryActiveIndex(0); }}>Fotos</button>
        {videos.length > 0 && (
          <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'videos' ? 'active' : ''}`} onClick={() => { setGalleryTab('videos'); setVideoActiveIndex(0); }}>Videos</button>
        )}
        {plans.length > 0 && (
          <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'planos' ? 'active' : ''}`} onClick={() => { setGalleryTab('planos'); setPlanActiveIndex(0); }}>Planos</button>
        )}
        {gallery360.length > 0 && (
          <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === '360' ? 'active' : ''}`} onClick={() => { setGalleryTab('360'); setGallery360ActiveIndex(0); }}>360</button>
        )}
      </div>
      )}

      {/* ── FOTOS ── */}
      {!isLoading && galleryTab === 'fotos' && (
        <GalleryLightboxSection
          items={images}
          activeIndex={galleryActiveIndex}
          onIndexChange={setGalleryActiveIndex}
          thumbsRef={galleryThumbsRef}
          ariaLabel={idx => `Ver foto ${idx + 1}`}
          renderMain={(src, idx) => (
            <img src={src} alt={`Foto ${idx + 1}`} className="property-gallery-lightbox-image" />
          )}
          renderThumb={(src, idx) => {
            const lastSlash = src.lastIndexOf('/');
            return <img src={src.slice(0, lastSlash + 1) + 'thumb_' + src.slice(lastSlash + 1)} alt={`Miniatura ${idx + 1}`} />;
          }}
        />
      )}

      {/* ── VIDEOS ── */}
      {!isLoading && galleryTab === 'videos' && (
        <GalleryLightboxSection
          items={videos}
          activeIndex={videoActiveIndex}
          onIndexChange={setVideoActiveIndex}
          ariaLabel={idx => `Ver video ${idx + 1}`}
          renderMain={(vid, idx) => {
            const videoId = extractYouTubeId(vid.url);
            return videoId ? (
              <iframe
                key={videoId}
                src={getYouTubeEmbed(videoId)}
                className="property-gallery-lightbox-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Video ${idx + 1}`}
              />
            ) : (
              <div className="property-gallery-lightbox-placeholder">Video no disponible</div>
            );
          }}
          renderThumb={(v, idx) => {
            const vId = extractYouTubeId(v.url);
            return vId
              ? <img src={getYouTubeThumbnail(vId)} alt={`Video ${idx + 1}`} />
              : <div className="property-gallery-lightbox-thumb-placeholder">▶</div>;
          }}
        />
      )}

      {/* ── PLANOS ── */}
      {!isLoading && galleryTab === 'planos' && (
        <GalleryLightboxSection
          items={plans}
          activeIndex={planActiveIndex}
          onIndexChange={setPlanActiveIndex}
          ariaLabel={idx => `Ver plano ${idx + 1}`}
          renderMain={(plan, idx) => {
            const isPdf = plan?.file_url?.toLowerCase().endsWith('.pdf');
            const src = plan?.file_url?.includes('http') ? plan.file_url : `${AWS_S3_BUCKET_URL}/${plan.file_url}`;
            return isPdf ? (
              <div className="property-gallery-lightbox-pdf">
                <iframe
                  src={src}
                  title={`Plano PDF ${idx + 1}`}
                  className="property-gallery-lightbox-pdf-embed"
                />
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="property-gallery-lightbox-pdf-link"
                >
                  Abrir en nueva pestaña
                </a>
              </div>
            ) : (
              <img
                src={src}
                alt={`Plano ${idx + 1}`}
                className="property-gallery-lightbox-image"
              />
            );
          }}
          renderThumb={(p, idx) => {
            const isPdfThumb = p.file_url?.toLowerCase().endsWith('.pdf');
            return isPdfThumb
              ? (
                <div className="property-gallery-lightbox-thumb-pdf">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="15" y2="17" />
                  </svg>
                  <span className="property-gallery-lightbox-thumb-pdf-badge">PDF</span>
                </div>
              )
              : <img src={p.file_url.includes('http') ? p.file_url : `${AWS_S3_BUCKET_URL}/${p.file_url}`} alt={`Plano ${idx + 1}`} />;
          }}
        />
      )}

      {/* ── 360 ── */}
      {!isLoading && galleryTab === '360' && (
        <GalleryLightboxSection
          items={gallery360 || []}
          activeIndex={gallery360ActiveIndex}
          onIndexChange={setGallery360ActiveIndex}
          ariaLabel={idx => `Ver video ${idx + 1}`}
          renderMain={(vid, idx) => <iframe
            key={vid.url}
            src={vid.url}
            className="property-gallery-lightbox-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`Video ${idx + 1}`}
          />
          }
          renderThumb={(v, idx) => {
            const vId = extractYouTubeId(v.url);
            return vId
              ? <img src={getYouTubeThumbnail(vId)} alt={`Video ${idx + 1}`} />
              : <div className="property-gallery-lightbox-thumb-placeholder">▶</div>;
          }}
        />
      )}
    </div>
  );
}
