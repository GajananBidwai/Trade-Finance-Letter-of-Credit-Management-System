import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { setCredentials, logout } from '../store/authSlice';
import type { LoginPayload } from '../types';

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginPayload) => authApi.login(credentials),
    onSuccess: (response) => {
      if (response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.token,
          })
        );
        // Store refresh token securely, e.g. HttpOnly cookie handled by backend or local storage
        localStorage.setItem('refreshToken', response.data.refreshToken);
        navigate('/'); // Redirect to dashboard
      }
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => authApi.logout(token),
    onSuccess: () => {
      dispatch(logout());
      localStorage.removeItem('refreshToken');
      navigate('/login');
    },
  });
};
