import { Suspense, useMemo, useState } from 'react';

import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Skeleton } from '@mantine/core';
import dayjs from 'dayjs';
import { Refund, useGetAllRefundDetails } from './hooks/useGetAllRefundDetails';
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { Typography } from '@mui/material';
import { convertIntoDateTime } from '../../../utility/helperFuntions';
import { TableNames } from '../../../enums';

const DisplayRefundReport = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const {
    data: RefundApiResponse,
    isError,
    isLoading,
  } = useGetAllRefundDetails({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Refund>[]>(
    () => [
      {
        accessorKey: 'orderId',
        header: 'Order Id',
        enableSorting: false,
      },
      {
        accessorKey: 'orderDate',
        header: 'Order Date',
        accessorFn: (originalRow) => new Date(originalRow.orderDate),
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        enableSorting: false,
        maxSize: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'customerId',
        header: 'Customer Id',
        enableSorting: false,
        maxSize: 100,
      },
      {
        accessorKey: 'merchantId',
        header: 'Merchant Id',
        enableSorting: false,
        maxSize: 100,
      },
      {
        accessorKey: 'invoiceId',
        header: 'Invoice Id',
        enableSorting: false,
        maxSize: 100,
      },
      {
        accessorKey: 'invoiceDate',
        header: 'Invoice Date',
        enableSorting: false,
        accessorFn: (originalRow) => new Date(originalRow.invoiceDate),
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        maxSize: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'refundCaptureDate',
        header: 'Refund Capture Date',
        enableSorting: true,
        accessorFn: (originalRow) => new Date(originalRow.refundCaptureDate),
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return dayjs(date).format('DD MMM YYYY hh:mm A');
        },
        muiFilterDateTimePickerProps: {
          label: 'Refund Capture Date',
          timeSteps: { minutes: 1 },
        },
        maxSize: 100,
      },
      {
        accessorKey: 'refundAmount',
        header: 'Refund Amount',
        enableSorting: false,
        maxSize: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'isSettled',
        header: 'Is Settled',
        enableSorting: false,
        maxSize: 100,
        Cell: ({ cell }) => (
          <Typography>{cell.getValue() ? 'Yes' : 'No'}</Typography>
        ),
        enableColumnFilter: true,
        filterVariant: 'autocomplete',
        filterSelectOptions: [
          { value: 'true', label: 'YES' },
          { value: 'false', label: 'NO' },
        ],
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={RefundApiResponse?.data?.refundOrders ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={RefundApiResponse?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          isError={isError}
          tableName={TableNames.RefundDisplay}
          crudOperationHeader="Refunds"
          columnPinning={{
            left: ['orderId', 'orderDate'],
            right: ['refundAmount', 'isSettled'],
          }}
          uniqueIDForRows="_id"
          enableRowActions={false}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayRefundReport;
