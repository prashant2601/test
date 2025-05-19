import { Chip } from '@mui/material';
import { getChipColor } from '../utility/helperFuntions';

const AppChipComponent = ({ value }: { value: string | undefined }) => {
  if (!value) {
    return null;
  }
  const { backgroundColor, textColor } = getChipColor(value);
  return (
    <Chip
      label={value}
      style={{
        backgroundColor,
        color: textColor,
      }}
      size="small"
      variant="filled"
    />
  );
};

export default AppChipComponent;
