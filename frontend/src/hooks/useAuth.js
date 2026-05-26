import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api.js';
import { logoutLocal, setCredentials } from '../features/auth/authSlice.js';
import { disconnectSocket } from '../services/socket.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const login = async (payload) => {
    const response = await endpoints.auth.login(payload);
    dispatch(setCredentials(response.data));
    toast.success('Welcome back');
    const role = response.data.user.role;
    navigate(role === 'admin' ? '/admin/dashboard' : role === 'agent' ? '/agent/dashboard' : '/customer/dashboard');
  };

  const signup = async (payload) => {
    const response = await endpoints.auth.signup(payload);
    dispatch(setCredentials(response.data));
    toast.success('Account created');
    navigate(payload.role === 'agent' ? '/agent/dashboard' : '/customer/dashboard');
  };

  const logout = async () => {
    try {
      await endpoints.auth.logout();
    } catch {
      // Local logout is still valid when the server session is already expired.
    }
    disconnectSocket();
    dispatch(logoutLocal());
    navigate('/login');
  };

  return { ...auth, login, signup, logout };
};
