import React from 'react';
import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

interface ModalConfirmationProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmColor?: string;
}

const ModalConfirmation: React.FC<ModalConfirmationProps> = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmColor = 'red',
}) => {
  const openModal = () =>
    modals.openConfirmModal({
      title: title,
      centered: true,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: confirmText, cancel: cancelText },
      confirmProps: { color: confirmColor },
      onCancel: onCancel,
      onConfirm: onConfirm,
    });

  return (
    <Button onClick={openModal} color="red">
      {confirmText}
    </Button>
  );
};

export default ModalConfirmation;
