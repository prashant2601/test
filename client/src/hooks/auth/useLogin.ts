import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import ApiHelpers from '../../api/ApiHelpers';
import ApiConstants from '../../api/ApiConstants';
import { useAuth } from '../useAuth';
import { User } from '../../pages/admin/adminPanelSetting/usersAndRole/hooks/useGetUsersbyRole';

export interface MenuItem {
  label: string;
  isActive?: boolean;
  submenu?: MenuItem[];
}

interface LoginUserResponse {
  token: string;
  message: string;
  user: User;
  menus: MenuItem[];
  success: true;
}

interface LoginUserError {
  message: string;
  success: boolean;
}

const loginUser = async (
  query: string,
  password: string
): Promise<AxiosResponse<LoginUserResponse>> => {
  if (!query || !password) {
    throw new Error('Query (email or username) and password are required');
  }

  return ApiHelpers.POST(ApiConstants.LOGIN_USER(), { query, password });
};

export const useLogin = () => {
  const { login } = useAuth();
  return useMutation<
    AxiosResponse<LoginUserResponse>,
    AxiosError<LoginUserError>,
    { query: string; password: string }
  >({
    mutationFn: async ({ query, password }) => {
      return loginUser(query, password);
    },
    onSuccess: (data) => {
      if (data?.data.success) {
        const { token, user } = data?.data ?? {};
        localStorage.setItem('appToken', token);
        login(user);
        notifications.show({
          title: 'Login Successful',
          message: `Welcome back, ${user?.firstName ?? 'User'}`,
          color: 'green',
          autoClose: 3000,
          position: 'top-center',
        });
      }
    },
  });
};
