import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: (cb) => {
        const localTok = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        cb({ token: localTok || '' });
      },
    });

    socket.on('connect', () => {
      console.log('Connected to Shuttle Tracking Socket.IO server on', SOCKET_URL);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }
  return socket;
};