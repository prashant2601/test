import { useEffect, useMemo, useRef } from 'react';
import { Formik, Form, FormikProps, useFormikContext } from 'formik';
import {
  Button,
  Group,
  Paper,
  Stack,
  Title,
  Box,
  Table,
  ActionIcon,
  LoadingOverlay,
} from '@mantine/core';

import { Invoice } from '../hooks/useGetAllInvoices';
import FormikDatePickerField from '../../../../components/CoreUI/FormikFields/FormikDateField';
import FormikNumberField from '../../../../components/CoreUI/FormikFields/FormikNumberField';
import { TableContainer, Typography } from '@mui/material';
import FormikInputField from '../../../../components/CoreUI/FormikFields/FormikInputField';
import { IconTrash } from '@tabler/icons-react';
import { useUpdateInvoice } from '../hooks/useUpdateInvoice';
import FormikCheckBoxField from '../../../../components/CoreUI/FormikFields/FormikCheckBoxField';
import dayjs from 'dayjs';
import { isTruthy } from '../../../../utility/helperFuntions';

function DescriptionAndAmountTable() {
  const { values, setFieldValue } = useFormikContext<Invoice>();
  const handleDeleteRow = (index: number) => {
    setFieldValue('invoiceParameters', {
      ...values?.invoiceParameters,
      calculationsByOrderType: {
        ...values?.invoiceParameters?.calculationsByOrderType,
        MISCELLANEOUS:
          values?.invoiceParameters?.calculationsByOrderType?.MISCELLANEOUS?.filter(
            (_, i) => i !== index
          ) ?? [],
      },
    });
  };
  const handleAddRow = () =>
    setFieldValue('invoiceParameters', {
      ...values?.invoiceParameters,
      calculationsByOrderType: {
        ...values?.invoiceParameters?.calculationsByOrderType,
        MISCELLANEOUS: [
          ...(values?.invoiceParameters?.calculationsByOrderType
            ?.MISCELLANEOUS ?? []),
          {
            amount: 0,
            text: '',
            isVatApplicable: true,
          },
        ],
      },
    });

  const { calculationsByOrderType, validItem, isInHouseType } =
    values.invoiceParameters;
  useEffect(() => {
    const calculateAmount = (orderType: 'DELIVERY' | 'COLLECTION') => {
      const totalorderValueofRow =
        values.invoiceParameters?.calculationsByOrderType?.[orderType]
          ?.totalOrderValue;
      const commissionRateofRow =
        values.invoiceParameters?.calculationsByOrderType?.[orderType]
          ?.commissionRate;
      if (
        totalorderValueofRow === undefined ||
        commissionRateofRow === undefined
      ) {
        return 0;
      }
      return totalorderValueofRow * 0.01 * commissionRateofRow;
    };

    if (
      Object.hasOwn(
        values.invoiceParameters.calculationsByOrderType,
        'DELIVERY'
      )
    ) {
      setFieldValue(
        'invoiceParameters.calculationsByOrderType.DELIVERY.amount',
        calculateAmount('DELIVERY')
      );
    }

    if (
      Object.hasOwn(
        values.invoiceParameters.calculationsByOrderType,
        'COLLECTION'
      )
    ) {
      setFieldValue(
        'invoiceParameters.calculationsByOrderType.COLLECTION.amount',
        calculateAmount('COLLECTION')
      );
    }
  }, [
    values.invoiceParameters.calculationsByOrderType?.DELIVERY?.totalOrderValue,
    values.invoiceParameters.calculationsByOrderType?.COLLECTION
      ?.totalOrderValue,
    values.invoiceParameters.calculationsByOrderType?.DELIVERY?.commissionRate,
    values.invoiceParameters.calculationsByOrderType?.COLLECTION
      ?.commissionRate,
  ]);

  const rows = [
    ...Object.entries(calculationsByOrderType).map(([orderType, data]) => {
      let row = null;

      if (orderType === 'COLLECTION') {
        row = (
          <Table.Tr>
            <Table.Td>
              <Group>
                <Typography>
                  {`${data.commissionRate}% Commission on Collection Orders value`}
                </Typography>
                <FormikNumberField
                  name={`invoiceParameters.calculationsByOrderType.COLLECTION.totalOrderValue`}
                  label=""
                  extraProps={{ prefix: '£', maw: '100px' }}
                />
              </Group>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (orderType === 'DELIVERY') {
        row = (
          <Table.Tr>
            <Table.Td>
              <Group>
                <Typography>
                  {`${data.commissionRate}% Commission on Delivery Orders value`}
                </Typography>
                <FormikNumberField
                  name={`invoiceParameters.calculationsByOrderType.DELIVERY.totalOrderValue`}
                  label=""
                  extraProps={{ prefix: '£', maw: '100px' }}
                />
              </Group>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (orderType === 'SERVICE_FEE' && !data.isCashOrders) {
        row = (
          <Table.Tr>
            <Table.Td>
              <Typography>
                Service Fee Paid ({data.totalOrders} Orders)
              </Typography>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (orderType === 'SERVICE_FEE' && data.isCashOrders) {
        row = (
          <Table.Tr>
            <Table.Td>
              <Typography>
                Service Fee Paid By Cash Orders ({data.totalOrders} Orders)
              </Typography>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (
        orderType === 'DELIVERY_CHARGE' &&
        !data.isCashOrders &&
        !isInHouseType
      ) {
        row = (
          <Table.Tr>
            <Table.Td>
              <Typography>
                Delivery Charge ({data.totalOrders} Orders)
              </Typography>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (
        orderType === 'DELIVERY_CHARGE' &&
        data.isCashOrders &&
        !isInHouseType
      ) {
        row = (
          <Table.Tr>
            <Table.Td>
              <Typography>
                Delivery Charge Paid By Cash Orders ({data.totalOrders} Orders)
              </Typography>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (orderType === 'DRIVER_TIP' && !isInHouseType) {
        row = (
          <Table.Tr>
            <Table.Td>
              <Typography>Driver Tip ({data.totalOrders} Orders)</Typography>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.calculationsByOrderType?.[
                  orderType
                ]?.amount?.toFixed(2)}
              </Typography>
            </Table.Td>
          </Table.Tr>
        );
      } else if (orderType === 'MISCELLANEOUS') {
        return null;
      }

      return row;
    }),

    ...(values?.invoiceParameters?.calculationsByOrderType?.MISCELLANEOUS &&
    values?.invoiceParameters?.calculationsByOrderType?.MISCELLANEOUS?.length >
      0
      ? values.invoiceParameters.calculationsByOrderType.MISCELLANEOUS.map(
          (item, index) => (
            <Table.Tr key={`MISCELLANEOUS ${index}`}>
              <Table.Td>
                <Group>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={(event) => handleDeleteRow(index)}
                  >
                    <IconTrash />
                  </ActionIcon>
                  <FormikInputField
                    name={`invoiceParameters.calculationsByOrderType.MISCELLANEOUS[${index}].text`}
                    label={''}
                  ></FormikInputField>
                  <FormikCheckBoxField
                    name={`invoiceParameters.calculationsByOrderType.MISCELLANEOUS[${index}].isVatApplicable`}
                    label="VAT Applicable"
                    RenderTextNodeforAlignment={false}
                  ></FormikCheckBoxField>
                </Group>
              </Table.Td>
              <Table.Td>
                <FormikNumberField
                  name={`invoiceParameters.calculationsByOrderType.MISCELLANEOUS[${index}].amount`}
                  label=""
                  extraProps={{ prefix: '£', maw: '100px' }}
                />
              </Table.Td>
            </Table.Tr>
          )
        )
      : []),
    ...(validItem.length > 0
      ? validItem.map((item, index) => (
          <Table.Tr key={item._id}>
            <Table.Td>
              <Typography>
                {' '}
                {`${item.itemName}, ${item.totalQuantity} Qty (Remaining £${item.balanceAmount.toFixed(
                  2
                )})`}
              </Typography>
            </Table.Td>
            <Table.Td>
              <FormikNumberField
                name={`invoiceParameters.validItem[${index}].deductableAmount`}
                label=""
                extraProps={{ prefix: '£', maw: '100px' }}
              />
            </Table.Td>
          </Table.Tr>
        ))
      : []),
  ];

  const ths = useMemo(
    () => (
      <Table.Tr>
        <Table.Th>Description</Table.Th>
        <Table.Th>Amount</Table.Th>
      </Table.Tr>
    ),
    []
  );

  return (
    <TableContainer>
      <Table
        captionSide="bottom"
        withColumnBorders
        withRowBorders
        withTableBorder
        borderColor="black"
        mt={20}
      >
        <Table.Thead>{ths}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Button onClick={() => handleAddRow()} mt={10} variant="outline">
        Add Row in the table
      </Button>
    </TableContainer>
  );
}

function SummaryTable() {
  const { values } = useFormikContext<Invoice>();
  const isInHouseType = values?.invoiceParameters?.isInHouseType;
  const deliveryChargeInHouse =
    values?.invoiceParameters?.deliveryChargeInHouse;
  const driverTipInHouse = values?.invoiceParameters?.driverTipInHouse;
  const rows = [
    <Table.Tr key={'totalOrdersCount'}>
      <Table.Td>
        <Typography>Total Orders</Typography>
      </Table.Td>
      <Table.Td>
        <FormikNumberField
          name="invoiceParameters.totalOrdersCount"
          label=""
          extraProps={{ maw: '100px' }}
        />
      </Table.Td>
    </Table.Tr>,
    <Table.Tr key={'deliveryOrderCount'}>
      <Table.Td>
        <Typography>Delivery Orders</Typography>
      </Table.Td>
      <Table.Td>
        <FormikNumberField
          name="invoiceParameters.deliveryOrderCount"
          label=""
          extraProps={{ maw: '100px' }}
        />
      </Table.Td>
    </Table.Tr>,
    <Table.Tr key={'collectionOrderCount'}>
      <Table.Td>
        <Typography>Collection Orders</Typography>
      </Table.Td>
      <Table.Td>
        <FormikNumberField
          name="invoiceParameters.collectionOrderCount"
          label=""
          extraProps={{ maw: '100px' }}
        />
      </Table.Td>
    </Table.Tr>,
    <Table.Tr key={'cardPaymentAmount'}>
      <Table.Td>
        <Group>
          <FormikNumberField
            name="invoiceParameters.cardPaymentCount"
            label=""
            extraProps={{ maw: '100px' }}
          />{' '}
          <Typography>Card Payments</Typography>
        </Group>
      </Table.Td>
      <Table.Td>
        <FormikNumberField
          name="invoiceParameters.cardPaymentAmount"
          label=""
          extraProps={{ prefix: '£', maw: '100px' }}
        />
      </Table.Td>
    </Table.Tr>,
    <Table.Tr key={'cashPaymentAmount'}>
      <Table.Td>
        <Group>
          <FormikNumberField
            name="invoiceParameters.cashPaymentCount"
            label=""
            extraProps={{ maw: '100px' }}
          />{' '}
          <Typography>
            Cash Payments (Including Service & Delivery Charges)
          </Typography>
        </Group>{' '}
      </Table.Td>
      <Table.Td>
        <FormikNumberField
          name="invoiceParameters.cashPaymentAmount"
          label=""
          extraProps={{ prefix: '£', maw: '100px' }}
        />
      </Table.Td>
    </Table.Tr>,

    ...(isInHouseType && deliveryChargeInHouse
      ? [
          <Table.Tr key={'isInHouseType_deliveryChargeInHouse'}>
            <Table.Td>
              <Group>
                <Typography>Own delivery charges (</Typography>
                <FormikNumberField
                  name="invoiceParameters.deliveryChargeInHouse.totalOrders"
                  label=""
                  extraProps={{ maw: '100px' }}
                />
                <Typography>) orders</Typography>
              </Group>
            </Table.Td>
            <Table.Td>
              <FormikNumberField
                name="invoiceParameters.deliveryChargeInHouse.amount"
                label=""
                extraProps={{ prefix: '£', maw: '100px' }}
              />
            </Table.Td>
          </Table.Tr>,
        ]
      : []),
    ...(isInHouseType && driverTipInHouse
      ? [
          <Table.Tr key={'isInHouseType_driverTipInHouse'}>
            <Table.Td>
              <Group>
                <Typography> Driver tip paid (</Typography>
                <FormikNumberField
                  name="invoiceParameters.driverTipInHouse.totalOrders"
                  label=""
                  extraProps={{ maw: '100px' }}
                />
                <Typography>) orders</Typography>
              </Group>
            </Table.Td>
            <Table.Td>
              <FormikNumberField
                name="invoiceParameters.driverTipInHouse.amount"
                label=""
                extraProps={{ prefix: '£', maw: '100px' }}
              />
            </Table.Td>
          </Table.Tr>,
        ]
      : []),

    ...(isTruthy(values?.invoiceParameters?.totalRefundAmount)
      ? [
          <Table.Tr key={'totalRefundAmount'}>
            <Table.Td>
              <Typography>Refunds</Typography>
            </Table.Td>
            <Table.Td>
              <Typography>
                {values?.invoiceParameters?.totalRefundAmount}
              </Typography>
            </Table.Td>
          </Table.Tr>,
        ]
      : []),
    <Table.Tr key={'totalSales'}>
      <Table.Td>
        <Typography>Total Sales</Typography>
      </Table.Td>
      <Table.Td>
        <FormikNumberField
          name="invoiceParameters.totalSales"
          label=""
          extraProps={{ prefix: '£', maw: '100px' }}
        />
      </Table.Td>
    </Table.Tr>,
  ];

  return (
    <>
      <Title order={4} mt={20} mb={10} m={'auto'}>
        Summary Table
      </Title>
      <Table
        withColumnBorders
        withRowBorders
        withTableBorder
        borderColor="black"
      >
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
}

function RefundTable() {
  const { values, setFieldValue } = useFormikContext<Invoice>();
  useEffect(() => {
    const total = values?.invoiceParameters?.refundArray?.reduce(
      (acc, item) => acc + item.refundAmount,
      0
    );
    if (isTruthy(total)) {
      setFieldValue('invoiceParameters.totalRefundAmount', total);
    }
  }, [values.invoiceParameters?.refundArray, setFieldValue]);
  const rows = values?.invoiceParameters?.refundArray?.map((item, i) => {
    return (
      <Table.Tr key={`refundTable${[i]}`}>
        <Table.Td>
          <Typography>{item?.orderId}</Typography>
        </Table.Td>
        <Table.Td>
          <Typography>
            {dayjs(item?.orderDate).format('DD MMM YYYY')}
          </Typography>
        </Table.Td>
        <Table.Td>
          <FormikNumberField
            name={`invoiceParameters.refundArray[${[i]}].refundAmount`}
          />
        </Table.Td>
        <Table.Td>
          <Typography>{item?.invoiceId}</Typography>
        </Table.Td>
      </Table.Tr>
    );
  });

  const ths = useMemo(
    () => (
      <Table.Tr>
        <Table.Th>order Id</Table.Th>
        <Table.Th>Order Date</Table.Th>
        <Table.Th>Refund Amount</Table.Th>
        <Table.Th>Invoice Id(if already billed)</Table.Th>
      </Table.Tr>
    ),
    []
  );
  return (
    <>
      <Title order={4} mt={20} mb={10} m={'auto'}>
        Refund Summary
      </Title>
      <Table
        withColumnBorders
        withRowBorders
        withTableBorder
        borderColor="black"
      >
        <Table.Thead>{ths}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
}
function RefundTotalTable() {
  const { values } = useFormikContext<Invoice>();

  const ths = useMemo(
    () => (
      <Table.Tr>
        <Table.Th w={'60%'}>
          <Typography>Total Refund</Typography>
        </Table.Th>
        <Table.Th w={'40%'}>
          {values?.invoiceParameters.totalRefundAmount}
        </Table.Th>
      </Table.Tr>
    ),
    [values?.invoiceParameters.totalRefundAmount]
  );
  return (
    <Table withColumnBorders withRowBorders withTableBorder borderColor="black">
      <Table.Thead>{ths}</Table.Thead>
    </Table>
  );
}
interface InvoiceEditProps {
  initialValues: Invoice;
  closeModal: () => void;
}
const InvoiceEdit = (props: InvoiceEditProps) => {
  const { closeModal, initialValues } = props;
  const FormikRef = useRef<FormikProps<Invoice>>(null);
  const {
    mutateAsync: SubmitEditedValues,
    isPending,
    isSuccess,
  } = useUpdateInvoice();
  const handleSubmit = (values: Invoice) => {
    SubmitEditedValues({ updates: values });
  };
  useEffect(() => {
    if (isSuccess) {
      closeModal();
    }
  }, [isSuccess]);

  return (
    <Paper p="xl" shadow="sm" withBorder w={'100%'} pos="relative">
      <Formik<Invoice>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        innerRef={FormikRef}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <Stack w={'100%'}>
              <Title order={5} ta="center" mb={20} c="grey">
                Invoice Id: {values?.invoiceId}
              </Title>
              <Box>
                <FormikDatePickerField
                  name="invoiceParameters.invoiceDate"
                  label="Invoice Date"
                />
              </Box>
              <Group>
                <FormikDatePickerField name="fromDate" label="From Date" />
                <FormikDatePickerField name="toDate" label="To Date" />
              </Group>
              <DescriptionAndAmountTable />

              <SummaryTable />
              {values?.invoiceParameters?.refundArray?.length && (
                <>
                  <RefundTable />
                  <Box w={'50%'}>
                    <RefundTotalTable />
                  </Box>
                </>
              )}

              <Title order={4} mt={20} mb={10} m={'auto'}>
                Account Section
              </Title>
              <Group>
                <FormikNumberField
                  name="invoiceParameters.openingBalance"
                  label="Opening Balance"
                  extraProps={{ prefix: '£' }}
                />
                <FormikNumberField
                  name="invoiceParameters.closingBalance"
                  label="Closing Balance"
                  extraProps={{ prefix: '£' }}
                />
                <FormikNumberField
                  name="invoiceParameters.currentInvoiceCount"
                  label="Current Invoice Count"
                />
              </Group>

              <Group grow gap={'md'} mt={20}>
                <Button type="submit" loading={isPending}>
                  Submit
                </Button>
                <Button type="reset" variant="outline" disabled={isPending}>
                  Reset
                </Button>
              </Group>
            </Stack>
          </Form>
        )}
      </Formik>
      <LoadingOverlay
        visible={isPending}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
    </Paper>
  );
};

export default InvoiceEdit;
