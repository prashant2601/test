import { useMerchantViewInvoiceID } from '.././hooks/useMerchantViewedInvoiceID';
import { notifications } from '@mantine/notifications';

const useUpdateBackendViewedInvoiceAndDownloadInvoice = () => {
  const {
    mutateAsync: UpdatetoBackendMerchantViewedInvoice,
    isPending,
    variables,
  } = useMerchantViewInvoiceID();

  const handleViewAndDownloadInvoice = async ({
    invoiceId,
    downloadlink,
  }: {
    invoiceId: string;
    downloadlink: string;
  }) => {
    let newWindow;
    try {
      await UpdatetoBackendMerchantViewedInvoice({ invoiceId });
      newWindow = window.open(downloadlink, '_blank', 'noopener,noreferrer');
    } catch (error: unknown) {
      // Handle potential errors opening the new window
      if (!newWindow) {
        throw new Error(
          'Failed to open a new window. The browser may have blocked it.'
        );
      }
      if (error instanceof Error) {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to view or download the invoice.',
          color: 'red',
        });
      }
    }
  };

  return { handleViewAndDownloadInvoice, isPending, variables };
};

export default useUpdateBackendViewedInvoiceAndDownloadInvoice;
