import * as React from 'react';
import {
  Drawer as DrawerCore,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { ReactNode } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

interface IDrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}

export function Drawer({
  trigger,
  children,
  description,
  title,
  ...rest
}: IDrawerProps & React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return (
    <DrawerCore {...rest}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">{children}</div>
        </div>
      </DrawerContent>
    </DrawerCore>
  );
}
