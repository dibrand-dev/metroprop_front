import './policy.scss';

export default function policyPage() {
  return (<div className="policy-container">
    <h1>POLÍTICA DE PRIVACIDAD — METROPROP</h1>
    <p><strong>Última actualización</strong>: 23/06/2026 </p>
    <p>La presente Política de Privacidad establece los términos en que <strong>MetroProp</strong> (en adelante, &quot;la Plataforma&quot;) recopila, utiliza, almacena y protege la información que es provista por los usuarios al momento de utilizar el portal web, registrarse en sus sistemas o interactuar con sus herramientas analíticas.</p>
    <p>Esta Plataforma está firmemente comprometida con la seguridad y protección de los datos de sus usuarios, dando estricto cumplimiento a lo establecido por la <strong>Ley N° 25.326 de Protección de Datos Personales</strong> de la República Argentina, sus normas complementarias y las directivas de la Agencia de Acceso a la Información Pública.</p>
    <h2>1. Información que Recopilamos</h2>
    <p>La Plataforma recolecta únicamente los datos estrictamente necesarios para proveer los servicios de agregación de datos y búsqueda inmobiliaria modular, distinguiendo según el tipo de interacción:</p>
    <p><strong>A. Usuarios Visitantes y Registrados (Particulares)</strong></p>
    <ul>
      <li><strong>Registro Directo</strong>: Correo electrónico, nombre de usuario y contraseña cifrada mediante algoritmos criptográficos seguros.</li>
    <li><strong>Login Social (Google OAuth2)</strong>: Cuando el usuario decide registrarse o iniciar sesión utilizando su cuenta de Google, la Plataforma recopila el identificador único (ID de Google), nombre completo, dirección de correo electrónico de Gmail y la imagen de perfil/avatar.</li>
    <li><strong>Datos de Interacción Interna</strong>: Historial de búsquedas guardadas, configuraciones de filtros específicos, listado de propiedades seleccionadas como &quot;Favoritas&quot; y parámetros de Alertas por Email (criterios de zonas y rangos de valor por m²).</li>
    </ul>
    <p><strong>B. Usuarios Profesionales (Inmobiliarias y Agentes)</strong></p>
    <ul>
      <li><strong>Datos de Perfil Corporativo</strong>: Nombre de la inmobiliaria, logotipo comercial, descripción institucional, dirección comercial, teléfonos y datos de contacto de los vendedores o agentes asociados a la cuenta.</li>
      <li><strong>Datos de Inmuebles</strong>: Precios de venta o alquiler, valor de expensas, superficies (m² totales y construidos), ambientes, descripciones e imágenes de las propiedades cargadas manualmente o inyectadas vía API.</li>
    </ul>
    <p><strong>C. Leads y Formularios de Consulta</strong></p>
    <ul>
      <li>Cuando un usuario utiliza el formulario de contacto integrado en la ficha de una propiedad, la Plataforma recopila los datos ingresados (Nombre, correo electrónico, teléfono y mensaje de consulta) para su transmisión automática al anunciante responsable.</li>
    </ul>
    <p><strong>D. Datos de Navegación Técnica</strong></p>
    <ul>
      <li>Recopilamos de forma automatizada información sobre la dirección IP de conexión, logs del servidor, identificadores de sesión técnicos y cookies de rendimiento para optimizar la seguridad y habilitar las reglas de visualización del sistema de banners publicitarios.</li>
    </ul>
    <h2>2. Finalidad del Tratamiento de los Datos</h2>
    <p>La información recolectada por la Plataforma tiene las siguientes finalidades comerciales y operativas legítimas:</p>
    <ol>
      <li>Proveer y optimizar las funciones centrales de búsqueda avanzada, doble visualización (Vista de Mapa / Vista de Listado) y cálculo analítico de <strong>valor por metro cuadrado (m²)</strong>.</li>
      <li>Procesar las solicitudes de contacto enviadas por los usuarios y derivar los datos del formulario (Leads) de forma directa a la inmobiliaria a cargo del inmueble consultado.</li>
      <li>Ejecutar de manera automatizada el sistema de <strong>Alertas por Email</strong>, enviando notificaciones al correo del usuario cuando ingresen propiedades que coincidan con sus criterios guardados.</li>
      <li>Habilitar la lógica de segmentación del módulo de banners publicitarios (ej. mostrar publicidad específica según el tipo de propiedad o ubicación consultada por el usuario).</li>
      <li>Mantener la seguridad de la Plataforma, prevenir accesos no autorizados en los Backoffices y auditar el uso correcto de las credenciales de API (API Key y Secret Key) asignadas a los CRMs socios.</li>
    </ol>
    <h2>3. Almacenamiento, Conservación y Seguridad de los Datos</h2>
    <ul>
      <li><strong>Infraestructura de Nube</strong>: Todos los datos personales e inmobiliarios se almacenan en servidores de alta seguridad provistos por <strong>Amazon Web Services (AWS)</strong>, utilizando bases de datos relacionales (PostgreSQL) estructuradas con accesos restringidos y controlados mediante políticas de administración rigurosas.</li>
      <li><strong>Cifrado de Credenciales</strong>: Las contraseñas de los usuarios no se almacenan en texto plano; son procesadas mediante funciones de hashing seguro en el backend. La autenticación entre sesiones se gestiona mediante tokens JWT seguros.</li>
      <li><strong>Plazo de Conservación</strong>: Los datos se conservarán mientras se mantenga activa la cuenta del usuario o sea necesario para el cumplimiento de las obligaciones contractuales asumidas con las inmobiliarias suscriptoras.</li>
    </ul>
    <h2>4. Transferencia y Compartición de Información con Terceros</h2>
    <ul>
      <li><strong>Derivación de Leads Inmobiliarios</strong>: El usuario acepta expresamente que al enviar una consulta a través de la ficha de un inmueble, sus datos de contacto (Nombre, email, teléfono) serán transferidos al anunciante responsable de dicha publicación para posibilitar el contacto comercial.</li>
      <li><strong>Proveedores Tecnológicos</strong>: Los datos pueden ser procesados tangencialmente por herramientas integradas esenciales para el funcionamiento del MVP (como la API de Google Maps para los pines geográficos o servicios de mensajería transaccional para el envío de correos).</li>
      <li><strong>Prohibición de Comercialización</strong>: MetroProp no vende, alquila, ni cede bajo ningún título oneroso las bases de datos de sus usuarios a terceras empresas de marketing o publicidad.</li>
    </ul>
    <h2>5. Derechos del Titular de los Datos (Derechos ARCO)</h2>
    <p>De acuerdo con la Ley N° 25.326, los usuarios de la Plataforma tienen derecho a ejercer de forma gratuita sus facultades de <strong>Acceso, Rectificación, Actualización y Supresión</strong> de sus datos personales.</p>
    <ul>
      <li>Para ejercer cualquiera de estos derechos, o revocar el consentimiento del uso del correo electrónico para alertas informativas, el titular deberá enviar una solicitud formal desde la dirección de email registrada en la plataforma hacia el correo oficial de atención:
      <strong><a href="mailto:atencion@metroprop.com">atencion@metroprop.com</a></strong></li>
      <li>Se informa que la <strong>Agencia de Acceso a la Información Pública</strong>, órgano de control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.</li>
    </ul>
    
    <h2>6. Cookies y Tecnologías de Terceros</h2>
    <p>La Plataforma utiliza cookies técnicas estrictamente necesarias para el mantenimiento de la sesión activa del usuario, seguridad del login y para la correcta indexación de filtros en la página de resultados. El usuario puede configurar su navegador web para bloquear o eliminar las cookies, reconociendo que esto podría deshabilitar o ralentizar ciertas funciones interactivas del portal.</p>
    <h2>7. Modificaciones a la Presente Política</h2>
    <p>La Plataforma se reserva el derecho de modificar esta Política de Privacidad de forma parcial o total para adaptarla a cambios regulatorios, de infraestructura en la nube o evolución de los servicios comerciales del portal. Las modificaciones tendrán vigencia desde su publicación en esta sección de la Plataforma.</p>
    <p><strong>Correo electrónico de contacto y asuntos legales: <a href="mailto:atencion@metroprop.com">atencion@metroprop.com</a></strong></p>
  </div>
  );
}
 