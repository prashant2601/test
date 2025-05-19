import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { MerchantEDITNEW, readFileAsBase64 } from './useAddMerchantDetails';
import { handleAPIError } from '../../../../utility/helperFuntions';

interface UpdateMerchantSuccessResponse {
  results: [
    {
      merchantId: number;
      success: true;
      message: string;
    },
  ];
  success: true;
}
async function updateMerchant({
  updates,
}: {
  updates: MerchantEDITNEW[];
}): Promise<AxiosResponse<UpdateMerchantSuccessResponse>> {
  if (!updates) {
    throw new Error('No payload');
  }
  const url = ApiConstants.UPDATE_MERCHANT_BY_ID();
  if (updates[0]?.logoImg instanceof File) {
    const baseString = await readFileAsBase64(updates[0]?.logoImg);
    return ApiHelpers.PUT(url, [{ ...updates[0], logoImg: baseString }]);
  }
  const { logoImg, ...other } = updates[0];
  return ApiHelpers.PUT(url, [other]);
}

export const useUpdateMerchantDetailsbyId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: MerchantEDITNEW[] }) =>
      updateMerchant({ updates }),
    onSuccess: (data) => {
      // TODO change the componet as we can show failed and success merchant id updates separately
      notifications.show({
        title: `Merchant ID: ${data?.data.results?.map((result) => result.merchantId)?.join(', ')}`,
        message: data?.data?.results[0]?.message ?? 'Success',
        color: 'green',
        autoClose: 4000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Merchants-Grid-data'] });
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
