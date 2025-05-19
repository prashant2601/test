import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosResponse, AxiosError } from 'axios';
import ApiHelpers from '../api/ApiHelpers';
import ApiConstants from '../api/ApiConstants';

export interface UploadOrderAxiosResponseError {
  error: string;
  errors: {
    fileName: string; // The name of the file where the error occurred
    Error: string; // Specific error message for the file
  }[];
  success: boolean;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface UploadPayload {
  csvfile: File[];
}

const uploadAndParseDocument = async (
  payload: UploadPayload
): Promise<AxiosResponse<UploadResponse>> => {
  const formData = new FormData();
  payload.csvfile.forEach((file) => {
    formData.append('files', file);
  });
  return await ApiHelpers.POST(
    ApiConstants.UPLOAD_AND_PARSE_DOCUMENT(),
    formData
  );
};

export const useUploadOrdersFiles = (): UseMutationResult<
  AxiosResponse<UploadResponse>,
  AxiosError<UploadOrderAxiosResponseError>,
  UploadPayload
> => {
  return useMutation({
    mutationFn: uploadAndParseDocument,
  });
};
