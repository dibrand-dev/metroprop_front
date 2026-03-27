'use client';

import { useState, useEffect, useRef } from 'react';
import { AWS_S3_BUCKET_URL } from '@/constants';
import { CreateAttached } from '@/types/propiedad';

const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
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
}

export default function GalleryModal({
  isOpen,
  onClose,
  images,
  videos,
  plans,
  initialTab = 'fotos',
  initialIndex = 0,
}: GalleryModalProps) {
  const [galleryTab, setGalleryTab] = useState<GalleryTab>(initialTab);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(initialIndex);
  const [videoActiveIndex, setVideoActiveIndex] = useState(0);
  const [planActiveIndex, setPlanActiveIndex] = useState(0);
  const galleryThumbsRef = useRef<HTMLDivElement>(null);

  // Sync internal state when modal opens with a specific tab / index
  useEffect(() => {
    if (isOpen) {
      setGalleryTab(initialTab);
      setGalleryActiveIndex(initialIndex);
      setVideoActiveIndex(0);
      setPlanActiveIndex(0);
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
      }
      if (e.key === 'ArrowLeft') {
        if (galleryTab === 'fotos') setGalleryActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === 'videos') setVideoActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === 'planos') setPlanActiveIndex(prev => Math.max(prev - 1, 0));
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, galleryTab, images.length, videos.length, plans.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="property-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Galería de fotos">
      <div className="property-gallery-lightbox-backdrop" onClick={onClose} />
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

      {/* Tabs */}
      <div className="property-gallery-lightbox-tabs">
        <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'fotos' ? 'active' : ''}`} onClick={() => { setGalleryTab('fotos'); setGalleryActiveIndex(0); }}>Fotos</button>
        {videos.length > 0 && (
          <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'videos' ? 'active' : ''}`} onClick={() => { setGalleryTab('videos'); setVideoActiveIndex(0); }}>Videos</button>
        )}
        {plans.length > 0 && (
          <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'planos' ? 'active' : ''}`} onClick={() => { setGalleryTab('planos'); setPlanActiveIndex(0); }}>Planos</button>
        )}
        <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === '360' ? 'active' : ''}`} onClick={() => setGalleryTab('360')}>360</button>
      </div>

      {/* ── FOTOS ── */}
      {galleryTab === 'fotos' && (
        <>
          <div className="property-gallery-lightbox-main">
            <button
                type="button"
                className="property-detail-gallery-arrow property-detail-gallery-arrow-left"
                aria-label="Anterior" onClick={() => setGalleryActiveIndex(prev => Math.max(prev - 1, 0))} disabled={galleryActiveIndex === 0}
            >
                <img src="/icons/chevron-up.svg" alt="" />
            </button>
            <img src={images[galleryActiveIndex]} alt={`Foto ${galleryActiveIndex + 1}`} className="property-gallery-lightbox-image" />
            <button
                type="button"
                className="property-detail-gallery-arrow property-detail-gallery-arrow-right"
                aria-label="Siguiente"
                onClick={() => setGalleryActiveIndex(prev => Math.min(prev + 1, images.length - 1))} disabled={galleryActiveIndex === images.length - 1}
            >
                <img src="/icons/chevron-up.svg" alt="" />
            </button>
          </div>
          <div className="property-gallery-lightbox-counter">{galleryActiveIndex + 1} / {images.length}</div>
          <div className="property-gallery-lightbox-thumbs" ref={galleryThumbsRef}>
            {images.map((img, idx) => (
              <button key={img} type="button" className={`property-gallery-lightbox-thumb ${idx === galleryActiveIndex ? 'is-active' : ''}`} onClick={() => setGalleryActiveIndex(idx)} aria-label={`Ver foto ${idx + 1}`}>
                <img src={img} alt={`Miniatura ${idx + 1}`} />
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── VIDEOS ── */}
      {galleryTab === 'videos' && (() => {
        const vid = videos[videoActiveIndex];
        const videoId = vid ? extractYouTubeId(vid.url) : null;
        return (
          <>
            <div className="property-gallery-lightbox-main">
              <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-prev" aria-label="Anterior" onClick={() => setVideoActiveIndex(prev => Math.max(prev - 1, 0))} disabled={videoActiveIndex === 0}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </button>
              {videoId ? (
                <iframe
                  key={videoId}
                  src={getYouTubeEmbed(videoId)}
                  className="property-gallery-lightbox-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${videoActiveIndex + 1}`}
                />
              ) : (
                <div className="property-gallery-lightbox-placeholder">Video no disponible</div>
              )}
              <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-next" aria-label="Siguiente" onClick={() => setVideoActiveIndex(prev => Math.min(prev + 1, videos.length - 1))} disabled={videoActiveIndex === videos.length - 1}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </button>
            </div>
            <div className="property-gallery-lightbox-counter">{videoActiveIndex + 1} / {videos.length}</div>
            <div className="property-gallery-lightbox-thumbs">
              {videos.map((v, idx) => {
                const vId = extractYouTubeId(v.url);
                return (
                  <button key={v.id} type="button" className={`property-gallery-lightbox-thumb ${idx === videoActiveIndex ? 'is-active' : ''}`} onClick={() => setVideoActiveIndex(idx)} aria-label={`Ver video ${idx + 1}`}>
                    {vId ? <img src={getYouTubeThumbnail(vId)} alt={`Video ${idx + 1}`} /> : <div className="property-gallery-lightbox-thumb-placeholder">▶</div>}
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* ── PLANOS ── */}
      {galleryTab === 'planos' && (() => {
        const plan = plans[planActiveIndex];
        const isPdf = plan?.file_url?.toLowerCase().endsWith('.pdf');
        return (
          <>
            <div className="property-gallery-lightbox-main">
              <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-prev" aria-label="Anterior" onClick={() => setPlanActiveIndex(prev => Math.max(prev - 1, 0))} disabled={planActiveIndex === 0}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </button>
              {isPdf ? (
                <div className="property-gallery-lightbox-pdf">
                  <span>PDF</span>
                  <small>{plan.file_url.split('/').pop()}</small>
                  <a href={`${AWS_S3_BUCKET_URL}/${plan.file_url}`} target="_blank" rel="noopener noreferrer">Abrir PDF</a>
                </div>
              ) : (
                <img src={`${AWS_S3_BUCKET_URL}/${plan?.file_url}`} alt={`Plano ${planActiveIndex + 1}`} className="property-gallery-lightbox-image" />
              )}
              <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-next" aria-label="Siguiente" onClick={() => setPlanActiveIndex(prev => Math.min(prev + 1, plans.length - 1))} disabled={planActiveIndex === plans.length - 1}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </button>
            </div>
            <div className="property-gallery-lightbox-counter">{planActiveIndex + 1} / {plans.length}</div>
            <div className="property-gallery-lightbox-thumbs">
              {plans.map((p, idx) => {
                const isPdfThumb = p.file_url?.toLowerCase().endsWith('.pdf');
                return (
                  <button key={idx} type="button" className={`property-gallery-lightbox-thumb ${idx === planActiveIndex ? 'is-active' : ''}`} onClick={() => setPlanActiveIndex(idx)} aria-label={`Ver plano ${idx + 1}`}>
                    {isPdfThumb ? <div className="property-gallery-lightbox-thumb-placeholder">PDF</div> : <img src={`${AWS_S3_BUCKET_URL}/${p.file_url}`} alt={`Plano ${idx + 1}`} />}
                  </button>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* ── 360 ── */}
      {galleryTab === '360' && (
        <div className="property-gallery-lightbox-empty">
          <p>Contenido 360° próximamente</p>
        </div>
      )}
    </div>
  );
}
