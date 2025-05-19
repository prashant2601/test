import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import { handleAPIError } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { BankAccountInBankGrid } from './useGetAllBankAccounts';

interface CreateBankAccountResponse {
  message: string;
  success: boolean;
  data?: any;
}

interface CreateBankAccountError {
  message: string;
  success: boolean;
  error: string;
  errors?: string[];
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
const createBankAccount = async (
  newBankAccountData: BankAccountInBankGrid
): Promise<AxiosResponse<CreateBankAccountResponse>> => {
  const requestData: Partial<BankAccountInBankGrid> = {
    accountHolderName: newBankAccountData?.accountHolderName,
    accountNumber: newBankAccountData?.accountNumber,
    bankName: newBankAccountData?.bankName,
    sortCode: newBankAccountData?.sortCode,
    accountRole: newBankAccountData?.accountRole,
    accountHolderId: newBankAccountData?.accountHolderId ?? 0,
  };
  if (newBankAccountData?.merchantId) {
    newBankAccountData.merchantName = await getMerchantName(
      newBankAccountData?.merchantId
    );
    requestData.merchantId = newBankAccountData?.merchantId;
    requestData.merchantName = newBankAccountData?.merchantName;
  }

  return ApiHelpers.POST(ApiConstants.CREATE_BANK_ACCOUNT(), requestData);
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<CreateBankAccountResponse>,
    AxiosError<CreateBankAccountError>,
    BankAccountInBankGrid
  >({
    mutationFn: async (newBankAccountData: BankAccountInBankGrid) => {
      const response = await createBankAccount(newBankAccountData);
      return response;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['BankAccounts-Grid-data'] });
      notifications.show({
        title: 'Bank Account Created Successfully',
        message: data?.data?.message ?? 'Bank account added successfully.',
        color: 'green',
        autoClose: 5000,
        position: 'top-center',
      });
    },
    onError: (error) => {
      handleAPIError(error);
    },
  });
};
