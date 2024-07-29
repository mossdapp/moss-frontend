import { useLocalStorage } from 'react-use';
import { GlobalConfig } from '@/constants';
import useSWR from 'swr';
import { provider } from '@/core/account';

interface IAccount {
  contractAddress: string;
  publicKey: string;
}

export const useAccount = () => {
  const [data] = useLocalStorage<{ account: IAccount } | null>(GlobalConfig.mossWalletKey, null);
  const account = data?.account || {
    contractAddress: '',
    publicKey: ''
  };
  return { account };
};

export const useAccountABI = (address: string) => {
  const { data } = useSWR(['abi', address], () => provider.getClassAt(address));

  return {
    abi: data?.abi
  };
};
