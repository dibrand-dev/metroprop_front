import { useRef, useCallback, type RefObject, type ReactNode } from 'react';

interface GalleryLightboxSectionProps<T> {
  items: T[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderMain: (item: T, index: number) => ReactNode;
  renderThumb: (item: T, index: number) => ReactNode;
  thumbsRef?: RefObject<HTMLDivElement>;
  ariaLabel?: (index: number) => string;
  onClose?: () => void;
}

export default function GalleryLightboxSection<T>({
  items,
  activeIndex,
  onIndexChange,
  renderMain,
  renderThumb,
  thumbsRef,
  ariaLabel,
  onClose,
}: GalleryLightboxSectionProps<T>) {
  const internalRef = useRef<HTMLDivElement>(null);
  const resolvedRef = thumbsRef ?? internalRef;
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50;
    if (diff > threshold) {
      onIndexChange(Math.min(activeIndex + 1, items.length - 1));
    } else if (diff < -threshold) {
      onIndexChange(Math.max(activeIndex - 1, 0));
    }
    touchStartX.current = null;
  }, [activeIndex, items.length, onIndexChange]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the background, not on child elements
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  }, [onClose]);

  return (
    <>
      <div className="property-gallery-lightbox-main" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={handleBackgroundClick}>
        <button
          type="button"
          className="property-detail-gallery-arrow property-detail-gallery-arrow-left"
          aria-label="Anterior"
          onClick={() => onIndexChange(Math.max(activeIndex - 1, 0))}
          disabled={activeIndex === 0}
        >
          <img src="/icons/chevron-up.svg" alt="" />
        </button>
        {renderMain(items[activeIndex], activeIndex)}
        <button
          type="button"
          className="property-detail-gallery-arrow property-detail-gallery-arrow-right"
          aria-label="Siguiente"
          onClick={() => onIndexChange(Math.min(activeIndex + 1, items.length - 1))}
          disabled={activeIndex === items.length - 1}
        >
          <img src="/icons/chevron-up.svg" alt="" />
        </button>
      </div>
      <div className="property-gallery-lightbox-counter">
        {activeIndex + 1} / {items.length}
      </div>
      <div className="property-gallery-lightbox-thumbs" ref={resolvedRef}>
        {items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className={`property-gallery-lightbox-thumb ${idx === activeIndex ? 'is-active' : ''}`}
            onClick={() => onIndexChange(idx)}
            aria-label={ariaLabel ? ariaLabel(idx) : `Ver elemento ${idx + 1}`}
          >
            {renderThumb(item, idx)}
          </button>
        ))}
      </div>
    </>
  );
}
