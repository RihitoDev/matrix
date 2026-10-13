export interface Vacancy {
  id: number;
  cargo: string;
  empresa: string;
  descripcion: string;
  requisitos: string[];
  salario: string;
  ubicacion: string;
  tipoContrato: string;
  jornada: string;
}

export const vacancies: Vacancy[] = [
  {
    id: 1,
    cargo: "Desarrollador Web Junior",
    empresa: "Tech Solutions Bolivia",
    descripcion:
      "Buscamos un desarrollador web junior para formar parte de nuestro equipo de desarrollo de aplicaciones web.",
    requisitos: [
      "Conocimientos de HTML, CSS y JavaScript",
      "Conocimientos básicos de React",
      "Conocimientos de Git",
      "Capacidad para trabajar en equipo",
    ],
    salario: "Bs. 4.000 - 5.000",
    ubicacion: "Cochabamba, Bolivia",
    tipoContrato: "Tiempo completo",
    jornada: "Presencial",
  },

  {
    id: 2,
    cargo: "Ingeniero de Redes",
    empresa: "Telecom Bolivia S.R.L.",
    descripcion:
      "Se requiere ingeniero de redes para administrar y mantener la infraestructura de comunicaciones de la empresa.",
    requisitos: [
      "Conocimientos de redes TCP/IP",
      "Configuración de routers y switches",
      "Conocimientos de Cisco",
      "Conocimientos de Linux",
      "Experiencia en administración de redes",
    ],
    salario: "Bs. 6.000 - 8.000",
    ubicacion: "Cochabamba, Bolivia",
    tipoContrato: "Tiempo completo",
    jornada: "Presencial",
  },

  {
    id: 3,
    cargo: "Analista de Sistemas",
    empresa: "Servicios Informáticos Andinos",
    descripcion:
      "Buscamos un analista de sistemas encargado del análisis, documentación y mejora de los sistemas informáticos de la organización.",
    requisitos: [
      "Formación en Ingeniería de Sistemas o carreras afines",
      "Conocimientos de bases de datos",
      "Conocimientos de SQL",
      "Análisis y documentación de requerimientos",
      "Capacidad de trabajo en equipo",
    ],
    salario: "Bs. 5.000 - 6.500",
    ubicacion: "Cochabamba, Bolivia",
    tipoContrato: "Tiempo completo",
    jornada: "Híbrido",
  },

  {
    id: 4,
    cargo: "Soporte Técnico",
    empresa: "Digital Systems Bolivia",
    descripcion:
      "Se busca personal para brindar soporte técnico a usuarios y mantener equipos y sistemas informáticos.",
    requisitos: [
      "Conocimientos de hardware y software",
      "Instalación y configuración de sistemas operativos",
      "Conocimientos básicos de redes",
      "Atención y soporte a usuarios",
      "Buenas habilidades de comunicación",
    ],
    salario: "Bs. 3.000 - 4.000",
    ubicacion: "Cochabamba, Bolivia",
    tipoContrato: "Tiempo completo",
    jornada: "Presencial",
  },

  {
    id: 5,
    cargo: "Desarrollador Backend",
    empresa: "Innovatec Bolivia",
    descripcion:
      "Buscamos desarrollador backend para participar en el diseño y desarrollo de APIs y servicios para nuestras aplicaciones.",
    requisitos: [
      "Experiencia con Node.js",
      "Conocimientos de TypeScript",
      "Conocimientos de APIs REST",
      "Conocimientos de bases de datos SQL",
      "Conocimientos de Git",
    ],
    salario: "Bs. 5.500 - 7.500",
    ubicacion: "Cochabamba, Bolivia",
    tipoContrato: "Tiempo completo",
    jornada: "Híbrido",
  },
];
