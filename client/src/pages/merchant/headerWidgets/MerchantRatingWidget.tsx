import { Rating, Text } from '@mantine/core';

const MerchantRatingWidget = () => {
  return (
    <>
      <Text size="sm" c="dimmed">
        Rating:
      </Text>
      <Rating defaultValue={4} readOnly fractions={2} size={'sm'} />
    </>
  );
};

export default MerchantRatingWidget;
