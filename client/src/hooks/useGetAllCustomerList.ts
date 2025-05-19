import { useQuery } from '@tanstack/react-query';
import ApiHelpers from '../api/ApiHelpers';
import ApiConstants from '../api/ApiConstants';
import { AxiosResponse } from 'axios';
interface Customer {
  customerId: number;
  customerName: string;
}
function fetchCustomerList(): Promise<AxiosResponse<Customer[]>> {
  return ApiHelpers.GET(ApiConstants.GET_ALL_CUSTOMERS());
}
export const useGetAllCustomerList = () => {
  return useQuery({
    queryKey: ['customerlist'],
    queryFn: () => fetchCustomerList(),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
