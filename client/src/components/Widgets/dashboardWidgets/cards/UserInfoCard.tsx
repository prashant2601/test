import {
  Avatar,
  Badge,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Flex,
  Skeleton,
} from '@mantine/core';

interface UserInfoIconsProps {
  cardLabel: string | undefined;
  Name: string | undefined;
  Id: { label: string; value: string };
  AnotherId?: { label: string; value: number };
  totalNumberLabel: string;
  totalNumber: number | undefined | string;
  anotherTotalNumber?: number;
  anotherTotalNumberLabel?: string;
  profileImg: string | undefined;
  isLoadingData?: boolean;
  noDataAvailable?: boolean;
}

function UserInfoCard({
  cardLabel,
  Name,
  Id,
  AnotherId,
  totalNumber,
  profileImg,
  totalNumberLabel,
  anotherTotalNumber,
  anotherTotalNumberLabel,
  isLoadingData,
  noDataAvailable,
}: UserInfoIconsProps) {
  if (noDataAvailable) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Text c="gray" fw={500} fz="lg" tt="capitalize">
            No data available
          </Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="xs" align="center">
        {isLoadingData ? (
          <Skeleton height={16} width={180} />
        ) : (
          <Text
            c="blue"
            fw={600}
            fz="sm"
            tt="uppercase"
            styles={{ root: { textAlign: 'center' } }}
          >
            {cardLabel}
          </Text>
        )}

        {isLoadingData ? (
          <Skeleton height={100} width={100} radius={100} />
        ) : (
          <Avatar
            src={
              profileImg ??
              'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png'
            }
            size={100}
            radius={100}
          />
        )}

        {isLoadingData ? (
          <Skeleton height={28} width={150} />
        ) : (
          <Text fz="xl" fw={700} mt="xs">
            {Name}
          </Text>
        )}

        <Flex gap="xl" justify="center">
          <Stack gap={2} align="center">
            {isLoadingData ? (
              <Skeleton height={16} width={80} />
            ) : (
              <Text c="dimmed" fw={500} fz="xs">
                {Id.label}
              </Text>
            )}
            {isLoadingData ? (
              <Skeleton height={24} width={60} radius="md" />
            ) : (
              <Badge size="md" color="blue">
                {Id.value}
              </Badge>
            )}
          </Stack>

          {AnotherId && (
            <Stack gap={2} align="center">
              {isLoadingData ? (
                <Skeleton height={16} width={80} />
              ) : (
                <Text c="dimmed" fw={500} fz="xs">
                  {AnotherId.label}
                </Text>
              )}
              {isLoadingData ? (
                <Skeleton height={24} width={60} radius="md" />
              ) : (
                <Badge size="md" color="grape">
                  {AnotherId.value}
                </Badge>
              )}
            </Stack>
          )}
        </Flex>
      </Stack>

      <Divider my="md" />

      <Stack gap="md" align="center">
        <Group>
          {isLoadingData ? (
            <>
              <Skeleton height={16} width={100} />
              <Skeleton height={32} width={60} radius="md" />
            </>
          ) : (
            <>
              <Text c="dimmed" fw={500} fz="sm">
                {totalNumberLabel}
              </Text>
              <Badge size="lg" color="teal" hidden={!totalNumber}>
                {totalNumber}
              </Badge>
            </>
          )}
        </Group>

        {anotherTotalNumber && anotherTotalNumberLabel && (
          <Group>
            {isLoadingData ? (
              <>
                <Skeleton height={16} width={100} />
                <Skeleton height={32} width={60} radius="md" />
              </>
            ) : (
              <>
                <Text c="dimmed" fw={500} fz="sm">
                  {anotherTotalNumberLabel}
                </Text>
                <Badge size="lg" color="violet" hidden={!anotherTotalNumber}>
                  {anotherTotalNumber}
                </Badge>
              </>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

export default UserInfoCard;
