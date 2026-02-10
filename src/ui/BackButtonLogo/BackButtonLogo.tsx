import { useRouter } from 'next/navigation';
import './BackButtonLogo.scss';

const logoMetroprop = "/images/metropropLogo.png";

export default function BackButtonLogo({ showLogo = true }: { showLogo?: boolean }) {
  const router = useRouter();
  return (<>    
      <div className="merged-signup-header">          
        <div className="signin-header">
          <button className="signin-header-back" onClick={() => router.back()} aria-label="Go back">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <button className="signin-header-close" aria-label="Close">
            <svg fill="none" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {showLogo && <div className="signin-logo">
          <img src={logoMetroprop} alt="Metroprop Logo" />
        </div>}
      </div>
  </>);
}
