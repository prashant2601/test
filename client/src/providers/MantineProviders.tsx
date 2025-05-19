import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from 'react';
import { ModalsProvider } from '@mantine/modals';
interface MantineProvidersProps {
  children: ReactNode;
}
export default function MantineProviders({
  children,
}: Readonly<MantineProvidersProps>) {
  return (
    <MantineProvider
      theme={{
        primaryColor: 'teal',
        cursorType: 'pointer',
      }}
    >
      <Notifications zIndex={1000} />
      <ModalsProvider />
      {children}
    </MantineProvider>
  );
}
