import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/authSlice";
import type { RootState, AppDispatch } from "../redux/store";
import { useAuth } from "./dashboard/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, login } = useAuth();

  const { isLoading, error } = useSelector((state:RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    dispatch(clearError());
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.email) {
      return;
    }

    if (!formData.password) {
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return;
    }

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      login(result.payload);
      navigate("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#F6F5F2] px-6 py-16 sm:px-10">
      <div
        className="ops-sans w-full max-w-md rounded-2xl bg-white px-9 py-10"
        style={{
          boxShadow:
            "0 2px 8px rgba(18,24,31,0.04), 0 16px 40px -12px rgba(18,24,31,0.18)",
        }}
      >
        <p className="text-center text-[20px] font-semibold text-[#15803d]">
          Welcome back !!
        </p>

        <h1 className="mt-5 text-center text-[26px] font-semibold leading-tight text-[#15803d]">
          Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-9 space-y-6"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-sm text-[#5B6472]"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              className="mt-2 h-10 w-full border-0 border-b-2 border-[#D8D9D6] bg-transparent px-0 text-[15px] text-[#12181F] outline-none transition-colors placeholder:text-[#B4B7B2] focus:border-[#12181F]"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-sm text-[#5B6472]"
            >
              Password
            </label>

            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-10 w-full border-0 border-b-2 border-[#D8D9D6] bg-transparent px-0 pr-8 text-[15px] text-[#12181F] outline-none transition-colors placeholder:text-[#B4B7B2] focus:border-[#12181F]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer text-[#B4B7B2] hover:text-[#12181F]"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 border-l-2 border-[#C6553D] pl-3">
              <p className="text-sm text-[#C6553D]">
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full cursor-pointer items-center justify-center text-white rounded-md bg-[#15803d] text-sm font-medium transition-colors hover:bg-emerald-600 hover:text-[#12181F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

      </div>
    </main>
  );
}