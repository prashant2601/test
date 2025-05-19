import { notifications } from '@mantine/notifications';
import { red, yellow, green, blue, grey, amber } from '@mui/material/colors';
import axios, { AxiosError } from 'axios';
import { MerchantAddress } from '../pages/admin/merchants/hooks/useGetAllMerchantsDetails';
import { DefaultMantineColor } from '@mantine/core';
import dayjs from 'dayjs';
import { ColumnFilter } from '@tanstack/table-core';

type ChipAllowedValues = {
  backgroundColor: string;
  textColor: string;
};

interface MyObject {
  [key: string]: ChipAllowedValues;
}
interface AxiosRequestError {
  message: string;
  code?: string;
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: any;
  };
}
export const getChipColor = (value: string): ChipAllowedValues => {
  const ChipColor: MyObject = {
    ABANDONED: { backgroundColor: grey[600], textColor: 'white' },
    PENDING: { backgroundColor: amber[500], textColor: 'black' },
    ACCEPTED: { backgroundColor: blue[300], textColor: 'white' },
    READY_TO_PICK_UP: { backgroundColor: blue[500], textColor: 'white' },
    SEARCHING_FOR_DRIVER: { backgroundColor: green[300], textColor: 'white' },
    DRIVER_ACCEPTED: { backgroundColor: green[400], textColor: 'white' },
    DRIVER_ON_THE_WAY: { backgroundColor: green[700], textColor: 'white' },
    DRIVER_ARRIVED: { backgroundColor: green[900], textColor: 'white' },
    PICKED_UP: { backgroundColor: blue[700], textColor: 'white' },
    ON_THE_WAY_TO_CUSTOMER: { backgroundColor: green[600], textColor: 'white' },
    ARRIVED_AT_CUSTOMER: { backgroundColor: blue[900], textColor: 'white' },
    FAILED: { backgroundColor: red[500], textColor: 'white' },
    CANCELLED: { backgroundColor: red[700], textColor: 'white' },
    REFUNDED: { backgroundColor: yellow[800], textColor: 'black' },
    PARTIALLY_REFUNDED: { backgroundColor: yellow[500], textColor: 'black' },
    DELIVERED: { backgroundColor: green[700], textColor: 'white' },
    ACTIVE: { backgroundColor: green[700], textColor: 'white' },
    SUCCESS: { backgroundColor: green[700], textColor: 'white' },
    INACTIVE: { backgroundColor: yellow[800], textColor: 'black' },
    UNPAID: { backgroundColor: yellow[800], textColor: 'white' },
    OUTSOURCE: { backgroundColor: blue[300], textColor: 'white' },
  };

  const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return (
    ChipColor[formattedValue] || {
      backgroundColor: grey[500],
      textColor: 'white',
    } // Default color
  );
};
export function getValueofKeyFromObject<T>(obj: T, accessor: string): any {
  const keys = accessor.split('.');
  let result: any = obj;
  for (let key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }

  return result;
}

export const getErrorNotificationContent = (
  error: AxiosError<{ message: string } | AxiosRequestError>
) => {
  let title = 'Unexpected error';
  let message = error.message;

  if (error.response) {
    title = 'Request Failed';
    message = error.response.data?.message ?? 'Something went wrong';
  } else if (error.request) {
    title = 'Axios Request Error';
    message = error.request ?? 'Request failed';
  }

  return { title, message };
};

export const displayRelevantErrorNotification = (error: Error) => {
  if (axios.isAxiosError(error)) {
    const { title, message } = getErrorNotificationContent(error);
    notifications.show({
      title,
      message,
      color: 'red',
      autoClose: 5000,
    });
  } else {
    console.error('Non-Axios error:', error);
  }
};
export function formatMerchantAddress(address: MerchantAddress) {
  let formattedAddress = address.line1 || '';
  if (address.line2) {
    formattedAddress += `, ${address.line2}`;
  }
  if (address.area) {
    formattedAddress += `, ${address.area}`;
  }
  if (address.city) {
    formattedAddress += `, ${address.city}`;
  }
  if (address.post) {
    formattedAddress += `, ${address.post}`;
  }
  if (address.country) {
    formattedAddress += `, ${address.country}`;
  }
  // Use regular expression to remove any leading or trailing commas and spaces
  return formattedAddress.replace(/(^,)|(,$)/g, '').trim();
}
export function isTruthy(value: any) {
  return (
    value !== null &&
    value !== undefined &&
    value !== false &&
    value !== '' &&
    !isNaN(value)
  );
}

const showErrorNotification = (
  title: string,
  message: string,
  color: DefaultMantineColor
) => {
  notifications.show({
    title,
    message,
    color,
    autoClose: 5000,
  });
};

export const handleAPIError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const errorMessage = error?.response?.data?.message ?? 'Request Failed';
    showErrorNotification(errorMessage, 'Request Failed', 'red');
  } else {
    showErrorNotification(
      'Failed to perform the action',
      'Something went wrong',
      'red'
    );
  }
  console.error('Error occurred:', error);
};
export function extractNumbersInBracketsArray(arr: string[]) {
  return arr
    .map((item) => {
      const match = RegExp(/\((\d+)\)/).exec(item);
      return match ? match[1] : null;
    })
    .filter((number) => number !== null)
    ?.join(',');
}
export function extractNumberInBrackets(str: string): string | null {
  const match = /\((\d+)\)/.exec(str);
  return match ? match[1] : null;
}
export function convertIntoDateTime(dateInput: string) {
  if (dateInput) {
    return dayjs(dateInput).format('DD MMM YYYY hh:mm A');
  }
  return '';
}

export function convertIntoDate(dateInput: string) {
  if (dateInput) {
    return dayjs(dateInput).format('DD MMM YYYY');
  }
  return '';
}

export const getFileSrc = (input: File | string) => {
  if (input instanceof File) {
    return URL.createObjectURL(input);
  } else if (input) {
    return input;
  }
  return undefined;
};
export function getFormattedDayFromDayjs(dateobj: dayjs.Dayjs) {
  return dayjs(dateobj, 'DD MMM YYYY hh:mm A').format(
    'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
  );
}
export const formatDateForParamSingleColumnRange = (
  columnFilters: ColumnFilter[],
  columnId: string
) => {
  let startDate = '';
  let endDate = '';

  const getDateColumn = columnFilters.find((column) => column.id === columnId);

  if (getDateColumn && Array.isArray(getDateColumn?.value)) {
    startDate = getDateColumn.value[0]
      ? getFormattedDayFromDayjs(getDateColumn.value[0])
      : '';
    endDate = getDateColumn.value[1]
      ? getFormattedDayFromDayjs(getDateColumn.value[1])
      : '';
  }

  if (startDate || endDate) {
    return { startDate, endDate };
  }

  return undefined; // explicitly return undefined if no dates found
};
export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  const assignValue = (
    current: Record<string, any>,
    keyParts: string[],
    value: any
  ) => {
    for (let i = 0; i < keyParts.length; i++) {
      const part = keyParts[i];
      if (i === keyParts.length - 1) {
        current[part] = value;
      } else {
        current[part] ??= {};
        current = current[part] as Record<string, any>;
      }
    }
  };

  for (const key in obj) {
    const value = obj[key];
    const keyParts = key.split('.');

    if (keyParts.length === 1) {
      result[key] = value;
    } else {
      assignValue(result, keyParts, value);
    }
  }

  return result;
}
export function flattenObject(
  obj: Record<string, any>,
  prefix = ''
): Record<string, any> {
  let result: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
