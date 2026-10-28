// Casos de éxito: textos literales de Aarón (26/10/2026). Cifras declaradas por el cliente, no verificadas.
// `video`: ruta a un MP4 en /public/videos o URL pública. Vacío = se muestra el hueco pendiente.
// `stats[].v = null` = cifra pendiente de confirmar (no se publica).

export const CASES = [
  {
    id: "karel",
    name: "Karel",
    place: "Florida, EE. UU.",
    profile: "Propietario · 2 casas · Mismo mes, un año después",
    headline: "De 6.657 $ a 13.815 $ al mes con las mismas dos casas",
    text: "Karel tenía dos casas en Florida que facturaban 6.657 $ en un mes. Un año después, ese mismo mes, las mismas casas facturaron 13.815 $. Trabajamos cómo se veían, cómo se elegían y cómo se reservaban, sin cambiar las propiedades. La facturación se duplicó.",
    stats: [{ k: "Facturación mensual", v: "13.815 USD" }],
    video: "",
  },
  {
    id: "joaquin",
    name: "Joaquín",
    place: "Madrid",
    profile: "Propietario · Sin reformar",
    headline: null,
    headlineNote: "Titular pendiente: +30 % o +32 % y período",
    text: "Joaquín tenía su piso en Madrid con la facturación estancada. Mismo piso, mismo mobiliario: trabajamos solo las fotografías y el posicionamiento del anuncio.",
    stats: [{ k: "Incremento de facturación", v: null, note: "30 % o 32 %: por confirmar" }],
    video: "",
  },
  {
    id: "jaime",
    name: "Jaime",
    place: "Houston, EE. UU.",
    profile: "Propietario · Primer mes publicado",
    headline: "59.000 $ reservados en su primer mes publicado",
    text: "Publicamos la casa de Jaime en Houston con el método aplicado desde el primer día. En su primer mes publicada ya tenía 59.000 $ en reservas, correspondientes a los 4 meses siguientes (sin reseñas ni historial).",
    stats: [{ k: "Reservado en el 1.er mes", v: "59.000 USD" }],
    video: "",
  },
  {
    id: "roger",
    name: "Roger",
    place: "",
    profile: "Gestor · Revenue management y gestión de propiedades",
    headline: "+180 propiedades en revenue y +25 en gestión, con más de 6 M de revenue",
    text: "Roger lleva un negocio de revenue management y gestión de propiedades de alquiler vacacional. Hoy trabaja el pricing de más de 180 propiedades, gestiona por completo más de 25 y acumula más de 6 millones de revenue.",
    stats: [
      { k: "Propiedades en revenue", v: "+180" },
      { k: "Propiedades en gestión", v: "+25" },
    ],
    video: "",
  },
  {
    id: "familia",
    name: "La familia de Jaume",
    place: "Mallorca",
    profile: "Casas familiares · 2 propiedades · Facturación anual",
    headline: "De 70.000 € a 350.000 € al año con las dos casas de la familia",
    text: "Eran dos propiedades en Mallorca: una pequeña en Playa de Muro y la planta de arriba de la casa familiar. Entre las dos facturaban 70.000 € al año, 35.000 € cada una. Aplicamos el método: la casa familiar pasó de 35.000 € a 290.000 € y la de Playa de Muro de 35.000 € a 60.000 €, hasta 350.000 € entre las dos. En una de ellas hubo reforma. El caso de Joaquín demuestra que el método también funciona sin reformar.",
    stats: [{ k: "Facturación anual", v: "350.000 EUR" }],
    video: "",
  },
  {
    id: "jaume",
    name: "Jaume Genovard",
    place: "Miami, EE. UU.",
    profile: "Operador de Airbnb · Fundador de Marès Collection",
    headline: "De 0 propiedades a 69 y 393.000 $ al mes",
    text: "Jaume empezó de cero, sin propiedades ni ingresos. Trabajó tres meses sin cobrar con el referente del mercado hispano en Airbnb y aplicaba cada semana lo aprendido en propiedades suyas. En el mes 4 su primera propiedad ya igualaba su sueldo y en el mes 5 la segunda lo duplicaba. Cerró el primer año con 14 propiedades y 25.000 $ al mes de beneficio, sin comprar ninguna. Fue mentor de más de 200 personas. Hoy dirige Marès Collection: 69 propiedades que suman 393.000 $ al mes.",
    stats: [
      { k: "Propiedades gestionadas", v: "69" },
      { k: "Facturación mensual", v: "393.000 USD" },
    ],
    video: "",
  },
];
