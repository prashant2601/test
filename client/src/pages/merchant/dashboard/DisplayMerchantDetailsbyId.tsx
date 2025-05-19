import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Image,
  Divider,
  Group,
  Skeleton,
  Avatar,
  Rating,
} from '@mantine/core';
import { useGetMerchantDetailsbyId } from '../../admin/merchants/hooks/useGetMerchantDetailsbyId';
import { formatMerchantAddress } from '../../../utility/helperFuntions';
import useGetRelevantMerchantID from '../hooks/useGetRelevantMerchantID';

const DisplayMerchantDetailsbyId = () => {
  const merchantId = useGetRelevantMerchantID();
  const { data, error, isLoading, isFetching } =
    useGetMerchantDetailsbyId(merchantId);
  if (isLoading || isFetching) {
    return (
      <Container size="lg" mt={30}>
        <Grid gutter="lg">
          {/* Left Side Skeleton */}
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group align={'center'}>
                <Skeleton height={150} width={150} circle />
              </Group>
              <Skeleton height={20} width="70%" mt="md" />
              <Skeleton height={20} width="50%" />
              <Skeleton height={20} width="70%" />
              <Skeleton height={20} width="60%" />
            </Card>
          </Grid.Col>

          {/* Right Side Skeleton */}
          <Grid.Col span={{ xs: 12, md: 8 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3}>
                <Skeleton width={150} height={30} />
              </Title>
              <Divider my="xs" />
              <Skeleton width="80%" height={20} />
              <Skeleton width="70%" height={20} />
              <Skeleton width="60%" height={20} />
              <Divider my="xs" />
              <Title order={4}>
                <Skeleton width={100} height={25} />
              </Title>
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <Skeleton height={20} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Skeleton height={20} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Skeleton height={20} />
                </Grid.Col>
              </Grid>
              <Divider my="xs" />
              <Title order={4}>
                <Skeleton width={100} height={25} />
              </Title>
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <Skeleton height={20} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Skeleton height={20} />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Skeleton height={20} />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    );
  }

  let merchant = data?.data?.merchant;
  if (!merchant) {
    return (
      <Container size="lg" mt={30}>
        <Text
          styles={{ root: { textAlign: 'center', fontWeight: 500 } }}
          size="xl"
        >
          {error?.response?.data?.message ?? 'Merchant details not found. '}
        </Text>
      </Container>
    );
  }
  return (
    <Container size="xl" mt={30} className="fade-in">
      <Grid gutter="lg">
        {/* Left Side: Merchant Info and Image */}
        <Grid.Col span={{ xs: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group align="center">
              {merchant.logoImg ? (
                <Image
                  src={`${merchant.logoImg}`}
                  alt={merchant.merchantName}
                  radius="md"
                  width={150}
                  height={150}
                />
              ) : (
                <Avatar size={150} radius="md" color="blue" />
              )}
            </Group>
            <Text size="xl" fw={500} mt="md">
              {merchant.merchantName}
            </Text>
            <Text c={{ xs: 'dimmed', sm: 'blue' }}>
              {merchant.merchantEmail}
            </Text>
            <Text c="dimmed">{merchant.merchantMobile}</Text>
            <Text c="dimmed">
              {formatMerchantAddress(merchant.merchantAddress)}
            </Text>
          </Card>
        </Grid.Col>

        {/* Right Side: Merchant Details */}
        <Grid.Col span={{ xs: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3}>Merchant Information</Title>
            <Divider my="xs" />
            <Text>
              <strong>Merchant ID:</strong> {merchant.merchantId}
            </Text>
            <Text>
              <strong>Zone:</strong> {merchant.zone}
            </Text>
            <Text>
              <strong>Registration Date:</strong>{' '}
              {new Date(merchant.registrationDate).toLocaleDateString()}
            </Text>
            <Text>
              <strong>Registration Method:</strong>{' '}
              {merchant.registrationMethod}
            </Text>
            <Text>
              <strong>Total Orders:</strong> {merchant.totalOrders}
            </Text>
            <Text>
              <strong>Tax Rate:</strong> {merchant.taxRate}%
            </Text>
            <Group>
              <strong>Rating:</strong> :{' '}
              <Rating defaultValue={merchant?.rating} size={'lg'} readOnly />
            </Group>

            <Divider my="xs" />

            <Title order={4}>Commissions</Title>
            <Grid gutter="md">
              <Grid.Col span={4}>
                <Text>
                  <strong>Delivery Orders:</strong>{' '}
                  {merchant.deliveryOrdersComission}%
                </Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text>
                  <strong>Collection Orders:</strong>{' '}
                  {merchant.collectionOrdersComission}%
                </Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text>
                  <strong>Eat-In Orders:</strong> {merchant.eatInComission}%
                </Text>
              </Grid.Col>
            </Grid>

            <Divider my="xs" />

            <Title order={4}>Fees & Charges</Title>
            <Grid gutter="md">
              <Grid.Col span={4}>
                <Text>
                  <strong>Service Fee:</strong>{' '}
                  {merchant.serviceFeeApplicable
                    ? 'Applicable'
                    : 'Not Applicable'}
                </Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text>
                  <strong>Delivery Charge:</strong>{' '}
                  {merchant.deliveryChargeApplicable
                    ? 'Applicable'
                    : 'Not Applicable'}
                </Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text>
                  <strong>Driver Tip:</strong>{' '}
                  {merchant.driverTipApplicable
                    ? 'Applicable'
                    : 'Not Applicable'}
                </Text>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default DisplayMerchantDetailsbyId;
