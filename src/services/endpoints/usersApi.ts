import { User } from "@/core/users/types";
import { RegisterUserDTO } from "@/core/users/user.dto";
import { api } from "../api";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<User, RegisterUserDTO>({
      query: (newUser) => ({
        url: "/auth/users",
        method: "POST",
        body: newUser,
      }),
    }),

    getUserByUsername: builder.query<User, string>({
      query: (username) => `/auth/users?username=${username}`,
    }),

    getUserByEmail: builder.query<User, string>({
      query: (email) => `/auth/users?email=${email}`,
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useGetUserByUsernameQuery,
  useGetUserByEmailQuery,
} = usersApi;
