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
import { useUploadOrdersFiles } from '../../../hooks/useUploadOrdersFiles';
import { UploadOrderErrorDisplay } from './UploadOrderErrorDisplay';
import { IconThumbUp } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

export interface UploadOrdersFormTypes {
  csvfile: FileWithPath[];
}

const validationSchema = Yup.object({
  csvfile: Yup.array()
    .min(1, 'You must upload at least one file.')
    .required('CSV file is required.'),
});

const UplaodOrders: React.FC = () => {
  const initialValues: UploadOrdersFormTypes = { csvfile: [] };
  const FormikRef = useRef<FormikProps<UploadOrdersFormTypes>>(null);
  const {
    mutate: uploadFiles,
    error: ErrorOnUploadingFiles,
    reset: ResetMutation,
    isPending: IsUplaodingdocs,
  } = useUploadOrdersFiles();

  const [showActionText, setShowActionText] = React.useState(false);
  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const handleSubmit = (values: UploadOrdersFormTypes) => {
    uploadFiles(
      { csvfile: values.csvfile },
      {
        onSuccess: (data) => {
          notifications.show({
            title: 'Success',
            message: data.data?.message || 'File uploaded successfully.',
            color: 'green',
            position: 'top-center',
            withCloseButton: true,
            autoClose: true,
          });
          FormikRef.current?.resetForm();
          queryClient.invalidateQueries({ queryKey: ['Orders-Grid-data'] });
          setShowActionText(true);
        },
        onError: (error: any) => {
          notifications.show({
            title: 'Error',
            message: error.response?.data?.message || 'Failed to upload files.',
            color: 'red',
          });
          FormikRef.current?.setErrors(error);
          setShowActionText(false);
        },
      }
    );
  };
  return (
    <Paper shadow="sm" p={20}>
      <Stack gap={20} pos={'relative'}>
        <MantineText size="lg" style={{ fontWeight: '600' }}>
          Upload Excel or CSV file to store order details. (Multiple files can
          be uploaded)
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
          visible={IsUplaodingdocs}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        {FormikRef.current?.errors && (
          <UploadOrderErrorDisplay
            response={ErrorOnUploadingFiles?.response?.data}
          />
        )}
        {showActionText && (
          <Flex direction="column" align="center" mt="10px">
            <IconThumbUp stroke={2} size={40} color={theme.colors.green[6]} />
            <MantineText
              size="lg"
              style={{
                fontWeight: '600',
                color: theme.colors.gray[7],
                textAlign: 'center',
              }}
            >
              {' '}
              Orders are saved successfully. You can see uploaded orders by
              switching tab to "All Orders".
            </MantineText>
          </Flex>
        )}
      </Stack>
    </Paper>
  );
};

export default UplaodOrders;
