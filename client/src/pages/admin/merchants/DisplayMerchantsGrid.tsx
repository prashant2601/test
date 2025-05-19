import { Suspense, useMemo, useState } from 'react';

import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_Row,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { Text as MantineText, Rating, Skeleton, Radio } from '@mantine/core';
import {
  Merchant,
  useGetAllMerchantsDetails,
} from './hooks/useGetAllMerchantsDetails';
import AppGridRemoteDataFetching from '../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../providers/MUIThemeProvider';
import { Box, Tooltip } from '@mui/material';
import { merchantsUISchema } from './CRUDUISchema/merchantsUISchema';
import { IconEye } from '@tabler/icons-react';
import AppChipComponent from '../../../components/AppChipComponent';
import {
  convertIntoDateTime,
  formatMerchantAddress,
} from '../../../utility/helperFuntions';
import { TableNames } from '../../../enums';
function CustomRadioComponent({
  columnFiltervalue,
  setColumnFilterValue,
}: {
  columnFiltervalue: unknown;
  setColumnFilterValue: any;
}) {
  return (
    <Radio.Group
      value={String(columnFiltervalue)}
      onChange={(value) => setColumnFilterValue(value)}
      label="Filter by Merchant Type"
      size="md"
      styles={{
        label: { fontWeight: 'normal', color: 'grey' },
        root: { borderBottom: '1px solid grey', paddingBottom: 10 },
      }}
    >
      <Radio value={'true'} label="In House" mt={10} />
      <Radio value={'false'} label="Outsource" mt={5} />
    </Radio.Group>
  );
}
const MerchantIdCell = ({ cell }: { cell: MRT_Cell<Merchant> }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MantineText style={{ cursor: 'pointer' }}>
        {cell.getValue<number>()}
      </MantineText>
      <Tooltip title={'View Merchant Details'} placement="top">
        <Link
          to={`/merchant/dashboard`}
          style={{ textDecoration: 'none' }}
          onClick={() =>
            localStorage.setItem(
              'AdminOnMerchantProfile',
              JSON.stringify(cell.getValue<number>())
            )
          }
        >
          <IconEye color="green" />
        </Link>
      </Tooltip>
    </Box>
  );
};

const MerchantAddressCell = ({
  cell,
  row,
}: {
  cell: MRT_Cell<Merchant>;
  row: MRT_Row<Merchant>;
}) => (
  <Box
    sx={(theme) => ({
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      maxWidth: '200px',
      overflowWrap: 'break-word',
    })}
  >
    {formatMerchantAddress(row?.original?.merchantAddress)}
  </Box>
);

const DisplayMerchantsGrid = () => {
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
    data: merchantDetails,
    isError,
    isLoading,
  } = useGetAllMerchantsDetails({
    columnFilters: columnFilters,
    EnableQuery: !opened,
    sorting: sorting,
    pagination: pagination,
  });

  const columns = useMemo<MRT_ColumnDef<Merchant>[]>(
    () => [
      {
        accessorKey: 'merchantId',
        header: 'Merchant ID',
        enableSorting: false,
        maxSize: 150,
        Cell: MerchantIdCell,
      },
      {
        accessorKey: 'merchantName',
        header: 'Merchant Name',
        enableSorting: true,
        maxSize: 50,
      },
      {
        accessorKey: 'merchantEmail',
        header: 'Email',
        enableSorting: false,
        maxSize: 100,
      },
      {
        accessorKey: 'merchantMobile',
        header: 'Mobile',
        enableSorting: false,
        maxSize: 30,
      },
      {
        accessorKey: 'merchantAddress',
        header: 'Address',
        enableSorting: false,
        enableColumnFilter: false,
        maxSize: 200,
        Cell: MerchantAddressCell,
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
        accessorKey: 'serviceFeeApplicable',
        header: 'Service Fee Applicable',
        enableSorting: false,
        maxSize: 30,
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'deliveryChargeApplicable',
        header: 'Delivery Charge Applicable',
        enableSorting: false,
        maxSize: 30,
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'driverTipApplicable',
        header: 'Driver Tip Applicable',
        enableSorting: false,
        maxSize: 30,
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
        enableColumnFilter: false,
      },
      {
        accessorKey: 'deliveryOrdersComission',
        header: 'Delivery Orders Commission (%)',
        enableSorting: false,
        maxSize: 220,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'collectionOrdersComission',
        header: 'Collection Orders Commission (%)',
        enableSorting: false,
        maxSize: 220,

        enableColumnFilter: false,
      },
      {
        accessorKey: 'eatInComission',
        header: 'Eat-In Commission (%)',
        enableSorting: false,
        maxSize: 220,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'taxRate',
        header: 'Tax Rate',
        enableSorting: false,
        maxSize: 30,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'totalOrders',
        header: 'Total Orders',
        enableSorting: false,
        maxSize: 30,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'isInHouseType',
        header: 'Merchant Type',
        enableSorting: false,
        maxSize: 30,
        Cell: ({ cell }) => (
          <AppChipComponent
            value={cell.getValue<boolean>() ? 'In House' : 'Outsource'}
          />
        ),
        Filter: ({ column }) => {
          return (
            <CustomRadioComponent
              columnFiltervalue={column?.getFilterValue()}
              setColumnFilterValue={column?.setFilterValue}
            />
          );
        },
      },
      {
        accessorKey: 'isEmailApplicable',
        header: 'Email Applicable',
        enableSorting: false,
        maxSize: 70,
        enableColumnFilter: false,
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
      },
      {
        accessorKey: 'isActive',
        header: 'Is Active',
        enableSorting: false,
        maxSize: 30,
        filterVariant: 'checkbox',
        muiFilterCheckboxProps: {
          size: 'large',
        },
        Cell: ({ cell }) => (
          <AppChipComponent
            value={cell.getValue<boolean>() ? 'Active' : 'Inactive'}
          />
        ),
      },

      {
        accessorKey: 'rating',
        header: 'Rating',
        enableSorting: false,
        maxSize: 30,
        Cell: ({ cell }) => <Rating value={cell.getValue<number>()} readOnly />,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'merchantManagementInfo.ownerName',
        header: 'Owner Name',
        enableSorting: false,
        enableColumnFilter: false,
        accessorFn: (originalRow) =>
          originalRow?.merchantManagementInfo?.ownerName ?? '',
      },
      {
        accessorKey: 'merchantManagementInfo.ownerPhone',
        header: 'Owner Phone',
        enableSorting: false,
        enableColumnFilter: false,
        accessorFn: (originalRow) =>
          originalRow?.merchantManagementInfo?.ownerPhone ?? '',
      },
      {
        accessorKey: 'merchantManagementInfo.ownerEmail',
        header: 'Owner Email',
        enableSorting: false,
        enableColumnFilter: false,
        accessorFn: (originalRow) =>
          originalRow?.merchantManagementInfo?.ownerEmail ?? '',
      },
      {
        accessorKey: 'merchantManagementInfo.managerName',
        header: 'Manager Name',
        enableSorting: true,
        enableColumnFilter: false,
        accessorFn: (originalRow) =>
          originalRow?.merchantManagementInfo?.managerName ?? '',
      },
      {
        accessorKey: 'merchantManagementInfo.managerPhone',
        header: 'Manager Phone',
        enableSorting: false,
        enableColumnFilter: false,
        accessorFn: (originalRow) =>
          originalRow?.merchantManagementInfo?.managerPhone ?? '',
      },
      {
        accessorKey: 'merchantManagementInfo.managerEmail',
        header: 'Manager Email',
        enableSorting: false,
        enableColumnFilter: false,
        accessorFn: (originalRow) =>
          originalRow?.merchantManagementInfo?.managerEmail ?? '',
      },
    ],
    []
  );

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={merchantDetails?.data?.merchant ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={merchantDetails?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={() => open()}
          OnApplyFiltersClicked={() => close()}
          filterDrawerIsOpen={opened}
          enableRowSelection={true}
          isError={isError}
          tableName={TableNames?.MerchantsDisplay}
          crudOperationHeader="Merchant"
          columnPinning={{
            left: ['mrt-row-select', 'mrt-row-actions', 'merchantId'],
          }}
          uniqueIDForRows="merchantId"
          uiSchema={merchantsUISchema}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayMerchantsGrid;
