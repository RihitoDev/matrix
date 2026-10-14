import { MESSAGE_STATUS_TITLES } from './chat.constants.js';
import type {
  SeedConversationDefinition,
  SeedMessageStatusDefinition,
  SeedUserPresenceDefinition,
} from '../types/seed-chat-definition.types.js';

export const SEED_MESSAGE_STATUSES: SeedMessageStatusDefinition[] = [
  { title: MESSAGE_STATUS_TITLES.SENDING,   description: 'El mensaje se está enviando' },
  { title: MESSAGE_STATUS_TITLES.SENT,      description: 'El mensaje llegó al servidor' },
  { title: MESSAGE_STATUS_TITLES.DELIVERED, description: 'El mensaje llegó al destinatario' },
  { title: MESSAGE_STATUS_TITLES.READ,      description: 'El destinatario abrió el mensaje' },
];

export const SEED_USER_PRESENCES: SeedUserPresenceDefinition[] = [
  { email: 'mentor.a@umssy.test',     isOnline: true },
  { email: 'empresa@umssy.test',      isOnline: true },
  { email: 'titulado.1@umssy.test',   isOnline: true },
  { email: 'prueba@umss.edu.bo',      isOnline: false, minutesAgo: 180 },
  { email: 'mentor.b@umssy.test',     isOnline: false, minutesAgo: 2880 },
  { email: 'estudiante.1@umssy.test', isOnline: false, minutesAgo: 20160 },
];

export const SEED_CONVERSATIONS: SeedConversationDefinition[] = [
  {
    key: 'conv-titulado-mentor-a',
    userAEmail: 'titulado.1@umssy.test',
    userBEmail: 'mentor.a@umssy.test',
    lastReadAtByA: { minutesAgo: 45 },
    lastReadAtByB: 'now',
    messages: [
      { fromA: true,  content: 'Hola Mentor Alfa, te envié la actualización de mi postulación.', minutesAgo: 60, status: 'READ' },
      { fromA: false, content: 'Excelente, acabo de revisarla y se ve muy sólida.', minutesAgo: 30, status: 'SENT' },
      { fromA: false, content: '¿Pudiste revisar los requerimientos de la vacante de Frontend?', minutesAgo: 15, status: 'SENT' },
    ],
  },
  {
    key: 'conv-titulado-prueba',
    userAEmail: 'titulado.1@umssy.test',
    userBEmail: 'prueba@umss.edu.bo',
    lastReadAtByA: 'now',
    lastReadAtByB: 'now',
    messages: [
      { fromA: false, content: 'Perfecto, coordinamos la llamada para mañana a primera hora.', minutesAgo: 240, status: 'READ' },
      { fromA: true,  content: 'De acuerdo, nos vemos a las 9.', minutesAgo: 230, status: 'READ' },
    ],
  },
  {
    key: 'conv-titulado-empresa',
    userAEmail: 'titulado.1@umssy.test',
    userBEmail: 'empresa@umssy.test',
    lastReadAtByA: { minutesAgo: 2000 },
    lastReadAtByB: 'now',
    messages: [
      { fromA: true,  content: 'Hola Carlos, quedo atento a la documentación de la empresa.', minutesAgo: 1600, status: 'READ' },
      { fromA: false, content: '[Archivo] Te envié el documento de soporte en formato PDF.', minutesAgo: 1440, status: 'SENT' },
    ],
  },
  {
    key: 'conv-titulado-mentor-b',
    userAEmail: 'titulado.1@umssy.test',
    userBEmail: 'mentor.b@umssy.test',
    lastReadAtByA: 'now',
    lastReadAtByB: 'now',
    messages: [
      { fromA: false, content: 'Tu sesión de orientación técnica fue agendada con éxito para el próximo ciclo.', minutesAgo: 4320, status: 'READ' },
    ],
  },
  {
    key: 'conv-titulado-estudiante',
    userAEmail: 'titulado.1@umssy.test',
    userBEmail: 'estudiante.1@umssy.test',
    lastReadAtByA: 'now',
    lastReadAtByB: 'now',
    messages: [
      { fromA: true,  content: 'Estimado estudiante, muchas gracias por la información compartida en el webinar dictado el mes pasado.', minutesAgo: 20160, status: 'READ' },
    ],
  },
];