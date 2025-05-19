// utils/modalUtils.ts
import { modals } from '@mantine/modals';

export function openModalConfirmation({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    modals.openConfirmModal({
      title,
      children: message,
      labels: { confirm: confirmLabel, cancel: cancelLabel },
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
