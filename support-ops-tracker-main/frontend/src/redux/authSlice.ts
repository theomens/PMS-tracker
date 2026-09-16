import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../Api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<User, LoginCredentials, { rejectValue: string }>(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      // Fetch Sanctum CSRF cookie first
      try {
        await api.get("/sanctum/csrf-cookie");
      } catch {
        // Continue if CSRF cookie call is rejected in stateless/token setups
      }

      // Perform login
      const response = await api.post("/login", credentials);

      const tokenHeader =
        response.headers["x-auth-token"] ||
        response.headers["X-Auth-Token"];
      if (tokenHeader && typeof tokenHeader === "string") {
        localStorage.setItem("auth_token", tokenHeader);
      }

      const user = response.data.user;
      localStorage.setItem("auth_user", JSON.stringify(user));

      return user;
    } catch (error: unknown) {
      let message = "Invalid email or password.";
      if (error && typeof error === "object" && "response" in error) {
        const res = (error as {
          response?: {
            data?: {
              message?: string;
              errors?: { email?: string[] };
            };
          };
        }).response;

        message =
          res?.data?.message ||
          res?.data?.errors?.email?.[0] ||
          message;
      }

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed.";
      });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;

export default authSlice.reducer;