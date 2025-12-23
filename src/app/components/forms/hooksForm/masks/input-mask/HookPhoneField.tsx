// components/form/masks/input-mask/HookPhoneField.tsx
import { TextFieldProps } from "@mui/material";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { format, useMask } from "@react-input/mask";
import CustomTextField from "../../../theme-elements/CustomTextField";

type HookPhoneFieldProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues> &
    Omit<TextFieldProps, "name" | "onChange"> & {
      isMobile?: boolean;
      showMask?: boolean;
    };

export function HookPhoneField<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  isMobile = true,
  showMask = true,
  defaultValue,
  shouldUnregister,
  ...props
}: HookPhoneFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue, shouldUnregister });

  const maskOption = {
    mask: isMobile ? "(__) _____-____" : "(__) ____-____",
    replacement: { _: /\d/ },
    showMask,
  };

  const inputRef = useMask(maskOption);

  return (
    <CustomTextField
      {...props}
      {...field}
      inputRef={(ref) => {
        if (ref) {
          inputRef.current = ref;
          field.ref(ref);
        }
      }}
      fullWidth
      error={!!error}
      helperText={error?.message}
      placeholder={!showMask ? (isMobile ? "(00) 00000-0000" : "(00) 0000-0000") : undefined }
    />
  );
}