import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import {
  Customer,
  CustomerWithoutProfilePic,
} from './useGetAllCustomersDetails';

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
      ApiConstants.ADD_CUSTOMER_DETAILS_MANUALLY(),
      customer
    );
  }
  const baseString = await readFileAsBase64(customer.profileImg);
  // Now that we have the baseString, make the API call
  return ApiHelpers.POST(ApiConstants.ADD_CUSTOMER_DETAILS_MANUALLY(), {
    ...customer,
    profileImg: baseString,
  });
};

export const useAddCustomer = () => {
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
      queryClient.invalidateQueries({ queryKey: ['Customers-Grid-data'] });
      notifications.show({
        title: 'Customer Added Successfully',
        message: data?.data?.message,
        color: 'green',
        autoClose: 5000,
        position: 'top-center',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        notifications.show({
          title: error?.response?.data?.error ?? 'Request Failed',
          message: 'There was an error adding the customer.',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'Customer Addition Failed',
          message: 'Something went wrong.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });
};
