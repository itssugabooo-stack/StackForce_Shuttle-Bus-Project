import { io, Socket } from 'socket.io-client';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_ORIGIN;
const TOKEN_COOKIE_NAME = 'token';

const clearStoredToken = (): void => {
  localStorage.removeItem('token');
  document.cookie = `${TOKEN_COOKIE_NAME}=; Max-Age=0; path=/; SameSite=Lax`;
};

const getValidSocketToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${TOKEN_COOKIE_NAME}=`));
  const token = localStorage.getItem('token') || (cookie ? decodeURIComponent(cookie.slice(TOKEN_COOKIE_NAME.length + 1)) : null);
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
      clearStoredToken();
      return null;
    }

    return token;
  } catch {
    clearStoredToken();
    return null;
  }
};

const loginAsVehicle = async (): Promise<string> => {
  const response = await fetch(`${API_ORIGIN}/api/auth/vehicle/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceId: 'TS01',
      secret: 'device123',
    }),
  });

  const data = await response.json().catch(() => ({})) as {
    token?: unknown;
    error?: string;
  };
  if (!response.ok) throw new Error(data.error || `Vehicle login failed (${response.status})`);
  if (!data.token) {
    throw new Error('Backend vehicle login response did not include a token');
  }

  if (typeof data.token !== 'string') throw new Error('Backend returned an invalid vehicle token');
  localStorage.setItem('token', data.token);
  return data.token;
};

let socket: Socket | null = null;
let socketPromise: Promise<Socket> | null = null;
let refreshingToken = false;

export const getSocket = (): Promise<Socket> => {
  if (socket) return Promise.resolve(socket);
  if (socketPromise) return socketPromise;

  const pendingSocket = (async () => {
    const token = getValidSocketToken() || await loginAsVehicle();
    const connection = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: { token },
    });
    socket = connection;

    connection.on('connect', () => {
      console.log('Connected to Shuttle Tracking Socket.IO server on', SOCKET_URL);
    });

    connection.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);

      if (/invalid token|jwt|token expired|unauthorized|token missing|authentication error/i.test(err.message) && !refreshingToken) {
        refreshingToken = true;
        clearStoredToken();
        void loginAsVehicle()
          .then((freshToken) => {
            if (socket !== connection) return;
            connection.auth = { token: freshToken };
            connection.disconnect();
            connection.connect();
          })
          .catch((error: unknown) => {
            console.error('Vehicle socket re-authentication failed:', error);
          })
          .finally(() => {
            refreshingToken = false;
          });
      }
    });

    return connection;
  })();

  socketPromise = pendingSocket;
  void pendingSocket.catch(() => {
    if (socketPromise === pendingSocket) socketPromise = null;
  });
  return pendingSocket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketPromise = null;
};