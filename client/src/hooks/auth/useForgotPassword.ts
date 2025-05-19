import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import ApiHelpers from '../../api/ApiHelpers';
import ApiConstants from '../../api/ApiConstants';

interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

interface ForgotPasswordError {
  message: string;
  success: boolean;
}

const forgotPassword = async (
  email: string
): Promise<AxiosResponse<ForgotPasswordResponse>> => {
  if (!email) {
    throw new Error('Email is required');
  }

  return ApiHelpers.POST(ApiConstants.FORGOT_PASSWORD(), { email });
};

export const useForgotPassword = () => {
  return useMutation<
    AxiosResponse<ForgotPasswordResponse>,
    AxiosError<ForgotPasswordError>,
    { email: string }
  >({
    mutationFn: async ({ email }) => {
      const response = await forgotPassword(email);
      return response;
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? (error?.response?.data?.message ??
            'Failed to send password reset link.')
          : 'An unexpected error occurred. Please try again.';

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      });
    },
  });
};
