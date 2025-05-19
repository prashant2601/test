import { Suspense, useMemo, useState } from 'react';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Skeleton } from '@mantine/core';
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { IconEye } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { convertIntoDate } from '../../../utility/helperFuntions';
import { TableNames } from '../../../enums';
import { OldInvoice, useGetAllOldInvoices } from './hooks/useGetAllOldInvoices';
import { UISCHEMA } from '../customers/CRUDUISchema/customersUISchema';

export const olderInvoiceUISchema: UISCHEMA[] = [
  {
    key: 'invoiceId',
    name: 'invoiceId',
    fieldType: 'Text',
    label: 'Invoice ID',
  },
  {
    key: 'fromDate',
    name: 'fromDate',
    fieldType: 'Date',
    label: 'From Date',
  },
  {
    key: 'toDate',
    name: 'toDate',
    fieldType: 'Date',
    label: 'To Date',
  },
  {
    key: 'createdAt',
    name: 'createdAt',
    fieldType: 'Date',
    label: 'Created At',
  },
];

const DisplayOldInvoices = () => {
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
    data: AllOldInvoicesDetailsApiResponse,
    isError,
    isLoading,
  } = useGetAllOldInvoices({
    columnFilters: columnFilters,
    EnableQuery: !opened && search?.includes('Old_Invoices'),
    sorting: sorting,
    pagination: pagination,
  });
  const columns = useMemo<MRT_ColumnDef<OldInvoice>[]>(
    () => [
      {
        accessorKey: 'merchantName',
        header: 'Merchant',
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
        //   if (cell.getValue()) {
        //     return (
        //       <Center>
        //         {isPending &&
        //         variables?.invoiceId === row.original.invoiceId ? (
        //           <Loader size="sm" />
        //         ) : (
        //           <Switch
        //             disabled={row?.original?.isPaidDisable}
        //             size="lg"
        //             checked={cell.getValue() === 'PAID'}
        //             onLabel="PAID"
        //             offLabel="UNPAID"
        //             thumbIcon={
        //               cell.getValue() === 'PAID' ? (
        //                 <IconCheck
        //                   size={12}
        //                   color="var(--mantine-color-teal-6)"
        //                   stroke={3}
        //                 />
        //               ) : (
        //                 <IconX
        //                   size={12}
        //                   color="var(--mantine-color-red-6)"
        //                   stroke={3}
        //                 />
        //               )
        //             }
        //             styles={{ trackLabel: { width: '40px', fontSize: 'xl' } }}
        //             onChange={(event) => {
        //               SubmitEditedValues({
        //                 ...row?.original,
        //                 status: event.currentTarget.checked ? 'PAID' : 'UNPAID',
        //               });
        //             }}
        //           />
        //         )}
        //       </Center>
        //     );
        //   } else {
        //     return undefined;
        //   }
        // },
        enableColumnFilter: true,
        filterVariant: 'autocomplete',
        filterSelectOptions: [
          { value: 'PAID', label: 'PAID' },
          { value: 'UNPAID', label: 'UNPAID' },
        ],
        enableSorting: false,
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
    []
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={AllOldInvoicesDetailsApiResponse?.data?.invoices ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={
            AllOldInvoicesDetailsApiResponse?.data?.totalCount ?? 0
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
          tableName={TableNames?.AllOldInvoicesDisplay}
          crudOperationHeader="Invoice"
          columnPinning={{
            left: [
              'mrt-row-select',
              'mrt-row-actions',
              'merchantName',
              'invoiceId',
            ],
            right: ['downloadLink'],
          }}
          uniqueIDForRows="invoiceId"
          enableRowActions={true}
          ManualInvoiceTableCellForm={false}
          uiSchema={olderInvoiceUISchema}
          crudModalWidth="350px"
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayOldInvoices;
