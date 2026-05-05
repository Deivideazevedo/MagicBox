import { useState } from 'react';

/**
 * Hook genérico para controlar animação de rotação de ícones
 *
 * @param duration - Duração da animação em ms (padrão: 1000ms)
 * @returns Objeto com estado de rotação e função para disparar animação
 *
 * @example
 * ```tsx
 * const resetSpin = useIconSpin();
 * const refreshSpin = useIconSpin(800);
 *
 * <IconButton
 *   onClick={() => {
 *     resetSpin.trigger();
 *     onReset();
 *   }}
 *   sx={{
 *     transition: resetSpin.isSpinning ? 'transform 1s ease' : 'none',
 *     transform: resetSpin.isSpinning ? 'rotate(360deg)' : 'none',
 *   }}
 * >
 *   <Refresh />
 * </IconButton>
 * ```
 */
export function useIconSpin(duration: number = 1000) {
  const [isSpinning, setIsSpinning] = useState(false);

  const trigger = () => {
    if (isSpinning) return; // Evita cliques múltiplos durante a animação
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), duration);
  };

  return {
    isSpinning,
    trigger,
  };
}
