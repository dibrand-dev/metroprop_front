import './PropertyCardSkeleton.scss';

interface PropertyCardSkeletonProps {
  layout: 'list' | 'grid';
  count?: number;
}

function ListSkeleton() {
  return (
    <div className="property-card-skeleton">
      <div className="card-content">
        <div className="skeleton-image" />
        <div className="skeleton-info">
          <div className="skeleton-title-row">
            <div className="skeleton-price" />
            <div className="skeleton-icon" />
          </div>
          <div className="skeleton-address" />
          <div className="skeleton-specs">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="property-card-grid-skeleton">
      <div className="skeleton-grid-image" />
      <div className="skeleton-grid-body">
        <div className="skeleton-grid-price" />
        <div className="skeleton-grid-address" />
        <div className="skeleton-grid-specs">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default function PropertyCardSkeleton({ layout, count = 8 }: PropertyCardSkeletonProps) {
  if (layout === 'grid') {
    return (
      <div className="property-grid-skeleton">
        {Array.from({ length: count }).map((_, i) => (
          <GridSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="property-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="property-wrapper">
          <ListSkeleton />
        </div>
      ))}
    </div>
  );
}
