import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Lock, Eye, EyeOff, Store } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const schema = zod.object({
  email: zod
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: zod.string().min(1, "Password is required"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const { login, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    typeof location.state?.from === "string" && location.state.from.trim()
      ? location.state.from
      : "/home";

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setAuthError("");

    const result = login({
      email: values.email,
      password: values.password,
    });

    if (!result.ok) {
      setAuthError(result.message || "Unable to login.");
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  if (!isReady) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      <div className="hidden lg:block relative">
        <img
          src="/src/assets/login image.jpg"
          alt="Login"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center justify-center px-4 sm:px-8 py-10 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2 text-orange-500">
            <Store size={34} />
            <h1 className="text-2xl font-bold">StoreFlow</h1>
          </div>

          <h2 className="text-[32px] font-semibold">Log In</h2>

          <form className="mt-10 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              size="lg"
              startContent={<Mail className="text-gray-400" size={18} />}
              label="Email"
              placeholder="Enter Email"
              labelPlacement="outside"
              type="email"
              {...register("email")}
              isInvalid={Boolean(errors.email && touchedFields.email)}
              errorMessage={errors.email?.message}
            />

            <Input
              size="lg"
              startContent={<Lock className="text-gray-400" size={18} />}
              label="Password"
              placeholder="Enter Password"
              labelPlacement="outside"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              isInvalid={Boolean(errors.password && touchedFields.password)}
              errorMessage={errors.password?.message}
              endContent={
                showPassword ? (
                  <Eye
                    className="text-gray-400 cursor-pointer"
                    size={18}
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <EyeOff
                    className="text-gray-400 cursor-pointer"
                    size={18}
                    onClick={() => setShowPassword(true)}
                  />
                )
              }
            />

            {authError ? (
              <p className="text-sm text-red-500 -mt-1">{authError}</p>
            ) : null}

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="mt-4 w-full bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
            >
              Log In
            </Button>

            <p className="mt-4 text-center">
              Don&apos;t have an account?{" "}
              <NavLink to="/signup" className="text-orange-500 hover:underline">
                Sign Up
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
