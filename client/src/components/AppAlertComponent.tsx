import React from 'react';
import { Alert as MantineAlert } from '@mantine/core';

interface AlertProps {
  title: string;
  message: string;
  color: 'green' | 'red' | 'yellow' | 'blue';
  onClose?: () => void;
}

const AppAlertComponent: React.FC<AlertProps> = ({
  title,
  message,
  color,
  onClose,
}) => {
  return (
    <MantineAlert
      title={title}
      color={color}
      //   onClose={onClose}
      //   withCloseButton={!!onClose}
    >
      {message}
    </MantineAlert>
  );
};

export default AppAlertComponent;
