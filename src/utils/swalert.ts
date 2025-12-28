import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

import { store } from "@/store/store";
import { buildThemeInternal } from "@/utils/theme/Theme";

/* -------------------------------------------------------------------------- */
/*                              THEME RESOLVER                                */
/* -------------------------------------------------------------------------- */

const getTheme = () => {
  const state = store.getState();

  return buildThemeInternal(state.customizer, {
    theme: state.customizer.activeTheme,
    direction: state.customizer.activeDir,
  });
};

/* -------------------------------------------------------------------------- */
/*                           BASE MIXIN (THEMED)                              */
/* -------------------------------------------------------------------------- */

const createThemedSwal = () => {
  const { palette } = getTheme();

  return Swal.mixin({
    icon: "warning",

    showCancelButton: true,
    reverseButtons: true,
    showLoaderOnConfirm: true,

    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",

    confirmButtonColor: palette.primary.main,
    cancelButtonColor: palette.error.main,
    background: palette.background.paper,
    color: palette.text.primary,

    /* 🔹 foco padrão nativo */
    focusCancel: true,

    /* 🔹 bloqueios nativos */
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: () => !Swal.isLoading(),
  });
};

/* -------------------------------------------------------------------------- */
/*                              MAIN ASYNC API                                */
/* -------------------------------------------------------------------------- */

const Swalert = async (
  options: SweetAlertOptions
): Promise<SweetAlertResult> => {
  const swal = createThemedSwal();

  const {
    preConfirm: userPreConfirm,
    focusConfirm,
    focusCancel,
    ...restOptions
  } = options;

  return swal.fire({
    /* 🔹 foco (override consciente) */
    focusConfirm,
    focusCancel: focusConfirm ? false : focusCancel,

    /* 🔹 async protegido */
    preConfirm: async (...args) => {
      const cancel = Swal.getCancelButton();
      if (cancel) {
        cancel.style.visibility = "hidden";
        cancel.style.display = "none";
      }

      Swal.disableButtons();

      try {
        if (userPreConfirm) {
          return await userPreConfirm(...args);
        }
      } finally {
        Swal.enableButtons();
      }
    },

    ...restOptions,
  });
};

/* -------------------------------------------------------------------------- */
/*                                   TOAST                                    */
/* -------------------------------------------------------------------------- */

const SwalToast = Swal.mixin({
  toast: true,
  position: "top-end",
  timer: 5000,
  timerProgressBar: true,
  showConfirmButton: false,
  showCloseButton: true,
  allowEscapeKey: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export { Swal, SwalToast, Swalert };
