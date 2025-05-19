import { Card, Text, Stack, Box, Loader } from '@mantine/core';

type DataItem = {
  label: string;
  value: number | string;
};
type CommissionCardProps = {
  mainLabel: string;
  data: DataItem[];
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  iconBgColor: string;
  labelMap: Record<string, string>;
  loadingData?: boolean;
};
const CardWithIconTitleInfo: React.FC<CommissionCardProps> = ({
  mainLabel,
  data,
  icon: IconComponent,
  bgColor,
  iconColor,
  iconBgColor,
  labelMap,
  loadingData = false,
}) => {
  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="md"
      style={{
        transition: 'transform 0.3s, box-shadow 0.3s',
        backgroundColor: bgColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.01)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
      }}
    >
      <Stack align="center">
        <Box
          style={{
            backgroundColor: iconBgColor,
            borderRadius: '50%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle, ${bgColor} 40%, ${iconBgColor} 100%)`,
          }}
        >
          <IconComponent size={24} color={iconColor} />
        </Box>
        <Box>
          <Text
            fw={'bold'}
            c={iconColor}
            size="sm"
            styles={{ root: { textWrap: 'wrap', textAlign: 'center' } }}
          >
            {mainLabel}
          </Text>
        </Box>
      </Stack>
      <Box mt={10}>
        {data.map((item) => (
          <Box
            key={item.label}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Text size="sm" c={iconColor}>
              {labelMap[item.label] || item.label}
            </Text>
            {loadingData ? (
              <Loader type="dots" color={iconBgColor} size={'sm'} />
            ) : (
              <Text size="sm" c={iconColor} fw="bold">
                £ {item.value}
              </Text>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
};
export default CardWithIconTitleInfo;
