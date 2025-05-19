import { useState, useEffect, useRef } from 'react';
import { TextInput, Radio, Button, Table, Group, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import './style.css';
import ApiHelpers from '../../api/ApiHelpers';

interface Customer {
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerArea: string;
  customerPost: number | null | string;
  customerEmail: string;
  customerMobile: string;
  serviceFee: boolean;
  driverTip: boolean;
  deliveryCharge: boolean;
  deliveryOrdersComission: number;
  collectionOrdersComission: number;
  eatInComission: number;
  logoImg: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoImg, setLogoImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    initialValues: {
      customerName: '',
      customerAddress: '',
      customerArea: '',
      customerPost: null,
      customerEmail: '',
      customerMobile: '',
      serviceFee: true,
      driverTip: false,
      deliveryCharge: false,
      deliveryOrdersComission: 0,
      collectionOrdersComission: 0,
      eatInComission: 0,
    },
  });

  const formEdit = useForm({
    initialValues: {
      customerName: '',
      customerAddress: '',
      customerArea: '',
      customerPost: null,
      customerEmail: '',
      customerMobile: '',
      serviceFee: true,
      driverTip: false,
      deliveryCharge: false,
      deliveryOrdersComission: 0,
      collectionOrdersComission: 0,
      eatInComission: 0,
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await ApiHelpers.GET(
        '/api/customer/getAllCustomerDetails'
      );

      if (response.status !== 200) throw new Error('Failed to fetch customers');

      setCustomers(response.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch customers',
        color: 'red',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setLogoImg(reader.result as string); // Store Base64 string
    };
  };

  const handleSubmit = async (values: typeof form.values) => {
    const obj: any = {
      customerName: values.customerName,
      customerAddress: values.customerAddress,
      customerArea: values.customerArea,
      customerPost: values.customerPost,
      customerEmail: values.customerEmail,
      customerMobile: values.customerMobile,
      serviceFee: values.serviceFee,
      driverTip: values.driverTip,
      deliveryCharge: values.deliveryCharge,
      deliveryOrdersComission: values.deliveryOrdersComission,
      collectionOrdersComission: values.collectionOrdersComission,
      eatInComission: values.eatInComission,
      img: logoImg,
    };

    try {
      const response = await ApiHelpers.POST('/api/customer/add-customer', obj);
      if (response.status !== 200) throw new Error('Failed to add customer');

      await fetchCustomers();
      form.reset();
      setLogoImg(null);
      notifications.show({
        title: 'Success',
        message: 'Customer added successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add customer',
        color: 'red',
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    formEdit.setValues({
      customerName: customer.customerName || '',
      customerAddress: customer.customerAddress || '',
      customerArea: customer.customerArea || '',
      customerPost: customer.customerPost || null,
      customerEmail: customer.customerEmail || '',
      customerMobile: customer.customerMobile || '',
      serviceFee: customer.serviceFee || false,
      driverTip: customer.driverTip || false,
      deliveryCharge: customer.deliveryCharge || false,
      deliveryOrdersComission: customer.deliveryOrdersComission || 0,
      collectionOrdersComission: customer.collectionOrdersComission || 0,
      eatInComission: customer.eatInComission || 0,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (values: typeof formEdit.values) => {
    if (!editingCustomer) return;
    try {
      const obj: any = {
        customerId: editingCustomer.customerId,
        customerName: values.customerName,
        customerAddress: values.customerAddress,
        customerArea: values.customerArea,
        customerPost: values.customerPost,
        customerEmail: values.customerEmail,
        customerMobile: values.customerMobile,
        serviceFee: values.serviceFee,
        driverTip: values.driverTip,
        deliveryCharge: values.deliveryCharge,
        deliveryOrdersComission: values.deliveryOrdersComission,
        collectionOrdersComission: values.collectionOrdersComission,
        eatInComission: values.eatInComission,
        img: logoImg,
      };
      const response = await ApiHelpers.PUT(
        `/api/customer/edit-customer/${editingCustomer.customerId}`,
        obj
      );
      if (response.status !== 200) throw new Error('Failed to update customer');
      await fetchCustomers();
      formEdit.reset();
      setLogoImg(null);
      setIsModalOpen(false);
      setEditingCustomer(null);
      notifications.show({
        title: 'Success',
        message: 'Customer updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update customer',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await ApiHelpers.DELETE(
        `/api/customer/delete-customer/${id}`
      );
      if (response.status !== 200) throw new Error('Failed to delete customer');
      await fetchCustomers();
      notifications.show({
        title: 'Success',
        message: 'Customer deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete customer',
        color: 'red',
      });
    }
  };

  return (
    <div className="p-4 space-y-8">
      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
        <TextInput
          label="Customer Name"
          placeholder="Enter customer name"
          required
          {...form.getInputProps('customerName')}
        />
        <TextInput
          label="Customer Address"
          placeholder="Enter customer address"
          required
          {...form.getInputProps('customerAddress')}
        />
        <TextInput
          label="Customer Area"
          placeholder="Enter customer area"
          required
          {...form.getInputProps('customerArea')}
        />
        <TextInput
          label="Customer Post Code"
          placeholder="Enter customer post code"
          required
          {...form.getInputProps('customerPost')}
        />
        <TextInput
          label="Customer Email"
          placeholder="Enter customer email"
          required
          {...form.getInputProps('customerEmail')}
        />
        <TextInput
          label="Customer Mobile"
          placeholder="Enter customer mobile"
          required
          {...form.getInputProps('customerMobile')}
        />
        <TextInput
          label="Delivery Orders Commission"
          placeholder="Enter delivery orders commission"
          type="number"
          required
          {...form.getInputProps('deliveryOrdersComission')}
        />
        <TextInput
          label="Collection Orders Commission"
          placeholder="Enter collection orders commission"
          type="number"
          required
          {...form.getInputProps('collectionOrdersComission')}
        />
        <TextInput
          label="Eat-In Commission"
          placeholder="Enter eat-in commission"
          type="number"
          required
          {...form.getInputProps('eatInComission')}
        />

        <div>
          <label>Upload Logo</label>
          <input type="file" onChange={handleFileUpload} ref={fileInputRef} />
        </div>

        <Radio.Group
          label="Service Fee Applicable"
          {...form.getInputProps('serviceFee')}
        >
          <Group mt="xs">
            <Radio value={'true'} label="Yes" />
            <Radio value={'false'} label="No" />
          </Group>
        </Radio.Group>
        <Radio.Group
          label="Driver Tip Applicable"
          {...form.getInputProps('driverTip')}
        >
          <Group mt="xs">
            <Radio value={'true'} label="Yes" />
            <Radio value={'false'} label="No" />
          </Group>
        </Radio.Group>
        <Radio.Group
          label="Delivery Charge Applicable"
          {...form.getInputProps('deliveryCharge')}
        >
          <Group mt="xs">
            <Radio value={'true'} label="Yes" />
            <Radio value={'false'} label="No" />
          </Group>
        </Radio.Group>
        <Button type="submit">Add Customer</Button>
      </form>

      <Table>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Name</th>
            <th>Address</th>
            <th>Area</th>
            <th>Post Code</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Logo</th>
            <th>Delivery Orders Commission</th>
            <th>Collection Orders Commission</th>
            <th>Eat-In Commission</th>
            <th>Service Fee (Is Applicable)</th>
            <th>Driver Tip (Is Applicable)</th>
            <th>Delivery Charge (Is Applicable)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.customerId}>
              <td>{index + 1}</td>
              <td>{customer.customerName}</td>
              <td>{customer.customerAddress}</td>
              <td>{customer.customerArea}</td>
              <td>{customer.customerPost}</td>
              <td>{customer.customerEmail}</td>
              <td>{customer.customerMobile}</td>
              <td>
                {customer?.logoImg && (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${customer?.logoImg}`}
                    alt="Logo"
                    width="50"
                  />
                )}
              </td>
              <td>{customer.deliveryOrdersComission}</td>
              <td>{customer.collectionOrdersComission}</td>
              <td>{customer.eatInComission}</td>
              <td>{customer.serviceFee ? 'Yes' : 'No'}</td>
              <td>{customer.driverTip ? 'Yes' : 'No'}</td>
              <td>{customer.deliveryCharge ? 'Yes' : 'No'}</td>
              <td>
                <Group>
                  <Button
                    onClick={() => handleEdit(customer)}
                    variant="outline"
                    size="xs"
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(customer.customerId)}
                    variant="outline"
                    color="red"
                    size="xs"
                  >
                    <IconTrash size={16} />
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Customer"
      >
        <form onSubmit={formEdit.onSubmit(handleUpdate)} className="space-y-4">
          <TextInput
            label="Customer Name"
            placeholder="Enter customer name"
            required
            {...formEdit.getInputProps('customerName')}
          />
          <TextInput
            label="Customer Address"
            placeholder="Enter customer address"
            required
            {...formEdit.getInputProps('customerAddress')}
          />
          <TextInput
            label="Customer Area"
            placeholder="Enter customer area"
            required
            {...formEdit.getInputProps('customerArea')}
          />
          <TextInput
            label="Customer Post Code"
            placeholder="Enter customer post code"
            required
            {...formEdit.getInputProps('customerPost')}
          />
          <TextInput
            label="Customer Email"
            placeholder="Enter customer email"
            required
            {...formEdit.getInputProps('customerEmail')}
          />
          <TextInput
            label="Customer Mobile"
            placeholder="Enter customer mobile"
            required
            {...formEdit.getInputProps('customerMobile')}
          />
          <TextInput
            label="Delivery Orders Commission"
            placeholder="Enter delivery orders commission"
            type="number"
            required
            {...formEdit.getInputProps('deliveryOrdersComission')}
          />
          <TextInput
            label="Collection Orders Commission"
            placeholder="Enter collection orders commission"
            type="number"
            required
            {...formEdit.getInputProps('collectionOrdersComission')}
          />
          <TextInput
            label="Eat-In Commission"
            placeholder="Enter eat-in commission"
            type="number"
            required
            {...formEdit.getInputProps('eatInComission')}
          />

          <div>
            <label>Upload Logo</label>
            <input type="file" onChange={handleFileUpload} ref={fileInputRef} />
          </div>

          <Radio.Group
            label="Service Fee Applicable"
            {...formEdit.getInputProps('serviceFee')}
          >
            <Group mt="xs">
              <Radio value={'true'} label="Yes" />
              <Radio value={'false'} label="No" />
            </Group>
          </Radio.Group>
          <Radio.Group
            label="Driver Tip Applicable"
            {...formEdit.getInputProps('driverTip')}
          >
            <Group mt="xs">
              <Radio value={'true'} label="Yes" />
              <Radio value={'false'} label="No" />
            </Group>
          </Radio.Group>
          <Radio.Group
            label="Delivery Charge Applicable"
            {...formEdit.getInputProps('deliveryCharge')}
          >
            <Group mt="xs">
              <Radio value={'true'} label="Yes" />
              <Radio value={'false'} label="No" />
            </Group>
          </Radio.Group>
          <Button type="submit">Update Customer</Button>
        </form>
      </Modal>
    </div>
  );
}
