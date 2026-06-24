'use client';

import { LOCATION_CABA_ID } from '@/app/constants';
import './Footer.scss';
import Link from 'next/link';

const logoMetroprop = "/images/metroprop.svg";
const qrCode = "/images/qr.png";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Left Section - Company Info */}
        <div>
          <div className="footer-logo">
            <a href="https://www.metroprop.co/"><img src={logoMetroprop} alt="MetroProp" /></a>
          </div>
          <div className="footer-left">
            <p className="footer-description">
              Encontrá propiedades e inmuebles en venta y alquiler, casas, departamentos, terrenos, locales, oficinas, quintas, PH, cocheras y más en Metroprop.
            </p>

            <div className="footer-social">
              <Link prefetch={false}  href="https://www.tiktok.com/@metroprop" className="footer-social-icon" aria-label="TikTok">
                <img src="/icons/youtube.svg" alt="TikTok" />
              </Link>
              <Link prefetch={false}  href="https://www.instagram.com/metroprop.co/" className="footer-social-icon" aria-label="Instagram">
                <img src="/icons/instagram.svg" alt="Instagram" />
              </Link>
              <Link prefetch={false}  href="https://x.com/metropropco" className="footer-social-icon" aria-label="X">
                <img src="/icons/youtube.svg" alt="X" />
              </Link>
              <Link prefetch={false}  href="https://www.facebook.com/metroprop" className="footer-social-icon" aria-label="Facebook">
                <img src="/icons/fb.svg" alt="Facebook" />
              </Link>              
            </div>

            <div className="footer-contact">
              <p className="footer-contact-text">
                Buenos Aires, Argentina<br />
                <a href="mailto:consultas@metroprop.com">consultas@metroprop.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section - Site Map & Locations */}
        <div className='middle-column-footer-mobile'>
          <div className="footer-map">
            <h3 className="footer-map-title">Mapa de sitio</h3>
            <ul className="footer-map-list">
              <li><Link prefetch={false}  href="/results?operation_type=1">Comprar</Link></li>
              <li><Link prefetch={false}  href="/results?operation_type=2">Alquilar</Link></li>
              <li><Link prefetch={false}  href="/results?operation_type=3">Temporal</Link></li>
              <li><Link prefetch={false}  href="#">Emprendimientos</Link></li>
              <li><Link prefetch={false}  href="/protected/publish">Publicar</Link></li>
              <li><Link prefetch={false}  href="#">Mi cuenta</Link></li>
              <li><Link prefetch={false}  href="#">Contáctanos</Link></li>
            </ul>
          </div>

          <div className="footer-zones">
            <h3 className="footer-zones-title">Zonas más buscadas</h3>
            <ul className="footer-zones-list">
              <li><Link prefetch={false}  href={`/results?q=Capital+Federal&location_id=${LOCATION_CABA_ID}&page=1&limit=20`}>Capital Federal</Link></li>
              <li><Link prefetch={false}  href="/results?q=G.B.A.+Zona+Norte&location_id=147&page=1&limit=20">GBA Norte</Link></li>
              <li><Link prefetch={false}  href="/results?q=G.B.A.+Zona+Sur&location_id=149&page=1&limit=20">GBA Sur</Link></li>
              <li><Link prefetch={false}  href="/results?q=G.B.A.+Zona+Oeste&location_id=148&page=1&limit=20">GBA Oeste</Link></li>
              <li><Link prefetch={false}  href="/results?q=Santa+Fé&location_id=170&page=1&limit=20">Santa Fé</Link></li>
              <li><Link prefetch={false}  href="/results?q=Costa+Atlantica&location_id=150&page=1&limit=20">Buenos Aires Costa Atlántica</Link></li>
              <li><Link prefetch={false}  href="/results?q=Cordoba&location_id=155&page=1&limit=20">Córdoba</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-map desktop-only">
            <h3 className="footer-map-title">Mapa de sitio</h3>
            <ul className="footer-map-list">
              <li><Link prefetch={false}  href={`/results?q=Capital+Federal&location_id=${LOCATION_CABA_ID}&operation_type=1&page=1&limit=20`}>Comprar</Link></li>
              <li><Link prefetch={false}  href={`/results?q=Capital+Federal&location_id=${LOCATION_CABA_ID}&operation_type=2&page=1&limit=20`}>Alquilar</Link></li>
              <li><Link prefetch={false}  href={`/results?q=Capital+Federal&location_id=${LOCATION_CABA_ID}&operation_type=3&page=1&limit=20`}>Temporal</Link></li>
              <li><Link prefetch={false}  href="#">Emprendimientos</Link></li>
              <li><Link prefetch={false}  href="/protected/publish">Publicar</Link></li>
              <li><Link prefetch={false}  href="#">Mi cuenta</Link></li>
              <li><Link prefetch={false}  href="#">Contáctanos</Link></li>
            </ul>
          </div>

          <div className="footer-zones desktop-only">
            <h3 className="footer-zones-title">Zonas más buscadas</h3>
            <ul className="footer-zones-list">
              <li><Link prefetch={false}  href={`/results?q=Capital+Federal&location_id=${LOCATION_CABA_ID}&page=1&limit=20`}>Capital Federal</Link></li>
              <li><Link prefetch={false}  href="/results?q=G.B.A.+Zona+Norte&location_id=147&page=1&limit=20">GBA Norte</Link></li>
              <li><Link prefetch={false}  href="/results?q=G.B.A.+Zona+Sur&location_id=149&page=1&limit=20">GBA Sur</Link></li>
              <li><Link prefetch={false}  href="/results?q=G.B.A.+Zona+Oeste&location_id=148&page=1&limit=20">GBA Oeste</Link></li>
              <li><Link prefetch={false}  href="/results?q=Santa+Fé&location_id=170&page=1&limit=20">Santa Fé</Link></li>
              <li><Link prefetch={false}  href="/results?q=Costa+Atlantica&location_id=150&page=1&limit=20">Buenos Aires Costa Atlántica</Link></li>
              <li><Link prefetch={false}  href="/results?q=Cordoba&location_id=155&page=1&limit=20">Córdoba</Link></li>
            </ul>
          </div>


        {/* Right Section - Legal & Contact */}
       
        <div>
          <div className="footer-terms">
            <h3 className="footer-terms-title">Legales</h3>
            <ul className="footer-terms-list">
              <li><Link prefetch={false} href="/terms" rel="noopener noreferrer" target="_blank">Términos y  Condiciones</Link></li>
              <li><Link prefetch={false} href="/policy" rel="noopener noreferrer" target="_blank">Políticas de privacidad</Link></li>
            </ul>
          </div>

          <div className="footer-qr">
            <div className="footer-qr-image">
              <img src={qrCode} alt="QR Code" />
            </div>
            <div className="footer-qr-info">
              <p>
                Metroprop<br />
                Todos los derechos reservados<br />
                {`${new Date().getFullYear()} Metroprop`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Attribution */}
      <div className="footer-bottom">
        <div className="footer-dibrand">
          <a href="https://www.dibrand.co/es" target="_blank" rel="noopener noreferrer"><img src="/icons/logo_dibrand.png" alt="DIBRAND" className="footer-dibrand-icon" /></a>
        </div>
      </div>
    </footer>
  );
}
