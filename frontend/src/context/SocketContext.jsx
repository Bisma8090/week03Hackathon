import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://your-reviews-service.vercel.app';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const userRef = useRef(user); // always holds latest user — updated below
  const [notifications, setNotifications] = useState([]);
  const [liveLikes, setLiveLikes] = useState({});
  const [liveReplyAdded, setLiveReplyAdded] = useState(null);

  // Keep userRef in sync with latest user value
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Connect once on mount — event handlers read userRef for latest user
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // BROADCAST: new review — skip if current user is the poster
    socket.on('new_review', (data) => {
      const currentUserId = userRef.current?._id;
      if (data.userId && currentUserId && data.userId === currentUserId) return;
      setNotifications((prev) => [{ id: Date.now(), ...data, read: false }, ...prev]);
    });

    // BROADCAST: like count update — update UI without refetch
    socket.on('like_update', ({ reviewId, likesCount }) => {
      setLiveLikes((prev) => ({ ...prev, [reviewId]: likesCount }));
    });

    // BROADCAST: reply added — trigger refetch on product pages
    socket.on('reply_added', (data) => {
      setLiveReplyAdded({ ...data, _ts: Date.now() });
    });

    // DIRECT: personal notification (reply, like, flagged, deleted, product_update, review_submitted)
    socket.on('notification', (data) => {
      const currentUser = userRef.current;
      // Skip reply notifications if current user was the one who replied
      if (data.type === 'reply' && data.replierId && currentUser?._id === data.replierId) return;
      setNotifications((prev) => [{ id: Date.now(), ...data, read: false }, ...prev]);
    });

    return () => socket.disconnect();
  }, []); // connect once — never recreate

  // Register / re-register on login, logout, or socket reconnect
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const doRegister = () => {
      const uid = userRef.current?._id;
      if (uid) {
        socket.emit('register', { userId: uid, role: userRef.current?.role });
        console.log('[Socket] Registered userId:', uid, 'role:', userRef.current?.role);
      }
    };

    // If already connected, register immediately
    if (socket.connected) doRegister();

    // Re-register on every (re)connect
    socket.on('connect', doRegister);
    return () => socket.off('connect', doRegister);
  }, [user]); // re-run when user logs in or out

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearNotifications = () => setNotifications([]);

  const removeNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <SocketContext.Provider
      value={{ notifications, markAllRead, clearNotifications, removeNotification, liveLikes, liveReplyAdded }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
