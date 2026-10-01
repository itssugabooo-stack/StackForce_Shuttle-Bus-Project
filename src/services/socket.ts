import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '') || '',
      },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to backend socket:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};