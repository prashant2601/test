import { Suspense, useMemo, useState } from 'react';

import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Box, Skeleton } from '@mantine/core';
import { Email, useGetAllEmailsReport } from './hooks/useGetAllEmailsReport';
import AppGridRemoteDataFetching from '../../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../../providers/MUIThemeProvider';
import { convertIntoDateTime } from '../../../../utility/helperFuntions';
import { TableNames } from '../../../../enums';
import WrapperforLongText from '../../../../components/TextWrapperforLongText';

const DisplayEmailReport = () => {
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
    data: EmailLogsApiResponse,
    isError,
    isLoading,
  } = useGetAllEmailsReport({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Email>[]>(
    () => [
      {
        accessorKey: 'receiverId',
        header: 'Receiver Id',
        enableSorting: false,
        maxSize: 50,
      },
      {
        accessorKey: 'receiverName',
        header: 'Receiver Name',
        enableSorting: false,
        maxSize: 100,
      },
      {
        accessorKey: 'orderId',
        header: 'Order Id',
        enableSorting: false,
        maxSize: 200,
      },
      {
        accessorKey: 'emailId',
        header: 'Email Id',
        enableSorting: false,
        maxSize: 300,
      },
      {
        accessorKey: 'emailType',
        header: 'Email Type',
        enableSorting: false,
        maxSize: 100,
        filterVariant: 'multi-select', // Multi-select filter
        filterSelectOptions: [
          { label: 'Order Feedback', value: 'orderFeedback' },
          { label: 'Invoice', value: 'invoice' },
        ],
      },
      {
        accessorKey: 'sendTo',
        header: 'Receiver Type',
        enableSorting: false,
        maxSize: 50,
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'Customer', value: 'customer' },
          { label: 'Merchant', value: 'merchant' },
        ],
      },
      {
        accessorKey: 'createdAt',
        header: 'Sent On',
        enableSorting: true,
        accessorFn: (originalRow) => new Date(originalRow.createdAt),
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        muiFilterDateTimePickerProps: {
          label: 'Sent On',
          timeSteps: { minutes: 1 },
        },
        maxSize: 100,
      },

      {
        accessorKey: 'error',
        header: 'Error(if any)',
        enableSorting: false,
        maxSize: 300,
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <WrapperforLongText maxWidth={200}>
            {cell.getValue<string>()}
          </WrapperforLongText>
        ),
      },
      {
        accessorKey: 'sendBy',
        header: 'Send By',
        enableSorting: false,
        maxSize: 50,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        maxSize: 100,
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'Processing', value: 'processing' },
          { label: 'Sent', value: 'sent' },
          { label: 'Failed', value: 'falied' },
        ],
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={EmailLogsApiResponse?.data?.logs ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={EmailLogsApiResponse?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          isError={isError}
          tableName={TableNames.EmailDisplay}
          crudOperationHeader="Email"
          columnPinning={{
            left: ['mrt-row-select', 'receiverName'],
            right: ['status'],
          }}
          uniqueIDForRows="_id"
          enableRowActions={false}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayEmailReport;
