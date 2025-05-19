import { Card, Text, Progress, Group, Badge } from '@mantine/core';

interface PerformanceCardProps {
  score: number;
}

export function MerchantPerformanceScore({ score }: PerformanceCardProps) {
  const getBadgeColor = () => {
    if (score >= 85) return 'teal';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getBadgeLabel = () => {
    if (score >= 85) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Card w={360} withBorder px={10} py={7} mt={5}>
      <Group align="center" justify="space-between">
        <Text size="sm" c="dimmed">
          Performance Score: {score}%
        </Text>
        <Badge size="xs" color={getBadgeColor()} variant="dot">
          {getBadgeLabel()}
        </Badge>
      </Group>
      <Progress
        value={score}
        size="sm"
        transitionDuration={200}
        aria-label="progress"
        mt={5}
        color={getBadgeColor()}
      />
    </Card>
  );
}
