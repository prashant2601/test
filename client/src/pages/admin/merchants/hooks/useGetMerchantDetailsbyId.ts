import { useQuery } from '@tanstack/react-query';

import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { Merchant } from './useGetAllMerchantsDetails';

export interface MerchantDetailsById {
  merchant: Merchant;
}

interface AxiosErrorResponse {
  message: string;
  success: boolean;
  errors: string[];
}

function fetchMerchantDetails(
  id: string
): Promise<AxiosResponse<MerchantDetailsById, AxiosErrorResponse>> {
  return ApiHelpers.GET(ApiConstants.GET_MERCHANT_DETAILS_BY_ID(id));
}

export const useGetMerchantDetailsbyId = (id: string) => {
  return useQuery({
    queryKey: ['merchantdetails', id],
    queryFn: () => fetchMerchantDetails(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
    refetchOnMount: true,
    retry: 2,
  });
};
