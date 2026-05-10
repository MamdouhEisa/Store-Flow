import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, User, Lock, Eye, EyeOff, Phone, Store } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const schema = zod
  .object({
    name: zod
      .string()
      .min(2, "Business name must be at least 2 characters long")
      .max(50, "Business name must be less than 50 characters long"),
    phone: zod
      .string()
      .min(10, "Phone number must be at least 10 digits long")
      .max(15, "Phone number must be less than 15 digits long")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    email: zod.string().email("Invalid email address"),
    password: zod
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(20, "Password must be less than 20 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must contain uppercase, lowercase, number, special character"
      ),
    confirmPassword: zod.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState("");

  const { signup, isReady } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (userData) => {
    setAuthError("");

    const result = signup({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
    });

    if (!result.ok) {
      if (result.field === "email") {
        setError("email", { type: "manual", message: result.message || "Email already exists" });
      } else {
        setAuthError(result.message || "Unable to sign up.");
      }
      return;
    }

    navigate("/home", { replace: true });
  };

  if (!isReady) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100">
      <div className="hidden lg:block relative">
        <img
          src="/src/assets/signup image.jpg"
          alt="Signup"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center justify-center px-4 sm:px-8 py-10 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2 text-orange-500">
            <Store size={34} />
            <h1 className="text-2xl font-bold">StoreFlow</h1>
          </div>

          <h2 className="text-[32px] font-semibold">Sign Up</h2>

          <form className="mt-10 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                size="lg"
                startContent={<User className="text-gray-400" size={18} />}
                label="Business Name"
                placeholder="Enter Store Name"
                labelPlacement="outside"
                type="text"
                {...register("name")}
                isInvalid={Boolean(errors.name && touchedFields.name)}
                errorMessage={errors.name?.message}
              />

              <Input
                size="lg"
                startContent={<Phone className="text-gray-400" size={18} />}
                label="Phone Number"
                placeholder="Enter Phone Number"
                labelPlacement="outside"
                type="text"
                {...register("phone")}
                isInvalid={Boolean(errors.phone && touchedFields.phone)}
                errorMessage={errors.phone?.message}
              />
            </div>

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

            <Input
              size="lg"
              startContent={<Lock className="text-gray-400" size={18} />}
              label="Confirm Password"
              placeholder="Re-enter your password"
              labelPlacement="outside"
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              isInvalid={Boolean(
                errors.confirmPassword && touchedFields.confirmPassword
              )}
              errorMessage={errors.confirmPassword?.message}
              endContent={
                showConfirm ? (
                  <Eye
                    className="text-gray-400 cursor-pointer"
                    size={18}
                    onClick={() => setShowConfirm(false)}
                  />
                ) : (
                  <EyeOff
                    className="text-gray-400 cursor-pointer"
                    size={18}
                    onClick={() => setShowConfirm(true)}
                  />
                )
              }
            />

            {authError ? <p className="text-sm text-red-500 -mt-1">{authError}</p> : null}

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="mt-4 w-full bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
            >
              Sign Up
            </Button>

            <p className="mt-4 text-center">
              Have an account?{" "}
              <NavLink to="/login" className="text-orange-500 hover:underline">
                Login
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
