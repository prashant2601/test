import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { Order } from './useGetAllOrders';
import { notifications } from '@mantine/notifications';
import { handleAPIError } from '../../../../utility/helperFuntions';
interface UpdateOrderResult {
  orderId: number;
  success: boolean;
  message: string;
}

interface UpdateOrderSuccessResponse {
  success: true;
  customerUpdated: boolean;
  merchantUpdated: boolean;
  results: UpdateOrderResult[];
}
function updateOrder({
  updates,
}: {
  updates: Order[];
}): Promise<AxiosResponse<UpdateOrderSuccessResponse>> {
  const url = ApiConstants.UPDATE_ORDER_BY_ID();
  return ApiHelpers.PUT(url, updates);
}

export const useUpdateOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: Order[] }) => updateOrder({ updates }),
    onSuccess: (data) => {
      notifications.show({
        title: `OrderID: ${data?.data?.results?.map((order) => order.orderId)?.join(', ')}`,
        message: data?.data?.results?.[0]?.message ?? 'Success',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Orders-Grid-data'] });
      if (data?.data?.customerUpdated) {
        queryClient.invalidateQueries({ queryKey: ['Customers-Grid-data'] });
      }
      if (data?.data?.merchantUpdated) {
        queryClient.invalidateQueries({ queryKey: ['Merchants-Grid-data'] });
      }
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
