import {
  Menu,
  Text,
  Group,
  Avatar,
  Loader,
  ActionIcon,
  Image,
} from '@mantine/core';
import { IconSettings, IconLogout2, IconUserCircle } from '@tabler/icons-react';
import { useAuth } from '../../../hooks/useAuth';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../../hooks/auth/useLogOut';
interface UserInfoProps {
  image: string | undefined;
  name: string | undefined;
  email: string | undefined;
}

const UserInfo = ({ image, name, email }: UserInfoProps) => (
  <Group p="xs">
    <Avatar src={image} alt="it's me" />
    <div style={{ flex: 1 }}>
      <Text size="sm" fw={500}>
        {name}
      </Text>
      <Text c="dimmed" size="xs">
        {email}
      </Text>
    </div>
  </Group>
);

function UserMenu() {
  const { user } = useAuth();
  const { mutateAsync: LogOutUSer, isPending: isLoggingout } = useLogout();
  const navigate = useNavigate();
  const handleLogOut = useCallback(() => {
    LogOutUSer();
  }, []);
  const navigateToProfilePage = useCallback(() => {
    if (['admin', 'superAdmin']?.includes(user?.role)) navigate('/profile');
    else {
      navigate(`/${user?.role}/profile`);
    }
  }, []);
  return (
    <Menu shadow="md" width={300} withArrow offset={1} closeOnClickOutside>
      <Menu.Target>
        <ActionIcon
          variant={user?.profileImg ? `outline` : 'subtle'}
          size={'lg'}
          radius={'lg'}
        >
          {user?.profileImg ? (
            <Image
              src={user?.profileImg}
              alt="User profile"
              style={{ borderRadius: '50%', width: '40px', height: '40px' }}
            />
          ) : (
            <IconUserCircle stroke={2} />
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={navigateToProfilePage}>
          <UserInfo
            name={user?.userName}
            email={user?.email}
            image={user?.profileImg}
          />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconSettings size={14} />}
          onClick={navigateToProfilePage}
        >
          My Profile
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconLogout2 size={14} />}
          rightSection={
            isLoggingout ? <Loader size={'sm'} color="red" /> : null
          }
          onClick={handleLogOut}
          type="button"
          closeMenuOnClick={false}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
export default UserMenu;
