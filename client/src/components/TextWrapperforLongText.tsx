import { Box } from '@mantine/core';
interface WrapperforLongTextTypes {
  children: string;
  maxWidth: number;
}
const WrapperforLongText = (props: WrapperforLongTextTypes) => {
  const { children, maxWidth } = props;
  return (
    <Box
      style={{
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        maxWidth: `${maxWidth}px`,
        overflowWrap: 'break-word',
      }}
    >
      {children}
    </Box>
  );
};

export default WrapperforLongText;
