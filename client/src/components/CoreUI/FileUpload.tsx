import React from 'react';
import {
  Dropzone,
  MIME_TYPES,
  FileRejection,
  FileWithPath,
} from '@mantine/dropzone';
import {
  ActionIcon,
  Box,
  Group,
  List,
  Text,
  ThemeIcon,
  rem,
} from '@mantine/core';
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconCircleCheck,
  IconTrash,
} from '@tabler/icons-react';

interface FileUploadProps {
  maxSize?: number; // Maximum file size in bytes
  maxFiles?: number; // Maximum number of files
  acceptedTypes?: string[]; // Accepted file MIME types
  onDrop: (files: FileWithPath[]) => void; // Handler for successful file drop
  onReject?: (fileRejections: FileRejection[]) => void; // Handler for rejected files
  uploadedFiles?: FileWithPath[]; // Currently uploaded files
  onDeleteFile?: (fileName: string) => void; // Handler for file deletion
  dropzoneText?: {
    title?: string; // Title displayed in the dropzone
    description?: string; // Description displayed in the dropzone
    rejectMessage?: string; // Message shown for rejected files
  };
}

export const FileUpload: React.FC<FileUploadProps> = ({
  maxSize = 5 * 1024 ** 2, // Default max size: 5 MB
  maxFiles = 10, // Default max files: 10
  acceptedTypes = [MIME_TYPES.csv, MIME_TYPES.xlsx, MIME_TYPES.xls], // Default accepted types
  onDrop,
  onReject,
  uploadedFiles = [],
  onDeleteFile,
  dropzoneText = {
    title: 'Drag your files here',
    description:
      'Attach multiple files. Each file should not exceed 5 MB, and the total file count should not exceed 10.',
    rejectMessage: 'File format not allowed',
  },
}) => {
  return (
    <Dropzone
      onDrop={onDrop}
      onReject={onReject}
      maxSize={maxSize}
      maxFiles={maxFiles}
      accept={acceptedTypes}
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '20px',
      }}
    >
      <Group justify="center" gap="xl">
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-blue-6)',
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-red-6)',
            }}
            stroke={1.5}
          />
          {dropzoneText.rejectMessage}
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: 'var(--mantine-color-dimmed)',
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            {dropzoneText.title}
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            {dropzoneText.description}
          </Text>

          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: 10, color: 'green' }}>
              <List
                spacing="xs"
                size="sm"
                style={{ pointerEvents: 'all' }}
                center
                icon={
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCircleCheck
                      style={{ width: rem(16), height: rem(16) }}
                    />
                  </ThemeIcon>
                }
              >
                {uploadedFiles.map((file) => (
                  <List.Item key={file.name + `${file.size}`}>
                    <Group align="center">
                      <Box>{file.name}</Box>
                      {onDeleteFile && (
                        <ActionIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.name);
                          }}
                          style={{ pointerEvents: 'all' }}
                          variant="transparent"
                          color={'green'}
                          key={file.name}
                        >
                          <IconTrash />
                        </ActionIcon>
                      )}
                    </Group>
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </div>
      </Group>
    </Dropzone>
  );
};
