import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import { Order } from './useGetAllOrders';

interface CreateOrderResponse {
  message: string;
  success: boolean;
  data: Order[];
  missingFields?: string;
}

interface CreateOrderError {
  message: string;
  success: boolean;
  error: string;
  errors: string[];
}

// Function to send orders to the API
const createOrders = async (
  orders: Order[]
): Promise<AxiosResponse<CreateOrderResponse>> => {
  if (!orders || orders.length === 0) {
    throw new Error('No orders provided');
  }

  return ApiHelpers.POST(ApiConstants.CREATE_ORDER_MANUALLY(), orders);
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<CreateOrderResponse>,
    AxiosError<CreateOrderError>,
    Order[]
  >({
    mutationFn: async (newOrders: Order[]) => {
      const response = await createOrders(newOrders);
      return response;
    },
    onSuccess: (data) => {
      // queryClient.removeQueries({ queryKey: ["Orders-Grid-data"] });
      queryClient.invalidateQueries({ queryKey: ['Orders-Grid-data'] });
      notifications.show({
        title: `Order Created Successfully`,
        message: data?.data?.message,
        color: 'green',
        autoClose: 5000,
        position: 'top-center',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        // Handle errors based on the response
        notifications.show({
          title: error?.response?.data?.error ?? 'Request Failed',
          message: 'There was an error creating the orders.',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        // Generic error handling
        notifications.show({
          title: 'Order Creation Failed',
          message: 'Something went wrong.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });
};
