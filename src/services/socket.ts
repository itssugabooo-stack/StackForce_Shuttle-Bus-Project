import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

const getValidSocketToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) {
      localStorage.removeItem('token');
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4));
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    const { exp } = JSON.parse(json) as { exp?: number };

    if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return token;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
};

const loginAsAdmin = async (): Promise<string> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123',
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to authenticate admin user');
  }

  const data = await response.json() as { token?: string };
  if (!data.token) {
    throw new Error('Backend login response did not include a token');
  }

  localStorage.setItem('token', data.token);
  return data.token;
};

const refreshSocketAuth = async (): Promise<string | null> => {
  try {
    const validToken = getValidSocketToken();
    if (validToken) return validToken;

    return await loginAsAdmin();
  } catch (error) {
    console.warn('Automatic admin login failed:', error);
    return null;
  }
};

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = getValidSocketToken();

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: {
        token: token || 'pending',
      },
    });

    if (!token) {
      void refreshSocketAuth().then((freshToken) => {
        if (!freshToken) return;
        if (socket) {
          socket.auth = { token: freshToken };
          socket.connect();
        }
      });
    }

    socket.on('connect', () => {
      console.log('Connected to Shuttle Tracking Socket.IO server on', SOCKET_URL);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);

      if (/invalid token|jwt|token expired|unauthorized|token missing/i.test(err.message)) {
        localStorage.removeItem('token');
        void refreshSocketAuth().then((freshToken) => {
          if (!freshToken || !socket) return;
          socket.auth = { token: freshToken };
          socket.connect();
        });
      }
    });
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};