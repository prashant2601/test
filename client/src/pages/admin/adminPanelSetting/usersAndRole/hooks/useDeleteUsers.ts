import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { notifications } from '@mantine/notifications';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';
import { useSearchParams } from 'react-router-dom';

interface DeleteUserIdsResponse {
  success: boolean;
  message: string;
}

function deleteUserIds(
  userIds: number[]
): Promise<AxiosResponse<DeleteUserIdsResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_USER(userIds?.toString()));
}

export const useDeleteUsers = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('tab') ?? 'admin';
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [`Deleting-Users-${role}`],
    mutationFn: (userIds: number[]) => deleteUserIds(userIds),
    onSuccess: (data) => {
      notifications.show({
        title: 'Users deleted successfully',
        message: 'Success',
        color: 'green',
        autoClose: 5000,
      });
      queryClient.invalidateQueries({ queryKey: [`Users-Grid-${role}-data`] });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
};
