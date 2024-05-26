'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';
import { ReactNode, useMemo, useState } from 'react';

import { SelectContent, SelectItem, SelectTrigger, Select as SelectUI, SelectValue } from '@/components/ui/select';

export interface IOption {
  label: ReactNode;
  value: string;
  description?: string;
}
export interface ISelectProps extends SelectPrimitive.SelectProps {
  onChange?: (v: string) => void;
  value?: string;
  placeholder?: string;
  options: IOption[];
  className?: string;
  displaySelectValue?: (v: string) => ReactNode;
}

export const Select = React.forwardRef<React.ElementRef<typeof SelectPrimitive.SelectTrigger>, ISelectProps>(
  ({ onChange, value, placeholder, className, options, displaySelectValue, ...other }, ref) => {
    const valueMap = useMemo(() => {
      return options?.reduce(
        (acc, option) => {
          acc[option.value] = option;
          return acc;
        },
        {} as Record<string, IOption>
      );
    }, [options]);
    const [open, setOpen] = useState(false);
    return (
      <SelectUI
        onValueChange={onChange}
        key={value}
        defaultValue={value}
        value={value}
        open={open}
        onOpenChange={setOpen}
        {...other}
      >
        <SelectTrigger className={className} ref={ref} id={'trigger'} value={value}>
          <SelectValue placeholder={placeholder}>
            {value ? (displaySelectValue ? displaySelectValue(value) : valueMap[value]?.label) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options?.map((option: IOption) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="text-md text-gray-900 dark:text-[#FFF] cursor-pointer">{option.label}</div>
              {option.description ? (
                <div className="text-xs text-gray-500 dark:text-foreground">{option.description}</div>
              ) : null}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectUI>
    );
  }
);

Select.displayName = 'Select';
