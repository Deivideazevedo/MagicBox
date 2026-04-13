import { startOfMonth, endOfMonth, format } from "date-fns";
import { ListUsersDTO } from "@/core/users/user.dto";

export interface FiltrosUsuarios {
  page?: number;
  limit?: number;
  nome?: string;
  email?: string;
  username?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const getDefaultUserDates = () => {
  return {
    dataInicio: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    dataFim: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  };
};

export const defaultUserFilters: ListUsersDTO = {
  page: 0,
  limit: 10,
  nome: "",
  email: "",
  username: "",
  status: "",
  ...getDefaultUserDates(),
};
