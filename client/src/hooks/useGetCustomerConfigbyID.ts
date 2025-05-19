import { useQuery } from '@tanstack/react-query';
import ApiHelpers from '../api/ApiHelpers';
import ApiConstants from '../api/ApiConstants';
import { AxiosResponse } from 'axios';
interface ConfigDetails {
  serviceFee: {
    isApplicable: boolean;
    value: number;
  };
  deliveryCharge: {
    isApplicable: boolean;
    value: number;
  };
  driverTip: {
    isApplicable: boolean;
    value: number;
  };
}

export interface CustomerData {
  _id: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  customerArea: string;
  customerPost: string;
  serviceFee: boolean;
  deliveryCharge: boolean;
  driverTip: boolean;
  deliveryOrdersComission: number;
  collectionOrdersComission: number;
  eatInComission: number;
  logoImg: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

function fetchCustomerConfig(id: string): Promise<AxiosResponse<CustomerData>> {
  return ApiHelpers.GET(ApiConstants.GET_CUSTOMER_CONFIG(id));
}

export const useGetCustomerConfigbyID = (id: string) => {
  return useQuery({
    queryKey: ['customerlist', id],
    queryFn: () => fetchCustomerConfig(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
    refetchOnMount: true,
  });
};
