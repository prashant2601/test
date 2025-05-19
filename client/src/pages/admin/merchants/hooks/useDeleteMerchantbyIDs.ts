import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { handleAPIError } from '../../../../utility/helperFuntions';

interface DeleteMerchantIdsResponse {
  success: boolean;
  message: string;
}

function deleteMerchantIds(
  id: string
): Promise<AxiosResponse<DeleteMerchantIdsResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_MERCHANTS_BY_IDS(id));
}

export const useDeleteMerchantbyIDs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['Deleting-Merchants'],
    mutationFn: (id: string[]) => deleteMerchantIds(id?.join(',')),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['Merchants-Grid-data'] });
      notifications.show({
        title: 'Record deleted successfully',
        message: 'Success',
        color: 'green',
        autoClose: 5000,
      });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
};
