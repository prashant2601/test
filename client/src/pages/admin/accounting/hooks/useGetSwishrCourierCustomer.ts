import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { AxiosResponse } from 'axios';
import { debounce } from 'lodash'; // Import lodash's debounce

interface Customer {
  customerId: number;
  customerName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  area: string;
  city: string;
  post: string;
  country: string;
}

interface CustomersResponse {
  customers: Customer[];
  success: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface ErrorResponse {
  message: string;
  success: boolean;
  errors: string[];
}

function fetchSwishrCourierCustomer(
  searchQuery: string,
  pageNo: number = 1,
  limit: number = 10
): Promise<AxiosResponse<CustomersResponse>> {
  return ApiHelpers.GET(ApiConstants.GET_SWISHR_COURIER_CUSTOMER(searchQuery));
}

export const useGetSwishrCourierCustomer = (
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
      1000 // 1-second delay
    );
    debounceFn();
    return () => {
      debounceFn.cancel(); // Clean up on component unmount
    };
  }, [searchQuery]);

  return useQuery({
    queryKey: [
      'searchSwishrCourierCustomer',
      debouncedSearchQuery,
      pageNo,
      limit,
    ],
    queryFn: () =>
      fetchSwishrCourierCustomer(debouncedSearchQuery, pageNo, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 0,
    enabled,
  });
};
