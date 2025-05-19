import { Suspense, useMemo, useState } from 'react';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Image, Avatar, Skeleton } from '@mantine/core';
import {
  Customer,
  useGetAllCustomersDetails,
} from './hooks/useGetAllCustomersDetails';
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { Box } from '@mui/material';
import { customersUISchema } from './CRUDUISchema/customersUISchema';
import {
  convertIntoDate,
  convertIntoDateTime,
  formatMerchantAddress,
} from '../../../utility/helperFuntions';
import { TableNames } from '../../../enums';
import WrapperforLongText from '../../../components/TextWrapperforLongText';
const DisplayCustomersGrid = () => {
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
    data: CustomeDetailsApiResponse,
    isError,
    isLoading,
  } = useGetAllCustomersDetails({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'customerId',
        header: 'Customer ID',
        enableSorting: false,
        maxSize: 30,
        Cell: ({ cell, row }) => {
          return (
            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p>{cell.getValue<string>()}</p>
              {row?.original?.profileImg ? (
                <Image
                  src={`${row?.original?.profileImg}`}
                  alt={`profile ${cell.getValue<string>()}`}
                  style={{ width: 40, height: 40, borderRadius: '50%' }}
                />
              ) : (
                <Avatar color="cyan" radius="xl">
                  {row?.original?.customerFirstName[0]?.toUpperCase()}{' '}
                  {row?.original?.customerLastName[0]?.toUpperCase()}
                </Avatar>
              )}
            </Box>
          );
        },
      },
      {
        accessorKey: 'merchantId',
        header: 'Merchant ID',
        enableSorting: false,
        maxSize: 30,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'customerFirstName',
        header: 'First Name',
        enableSorting: true,
        maxSize: 50,
      },
      {
        accessorKey: 'customerLastName',
        header: 'Last Name',
        enableSorting: true,
        maxSize: 50,
      },
      {
        accessorKey: 'customerEmail',
        header: 'Email',
        enableSorting: false,
        maxSize: 100,
      },
      {
        accessorKey: 'customerMobile',
        header: 'Mobile',
        enableSorting: false,
        maxSize: 30,
      },
      {
        accessorKey: 'customerAddress',
        header: 'Address',
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 200,
        Cell: ({ row }) => (
          <WrapperforLongText maxWidth={200}>
            {formatMerchantAddress(row?.original?.customerAddress)}
          </WrapperforLongText>
        ),
      },
      {
        accessorKey: 'customerDOB',
        header: 'Date of Birth',
        enableSorting: false,
        Cell: ({ cell }) => convertIntoDate(cell.getValue<string>()),
        enableColumnFilter: false,
        maxSize: 50,
      },
      {
        accessorKey: 'registrationDate',
        header: 'Registration Date',
        enableSorting: true,
        accessorFn: (originalRow) => new Date(originalRow.registrationDate),
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
        muiFilterDateTimePickerProps: {
          label: 'Registration Date',
          timeSteps: { minutes: 1 },
        },
        maxSize: 50,
      },
      {
        accessorKey: 'zone',
        header: 'Zone',
        enableSorting: false,
        maxSize: 30,
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { label: 'Chester', value: 'Chester' },
          { label: 'Manchester', value: 'Manchester' },
          { label: 'Birmingham', value: 'Birmingham' },
          { label: 'Wrexham', value: 'Wrexham' },
          { label: 'Ellesmere Port', value: 'Ellesmere Port' },
          { label: 'Mold', value: 'Mold' },
          { label: 'London', value: 'London' },
          { label: 'Birkenhead', value: 'Birkenhead' },
          { label: 'Wirral', value: 'Wirral' },
        ],
      },
      {
        accessorKey: 'totalOrders',
        header: 'Total Orders',
        enableSorting: false,
        maxSize: 30,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'branchId',
        header: 'Branch ID',
        enableSorting: false,
        maxSize: 30,
        enableColumnFilter: false,
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={CustomeDetailsApiResponse?.data?.customer ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={CustomeDetailsApiResponse?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          enableRowSelection={true}
          isError={isError}
          tableName={TableNames.CustomersDisplay}
          crudOperationHeader="Customer"
          columnPinning={{
            left: ['mrt-row-select', 'mrt-row-actions', 'customerId'],
          }}
          uniqueIDForRows="orderID"
          uiSchema={customersUISchema}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayCustomersGrid;
