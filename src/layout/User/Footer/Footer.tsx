'use client';

import './Footer.scss';

const logoMetroprop = "/images/metropropLogo.png";
const qrCode = "/images/qr.png";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Left Section - Company Info */}
        <div>
          <div className="footer-logo">
            <img src={logoMetroprop} alt="MetroProp" />
          </div>
          <div className="footer-left">
            <p className="footer-description">
              Encontrá propiedades e inmuebles en venta y alquiler, casas, departamentos, terrenos, locales, oficinas, quintas, PH, cocheras y más en Metroprop.
            </p>

            <div className="footer-social">
              <a href="#" className="footer-social-icon" aria-label="Facebook">
                <img src="/icons/fb.svg" alt="Facebook" />
              </a>
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <img src="/icons/instagram.svg" alt="Instagram" />
              </a>
              <a href="#" className="footer-social-icon" aria-label="YouTube">
                <img src="/icons/youtube.svg" alt="YouTube" />
              </a>
            </div>

            <div className="footer-contact">
              <p className="footer-contact-text">
                Buenos Aires, Argentina<br />
                Olazabal 1515, oficina 708<br />
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
              <li><a href="/results?operation_type=1">Comprar</a></li>
              <li><a href="/results?operation_type=2">Alquilar</a></li>
              <li><a href="/results?operation_type=3">Temporal</a></li>
              <li><a href="#">Emprendimientos</a></li>
              <li><a href="/protected/publish">Publicar</a></li>
              <li><a href="#">Mi cuenta</a></li>
              <li><a href="#">Contáctanos</a></li>
            </ul>
          </div>

          <div className="footer-zones">
            <h3 className="footer-zones-title">Zonas más buscadas</h3>
            <ul className="footer-zones-list">
              <li><a href="/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=1&currency=USD&status=1&page=1&limit=20">Capital Federal</a></li>
              <li><a href="/results?q=Argentina+%7C+G.B.A.+Zona+Norte&location_id=147&operation_type=1&currency=USD&status=1&page=1&limit=20">GBA Norte</a></li>
              <li><a href="/results?q=Argentina+%7C+G.B.A.+Zona+Sur&location_id=149&operation_type=1&currency=USD&status=1&page=1&limit=20">GBA Sur</a></li>
              <li><a href="/results?q=Argentina+%7C+G.B.A.+Zona+Oeste&location_id=148&operation_type=1&currency=USD&status=1&page=1&limit=20">GBA Oeste</a></li>
              <li><a href="/results?q=Argentina+%7C+Santa+Fé&location_id=170&operation_type=1&currency=USD&status=1&page=1&limit=20">Santa Fé</a></li>
              <li><a href="/results?q=Argentina+%7C+Costa+Atlantica&location_id=150&operation_type=1&currency=USD&status=1&page=1&limit=20">Buenos Aires Costa Atlántica</a></li>
              <li><a href="/results?q=Argentina+%7C+Cordoba&location_id=155&operation_type=1&currency=USD&status=1&page=1&limit=20">Córdoba</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-map desktop-only">
            <h3 className="footer-map-title">Mapa de sitio</h3>
            <ul className="footer-map-list">
              <li><a href="/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=1&currency=USD&status=1&page=1&limit=20">Comprar</a></li>
              <li><a href="/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=2&currency=USD&status=1&page=1&limit=20">Alquilar</a></li>
              <li><a href="/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=3&currency=USD&status=1&page=1&limit=20">Temporal</a></li>
              <li><a href="#">Emprendimientos</a></li>
              <li><a href="/protected/publish">Publicar</a></li>
              <li><a href="#">Mi cuenta</a></li>
              <li><a href="#">Contáctanos</a></li>
            </ul>
          </div>

          <div className="footer-zones desktop-only">
            <h3 className="footer-zones-title">Zonas más buscadas</h3>
            <ul className="footer-zones-list">
              <li><a href="/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=1&currency=USD&status=1&page=1&limit=20">Capital Federal</a></li>
              <li><a href="/results?q=Argentina+%7C+G.B.A.+Zona+Norte&location_id=147&operation_type=1&currency=USD&status=1&page=1&limit=20">GBA Norte</a></li>
              <li><a href="/results?q=Argentina+%7C+G.B.A.+Zona+Sur&location_id=149&operation_type=1&currency=USD&status=1&page=1&limit=20">GBA Sur</a></li>
              <li><a href="/results?q=Argentina+%7C+G.B.A.+Zona+Oeste&location_id=148&operation_type=1&currency=USD&status=1&page=1&limit=20">GBA Oeste</a></li>
              <li><a href="/results?q=Argentina+%7C+Santa+Fé&location_id=170&operation_type=1&currency=USD&status=1&page=1&limit=20">Santa Fé</a></li>
              <li><a href="/results?q=Argentina+%7C+Costa+Atlantica&location_id=150&operation_type=1&currency=USD&status=1&page=1&limit=20">Buenos Aires Costa Atlántica</a></li>
              <li><a href="/results?q=Argentina+%7C+Cordoba&location_id=155&operation_type=1&currency=USD&status=1&page=1&limit=20">Córdoba</a></li>
            </ul>
          </div>


        {/* Right Section - Legal & Contact */}
       
        <div>
          <div className="footer-terms">
            <h3 className="footer-terms-title">Términos y condiciones</h3>
            <ul className="footer-terms-list">
              <li><a href="#">Normas de confidencialidad y privacidad</a></li>
              <li><a href="#">Normativa alquiler temporario turístico</a></li>
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
                2025 Metroprop
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Attribution */}
      <div className="footer-bottom">
        <div className="footer-dibrand">
          <img src="/icons/logo_dibrand.png" alt="DIBRAND" className="footer-dibrand-icon" />
        </div>
      </div>
    </footer>
  );
}
