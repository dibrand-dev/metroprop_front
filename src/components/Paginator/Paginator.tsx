import './Paginator.scss';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPaginatorPages(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (currentPage > 4) pages.push('...');
  for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 3) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export default function Paginator({ currentPage, totalPages, onPageChange }: PaginatorProps) {
  if (totalPages <= 1) return null;

  const pages = getPaginatorPages(currentPage, totalPages);

  return (
    <div className="paginator">
      <button
        className="paginator-btn paginator-arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="paginator-ellipsis">…</span>
        ) : (
          <button
            key={page}
            className={`paginator-btn ${currentPage === page ? 'is-active' : ''}`}
            onClick={() => onPageChange(page as number)}
            aria-label={`Página ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        className="paginator-btn paginator-arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </div>
  );
}
