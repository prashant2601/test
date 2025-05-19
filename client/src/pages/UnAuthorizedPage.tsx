import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { UserRoleTypes } from './admin/adminPanelSetting/usersAndRole/constants';

const UnauthorizedPage = ({ role }: { role: UserRoleTypes }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(`/${role}/dashboard`);
  };

  return (
    <Container
      size="xs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Title order={1} style={{ fontWeight: 700, marginBottom: 20 }}>
        Unauthorized Access
      </Title>
      <Text size="lg" c="dimmed" style={{ marginBottom: 30 }}>
        You don't have permission to view this page. Please contact the
        administrator if you believe this is an error.
      </Text>
      <Group>
        <Button onClick={handleGoHome} variant="outline" size="md">
          Go back to Dashboard
        </Button>
      </Group>
    </Container>
  );
};

export default UnauthorizedPage;
