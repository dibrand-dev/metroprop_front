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
        </div>
        {showLogo && <div className="signin-logo">
          <a href="/"><img src={logoMetroprop} alt="Metroprop Logo" /></a>
        </div>}
      </div>
  </>);
}
