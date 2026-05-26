import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { router } from './routes/router.jsx';
import { connectSocket } from './services/socket.js';

export default function App() {
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const socket = connectSocket(token);
    if (!socket) return undefined;
    socket.on('notification:new', (notification) => toast(notification.title));
    socket.on('booking:update', () => toast.success('Booking updated'));
    return () => {
      socket.off('notification:new');
      socket.off('booking:update');
    };
  }, [token]);

  return <RouterProvider router={router} />;
}
