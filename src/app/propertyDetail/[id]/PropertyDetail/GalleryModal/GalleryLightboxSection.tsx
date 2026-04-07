import { useRef, type RefObject, type ReactNode } from 'react';

interface GalleryLightboxSectionProps<T> {
  items: T[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  renderMain: (item: T, index: number) => ReactNode;
  renderThumb: (item: T, index: number) => ReactNode;
  thumbsRef?: RefObject<HTMLDivElement>;
  ariaLabel?: (index: number) => string;
}

export default function GalleryLightboxSection<T>({
  items,
  activeIndex,
  onIndexChange,
  renderMain,
  renderThumb,
  thumbsRef,
  ariaLabel,
}: GalleryLightboxSectionProps<T>) {
  const internalRef = useRef<HTMLDivElement>(null);
  const resolvedRef = thumbsRef ?? internalRef;

  return (
    <>
      <div className="property-gallery-lightbox-main">
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
