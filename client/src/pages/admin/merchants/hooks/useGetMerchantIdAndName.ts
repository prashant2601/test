import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { AxiosResponse } from 'axios';
import { debounce } from 'lodash'; // Import lodash's debounce

export interface DebouncedSearchedMerchant {
  _id: string;
  merchantId: number;
  merchantName: string;
  addressLine1: string;
  addressLine2: string;
  area: string;
  city: string;
  country: string;
  email: string;
  isActive: true;
  post: string;
}

interface MerchantsResponse {
  merchants: DebouncedSearchedMerchant[];
  success: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

function fetchMerchants(
  searchQuery: string,
  pageNo: number = 1,
  limit: number = 10
): Promise<AxiosResponse<MerchantsResponse>> {
  return ApiHelpers.GET(
    ApiConstants.GET_MERCHANT_ID_AND_MERCHANT_NAME(searchQuery)
  );
}

export const useGetMerchantIdAndName = (
  searchQuery: string,
  enabled: boolean,
  pageNo: number = 1,
  limit: number = 10
) => {
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce the search query value
  useEffect(() => {
    const debounceFn = debounce(
      () => setDebouncedSearchQuery(searchQuery),
      1000
    ); // 500ms delay
    debounceFn();
    return () => {
      debounceFn.cancel(); // Clean up on component unmount
    };
  }, [searchQuery]);

  return useQuery({
    queryKey: ['searchMerchants', debouncedSearchQuery, pageNo, limit],
    queryFn: () => fetchMerchants(debouncedSearchQuery, pageNo, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 0,
    enabled,
  });
};
