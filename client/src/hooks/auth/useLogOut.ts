import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import ApiHelpers from '../../api/ApiHelpers';
import ApiConstants from '../../api/ApiConstants';
import { useAuth } from '../useAuth';

interface LogoutResponse {
  success: boolean;
  message: string;
}

interface LogoutError {
  success: boolean;
  message: string;
}

const logoutUser = async (): Promise<AxiosResponse<LogoutResponse>> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return ApiHelpers.POST(ApiConstants.LOGOUT_USER());
};

export const useLogout = () => {
  const { logout } = useAuth();

  return useMutation<AxiosResponse<LogoutResponse>, AxiosError<LogoutError>>({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      if (data?.data.success) {
        logout();
        notifications.show({
          title: 'Logout Successful',
          message: data.data.message,
          color: 'blue',
          autoClose: 3000,
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: 'Logout Failed',
        message: error?.response?.data?.message ?? 'Something went wrong',
        color: 'red',
        autoClose: 3000,
      });
    },
  });
};
