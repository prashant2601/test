import React, { useEffect, useMemo, useRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Group,
  Paper,
  Stack,
  LoadingOverlay,
  Space,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FileWithPath, FileRejection, PDF_MIME_TYPE } from '@mantine/dropzone';

import {
  UploadOldInvoicePDFParams,
  useUploadOldInvoicePDF,
} from '../../../../../pages/admin/accounting/hooks/useUploadOldInvoicePDF';
import { FileUpload } from '../../../FileUpload';
import MutliSelectMerchantIds from '../../../../../pages/admin/accounting/MutliSelectMerchantIds';
import { DebouncedSearchedMerchant } from '../../../../../pages/admin/merchants/hooks/useGetMerchantIdAndName';
import { UploadOrderErrorDisplay } from '../../../../../pages/admin/orders/UploadOrderErrorDisplay';

const validationSchema = Yup.object({
  pdfFiles: Yup.array()
    .min(1, 'You must upload at least one file.')
    .required('PDF file is required.'),
  merchantId: Yup.string().required('Merchant is required.'),
});
interface UploadOldInvpiceForm {
  closeModal: () => void;
}
const UploadOldInvoicePdfModal: React.FC<UploadOldInvpiceForm> = (props) => {
  const { closeModal } = props;
  const initialValues: UploadOldInvoicePDFParams = {
    pdfFiles: [],
    merchantId: '',
    merchantName: '',
  };
  const FormikRef = useRef<FormikProps<UploadOldInvoicePDFParams>>(null);
  const {
    mutate: uploadFiles,
    reset: ResetMutation,
    data: uploadFilesResponse,
    error: ErrorOnUploadingFiles,
    isPending: IsUplaodingFiles,
  } = useUploadOldInvoicePDF();
  useEffect(() => {
    if (
      uploadFilesResponse?.data?.success &&
      uploadFilesResponse?.data.results?.every((result) => result.success)
    ) {
      closeModal();
    }
  }, [uploadFilesResponse]);
  const formatResponseofFailedtoParsedPdFs = useMemo(() => {
    const failedFiles = uploadFilesResponse?.data.results?.filter(
      (result) => result.success === false
    );
    if (!failedFiles || failedFiles.length === 0) return null;
    return {
      error: 'Failed to parse the following files,',
      errors: failedFiles.map((result) => ({
        fileName: result.filename,
        Error: result.message,
      })),
    };
  }, [uploadFilesResponse]);
  const handleSubmit = (values: UploadOldInvoicePDFParams) => {
    uploadFiles({
      pdfFiles: values.pdfFiles,
      merchantId: values.merchantId,
      merchantName: values.merchantName,
    });
  };
  const setMerchantName = (merchantDetails: DebouncedSearchedMerchant) => {
    FormikRef.current?.setFieldValue(
      'merchantName',
      merchantDetails?.merchantName
    );
  };
  const removeMerchantName = () => {
    FormikRef.current?.setFieldValue('merchantName', '');
  };
  return (
    <Paper shadow="sm" p={10}>
      <Stack gap={20} pos={'relative'}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          innerRef={FormikRef}
          onReset={() => ResetMutation()}
        >
          {({ values, errors, touched, setFieldValue }) => {
            const handleDrop = (newFiles: FileWithPath[]) => {
              setFieldValue('pdfFiles', [...values.pdfFiles, ...newFiles]);
            };
            const handleReject = (rejectedFiles: FileRejection[]) => {
              notifications.show({
                title: 'Invalid Files',
                message: 'Some files were rejected due to invalid format',
                color: 'red',
              });
            };

            const handleDeleteFile = (fileName: string) => {
              const updatedFiles = values.pdfFiles.filter(
                (file) => file.name !== fileName
              );
              setFieldValue('pdfFiles', updatedFiles);
              ResetMutation();
            };

            return (
              <Form>
                <MutliSelectMerchantIds
                  needLabel={true}
                  name="merchantId"
                  multiSelect={false}
                  onSingleMerchantSelect={setMerchantName}
                  onRemoveSingleValueInSingleSelect={removeMerchantName}
                />
                <FileUpload
                  onDrop={handleDrop}
                  onReject={handleReject}
                  uploadedFiles={values.pdfFiles}
                  onDeleteFile={handleDeleteFile}
                  dropzoneText={{
                    title: 'Upload files with relevant data',
                    description:
                      'You can upload at max 10 files with size not exceeding 5 MB',
                    rejectMessage:
                      'Invalid file type. Only PDF files are allowed.',
                  }}
                  maxFiles={10}
                  acceptedTypes={[PDF_MIME_TYPE]}
                />
                {errors?.pdfFiles && touched?.pdfFiles && (
                  <div style={{ color: 'red', marginTop: '10px' }}>
                    {errors?.pdfFiles as string}
                  </div>
                )}
                {formatResponseofFailedtoParsedPdFs &&
                  formatResponseofFailedtoParsedPdFs?.errors?.length > 0 && (
                    <>
                      <Space h="md" />
                      <UploadOrderErrorDisplay
                        response={formatResponseofFailedtoParsedPdFs}
                      />
                    </>
                  )}
                <Group mt="md" justify="center">
                  <Button type="submit" loading={false}>
                    Submit
                  </Button>
                  <Button type="reset" variant="outline">
                    Reset
                  </Button>
                </Group>
              </Form>
            );
          }}
        </Formik>
        <LoadingOverlay
          visible={IsUplaodingFiles}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      </Stack>
    </Paper>
  );
};

export default UploadOldInvoicePdfModal;
