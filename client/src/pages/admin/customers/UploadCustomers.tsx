import React, { useRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Group,
  Paper,
  Stack,
  Text as MantineText,
  useMantineTheme,
  Flex,
  LoadingOverlay,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FileWithPath, FileRejection } from '@mantine/dropzone';
import { FileUpload } from '../../../components/CoreUI/FileUpload';

// import { UploadCustomerErrorDisplay } from "./UploadCustomerErrorDisplay";
import { IconThumbUp } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUploadCustomerDetails } from './hooks/useUploadCustromersDetails';
import { UploadOrderErrorDisplay } from '../orders/UploadOrderErrorDisplay';
import { modals } from '@mantine/modals';

export interface UploadCustomersFormTypes {
  csvfile: FileWithPath[];
}

const validationSchema = Yup.object({
  csvfile: Yup.array()
    .min(1, 'You must upload at least one file.')
    .required('CSV file is required.'),
});

const UploadCustomers: React.FC = () => {
  const initialValues: UploadCustomersFormTypes = { csvfile: [] };
  const FormikRef = useRef<FormikProps<UploadCustomersFormTypes>>(null);
  const {
    mutate: uploadFiles,
    error: ErrorOnUploadingFiles,
    reset: ResetMutation,
    isPending: IsUplaodingFiles,
  } = useUploadCustomerDetails();

  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const handleSubmit = (values: UploadCustomersFormTypes) => {
    uploadFiles(
      { csvfile: values.csvfile },
      {
        onSuccess: (data) => {
          FormikRef.current?.resetForm();
          queryClient.invalidateQueries({ queryKey: ['Customers-Grid-data'] });
          modals?.open({
            title: 'File(s) Upload Successfully',
            children: (
              <Flex direction="column" align="center" mt="10px">
                <IconThumbUp
                  stroke={2}
                  size={40}
                  color={theme.colors.green[6]}
                />
                <MantineText
                  size="lg"
                  style={{
                    fontWeight: '600',
                    color: theme.colors.gray[7],
                    textAlign: 'center',
                  }}
                >
                  Customers are saved successfully. You can see uploaded
                  customers by switching tab to "All Customers".
                </MantineText>
              </Flex>
            ),
            onClose: () => FormikRef.current?.resetForm(),
          });
        },
        onError: (error: any) => {
          notifications.show({
            title: 'Error',
            message: error.response?.data?.message || 'Failed to upload files.',
            color: 'red',
          });
          FormikRef.current?.setErrors(error);
        },
      }
    );
  };
  return (
    <Paper shadow="sm" p={20}>
      <Stack gap={20} pos={'relative'}>
        <MantineText size="lg" style={{ fontWeight: '600' }}>
          Upload Excel or CSV file to store customer details. (Multiple files
          can be uploaded)
        </MantineText>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          innerRef={FormikRef}
          onReset={() => ResetMutation()}
        >
          {({ values, errors, touched, setFieldValue }) => {
            const handleDrop = (newFiles: FileWithPath[]) => {
              setFieldValue('csvfile', [...values.csvfile, ...newFiles]);
            };

            const handleReject = (rejectedFiles: FileRejection[]) => {
              notifications.show({
                title: 'Invalid Files',
                message: 'Some files were rejected due to invalid format.',
                color: 'red',
              });
              console.error('Rejected files:', rejectedFiles);
            };

            const handleDeleteFile = (fileName: string) => {
              const updatedFiles = values.csvfile.filter(
                (file) => file.name !== fileName
              );
              setFieldValue('csvfile', updatedFiles);
              ResetMutation();
            };

            return (
              <Form>
                <FileUpload
                  onDrop={handleDrop}
                  onReject={handleReject}
                  uploadedFiles={values.csvfile}
                  onDeleteFile={handleDeleteFile}
                  dropzoneText={{
                    title: 'Upload files with relevant data',
                    description:
                      'You can upload at max 10 files with size not exceeding 5 MB',
                    rejectMessage:
                      'Invalid file type. Only CSV files are allowed.',
                  }}
                  maxFiles={10}
                />
                {errors?.csvfile && touched?.csvfile && (
                  <div style={{ color: 'red', marginTop: '10px' }}>
                    {errors?.csvfile as string}
                  </div>
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
        {FormikRef.current?.errors && (
          <UploadOrderErrorDisplay
            response={ErrorOnUploadingFiles?.response?.data}
          />
        )}
      </Stack>
    </Paper>
  );
};

export default UploadCustomers;
