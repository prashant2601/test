import { Box, IconButton, Tooltip } from '@mui/material';
import { DeleteForeverRounded } from '@mui/icons-material';
import { modals } from '@mantine/modals';
import { Text as MantineText } from '@mantine/core';
import { MRT_TableInstance } from 'material-react-table';
interface DeleteActionInGridProps {
  table: MRT_TableInstance<any>;
  onDeleteConfirm: (IDs: string[] | number[]) => void;
  uniqueIDinRow: string;
  confirmationText: string;
}
const DeleteActionInGrid = (props: DeleteActionInGridProps) => {
  const { onDeleteConfirm, table, uniqueIDinRow, confirmationText } = props;
  const getSelectedROws = table
    .getSelectedRowModel()
    ?.flatRows?.map((row) => row?.original);
  const getaccIdsofSelectedRows = getSelectedROws?.map(
    (row) => row?.[uniqueIDinRow]
  );
  const handleDelete = () => {
    handleDeleteOrder(getaccIdsofSelectedRows);
  };
  const handleDeleteOrder = (IDs: string[] | number[]) => {
    modals.openConfirmModal({
      title: (
        <MantineText size="md" style={{ fontWeight: '600' }}>
          Are you sure you want to proceed?
        </MantineText>
      ),
      children: (
        <MantineText size="sm">{`This action will delete the selected ${confirmationText}`}</MantineText>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => {
        onDeleteConfirm(IDs);
      },
    });
  };
  return (
    <Box>
      <Tooltip title="Delete selected rows" placement="top">
        <IconButton
          color="error"
          disabled={
            !table.getIsAllPageRowsSelected() && !table.getIsSomeRowsSelected()
          }
          onClick={handleDelete}
        >
          <DeleteForeverRounded />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DeleteActionInGrid;
