'use client';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { IOption } from '@/components/Select';

export function TokenSelect({
  options,
  value,
  onChange,
  onSearch
}: {
  options: IOption[];
  value?: string;
  onChange: (v: string) => void;
  onSearch?: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const currentOption = options?.find((option) => option.value === value);

  useEffect(() => {
    if (search) {
      onSearch?.(search);
    }
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <>
      <Button variant={'outline'} className={'rounded-3xl gap-2'} onClick={() => setOpen(true)}>
        {value ? currentOption?.label : 'Select Token'}
        <ChevronDown size={14} />
      </Button>
      <CommandDialog
        commandProps={{
          value,
          onValueChange: onChange
        }}
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput value={search} onValueChange={setSearch} placeholder="Enter address to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Token List">
            {options?.map((option, index) => {
              return (
                <CommandItem
                  key={index}
                  itemID={option.value}
                  value={option.value}
                  onSelect={(value) => {
                    console.log('Selected', value);
                    onChange(value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
}
