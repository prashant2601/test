import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import {
  Customer,
  CustomerWithoutProfilePic,
} from './useGetSwishrCourierAllCustomersDetails';
import { handleAPIError } from '../../../../../utility/helperFuntions';

interface CreateCustomerResponse {
  message: string;
  success: boolean;
  data: Customer;
}

interface CreateCustomerError {
  message: string;
  success: boolean;
  error: string;
  errors: string[];
}

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};
export interface CustomerMutation extends CustomerWithoutProfilePic {
  profileImg?: File;
}
const createCustomer = async (
  customer: CustomerMutation
): Promise<AxiosResponse<CreateCustomerResponse>> => {
  if (!customer) {
    throw new Error('No customer data or profile image provided');
  }
  if (!customer.profileImg) {
    return ApiHelpers.POST(
      ApiConstants.ADD_SWISHR_COURIER_CUSTOMER(),
      customer
    );
  }
  const baseString = await readFileAsBase64(customer.profileImg);
  // Now that we have the baseString, make the API call
  return ApiHelpers.POST(ApiConstants.ADD_SWISHR_COURIER_CUSTOMER(), {
    ...customer,
    profileImg: baseString,
  });
};

export const useAddSwishrCourierCustomerDetails = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<CreateCustomerResponse>,
    AxiosError<CreateCustomerError>,
    CustomerMutation
  >({
    mutationFn: async (newCustomer: CustomerMutation) => {
      const response = await createCustomer(newCustomer);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['Swishr-Courier-Customers-Grid-data'],
      });
      notifications.show({
        title: 'Customer Added Successfully',
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
