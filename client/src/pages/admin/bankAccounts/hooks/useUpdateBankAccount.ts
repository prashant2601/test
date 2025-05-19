import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { notifications } from '@mantine/notifications';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { handleAPIError } from '../../../../utility/helperFuntions';
import { BankAccountInBankGrid } from './useGetAllBankAccounts';

interface UpdateBankAccountResponse {
  success: boolean;
  message: string;
}
const getMerchantName = async (merchantId: number): Promise<string> => {
  try {
    const response = await ApiHelpers.GET(ApiConstants.GET_MERCHANT_DETAILS(), {
      params: { merchantId },
    });
    return response?.data?.merchant[0]?.merchantName;
  } catch (error) {
    throw new Error('Failed to fetch merchant name');
  }
};
async function updateBankAccount({
  updates,
}: {
  updates: BankAccountInBankGrid[];
}): Promise<AxiosResponse<UpdateBankAccountResponse>> {
  if (!updates || updates.length === 0) {
    return Promise.reject(new Error('No updates provided'));
  }
  if (updates[0].merchantId !== undefined) {
    updates[0].merchantName = await getMerchantName(updates[0].merchantId);
  }
  return ApiHelpers.PUT(ApiConstants.EDIT_BANK_ACCOUNT(), updates[0]);
}

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: BankAccountInBankGrid[] }) =>
      updateBankAccount({ updates }),
    onSuccess: (data) => {
      notifications.show({
        title: 'Bank Account Updated',
        message: data?.data?.message || 'Bank account updated successfully.',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });

      queryClient.invalidateQueries({ queryKey: ['BankAccounts-Grid-data'] });
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
