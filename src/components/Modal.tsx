'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { ButtonProps } from 'react-day-picker';
import { Button } from '@/components/ui/button';

export interface ModalProps {
  /**
   * @description 触发器
   * @default "-"
   * @type ReactNode
   */
  trigger?: ReactNode;
  /**
   * @description 内容
   * @default "-"
   * @type ReactNode
   */
  children: ReactNode;
  /**
   * @description 自定义头部内容
   * @default "-"
   * @type ReactNode
   */
  header?: ReactNode;
  /**
   * @description 是否打开
   * @default "-"
   * @type boolean
   */
  open?: boolean;
  /**
   * @description 打开关闭回调
   * @default "-"
   * @type (open: boolean) => void
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * @description 类名
   * @default "-"
   * @type string
   */
  className?: string;
  /**
   * @description 自定义底部内容
   * @default "-"
   * @type ReactNode | false
   */
  footer?: ReactNode | false;
  /**
   * @description 取消文本
   * @default "Cancel"
   * @type string
   */
  cancelText?: string;
  /**
   * @description 确认文本
   * @default "Confirm"
   * @type string
   */
  confirmText?: string;
  /**
   * @description 取消回调
   * @default "-"
   * @type () => void
   */
  onCancel?: () => void;
  /**
   * @description 确认回调
   * @default "Confirm"
   * @type () => void
   */
  onConfirm?: () => void;
  /**
   * @description 关闭按钮毁掉
   * @default "—"
   * @type () => void
   */
  onClose?: () => void;
  /**
   * @description 取消按钮属性
   * @default "-"
   * @type ButtonProps
   */
  cancelButtonProps?: ButtonProps;
  /**
   * @description 确认按钮属性
   * @default "-"
   * @type ButtonProps
   */
  confirmButtonProps?: ButtonProps;
  /**
   * @description 是否隐藏关闭图标
   * @default false
   * @type boolean
   */
  hiddenCloseIcon?: boolean;
  /**
   * @description 是否点击遮罩关闭
   * @default true
   * @type boolean
   */
  maskClosable?: boolean;

  /**
   * @description 底部类名
   * @default "-"
   * @type string
   */
  footerClassName?: string;
}

export const Modal = ({
  header,
  children,
  trigger,
  open,
  onOpenChange,
  className,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  confirmText,
  onCancel,
  cancelText,
  footer,
  maskClosable = true,
  footerClassName
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn('sm:w-[480px] bg-white dark:bg-popover', className)}
        onInteractOutside={(e) => {
          if (!maskClosable) {
            e.preventDefault();
          }
        }}
      >
        {header ? <DialogHeader>{header}</DialogHeader> : null}
        {children}
        {footer === false
          ? null
          : footer || (
              <DialogFooter className={cn('mt-[32px]', footerClassName)}>
                <DialogPrimitive.Close asChild>
                  <Button
                    className="flex-1 border-gray-300 text-gray-600 text-md font-medium shadow-xs"
                    variant="outline"
                    onClick={onCancel}
                    {...cancelButtonProps}
                  >
                    {cancelText || 'Cancel'}
                  </Button>
                </DialogPrimitive.Close>

                <Button className="flex-1 text-md font-medium shadow-xs" onClick={onConfirm} {...confirmButtonProps}>
                  {confirmText || 'Confirm'}
                </Button>
              </DialogFooter>
            )}
      </DialogContent>
    </Dialog>
  );
};
