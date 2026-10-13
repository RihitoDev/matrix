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
  { email: 'titulado.1@umssy.test',   isOnline: false, minutesAgo: 1440 },
  { email: 'estudiante.1@umssy.test', isOnline: false },
];

export const SEED_CONVERSATIONS: SeedConversationDefinition[] = [
  {
    key: 'conv-with-unread',
    userAEmail: 'prueba@umss.edu.bo',
    userBEmail: 'mentor.a@umssy.test',
    lastReadAtByA: { minutesAgo: 240 },
    lastReadAtByB: 'now',
    messages: [
      { fromA: true,  content: 'Hola, ¿cómo va todo?',            minutesAgo: 300, status: 'READ' },
      { fromA: false, content: 'Todo bien, gracias. ¿Y tú?',       minutesAgo: 290, status: 'READ' },
      { fromA: false, content: '¿Revisaste el CV que te envié?',   minutesAgo: 120, status: 'SENT' },
      { fromA: false, content: 'Avísame cuando puedas.',           minutesAgo: 30,  status: 'SENT' },
    ],
  },
  {
    key: 'conv-no-unread',
    userAEmail: 'prueba@umss.edu.bo',
    userBEmail: 'titulado.1@umssy.test',
    lastReadAtByA: 'now',
    lastReadAtByB: 'now',
    messages: [
      { fromA: false, content: 'Perfecto, coordinamos la llamada para mañana.', minutesAgo: 1440, status: 'READ' },
      { fromA: true,  content: 'De acuerdo, nos vemos a las 9.',                minutesAgo: 1430, status: 'READ' },
    ],
  },
  {
    key: 'conv-recent-incoming',
    userAEmail: 'prueba@umss.edu.bo',
    userBEmail: 'estudiante.1@umssy.test',
    lastReadAtByA: { minutesAgo: 90 },
    lastReadAtByB: 'now',
    messages: [
      { fromA: true,  content: '¿Tienes el documento de soporte?', minutesAgo: 200, status: 'READ' },
      { fromA: false, content: 'Te envío el documento en PDF.',     minutesAgo: 60,  status: 'SENT' },
    ],
  },
];