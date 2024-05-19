import { ArrowRightLeft, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { provider } from '@/core/account';
import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { shortenAddress } from '@/utils/common';
import { GlobalConfig } from '@/constants';

interface StoreState {
  transactions: string[];
  set: (v: string[]) => void;
  push: (v: string) => void;
}

export const useTransactionStore = create<StoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      set: (v: string[]) => set({ transactions: v }),
      push: (v: string) => set({ transactions: [...get().transactions, v] })
    }),
    {
      name: 'transactions-storage' // name of the item in the storage (must be unique)
    }
  )
);

interface PendingState {
  pendings: string[];
  setPendings: (v: string[]) => void;
  pushPendings: (v: string) => void;
}

export const usePendingStore = create<PendingState>()((set, get) => ({
  pendings: [],
  setPendings: (v: string[]) => set({ pendings: v }),
  pushPendings: (v: string) => set({ pendings: [...get().pendings, v] })
}));

export const PendingTransactions = () => {
  const { transactions, set: setTransactions } = useTransactionStore();
  const { pendings, setPendings, pushPendings } = usePendingStore();

  const waitForTransaction = async (hash: any) => {
    try {
      const recipient = await provider.waitForTransaction(hash);
      console.log(recipient, 'rr');
      if ((recipient as any)?.execution_status === 'SUCCEEDED') {
        toast.success('Transaction has been confirmed');
      } else {
        toast.error('Transaction has failed');
      }
    } catch (error) {
      toast.error('An error occurred while waiting for the transaction');
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const processTransactions = async () => {
        for (const hash of transactions) {
          if (pendings.includes(hash)) {
            continue;
          }
          await waitForTransaction(hash);
          pushPendings(hash);
          // 一旦交易确认，从数组中移除该hash
          setTransactions(transactions.filter((t) => t !== hash));
        }
      };

      processTransactions();
    }
  }, [transactions]);

  const openScan = (hash: string) => {
    window.open(GlobalConfig.scanUrl + hash, '_blank');
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger>
        <div className={'absolute top-0 left-0 cursor-pointer'}>
          <ArrowRightLeft className={'text-primary/80'} size={20} />
          <span className={'absolute bottom-[-5px] right-[-23px] text-xs text-white bg-red-500 rounded-full px-2'}>
            {transactions.length}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent side={'bottom'}>
        <div className={'text-lg font-bold'}>Pending Transactions</div>
        <div className={'pt-3 space-y-4'}>
          {transactions.map((hash, i) => {
            return (
              <div key={i} className={'flex justify-between items-center'}>
                <div className={'text-gray-400 text-sm'}>{shortenAddress(hash)}</div>
                <div>
                  <ExternalLink className={'text-gray-400 cursor-pointer'} onClick={() => openScan(hash)} size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
