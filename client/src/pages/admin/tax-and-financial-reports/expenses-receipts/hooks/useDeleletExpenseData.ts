import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { notifications } from '@mantine/notifications';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';

interface DeleteExpenseDataResponse {
  success: boolean;
  message: string;
}

function deleteExpenseData(
  receiptIds: string[]
): Promise<AxiosResponse<DeleteExpenseDataResponse>> {
  return ApiHelpers.DELETE(
    ApiConstants.DELETE_EXPENSE_DATA_BY_IDS(receiptIds?.toString())
  );
}

export const useDeleteExpenseData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [`Deleting-Expense-Data`],
    mutationFn: (receiptIds: string[]) => deleteExpenseData(receiptIds),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense data deleted successfully',
        message: 'Success',
        color: 'green',
        autoClose: 5000,
      });
      queryClient.invalidateQueries({ queryKey: [`Expense-Grid-data`] });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
};
