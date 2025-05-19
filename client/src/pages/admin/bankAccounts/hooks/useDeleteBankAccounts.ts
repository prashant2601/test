import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { notifications } from '@mantine/notifications';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { handleAPIError } from '../../../../utility/helperFuntions';

interface DeleteBankAccountIdsResponse {
  success: boolean;
  message: string;
}

function deleteBankAccountIdsIds(
  ids: string
): Promise<AxiosResponse<DeleteBankAccountIdsResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_BANK_ACCOUNTS_BY_IDS(ids));
}

export const useDeleteBankAccountIdsByEmails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['Deleting-BankAccounts'],
    mutationFn: (ids: string[]) => deleteBankAccountIdsIds(ids?.join(',')),
    onSuccess: (data) => {
      notifications.show({
        title: 'Bank Accounts deleted successfully',
        message: 'Success',
        color: 'green',
        autoClose: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['BankAccounts-Grid-data'] });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
};
