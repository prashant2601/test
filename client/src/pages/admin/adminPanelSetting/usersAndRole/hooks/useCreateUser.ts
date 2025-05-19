import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import ApiConstants from '../../../../../api/ApiConstants';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { User } from './useGetUsersByRole';

interface CreateUserResponse {
  message: string;
  success: boolean;
  data: any;
}

interface CreateUserError {
  message: string;
  success: boolean;
  error: string;
  errors: string[];
}

const createUser = async (
  newUserData: Partial<User>
): Promise<AxiosResponse<CreateUserResponse>> => {
  if (!newUserData?.email || !newUserData?.role) {
    throw new Error('Required fields are missing');
  }
  return ApiHelpers.POST(ApiConstants.CREATE_USER(), newUserData);
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<CreateUserResponse>,
    AxiosError<CreateUserError>,
    Partial<User>
  >({
    mutationFn: async (newUserData: Partial<User>) => {
      const response = await createUser(newUserData);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`Users-Grid-${variables?.role}-data`],
      });
      notifications.show({
        title: 'User Created Successfully',
        message:
          data?.data?.message ??
          'User created successfully, activation link sent.',
        color: 'green',
        autoClose: 5000,
        position: 'top-center',
      });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
};
