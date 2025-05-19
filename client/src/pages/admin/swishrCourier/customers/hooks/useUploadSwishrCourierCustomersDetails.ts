import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import ApiConstants from '../../../../../api/ApiConstants';
import ApiHelpers from '../../../../../api/ApiHelpers';

export interface UploadCustomerAxiosResponseError {
  error: string;
  errors: {
    fileName: string; // The name of the file where the error occurred
    Error: string; // Specific error message for the file
  }[];
  success: boolean;
}

interface UploadResponse {
  results: any[];
}

interface UploadPayload {
  csvfile: File[];
}

const uploadAndParseCustomer = async (
  payload: UploadPayload
): Promise<AxiosResponse<UploadResponse>> => {
  const formData = new FormData();
  payload.csvfile.forEach((file) => {
    formData.append('files', file);
  });
  return await ApiHelpers.POST(
    ApiConstants.UPLOAD_AND_PARSE_SWISHR_COURIER_CUSTOMER(),
    formData
  );
};

export const useUploadSwishrCourierCustomersDetails = (): UseMutationResult<
  AxiosResponse<UploadResponse>,
  AxiosError<UploadCustomerAxiosResponseError>,
  UploadPayload
> => {
  return useMutation({
    mutationFn: uploadAndParseCustomer,
  });
};
