import { Card, Text, Stack, Box, Group } from '@mantine/core';

type DataItem = {
  label: string;
  value: number;
};

type CommissionCardProps = {
  mainLabel: string;
  section1Label: string;
  section2Label: string;
  section3Label?: string;
  section1: DataItem[];
  section2: DataItem[];
  section3?: DataItem[];
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  iconBgColor: string;
  labelMap: Record<string, string>;
};

const CardWithSections: React.FC<CommissionCardProps> = ({
  mainLabel,
  section1Label,
  section2Label,
  section1,
  section3,
  section3Label,
  section2,
  icon: IconComponent,
  bgColor,
  iconColor,
  iconBgColor,
  labelMap,
}) => {
  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="md"
      style={{ backgroundColor: bgColor }}
    >
      <Stack align="center" gap={'xs'}>
        <div
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
        </div>
        <Text fw={'bold'} c={iconColor} size="sm">
          {mainLabel}
        </Text>
      </Stack>

      {/* Section 1 */}
      <Box mt={10}>
        <fieldset
          style={{
            border: `1px solid ${iconColor}`,
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <legend
            style={{ fontSize: '12px', fontWeight: 'bold', color: iconColor }}
          >
            {section1Label}
          </legend>
          {section1.map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Text size="sm" c={iconColor}>
                {labelMap[item.label] || item.label}
              </Text>
              <Text size="sm" c={iconColor} fw={'bold'}>
                {item.value}
              </Text>
            </div>
          ))}
        </fieldset>
      </Box>

      {/* Section 2 */}
      <Box mt={10}>
        <fieldset
          style={{
            border: `1px solid ${iconColor}`,
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <legend
            style={{ fontSize: '12px', fontWeight: 'bold', color: iconColor }}
          >
            {section2Label}
          </legend>
          {section2.map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Text size="sm" c={iconColor}>
                {labelMap[item.label] || item.label}
              </Text>
              <Text size="sm" c={iconColor} fw={'bold'}>
                {item.value}
              </Text>
            </div>
          ))}
        </fieldset>
      </Box>
      {/* Section 3 */}
      {section3 && (
        <Box mt={10}>
          <fieldset
            style={{
              border: `1px solid ${iconColor}`,
              borderRadius: '8px',
              padding: '10px',
            }}
          >
            <legend
              style={{ fontSize: '12px', fontWeight: 'bold', color: iconColor }}
            >
              {section3Label}
            </legend>
            {section3.map((item) => (
              <div
                key={item.label}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Text size="sm" c={iconColor}>
                  {labelMap[item.label] || item.label}
                </Text>
                <Text size="sm" c={iconColor} fw={'bold'}>
                  {item.value}
                </Text>
              </div>
            ))}
          </fieldset>
        </Box>
      )}
    </Card>
  );
};

export default CardWithSections;
