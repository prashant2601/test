import { FC } from 'react';
import { useFormikContext, getIn } from 'formik';
import { Text, Stack } from '@mantine/core';
import { FileWithPath, FileRejection } from '@mantine/dropzone';
import { FileUpload } from '../FileUpload';

interface FormikFileUploadProps {
  name: string;
  label?: string;
  maxSize?: number;
  maxFiles?: number;
  acceptedTypes?: string[];
  dropzoneText?: {
    title?: string;
    description?: string;
    rejectMessage?: string;
  };
}

const FormikFileUpload: FC<FormikFileUploadProps> = ({
  name,
  label,
  maxSize,
  maxFiles,
  acceptedTypes,
  dropzoneText,
}) => {
  const { setFieldValue, setFieldTouched, values, errors, touched } =
    useFormikContext<any>();

  const fieldValue = getIn(values, name) ?? [];
  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);

  const handleDrop = (files: FileWithPath[]) => {
    setFieldValue(name, files);
    setFieldTouched(name, true, false);
  };

  const handleReject = (fileRejections: FileRejection[]) => {
    // Optional: Set an error or handle rejection
    console.warn('Rejected files:', fileRejections);
  };

  const handleDeleteFile = (fileName: string) => {
    const updatedFiles = fieldValue?.filter(
      (file: FileWithPath) => file.name !== fileName
    );
    setFieldValue(name, updatedFiles);
  };

  return (
    <Stack gap="xs">
      <FileUpload
        maxSize={maxSize}
        maxFiles={maxFiles}
        acceptedTypes={acceptedTypes}
        onDrop={handleDrop}
        onReject={handleReject}
        uploadedFiles={fieldValue}
        onDeleteFile={handleDeleteFile}
        dropzoneText={dropzoneText}
      />
      {isTouched && error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
};

export default FormikFileUpload;
