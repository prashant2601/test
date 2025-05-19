import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import { Merchant } from './useGetAllMerchantsDetails';
import { handleAPIError } from '../../../../utility/helperFuntions';

interface CreateMerchantResponse {
  message: string;
  success: boolean;
  data: Merchant;
}

interface CreateMerchantError {
  message: string;
  success: boolean;
  error: string;
  errors: string[];
}

export interface MerchantEDITNEW extends Omit<Merchant, 'logoImg'> {
  logoImg: File;
}

// Helper function to read the image and return a Promise with the base64 string
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const createMerchant = async (
  merchant: MerchantEDITNEW
): Promise<AxiosResponse<CreateMerchantResponse>> => {
  if (!merchant) {
    throw new Error('No merchant data or profile image provided');
  }
  if (!merchant.logoImg) {
    return ApiHelpers.POST(
      ApiConstants.ADD_MERCHANT_DETAILS_MANUALLY(),
      merchant
    );
  }
  const baseString = await readFileAsBase64(merchant.logoImg);
  // Now that we have the baseString, make the API call
  return ApiHelpers.POST(ApiConstants.ADD_MERCHANT_DETAILS_MANUALLY(), {
    ...merchant,
    logoImg: baseString,
  });
};

export const useAddMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<CreateMerchantResponse>,
    AxiosError<CreateMerchantError>,
    Merchant
  >({
    mutationFn: async (newMerchant: Merchant) => {
      const response = await createMerchant(newMerchant);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['Merchants-Grid-data'] });
      notifications.show({
        title: 'Merchant Added Successfully',
        message: data?.data?.message,
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
