import { Suspense, useMemo, useState } from 'react';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Badge, Center, Group, Loader, Skeleton, Switch } from '@mantine/core';
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { IconCheck, IconEye, IconX } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useEditManualInvoice } from './hooks/useEditManualInvoice';
import {
  ManualInvoiceRow,
  useGetAllManualInvoices,
} from './hooks/useGetAllManualInvoices';
import { Typography } from '@mui/material';
import { convertIntoDate, isTruthy } from '../../../utility/helperFuntions';
import { TableNames } from '../../../enums';

const DisplayManualInvoices = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const { search } = useLocation();
  const {
    data: AllManualInvoicesDetailsApiResponse,
    isError,
    isLoading,
  } = useGetAllManualInvoices({
    columnFilters: columnFilters,
    EnableQuery: !opened && search?.includes('Other_Invoices'),
    sorting: sorting,
    pagination: pagination,
  });
  const {
    mutateAsync: SubmitEditedValues,
    isPending,
    variables,
  } = useEditManualInvoice();
  const columns = useMemo<MRT_ColumnDef<ManualInvoiceRow>[]>(
    () => [
      {
        accessorKey: 'invoiceParameters.totalWithTax',
        header: 'Amount Due',
        enableColumnFilter: false,
        enableSorting: false,
        maxSize: 100,
        Cell: ({ row }) =>
          `${row?.original?.invoiceParameters?.totalWithTax ?? ''}`,
      },
      {
        accessorKey: 'merchantName',
        header: 'Name',
        enableColumnFilter: true,
        enableSorting: false,
        maxSize: 100,
        Cell: ({ row }) =>
          `${row?.original?.merchantName ?? ''} (${row?.original?.merchantId})`,
      },
      {
        accessorKey: 'invoiceId',
        header: 'Invoice ID',
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        accessorFn: (originalRow) =>
          originalRow?.createdAt ? new Date(originalRow?.createdAt) : '',
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        enableColumnFilter: false,
        maxSize: 150,
      },
      {
        accessorKey: 'fromDate',
        header: 'From Date',
        accessorFn: (originalRow) => new Date(originalRow?.fromDate),
        enableSorting: false,
        filterVariant: 'date',
        muiFilterDatePickerProps: {
          label: 'From Date',
          format: 'DD MMM YYYY',
        },
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        maxSize: 150,
      },
      {
        accessorKey: 'toDate',
        header: 'To Date',
        maxSize: 150,
        enableSorting: false,
        accessorFn: (originalRow) => new Date(originalRow?.toDate),
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        filterVariant: 'date',
        muiFilterDatePickerProps: {
          label: 'To Date',
          format: 'DD MMM YYYY',
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        maxSize: 100,
        Cell: ({ cell, row }) => {
          if (cell.getValue()) {
            return (
              <Center>
                {isPending &&
                variables?.invoiceId === row.original.invoiceId ? (
                  <Loader size="sm" />
                ) : (
                  <Switch
                    disabled={row?.original?.isPaidDisable}
                    size="lg"
                    checked={cell.getValue() === 'PAID'}
                    onLabel="PAID"
                    offLabel="UNPAID"
                    thumbIcon={
                      cell.getValue() === 'PAID' ? (
                        <IconCheck
                          size={12}
                          color="var(--mantine-color-teal-6)"
                          stroke={3}
                        />
                      ) : (
                        <IconX
                          size={12}
                          color="var(--mantine-color-red-6)"
                          stroke={3}
                        />
                      )
                    }
                    styles={{ trackLabel: { width: '40px', fontSize: 'xl' } }}
                    onChange={(event) => {
                      SubmitEditedValues({
                        ...row?.original,
                        status: event.currentTarget.checked ? 'PAID' : 'UNPAID',
                      });
                    }}
                  />
                )}
              </Center>
            );
          } else {
            return undefined;
          }
        },
        enableColumnFilter: true,
        filterVariant: 'autocomplete',
        filterSelectOptions: [
          { value: 'PAID', label: 'PAID' },
          { value: 'UNPAID', label: 'UNPAID' },
        ],
        enableSorting: false,
      },
      {
        accessorKey: 'isSentToMerchant',
        header: 'Sent to Customer',
        Cell: ({ cell }) => (
          <Typography>{cell.getValue() ? 'Yes' : 'No'}</Typography>
        ),
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'autocomplete',
        maxSize: 100,
        filterSelectOptions: [
          { value: 'true', label: 'YES' },
          { value: 'false', label: 'NO' },
        ],
      },
      {
        accessorKey: 'downloadLink',
        header: 'View Invoice',
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 100,
        Cell: ({ cell }) => {
          const link = cell.getValue<string>();
          return link ? (
            <a href={`${link}`} target="_blank" download={`${link}`}>
              <IconEye color="green" cursor={'pointer'} />
            </a>
          ) : (
            'Not Available'
          );
        },
      },
    ],
    [isPending]
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={AllManualInvoicesDetailsApiResponse?.data?.invoices ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={
            AllManualInvoicesDetailsApiResponse?.data?.totalCount ?? 0
          }
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          enableRowSelection={true}
          isError={isError}
          tableName={TableNames?.AllManualInvoicesDisplay}
          crudOperationHeader="Invoice"
          columnPinning={{
            left: ['mrt-row-select'],
          }}
          uniqueIDForRows="invoiceId"
          enableRowActions={true}
          ManualInvoiceTableCellForm={true}
          renderCaption={({ table }) => {
            return isTruthy(
              AllManualInvoicesDetailsApiResponse?.data?.totalAmountDue
            ) ? (
              <Group>
                <Badge size="lg" styles={{ label: { textTransform: 'none' } }}>
                  {`Total Amount Due: £
                          ${AllManualInvoicesDetailsApiResponse?.data?.totalAmountDue ?? '0'}`}
                </Badge>
                <Badge size="lg" styles={{ label: { textTransform: 'none' } }}>
                  {`Total VAT: £
                          ${AllManualInvoicesDetailsApiResponse?.data?.totalVAT ?? '0'}`}
                </Badge>
              </Group>
            ) : undefined;
          }}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayManualInvoices;
