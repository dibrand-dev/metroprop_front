import './terms.scss';

export default function TermsPage() {
  return (<div className="terms-container">
    <h1>TÉRMINOS Y CONDICIONES GENERALES DE USO — METROPROP</h1>
    <p><strong>Última actualización</strong>: 23/06/2026 </p>
    <p>Bienvenido a <strong>MetroProp</strong> (en adelante, la &quot;Plataforma&quot;), el portal inmobiliario y de agregación de datos diseñado para optimizar la búsqueda, visualización y análisis de propiedades en el mercado</p>
    <p>La utilización de la Plataforma, ya sea como visitante, usuario registrado o anunciante profesional, implica la <strong>aceptación plena, incondicional y expresa</strong> de los presentes Términos y Condiciones, así como de nuestra Política de Privacidad. Si usted no está de acuerdo con estos términos, le solicitamos que abandone la Plataforma y se abstenga de utilizar nuestros servicios.</p>
    <h2>1. Naturaleza del Servicio y Rol de MetroProp</h2>    
    <ul>
        <li><strong>Intermediación Exclusivamente Tecnológica</strong>: MetroProp funciona como un motor de búsqueda y agregador de datos inmobiliarios. <strong>No somos una inmobiliaria, no ejercemos el corretaje inmobiliario, no somos propietarios de los bienes anunciados y no participamos en las transacciones.</strong></li>
        <li><strong>Límite de Responsabilidad</strong>: Nuestro rol se limita a proveer el espacio e infraestructura digital. MetroProp no asume responsabilidad alguna por la veracidad de los anuncios, los precios publicados, el estado de los inmuebles, ni por los resultados de las negociaciones, contratos o acuerdos económicos entre los usuarios.</li>
    </ul>
    
    <h2>2. Funcionalidades Exclusivas y Diferenciador de Datos</h2>
    <ul>
        <li><strong>Análisis de Valor ($/m²)</strong>: La Plataforma ofrece herramientas analíticas, como el filtrado y ordenamiento interactivo basado en el valor por metro cuadrado. Estos datos son calculados en base a la información provista por los anunciantes y tienen un fin puramente orientativo e informativo.</li>
        <li><strong>Operaciones de Alquiler</strong>: Para el caso de propiedades en alquiler, MetroProp podrá sustituir la visualización del valor por metro cuadrado por el valor de las expensas (si estuviese disponible), adaptando la interfaz a los usos y costumbres del mercado.</li>
        <li><strong>Geolocalización</strong>: La visualización de inmuebles en la &quot;Vista de Mapa&quot; se basa en integraciones de terceros (ej. Google Maps). MetroProp no garantiza la precisión milimétrica de los marcadores (pines) geográficos.</li>
    </ul>
    <h2>3. Registro, Tipos de Usuarios y Cuentas</h2>
    <p>El uso de funcionalidades avanzadas requiere el registro previo. Al registrarse, el usuario declara ser mayor de edad y tener capacidad legal para contratar. Existen dos perfiles:</p>
    <ul>
        <li><strong>Usuario Visitante</strong>: Persona física que busca inmuebles. Podrá registrarse mediante correo electrónico o Login Social (Google). El registro le permite guardar propiedades favoritas, configurar alertas personalizadas por email y almacenar historiales de búsqueda.</li>
        <li><strong>Usuario Profesional (Inmobiliarias/Agentes)</strong>: Entidades o profesionales que utilizan el Panel de Administración (Backoffice) para la carga de su inventario. Son los únicos responsables legales, penales y comerciales del contenido, fotografías y precios que publican.</li>
    </ul>
    <h2>4. Publicación de Anuncios e Integración vía API (CRMs)</h2>
    <ul>
        <li><strong>Veracidad y Legalidad</strong>: El Usuario Profesional garantiza poseer las autorizaciones, matrículas y mandatos legales vigentes en su jurisdicción para comercializar y publicar los inmuebles.</li>
        <li><strong>Sincronización de Datos (Ingesta)</strong>: Las inmobiliarias que conecten su inventario a través de CRMs de terceros (ej. Tokko Broker, Adinco, Xintel) deberán utilizar credenciales seguras (API Key y Secret Key).</li>
        <li><strong>Revocación de Accesos</strong>: MetroProp se reserva el derecho de revocar credenciales de API o suspender cuentas si detecta envíos masivos de datos corruptos, saturación intencional de servidores o incumplimiento de estos términos.</li>
    </ul>
    <h2>5. Propiedad Intelectual y Usos Prohibidos</h2>
    <ul>
        <li><strong>Propiedad de la Plataforma</strong>: El diseño general (UI/UX), la arquitectura del código fuente (React.js, Node.js), la estructura de bases de datos, los logotipos y las herramientas de visualización de MetroProp pertenecen a sus desarrolladores y titulares.</li>
        <li><strong>Prohibición de Extracción de Datos (Scraping)</strong>: Queda estrictamente prohibido el uso de scrapers, bots, spiders o cualquier software automatizado para extraer, copiar o duplicar el inventario de propiedades, los datos de contacto o nuestro algoritmo analítico de <strong>$/m²</strong>.</li>
        <li><strong>Prohibición de Spam</strong>: Está prohibido utilizar los formularios de contacto de las propiedades para enviar publicidad no solicitada, promociones ajenas al rubro o spam a las inmobiliarias.</li>
    </ul>
    <h2>6. Disponibilidad de la Plataforma</h2>
    <p>MetroProp está alojada en infraestructuras en la nube de alta disponibilidad (AWS). Sin embargo, no garantizamos que el funcionamiento de la Plataforma sea ininterrumpido, libre de errores o invulnerable a ataques informáticos de terceros. MetroProp podrá realizar paradas técnicas para mantenimiento sin previo aviso.</p>
    <h2>7. Moderación, Reportes y Sanciones</h2>
    <ul>
        <li>Si usted detecta un anuncio engañoso, fraudulento, con errores graves o que infringe derechos de terceros, debe reportarlo inmediatamente a través del correo oficial: <strong><a href="mailto:consultas@metroprop.co">consultas@metroprop.co</a></strong>.</li>
        <li>MetroProp podrá, a su exclusivo criterio y sin necesidad de notificación previa ni derecho a reembolso, suspender, ocultar o eliminar avisos, así como dar de baja cuentas de usuarios que violen las presentes Condiciones Generales.</li>
    </ul>
    
    <h2>8. Modificaciones, Jurisdicción y Ley Aplicable</h2>
    <ul>
        <li><strong>Actualizaciones</strong>: MetroProp se reserva el derecho de actualizar estos Términos y Condiciones en cualquier momento. El uso continuo de la Plataforma tras cualquier modificación implicará la aceptación de los nuevos términos.</li>
        <li><strong>Legislación</strong>: Las presentes condiciones se rigen por las leyes de la República Argentina. Cualquier disputa relacionada con el uso de la Plataforma intentará resolverse de buena fe a través de nuestros canales de soporte. En su defecto, las partes se someterán a la jurisdicción de los tribunales ordinarios competentes.</li>        
    </ul>
    <p><strong>Contacto Oficial</strong>: Para consultas, denuncias o soporte técnico, contáctenos en: <strong><a href="mailto:consultas@metroprop.co">consultas@metroprop.co</a></strong></p>
  </div>
  );
}
 