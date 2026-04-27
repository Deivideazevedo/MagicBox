import { z } from "zod";
import { api } from "../api";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { DashboardResponse } from "@/core/dashboard/types";
import { DashboardFiltros } from "@/core/dashboard/dashboard.dto";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, DashboardFiltros>({
      query: (params) => ({
        url: "/dashboard",
        params: fnCleanObject({ params }),
      }),
      providesTags: ["Dashboard"],
    }),
    getHeatmap: builder.query<any, DashboardFiltros>({
      query: (params) => ({
        url: "/dashboard/heatmap",
        params: fnCleanObject({ params }),
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { 
  useGetDashboardQuery, 
  useLazyGetDashboardQuery,
  useGetHeatmapQuery 
} = dashboardApi;
