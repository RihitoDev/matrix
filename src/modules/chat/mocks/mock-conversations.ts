import { Conversation } from '../types/conversation.types';

const now = new Date();

const todayRecent = new Date(now.getTime() - 1000 * 60 * 15).toISOString();
const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 40).toISOString();
const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString();
const olderDate = new Date('2026-04-03T14:15:00Z').toISOString();

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    contact: {
      id: 'user-101',
      fullName: 'Maria Peredo',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isOnline: true,
    },
    lastMessage: {
      id: 'msg-1',
      senderId: 'user-101',
      content: 'Hola, pudiste revisar los requerimientos de la vacante de Frontend?',
      isAttachment: false,
      createdAt: todayRecent,
    },
    unreadCount: 2,
    updatedAt: todayRecent,
  },
  {
    id: 'conv-2',
    contact: {
      id: 'user-102',
      fullName: 'Pablo Perez',
      avatarUrl: null, 
      isOnline: false,
    },
    lastMessage: {
      id: 'msg-2',
      senderId: 'user-102',
      content: 'Perfecto, coordinamos la llamada para manana a primera hora.',
      isAttachment: false,
      createdAt: todayMorning,
    },
    unreadCount: 0,
    updatedAt: todayMorning,
  },
  {
    id: 'conv-3',
    contact: {
      id: 'user-103',
      fullName: 'Mario Alcocer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isOnline: true,
    },
    lastMessage: {
      id: 'msg-3',
      senderId: 'user-103',
      content: 'Te envie el documento de soporte en formato PDF.',
      isAttachment: true,
      attachmentType: 'file',
      createdAt: yesterday,
    },
    unreadCount: 1,
    updatedAt: yesterday,
  },
  {
    id: 'conv-4',
    contact: {
      id: 'user-104',
      fullName: 'Claudia Torrico',
      avatarUrl: null,
      isOnline: false,
    },
    lastMessage: {
      id: 'msg-4',
      senderId: 'current-user',
      content: 'Estimada Claudia, muchas gracias por la informacion compartida en el webinar de ciberseguridad dictado el pasado viernes.',
      isAttachment: false,
      createdAt: olderDate,
    },
    unreadCount: 0,
    updatedAt: olderDate,
  },
];