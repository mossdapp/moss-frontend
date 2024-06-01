import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export function Loading({ color }: { color?: string }) {
  return (
    <div className="absolute z-[99] bg-background/80 background-blur-sm left-0 right-0 top-0 bottom-0 flex flex-col justify-center items-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}

export const Spin = ({ children, loading, color }: { children: ReactNode; loading: boolean; color?: string }) => {
  return (
    <div className="relative w-full h-full">
      {loading && (
        <div
          className={
            'absolute top-0 left-0 w-full h-full flex justify-center items-center bg-background/80 background-blur-sm z-[9999]'
          }
        >
          <Loader2 className="animate-spin" color={color || '#CF5C10'} size={32} />
        </div>
      )}
      <div className="relative h-full">{children}</div>
    </div>
  );
};
