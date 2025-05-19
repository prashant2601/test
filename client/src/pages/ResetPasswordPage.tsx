import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Formik, Form, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Text,
  Alert,
  Container,
  Paper,
  Title,
  Space,
  Box,
  Loader,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useResetPassword } from '../hooks/auth/useResetPassword';
import { useValidateResetPasswordToken } from '../hooks/auth/useValidateResetToken';
import FormikPasswordField from '../components/CoreUI/FormikFields/FormikPasswordField';
interface ResetPageForm {
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
}
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const formikRef = useRef<FormikProps<ResetPageForm>>(null);
  const {
    mutate: validateToken,
    isPending: isValidatingToken,
    isSuccess: isSuccessInValidatingToken,
    data: ValidatedTokenAPiData,
  } = useValidateResetPasswordToken();

  const {
    mutate: resetPassword,
    isSuccess,
    isPending: isResettingPassword,
  } = useResetPassword();

  useEffect(() => {
    if (token) {
      validateToken({ token });
    }
  }, [token, validateToken]);
  const validationSchema = Yup.object().shape({
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords do not match.')
      .required('Confirm password is required'),
  });

  const handleSubmit = (values: ResetPageForm) => {
    if (token) {
      resetPassword({ password: values?.password, token });
    }
  };

  let content;

  if (isValidatingToken) {
    content = (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '150px',
        }}
      >
        <Loader size="lg" />
      </Box>
    );
  } else if (!token || !isSuccessInValidatingToken) {
    content = (
      <Alert
        icon={<IconAlertTriangle size="1rem" />}
        title="Error"
        color="red"
        styles={{ title: { fontSize: 18 } }}
      >
        Invalid or expired token. Please check your email link or request a new
        one.
      </Alert>
    );
  } else if (isSuccess) {
    content = (
      <Text c="green" size="lg">
        Password reset successful! Redirecting to login...
      </Text>
    );
  } else if (isSuccessInValidatingToken) {
    content = (
      <Formik<ResetPageForm>
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formikRef}
      >
        {({ handleChange, values, handleBlur, touched, errors }) => (
          <Form>
            <Space h={'md'} />
            <FormikPasswordField name={'password'} label="Enter new password" />
            <FormikPasswordField
              name={'confirmPassword'}
              label="Confirm Password"
            />

            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                size="md"
                w={200}
                loading={isResettingPassword}
                mt="lg"
              >
                Reset Password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    );
  }

  return (
    <Container size="xs" mt="xl">
      <Paper p="xl" shadow="xs" withBorder>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Title order={3} c={'gray'}>
            Reset your password
          </Title>
        </Box>
        <Space h="lg" />
        {content}
        <Space h="lg" />
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
