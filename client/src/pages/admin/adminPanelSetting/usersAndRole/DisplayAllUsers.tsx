import { Suspense, useMemo, useState } from 'react';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Skeleton } from '@mantine/core';
import {
  useGetUsersByRole,
  UserRoleMapResponses,
} from './hooks/useGetUsersByRole';
import AppGridRemoteDataFetching from '../../../../components/CoreUI/AppGrids/AppGridRemoteDataFetching';
import MUIThemeProvider from '../../../../providers/MUIThemeProvider';
import { AllUserRoleTypesExcludingSuperAdmin } from './constants';
import { convertIntoDateTime } from '../../../../utility/helperFuntions';
import { usersUISchemaByRole } from './CRUDUISchema/usersUISchema';
import { TableNames } from '../../../../enums';

const commonColumns: MRT_ColumnDef<any>[] = [
  { accessorKey: 'firstName', header: 'First Name', enableSorting: true },
  { accessorKey: 'lastName', header: 'Last Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: false },
  { accessorKey: 'userName', header: 'UserName', enableSorting: false },
  { accessorKey: 'phone', header: 'Phone', enableSorting: false },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    enableSorting: false,
    Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
  },
  {
    accessorKey: 'lastActive',
    header: 'Last Active',
    enableSorting: false,
    Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
  },
  { accessorKey: 'userId', header: 'User ID', enableSorting: false },
  {
    accessorKey: 'activatedOn',
    header: 'Activated On',
    enableSorting: false,
    Cell: ({ cell }) => convertIntoDateTime(cell.getValue<string>()),
  },
];

const userColumns: {
  [K in keyof UserRoleMapResponses]: MRT_ColumnDef<UserRoleMapResponses[K]>[];
} = {
  admin: [...commonColumns],
  affiliate: [
    ...commonColumns,
    {
      accessorKey: 'referralCode',
      header: 'Referral Code',
      enableSorting: false,
    },
  ],
  staff: [
    ...commonColumns,
    { accessorKey: 'department', header: 'Department', enableSorting: false },
  ],
  support: [
    ...commonColumns,
    { accessorKey: 'ticketCount', header: 'Ticket Count', enableSorting: true },
  ],
  driver: [
    ...commonColumns,
    {
      accessorKey: 'licenseNumber',
      header: 'License Number',
      enableSorting: false,
    },
    {
      accessorKey: 'vehicleType',
      header: 'Vehicle Type',
      enableSorting: false,
    },
  ],
  merchant: [
    ...commonColumns,
    {
      accessorKey: 'merchantIds',
      header: 'Merchant IDs',
      enableSorting: false,
      accessorFn: (originalRow) => originalRow?.merchantIds?.join(', '),
    },
  ],
};

const DisplayUserGrid = ({
  role,
}: {
  role: AllUserRoleTypesExcludingSuperAdmin;
}) => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const { data, isError, isLoading } = useGetUsersByRole({
    role,
    columnFilters,
    enableQuery: !opened,
    sorting,
    pagination,
  });

  const columns = useMemo<
    MRT_ColumnDef<UserRoleMapResponses[typeof role]>[]
  >(() => {
    return userColumns[role] as MRT_ColumnDef<
      UserRoleMapResponses[typeof role]
    >[];
  }, [role]);

  return (
    <MUIThemeProvider>
      <Suspense fallback={<Skeleton height={300} width="100%" />}>
        <AppGridRemoteDataFetching
          data={data?.data?.users ?? []}
          columnFilters={columnFilters}
          columns={columns}
          pagination={pagination}
          sorting={sorting}
          totalRowCount={data?.data?.totalCount ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          isLoading={isLoading}
          OnFilterButtonClicked={open}
          OnApplyFiltersClicked={close}
          filterDrawerIsOpen={opened}
          enableRowSelection={true}
          isError={isError}
          tableName={TableNames?.UsersDisplay}
          crudOperationHeader={`${role.charAt(0).toUpperCase() + role.slice(1)} User`}
          columnPinning={{
            left: ['mrt-row-select', 'mrt-row-actions', 'firstName'],
          }}
          uniqueIDForRows="userId"
          uiSchema={usersUISchemaByRole[role]}
        />
      </Suspense>
    </MUIThemeProvider>
  );
};

export default DisplayUserGrid;
