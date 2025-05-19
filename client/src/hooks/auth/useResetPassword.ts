import { AxiosError, AxiosResponse } from 'axios';
import { handleAPIError } from '../../utility/helperFuntions';
import { notifications } from '@mantine/notifications';
import ApiHelpers from '../../api/ApiHelpers';
import ApiConstants from '../../api/ApiConstants';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

interface ResetPasswordError {
  message: string;
  success: boolean;
}
const resetPassword = async (
  token: string,
  password: string
): Promise<AxiosResponse<ResetPasswordResponse>> => {
  return ApiHelpers.POST(ApiConstants.RESET_PASSWORD(), {
    token,
    password,
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation<
    AxiosResponse<ResetPasswordResponse>,
    AxiosError<ResetPasswordError>,
    { token: string; password: string }
  >({
    mutationFn: async ({ token, password }) => {
      return resetPassword(token, password);
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.data.message ?? 'Password has been reset successfully.',
        color: 'green',
        autoClose: 3000,
        position: 'top-center',
      });
      setTimeout(() => navigate('/login'), 4000);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        handleAPIError(error);
      }
    },
  });
};
