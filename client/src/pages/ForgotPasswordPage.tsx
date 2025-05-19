import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Space,
  Box,
  Anchor,
  Alert,
} from '@mantine/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useForgotPassword } from '../hooks/auth/useForgotPassword';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const initialValues = {
  email: '',
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
  const { mutate, isSuccess, data } = useForgotPassword();
  const navigate = useNavigate();

  const handleNavigation = useCallback(() => {
    navigate('/login');
  }, []);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      mutate(values);
    },
  });

  return (
    <Container size="xs" mt="xl">
      {isSuccess && data?.data?.success ? (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          title="Success"
          color="green"
          styles={{ title: { fontSize: 18 } }}
        >
          Password Reset Link Sent Successfuly. You can close this tab.
        </Alert>
      ) : (
        <Paper
          p="xl"
          shadow="xs"
          withBorder
          styles={{
            root: {
              marginTop: 100,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              transition: 'box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 25px rgba(0, 0, 0, 0.2)',
              },
            },
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Title order={3}>Forgot your password?</Title>
            <Text mt="sm" size="sm">
              Please enter the email address associated with your account and we
              will email you a link to reset your password.
            </Text>
          </Box>

          <Space h="lg" />

          <form onSubmit={formik.handleSubmit}>
            <TextInput
              placeholder="Email address (Required)"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && formik.errors.email}
              required
            />

            <Space h="md" />

            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="submit" size="md" w={200}>
                Reset Password
              </Button>
            </Box>

            <Box mt="md" style={{ display: 'flex', justifyContent: 'center' }}>
              <Anchor onClick={handleNavigation} size="sm">
                Back
              </Anchor>
            </Box>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default ForgotPasswordPage;
