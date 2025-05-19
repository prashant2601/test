import { Badge, Group } from '@mantine/core';
import { ReactNode } from 'react';

interface BadgeItem {
  label: string;
  value: string | number;
  color?: string; // Optional custom color
  icon?: ReactNode; // Optional icon (left side)
}

interface BadgeGroupProps {
  badges: BadgeItem[];
}

export const BadgeGroup = ({ badges }: BadgeGroupProps) => {
  return (
    <Group>
      {badges.map((badge, index) => (
        <Badge
          key={`${badge.label}-${index}`}
          size="lg"
          styles={{ label: { textTransform: 'none' } }}
        >
          {`${badge.label}: ${badge.value}`}
        </Badge>
      ))}
    </Group>
  );
};
