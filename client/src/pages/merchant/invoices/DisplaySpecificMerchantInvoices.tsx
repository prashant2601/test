import { Suspense, useMemo, useState } from 'react';

import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { ActionIcon, Box, Loader, Skeleton } from '@mantine/core';
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import {
  MerchantInvoice,
  useGetInvoicesbyMerchantId,
} from '../../admin/merchants/hooks/useGetInvoicesbyMerchantId';
import { useDisclosure } from '@mantine/hooks';
import InvoiceDetails from '../../../components/Widgets/InvoiceParameters';
import { IconEye } from '@tabler/icons-react';
import useUpdateBackendViewedInvoiceAndDownloadInvoice from '../../admin/merchants/hooks/useUpdateBackendViewedInvoiceAndDownloadInvoice';
import useGetRelevantMerchantID from '../hooks/useGetRelevantMerchantID';
import {
  convertIntoDate,
  convertIntoDateTime,
} from '../../../utility/helperFuntions';
import { TableNames } from '../../../enums';

const DIsplaySpecificMerchantInvoices = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const merchantId = useGetRelevantMerchantID();

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const { data, isLoading, isError } = useGetInvoicesbyMerchantId({
    merchantId: merchantId ?? '',
    columnFilters,
    EnableQuery: !opened && Boolean(merchantId),
    sorting,
    pagination,
  });

  const { handleViewAndDownloadInvoice, isPending, variables } =
    useUpdateBackendViewedInvoiceAndDownloadInvoice();

  const columns = useMemo<MRT_ColumnDef<MerchantInvoice>[]>(
    () => [
      {
        accessorKey: 'invoiceId',
        header: 'Invoice ID',
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 30,
      },
      {
        accessorKey: 'fromDate',
        header: 'From Date',
        enableSorting: false,
        maxSize: 50,
        accessorFn: (originalRow) => new Date(originalRow?.fromDate),
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        filterVariant: 'date',
        muiFilterDatePickerProps: {
          label: 'From Date',
          format: 'DD MMM YYYY',
        },
      },
      {
        accessorKey: 'toDate',
        header: 'To Date',
        enableSorting: false,
        maxSize: 50,
        accessorFn: (originalRow) => new Date(originalRow?.toDate),
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        filterVariant: 'date',
        muiFilterDatePickerProps: {
          format: 'DD MMM YYYY',
          label: 'To Date',
        },
      },
      {
        accessorKey: 'downloadLink',
        header: 'View Invoice',
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 150,
        Cell: ({ cell, row }) => {
          if (cell.getValue()) {
            return (
              <Box>
                {isPending &&
                variables?.invoiceId === row.original.invoiceId ? (
                  <Loader size="sm" />
                ) : (
                  <ActionIcon
                    variant="transparent"
                    onClick={() => {
                      handleViewAndDownloadInvoice({
                        invoiceId: row.original.invoiceId,
                        downloadlink: cell.getValue<string>(),
                      });
                    }}
                  >
                    <IconEye color="green" />
                  </ActionIcon>
                )}
              </Box>
            );
          } else {
            return 'Not Available';
          }
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        enableSorting: true,
        enableColumnFilter: false,
        maxSize: 50,
        accessorFn: (originalRow) => new Date(originalRow?.createdAt),
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        muiFilterDateTimePickerProps: {
          label: 'Created At',
        },
        meta: {
          fieldType: 'DateTimeRange',
        },
      },
    ],
    [isPending]
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={data?.data?.invoices ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={data?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          isError={isError}
          tableName={TableNames.MerchantInvoicesData}
          crudOperationHeader="Invoices"
          columnPinning={{}}
          uniqueIDForRows="downloadLink"
          enableRowActions={false}
          muiExpandButtonProps={({ row, table }) => ({
            onClick: () =>
              table.setExpanded({ [row.id]: !row.getIsExpanded() }), //only 1 detail panel open at a time
            sx: {
              transform: row.getIsExpanded()
                ? 'rotate(180deg)'
                : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            },
          })}
          renderDetailPanel={({ row }) =>
            row.original?.invoiceParameters ? (
              <InvoiceDetails row={row} />
            ) : null
          }
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DIsplaySpecificMerchantInvoices;
