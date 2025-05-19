import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { CustomerMutation, readFileAsBase64 } from './useAddCustomerDetails';
import { handleAPIError } from '../../../../utility/helperFuntions';

interface UpdateOrderSuccessResponse {
  results: [
    {
      customerId: number;
      success: true;
      message: string;
    },
  ];
  success: true;
}
async function updateCustomer({
  updates,
}: {
  updates: CustomerMutation[];
}): Promise<AxiosResponse<UpdateOrderSuccessResponse>> {
  if (!updates) {
    throw new Error('Np payload');
  }
  const url = ApiConstants.UPDATE_CUSTOMER_BY_ID();
  if (updates[0]?.profileImg instanceof File) {
    const baseString = await readFileAsBase64(updates[0]?.profileImg);
    return ApiHelpers.PUT(url, [{ ...updates[0], profileImg: baseString }]);
  }
  const { profileImg, ...other } = updates[0];
  return ApiHelpers.PUT(url, [other]);
}

export const useUpdateCustomerDetailsbyId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: CustomerMutation[] }) =>
      updateCustomer({ updates }),
    onSuccess: (data) => {
      // TODO chnage the componet as we can show failed and success order id updates separately
      notifications.show({
        title: `CustomerID: ${data?.data.results?.map((result) => result.customerId)?.join(', ')}`,
        message: data?.data?.results[0]?.message ?? 'Success',
        color: 'green',
        autoClose: 4000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Customers-Grid-data'] });
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
