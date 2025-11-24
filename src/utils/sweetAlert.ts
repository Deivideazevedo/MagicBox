import Swal, { SweetAlertIcon } from 'sweetalert2';

// Variável temporária para armazenar o valor de focusConfirm
let tempFocusConfirm = false;

type ThemeColors = {
  primary?: string;
  error?: string;
  background?: string;
  text?: string;
};

/**
 * Cria uma instância customizada do SweetAlert2 com tema do Material-UI
 *
 * @param themeColors - Cores do tema para customização
 * @returns Instância do Swal configurada
 *
 * @example
 * // Uso básico (foco padrão no botão Cancelar)
 * const Swalert = createSwalert({ primary: '#1976d2', error: '#d32f2f' });
 * Swalert.fire({ title: 'Confirmar ação?' });
 *
 * @example
 * // Foco no botão Confirmar
 * const Swalert = createSwalert({ primary: '#1976d2', error: '#d32f2f' });
 * Swalert.fire({
 *   title: 'Confirmar ação?',
 *   focusConfirm: true  // 👈 Define o foco no momento da chamada
 * });
 */
export const createSwalert = (themeColors: ThemeColors = {}): typeof Swal => {
  const {
    primary = '#1976d2', // MUI default primary.main
    error = '#d32f2f', // MUI default error.main
    background = '#fff', // MUI default background.paper
    text = '#1a1a1a', // MUI default text.primary
  } = themeColors;

  const swalInstance = Swal.mixin({
    icon: 'warning' as SweetAlertIcon,
    showCancelButton: true,
    showLoaderOnConfirm: true,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonText: 'Confirmar',
    cancelButtonColor: error,
    confirmButtonColor: primary,
    background,
    color: text,
    didOpen: (_popup) => {
      const loader = document.querySelector('.swal2-loader') as HTMLElement;
      const title = document.querySelector('.swal2-title') as HTMLElement;
      const content = document.querySelector(
        '.swal2-html-container',
      ) as HTMLElement;
      const cancelButton = document.querySelector(
        '.swal2-cancel',
      ) as HTMLButtonElement;
      const confirmButton = document.querySelector(
        '.swal2-confirm',
      ) as HTMLButtonElement;

      if (loader)
        loader.style.borderColor = `${primary} transparent ${primary} transparent`;
      if (title) title.style.lineHeight = '1.2';
      if (content) content.style.lineHeight = '1.2';

      if (cancelButton) {
        cancelButton.classList.add('swal-focus-highlight');
        cancelButton.style.setProperty('--swal-focus-color', error);
        cancelButton.style.setProperty('--swal-focus-shadow', `${error}80`);
      }

      if (confirmButton) {
        confirmButton.classList.add('swal-focus-highlight');
        confirmButton.style.setProperty('--swal-focus-color', primary);
        confirmButton.style.setProperty('--swal-focus-shadow', `${primary}80`);
      }

      // Usa setTimeout para garantir que o popup esteja totalmente renderizado
      setTimeout(() => {
        if (tempFocusConfirm && confirmButton) {
          confirmButton.focus();
        } else if (cancelButton) {
          cancelButton.focus();
        }
        // Reseta após usar
        tempFocusConfirm = false;
      }, 100);

      document.addEventListener('keydown', escListener, true);
      Swal.getPopup()?.addEventListener('transitionend', () => {
        document.removeEventListener('keydown', escListener, true);
      });
    },
  });

  // Intercepta o fire para capturar focusConfirm
  const originalFire = swalInstance.fire.bind(swalInstance);
  swalInstance.fire = ((...args: any[]) => {
    const options = args[0];
    if (options && typeof options === 'object' && 'focusConfirm' in options) {
      tempFocusConfirm = options.focusConfirm;
    }
    return originalFire(...args);
  }) as typeof swalInstance.fire;

  return swalInstance;
};

const escListener = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && Swal.isVisible()) {
    e.stopPropagation();
    e.preventDefault();
    Swal.close();
  }
};

export const createSwalToast = (): typeof Swal => {
  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    showCloseButton: true,
    allowEscapeKey: true,
    didOpen: (toast: HTMLElement) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;

      document.addEventListener('keydown', escListener, true);
      Swal.getPopup()?.addEventListener('transitionend', () => {
        document.removeEventListener('keydown', escListener, true);
      });
    },
  });
};

export const SwalToast = createSwalToast();

export { Swal };
