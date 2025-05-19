import { useCallback } from 'react';
import {
  Button,
  Card,
  Group,
  Title,
  Image,
  Grid,
  Stack,
  Center,
  Avatar,
  Box,
} from '@mantine/core';
import { Formik, Form } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import FormikInputField from '../../components/CoreUI/FormikFields/FormikInputField';
import FormikSelectField from '../../components/CoreUI/FormikFields/FormikSelectField';
import { userRoles } from '../admin/adminPanelSetting/usersAndRole/constants';
import FormikImageFileUpload from '../../components/CoreUI/FormikFields/FormikImageFileUpload';
import { useUpdateUser } from '../admin/adminPanelSetting/usersAndRole/hooks/useUpdateUser';
import * as Yup from 'yup';
import FormikPasswordField from '../../components/CoreUI/FormikFields/FormikPasswordField';
import { APPTabs } from '../../components/CoreUI/tabs/AppTabs';
import { getFileSrc } from '../../utility/helperFuntions';

const ResetPasswordvalidationSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords do not match.')
    .required('Confirm password is required'),
});

export default function UserProfile() {
  const { mutateAsync: UpdateUser, isPending: IsUpdatingUser } =
    useUpdateUser();
  const handleUpdate = useCallback((values) => {
    UpdateUser({ updates: [values] });
  }, []);
  const { user } = useAuth();
  const UserProfileFields = (
    <Formik
      initialValues={{
        userName: user?.userName,
        phone: '',
        email: user?.email,
        role: user?.role,
        profileImg: user?.profileImg,
        firstName: user?.firstName,
        lastName: user?.lastName,
        userId: user?.userId,
      }}
      onSubmit={handleUpdate}
    >
      {({ values }) => (
        <Form>
          <Stack p="lg">
            <Card shadow="sm" padding="lg">
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Card shadow="sm" padding="md">
                    <Stack align="center">
                      {values?.profileImg ? (
                        <Box style={{ boxShadow: 'initial' }}>
                          <Image
                            src={getFileSrc(values?.profileImg)}
                            alt="Profile Pic"
                            h={200}
                            w="auto"
                            fit="contain"
                            radius={'lg'}
                          />
                        </Box>
                      ) : (
                        <Avatar radius="xl" size={150} />
                      )}
                      <FormikImageFileUpload
                        label="Change Profile Image"
                        name="profileImg"
                        maxSize={3}
                      />
                    </Stack>
                  </Card>
                </Grid.Col>

                {/* User Details Section */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack>
                    <Group grow>
                      <FormikInputField
                        label="First Name"
                        name="firstName"
                        disabled
                      />

                      <FormikInputField
                        label="Last Name"
                        name="lastName"
                        disabled
                      />
                    </Group>
                    <FormikInputField label="Username" name="userName" />

                    <Group grow>
                      <FormikInputField label="Phone Number" name="phone" />

                      <FormikInputField label="Email Address" name="email" />
                    </Group>
                    <FormikSelectField
                      label="Current Role"
                      name="role"
                      disabled
                      data={userRoles}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
              <Center mt={20}>
                <Button type="submit" loading={IsUpdatingUser}>
                  Save Changes
                </Button>
              </Center>
            </Card>
          </Stack>
        </Form>
      )}
    </Formik>
  );
  const PassWordChangFields = (
    <Card p="xl" mt="xs">
      <Formik
        initialValues={{
          password: '',
          email: user?.email,
          userId: user?.userId,
          confirmPassword: '',
        }}
        onSubmit={handleUpdate}
        validationSchema={ResetPasswordvalidationSchema}
      >
        <Form>
          <Box m="auto" w="500px">
            <Stack>
              <FormikPasswordField name="password" label="Password" />

              <FormikPasswordField
                name="confirmPassword"
                label="Confirm Password"
              />
            </Stack>
            <Center mt="md">
              <Button type="submit" loading={IsUpdatingUser}>
                Change Password
              </Button>
            </Center>
          </Box>
        </Form>
      </Formik>
    </Card>
  );
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={2} mb="md">
        Your Profile
      </Title>
      <APPTabs
        tabs={[
          {
            label: 'Your Details',
            value: 'details',
            content: UserProfileFields,
          },
          {
            label: 'Change Password',
            value: 'password',
            content: PassWordChangFields,
          },
        ]}
      />
    </Card>
  );
}
