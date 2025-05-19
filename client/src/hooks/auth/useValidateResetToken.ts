import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import ApiHelpers from '../../api/ApiHelpers';
import ApiConstants from '../../api/ApiConstants';

interface ValidateTokenResponse {
  email: string;
  userName: string;
  success: boolean;
}

interface ValidateTokenError {
  message: string;
  success: boolean;
}

const validateResetPasswordToken = async (
  token: string
): Promise<AxiosResponse<ValidateTokenResponse>> => {
  if (!token) {
    throw new Error('Token is required.');
  }
  return ApiHelpers.POST(ApiConstants.VALIDATE_RESET_PASSWORD_TOKEN(), {
    token,
  });
};

export const useValidateResetPasswordToken = () => {
  return useMutation<
    AxiosResponse<ValidateTokenResponse>,
    AxiosError<ValidateTokenError>,
    { token: string }
  >({
    mutationFn: async ({ token }) => {
      const response = await validateResetPasswordToken(token);
      return response;
    },
  });
};
