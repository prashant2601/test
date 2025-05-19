import { Suspense, useCallback } from 'react';
import {
  Button,
  Paper,
  Title,
  Container,
  Space,
  Alert,
  Box,
  Anchor,
  Image,
  Skeleton,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useLogin } from '../hooks/auth/useLogin';
import Static_Logo from '../assets/Static_Logo.jpeg';
import { useNavigate } from 'react-router-dom';
import FormikInputField from '../components/CoreUI/FormikFields/FormikInputField';
import FormikPasswordField from '../components/CoreUI/FormikFields/FormikPasswordField';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const initialValues = {
  query: '',
  password: '',
};
interface LoginFormInterface {
  query: string;
  password: string;
}

const validationSchema = Yup.object({
  query: Yup.string().required('Email/Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage = () => {
  const { mutate, isPending, error } = useLogin();
  const navigate = useNavigate();
  const handleNavigation = useCallback(() => {
    navigate('/auth/forgot-password');
  }, []);
  const handleSubmit = useCallback((values: LoginFormInterface) => {
    mutate(values);
  }, []);

  return (
    <Container size="xs" my="xl">
      <Paper
        p="lg"
        shadow="sm"
        withBorder
        pos={'relative'}
        styles={{
          root: {
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 25px rgba(0, 0, 0, 0.2)',
            },
          },
        }}
      >
        <Stack align="center">
          <Suspense fallback={<Skeleton height={200} width={200} />}>
            <Image h={120} w="auto" fit="contain" src={Static_Logo} />
          </Suspense>
          <Title order={4} mt="0">
            Welcome to Swishr
          </Title>
        </Stack>

        <Space h="md" />

        <Box style={{ display: 'flex', justifyContent: 'center' }}>
          <Title order={3}>Login</Title>
        </Box>
        {/* <DotLottieReact
          // src="https://lottie.host/49a89b29-9317-4f12-a0c2-aa763d86a91e/M2ldepdih6.lottie"
          src="https://lottie.host/9d5e542e-dc59-4bec-bc28-04fb0618b8df/W7IfTXdENA.lottie"
          loop
          autoplay
          renderConfig={{ autoResize: true }}
        /> */}

        <Formik<LoginFormInterface>
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          initialValues={initialValues}
        >
          {() => (
            <Form>
              <FormikInputField name={'query'} label="Username/Email" />
              <Space h="md" />
              <FormikPasswordField label="Password" name={'password'} />
              <Box
                mt="xs"
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Anchor onClick={handleNavigation} size="sm">
                  Forgot Password?
                </Anchor>
              </Box>

              <Space h="md" />
              {error && (
                <Alert color="red" mb={10}>
                  {error?.response?.data?.message ?? error?.message}
                </Alert>
              )}

              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <Button type="submit" size="md" w={200} loading={isPending}>
                  Login
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
        <LoadingOverlay visible={isPending} />
      </Paper>
    </Container>
  );
};

export default LoginPage;
