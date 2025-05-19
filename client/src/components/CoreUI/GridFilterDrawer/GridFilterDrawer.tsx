import { Drawer } from '@mantine/core';
interface GridFilterDrawerTypes {
  children: React.ReactNode;
  opened: boolean;
  close: () => void;
  crudOperationHeader: string;
}
export function GridFilterDrawer(props: GridFilterDrawerTypes) {
  const { children, close, opened, crudOperationHeader } = props;

  return (
    <Drawer
      opened={opened}
      onClose={close}
      title={`Filter ${crudOperationHeader}`}
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      position="right"
      size={'lg'}
    >
      {children}
    </Drawer>
  );
}
