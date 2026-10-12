import type { EducationDegreeCatalogEntry } from '../types/education-degree-catalog-entry.types';

export const EDUCATION_DEGREES: readonly EducationDegreeCatalogEntry[] = [
  {
    institution: "Universidad Mayor de San Simón (UMSS)",
    sources: ["https://www.fcyt.umss.edu.bo/pregrado/","https://www.umss.edu.bo/departamento-de-biologia-2/"],
    degrees: [
      { name: "Ingeniería de Alimentos", aliases: [] },
      { name: "Ingeniería Civil", aliases: [] },
      { name: "Ingeniería Mecánica", aliases: [] },
      { name: "Ingeniería Electromecánica", aliases: [] },
      { name: "Ingeniería Industrial", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería Química", aliases: [] },
      { name: "Ingeniería Eléctrica", aliases: [] },
      { name: "Ingeniería Informática", aliases: ["Ingeniería en Informática","Ingenieria de Informatica"] },
      { name: "Ingeniería Petroquímica", aliases: [] },
      { name: "Ingeniería Electrónica", aliases: [] },
      { name: "Ingeniería en Energía", aliases: [] },
      { name: "Ingeniería Matemática", aliases: [] },
      { name: "Ingeniería en Biotecnología", aliases: [] },
      { name: "Licenciatura en Biología", aliases: ["Biología"] },
      { name: "Licenciatura en Física", aliases: ["Física"] },
      { name: "Licenciatura en Matemáticas", aliases: ["Matemáticas"] },
      { name: "Licenciatura en Química", aliases: ["Química"] },
      { name: "Licenciatura en Didáctica de la Física", aliases: ["Didáctica de la Física"] },
    ],
  },
  {
    institution: "Universidad Indígena Boliviana Quechua \"Casimiro Huanca\" (UNIBOL Quechua)",
    sources: ["https://unibolquechua.edu.bo/wp-content/uploads/2024/01/Convocatoria-de-examen-directo.pdf"],
    degrees: [
      { name: "Ingeniería en Agroforestería Comunitaria Ecológica", aliases: [] },
      { name: "Ingeniería en Transformación de Alimentos", aliases: [] },
      { name: "Ingeniería en Acuicultura Comunitaria y Gestión de Agua", aliases: [] },
    ],
  },
  {
    institution: "Escuela Militar de Ingeniería (EMI)",
    sources: ["https://emi.edu.bo/servicios/preguntas-frecuentes"],
    degrees: [
      { name: "Ingeniería Civil", aliases: [] },
      { name: "Ingeniería en Sistemas Electrónicos", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería Petrolera", aliases: [] },
      { name: "Ingeniería Agroindustrial", aliases: [] },
      { name: "Técnico Superior en Sistemas Electrónicos", aliases: [] },
      { name: "Técnico Superior en Informática", aliases: [] },
      { name: "Técnico Superior en Construcción Civil", aliases: [] },
      { name: "Técnico Superior en Energías Renovables", aliases: [] },
    ],
  },
  {
    institution: "Universidad Católica Boliviana \"San Pablo\" (UCB)",
    sources: ["https://cba.ucb.edu.bo/oferta-pregrado-ucb-cochabamba/"],
    degrees: [
      { name: "Ingeniería Ambiental", aliases: [] },
      { name: "Ingeniería Civil", aliases: [] },
      { name: "Ingeniería Industrial", aliases: [] },
      { name: "Ingeniería Química", aliases: [] },
      { name: "Ingeniería Mecatrónica", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería de Telecomunicaciones", aliases: [] },
    ],
  },
  {
    institution: "Universidad Privada Boliviana (UPB)",
    sources: ["https://innovacioneducativa.upb.edu/es/contenido/pregrado","https://www.upb.edu/programas/pregrado/cb-ingenieria-en-inteligencia-artificial","https://www.upb.edu/programas/pregrado/cb-ingenieria-industrial-y-sistemas"],
    degrees: [
      { name: "Ingeniería Civil", aliases: [] },
      { name: "Ingeniería de la Producción", aliases: [] },
      { name: "Ingeniería Industrial y Sistemas", aliases: ["Ingeniería Industrial y de Sistemas"] },
      { name: "Ingeniería en Inteligencia Artificial", aliases: ["Ingeniería de Inteligencia Artificial"] },
      { name: "Ingeniería de Sistemas Computacionales", aliases: [] },
      { name: "Ingeniería Electromecánica", aliases: [] },
      { name: "Ingeniería Electrónica y Telecomunicaciones", aliases: [] },
      { name: "Ingeniería en Petróleo y Gas Natural", aliases: [] },
    ],
  },
  {
    institution: "Universidad Privada del Valle (UNIVALLE)",
    sources: ["https://www.univalle.edu/?page_id=20106"],
    degrees: [
      { name: "Ingeniería en Ciencia de Datos e Inteligencia de Negocios", aliases: [] },
      { name: "Ingeniería Biomédica", aliases: [] },
      { name: "Ingeniería Electrónica", aliases: [] },
      { name: "Ingeniería de Sistemas Informáticos", aliases: [] },
      { name: "Ingeniería Civil", aliases: [] },
      { name: "Ingeniería en Tecnología Alimentaria", aliases: [] },
      { name: "Ingeniería Aeronáutica", aliases: [] },
      { name: "Ingeniería Electromecánica", aliases: [] },
      { name: "Ingeniería Mecánica y de Automatización Industrial", aliases: [] },
      { name: "Ingeniería Industrial", aliases: [] },
      { name: "Ingeniería en Energía", aliases: [] },
    ],
  },
  {
    institution: "Universidad Privada Franz Tamayo (UNIFRANZ)",
    sources: ["https://unifranz.edu.bo/carreras/ingenieria-de-sistemas-e-innovacion-digital/","https://rrii.unifranz.edu.bo/tecnologia-para-la-educacion"],
    degrees: [
      { name: "Ingeniería de Sistemas e Innovación Digital", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
    ],
  },
  {
    institution: "Universidad de Aquino Bolivia (UDABOL)",
    sources: ["https://www.minedu.gob.bo/files/GUIA-UNIVERSIDADES.pdf#page=73"],
    degrees: [
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería Ambiental", aliases: [] },
      { name: "Ingeniería Agronómica", aliases: [] },
    ],
  },
  {
    institution: "Universidad Central (UNICEN)",
    sources: ["https://unicen.edu.bo/noticias/ministerio-de-educacion-autoriza-la-nueva-licenciatura-en-innovacion-digital-e-inteligencia-artificial-de-unicen/"],
    degrees: [
      { name: "Licenciatura en Innovación Digital e Inteligencia Artificial", aliases: ["Innovación Digital e Inteligencia Artificial"] },
    ],
  },
  {
    institution: "Universidad Privada de Ciencias Administrativas y Tecnológicas (UCATEC)",
    sources: ["https://web.ucatec.edu.bo/"],
    degrees: [
      { name: "Ingeniería Mecatrónica", aliases: [] },
      { name: "Ingeniería Industrial", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Técnico Superior en Análisis de Sistemas", aliases: [] },
    ],
  },
  {
    institution: "Universidad Privada Domingo Savio (UPDS)",
    sources: ["https://www.upds.edu.bo/facultad/ingenieria/"],
    degrees: [
      { name: "Ingeniería Industrial", aliases: [] },
      { name: "Ingeniería en Redes y Telecomunicaciones", aliases: [] },
      { name: "Ingeniería en Gestión Petrolera", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
    ],
  },
  {
    institution: "Universidad Adventista de Bolivia (UAB)",
    sources: ["https://paginanueva.uab.edu.bo/comp-sistemas/"],
    degrees: [
      { name: "Ingeniería de Sistemas", aliases: [] },
    ],
  },
  {
    institution: "Universidad Técnica Privada Cosmos (UNITEPC)",
    sources: ["https://unitepc.edu.bo/cochabamba/requisitos-carreras-cochabamba/","https://www.minedu.gob.bo/files/documentos-normativos/VESFP/Plazas_disponibles_Becas_Sociales_Universidades.pdf"],
    degrees: [
      { name: "Ingeniería de Sonido", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería Electrónica", aliases: [] },
      { name: "Ingeniería Biomédica", aliases: [] },
    ],
  },
  {
    institution: "Universidad Simón I. Patiño (USIP)",
    sources: ["https://usip.edu.bo/facultad/de-ingenieria/","https://usip.edu.bo/"],
    degrees: [
      { name: "Ingeniería de Telecomunicaciones", aliases: [] },
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería Electromecánica", aliases: [] },
      { name: "Técnico Superior en Software", aliases: [] },
    ],
  },
  {
    institution: "Universidad Latinoamericana (ULAT)",
    sources: ["https://www.minedu.gob.bo/files/documentos-normativos/VESFP/Plazas_disponibles_Becas_Sociales_Universidades.pdf"],
    degrees: [
      { name: "Ingeniería de Sistemas", aliases: [] },
      { name: "Ingeniería Civil", aliases: [] },
    ],
  },
  {
    institution: "Universidad Villa de Oropesa (UNIVIOR)",
    sources: ["https://univior.edu.bo/nuestras-carreras/"],
    degrees: [
      { name: "Ingeniería de Alimentos", aliases: [] },
      { name: "Ingeniería de Telecomunicaciones", aliases: [] },
    ],
  },
  {
    institution: "Universidad Salesiana de Bolivia (USB)",
    sources: ["https://www.usalesiana.edu.bo/cochabamba/sitio/ing_de_sistemas_cochabamba/"],
    degrees: [
      { name: "Ingeniería de Sistemas", aliases: [] },
    ],
  },
];

