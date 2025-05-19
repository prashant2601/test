import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { handleAPIError } from '../../../../utility/helperFuntions';

interface DeleteOrderResponse {
  success: boolean;
  message: string;
}

function deleteOrder(
  id: string[]
): Promise<AxiosResponse<DeleteOrderResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_ORDER_BY_ID(id?.join(',')));
}

export const useDeleteOrderByID = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['Deleting-Orders'],
    mutationFn: (id: string[]) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Orders-Grid-data'] });
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
