import { ReactNode } from 'react';

/**
 * Configuração de uma ação individual para uma linha
 */
export interface IActionConfig<T> {
  icon?: ReactNode;
  title: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  callback: (row: T) => void;
  show?: (row: T) => boolean;
}
