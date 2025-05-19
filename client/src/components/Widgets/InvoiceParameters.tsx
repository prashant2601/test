import { Box, Divider, Paper, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Flex, Group, List, Loader, Modal, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import InvoiceEdit from '../../pages/admin/accounting/FeatureInvoiceEdit/InvoiceEdit';
import { MRT_Row } from 'material-react-table';
import { Invoice } from '../../pages/admin/accounting/hooks/useGetAllInvoices';
import { useLocation } from 'react-router-dom';
import { IconEdit, IconFileDownload } from '@tabler/icons-react';
import useUpdateBackendViewedInvoiceAndDownloadInvoice from '../../pages/admin/merchants/hooks/useUpdateBackendViewedInvoiceAndDownloadInvoice';
import { convertIntoDateTime } from '../../utility/helperFuntions';
import { useAuth } from '../../hooks/useAuth';

const InvoiceSummaryField = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Box>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {value}
    </Typography>
  </Box>
);

interface InvoiceDetailsProps {
  row: MRT_Row<Invoice>;
}

const InvoiceDetails = ({ row }: InvoiceDetailsProps) => {
  const downloadLink = row.original?.downloadLink;
  const isEditable = row.original?.isEditable;
  const InvoiceParamaterObj = row.original?.invoiceParameters;
  const [opened, { open, close }] = useDisclosure(false);
  const { pathname } = useLocation();
  const { handleViewAndDownloadInvoice, isPending } =
    useUpdateBackendViewedInvoiceAndDownloadInvoice();

  const [
    openedViewHistory,
    { open: openViewHistory, close: closeViewHistory },
  ] = useDisclosure(false);

  const { user } = useAuth();
  const isMerchant = user?.role === 'merchant';

  const summaryFields = [
    { label: 'Total Sales', value: `£${InvoiceParamaterObj?.totalSales}` },
    {
      label: 'Total Orders Count',
      value: InvoiceParamaterObj?.totalOrdersCount,
    },
    {
      label: 'Delivery Orders',
      value: InvoiceParamaterObj?.deliveryOrderCount,
    },
    {
      label: 'Collection Orders',
      value: InvoiceParamaterObj?.collectionOrderCount,
    },
    {
      label: `Card Payments (${InvoiceParamaterObj?.cardPaymentCount})`,
      value: `£${InvoiceParamaterObj?.cardPaymentAmount}`,
    },
    {
      label: `Cash Payments (${InvoiceParamaterObj?.cashPaymentCount})`,
      value: `£${InvoiceParamaterObj?.cashPaymentAmount}`,
    },
    {
      label: 'Delivery Order Value',
      value: `£${InvoiceParamaterObj?.deliveryOrderValue}`,
    },
    {
      label: 'Collection Order Value',
      value: `£${InvoiceParamaterObj?.collectionOrderValue}`,
    },
  ];

  return (
    <>
      <Box sx={{ padding: 1 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Flex justify={'space-between'} align={'flex-start'}>
            <Typography
              variant="h6"
              sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}
            >
              <CheckCircle sx={{ marginRight: 1 }} color="primary" />
              Invoice Summary
            </Typography>
            {row.original?.isSentToMerchant &&
              row.original?.sentToMerchantAt &&
              !isMerchant && (
                <Group mr={20}>
                  <Typography
                    variant="subtitle1"
                    style={{ fontStyle: 'italic' }}
                  >
                    Sent to Merchant at{' '}
                    {convertIntoDateTime(row.original?.sentToMerchantAt)}
                  </Typography>
                  {row.original?.viewHistory?.length > 0 && (
                    <Popover
                      position="top"
                      withArrow
                      shadow="md"
                      opened={openedViewHistory}
                    >
                      <Popover.Target>
                        <Button
                          onMouseEnter={openViewHistory}
                          onMouseLeave={closeViewHistory}
                          variant="outlined"
                        >
                          Seen History
                        </Button>
                      </Popover.Target>
                      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                        <Typography>Merchant Seen History :</Typography>
                        <List mt={5}>
                          {row.original?.viewHistory?.map((value) => (
                            <List.Item key={value}>
                              {convertIntoDateTime(value)}
                            </List.Item>
                          ))}
                        </List>
                      </Popover.Dropdown>
                    </Popover>
                  )}
                </Group>
              )}
          </Flex>

          <Divider sx={{ marginBottom: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 2,
              marginBottom: 2,
            }}
          >
            {summaryFields.map((field) => (
              <InvoiceSummaryField
                key={field.label}
                label={field.label}
                value={field.value}
              />
            ))}
          </Box>

          <Divider sx={{ marginTop: 2 }} />
          <Group mt={20} align="flex-end">
            {downloadLink && !isMerchant ? (
              <Button
                variant="contained"
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ marginTop: 1 }}
                startIcon={<IconFileDownload />}
              >
                Download Invoice
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleViewAndDownloadInvoice({
                    invoiceId: row.original?.invoiceId,
                    downloadlink: row.original?.downloadLink,
                  });
                }}
                startIcon={
                  isPending ? (
                    <Loader size={'xs'} color="white" />
                  ) : (
                    <IconFileDownload />
                  )
                }
              >
                Download Invoice
              </Button>
            )}

            {!isMerchant && isEditable && (
              <Button
                variant="outlined"
                color="primary"
                onClick={open}
                sx={{ marginTop: 1 }}
                startIcon={<IconEdit />}
              >
                EDIT INVOICE
              </Button>
            )}
          </Group>
        </Paper>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        title=""
        fullScreen
        radius={10}
        closeButtonProps={{ iconSize: 'lg' }}
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        <InvoiceEdit initialValues={row.original} closeModal={close} />
      </Modal>
    </>
  );
};

export default InvoiceDetails;
