import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { handleAPIError } from '../../../../../utility/helperFuntions';

interface DeleteCustomerIdsResponse {
  success: boolean;
  message: string;
}

function deleteCustomerIds(
  id: string
): Promise<AxiosResponse<DeleteCustomerIdsResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_CUSTOMERS_BY_IDS(id));
}

export const useDeleteSwishrCourierCustomerbyIDs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['Deleting-Customers'],
    mutationFn: (id: string[]) => deleteCustomerIds(id?.join(',')),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['Swishr-Courier-Customers-Grid-data'],
      });
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
