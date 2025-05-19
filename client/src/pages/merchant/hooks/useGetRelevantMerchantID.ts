export default function useGetRelevantMerchantID() {
  return (
    localStorage?.getItem('loggedInMerchantId') ??
    localStorage.getItem('AdminOnMerchantProfile') ??
    ''
  );
}
