import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';

// Interfaces for Success and Error Responses

export interface GeneratedInvoiceDetails {
  merchantId: number;
  message: string;
  status: string;
}

interface GenerateInvoiceSuccessResponse {
  message: string; // "Invoice request processed"
  invoices: GeneratedInvoiceDetails[]; // Array of invoice status for each merchant
}

// Interfaces for Error Responses

interface GenerateInvoiceMissingMerchantIdsError {
  message: string; // "Merchant IDs are required" or "Invalid Merchant IDs provided"
}

interface GenerateInvoiceInvalidDateRangeError {
  message: string; // "Provide date range to generate invoice"
  status: 'failed';
}

interface GenerateInvoiceNoOrdersFoundError {
  merchantId: number; // The merchant ID that had no orders
  message: string; // "No orders found for the given date range"
  status: 'failed';
}

interface GenerateInvoiceAlreadyExistsError {
  merchantId: number; // The merchant ID that already has an existing invoice for the date range
  message: string; // "Invoice already exists for the given date range"
  status: 'failed';
}

interface GenerateInvoiceMerchantNotFoundError {
  merchantId: number; // The merchant ID that could not be found
  message: string; // "Merchant not found"
  status: 'failed';
}

interface GenerateInvoiceServerError {
  message: string; // General error message
}

// Request body interface
export interface GenerateInvoiceRequest {
  merchantIds: string; // Comma-separated string of merchant IDs
  lastWeek: boolean;
  startDate?: string; // Optional, required only if lastWeek is false
  endDate?: string; // Optional, required only if lastWeek is false
}

// Function to call the API and generate the invoice
const generateInvoice = async (
  data: GenerateInvoiceRequest
): Promise<AxiosResponse<GenerateInvoiceSuccessResponse>> => {
  if (!data.merchantIds || data.lastWeek === null) {
    throw new Error('Missing required fields');
  }

  if (!data.lastWeek && (!data.startDate || !data.endDate)) {
    throw new Error(
      "Start date and End date are required when 'lastWeek' is false"
    );
  }

  return ApiHelpers.POST(
    ApiConstants.GENERATE_INVOICE_BY_MERCHANTID_AND_DATE_RANGE(),
    data
  );
};

export const useGenerateInvoiceByMerchantIdAndDate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<GenerateInvoiceSuccessResponse>, // Success Response Type
    AxiosError<
      | GenerateInvoiceMissingMerchantIdsError
      | GenerateInvoiceInvalidDateRangeError
      | GenerateInvoiceNoOrdersFoundError
      | GenerateInvoiceAlreadyExistsError
      | GenerateInvoiceMerchantNotFoundError
      | GenerateInvoiceServerError
    >, // Error Response Type
    GenerateInvoiceRequest // Request Input Type
  >({
    mutationFn: async (requestData: GenerateInvoiceRequest) => {
      const response = await generateInvoice(requestData);
      return response;
    },
    onSuccess: (data) => {
      if (
        data?.data?.invoices?.some((invoice) => invoice.status === 'success')
      ) {
        queryClient.invalidateQueries({ queryKey: ['All_Invoices-Grid-data'] });
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        // Handle errors based on the response
        notifications.show({
          title: error?.response?.data?.message ?? 'Request Failed',
          message: 'There was an error processing the invoice request.',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        // Generic error handling
        notifications.show({
          title: 'Invoice Creation Failed',
          message: 'Something went wrong.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });
};
