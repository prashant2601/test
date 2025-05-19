import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { notifications } from '@mantine/notifications';
import ApiConstants from '../../../../../api/ApiConstants';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import { readFileAsBase64 } from '../../../customers/hooks/useAddCustomerDetails';
import { useAuth } from '../../../../../hooks/useAuth';

interface UpdateUserSuccessResponse {
  success: true;
  message: string;
  user: {
    userUpdated: boolean;
    profileImg?: string;
    userName: string;
    email: string;
    role: string;
    userId: number;
    phone: string;
    lastLogin: string;
    lastActive: string;
  };
}
interface UserUpdates {
  mail: string;
  role: string;
  isActive: boolean;
  resendActivationLink: boolean;
  profileImg?: File;
  password?: string;
}
async function updateUser({
  updates,
}: {
  updates: UserUpdates[];
}): Promise<AxiosResponse<UpdateUserSuccessResponse>> {
  const url = ApiConstants.EDIT_USER();
  if (updates[0]?.profileImg instanceof File) {
    const baseString = await readFileAsBase64(updates[0]?.profileImg);
    return ApiHelpers.PUT(url, { ...updates[0], profileImg: baseString });
  }
  const { profileImg, ...other } = updates[0];
  return ApiHelpers.PUT(url, other);
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { user, UpdateAuthContextUser } = useAuth();
  return useMutation({
    mutationFn: ({ updates }: { updates: UserUpdates[] }) =>
      updateUser({ updates }),
    onSuccess: (data, variables) => {
      notifications.show({
        title: `Success`,
        message: 'User detail updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      if (data?.data?.user?.email === user?.email) {
        UpdateAuthContextUser(data?.data?.user);
      }
      queryClient.invalidateQueries({
        queryKey: [`Users-Grid-${variables?.updates[0]?.role}-data`],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        handleAPIError(error);
      } else {
        console.error('Non-Axios error:', error);
      }
    },
  });
};
