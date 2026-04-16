import { Meta, MetaPayload } from "@/core/metas/types";
import {
  useCreateMetaMutation,
  useDeleteMetaMutation,
  useGetMetasQuery,
  useUpdateMetaMutation,
} from "@/services/endpoints/metasApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Swal from "sweetalert2";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";

const metaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  valorMeta: z.number().min(0.01, "Valor deve ser maior que zero"),
  dataAlvo: z.string().min(1, "Data alvo é obrigatória"),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
});

export type MetaFormData = z.infer<typeof metaSchema>;

export function useMetas() {
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const { data: metas = [], isLoading } = useGetMetasQuery();
  const [createMeta, { isLoading: isCreating }] = useCreateMetaMutation();
  const [updateMeta, { isLoading: isUpdating }] = useUpdateMetaMutation();
  const [deleteMeta, { isLoading: isDeleting }] = useDeleteMetaMutation();

  const {
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    setFocus,
  } = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      nome: "",
      valorMeta: 0,
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof metaSchema>) => {
      try {
        const payload = fnCleanObject({ params: data }) as unknown as MetaPayload;

        if (data.id) {
          await updateMeta({ id: Number(data.id), data: payload }).unwrap();
          // Swal.fire({ icon: "success", title: "Meta atualizada!", timer: 1500 });
        } else {
          await createMeta(payload).unwrap();
          // Swal.fire({ icon: "success", title: "Meta criada!", timer: 1500 });
        }
        reset({ nome: "", valorMeta: 0, dataAlvo: "", icone: "IconTarget", cor: "#00FF00" });
      } catch (error) {
        // Swal.fire({ icon: "error", title: "Erro ao salvar meta" });
      }
    },
    [createMeta, updateMeta, userId, reset]
  );

  const handleEdit = (meta: Meta) => {
    reset({
      id: meta.id,
      nome: meta.nome,
      valorMeta: meta.valorMeta,
      dataAlvo: meta.dataAlvo ? new Date(meta.dataAlvo).toISOString().split("T")[0] : "",
      icone: meta.icone,
      cor: meta.cor,
    });
    setFocus("nome");
  };

  const handleDelete = async (id: number | string) => {
    const targetId = Number(id);
    Swal.fire({
      title: "Tem certeza?",
      text: "Esta meta será marcada como inativa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, inativar!",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteMeta(targetId).unwrap();
          Swal.fire({ icon: "success", title: "Meta inativada!", timer: 1500 });
        } catch {
          Swal.fire({ icon: "error", title: "Erro ao inativar meta" });
        }
      }
    });
  };

  const isEditing = Boolean(watch("id"));
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    metas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isEditing,
    control,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancelEdit: () => reset({ id: undefined, nome: "", valorMeta: 0 }),
  };
}
