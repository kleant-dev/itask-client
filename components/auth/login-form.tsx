"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/hooks/use-auth";
import { handleGoogleAuth, loginWithEmail } from "@/lib/api/auth";
import { LoginSchema } from "@/lib/validations/auth/LoginSchema";

type LoginFormValues = z.infer<typeof LoginSchema>;
const defaultValues = { email: "", password: "" };

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(
      LoginSchema as unknown as Parameters<typeof zodResolver>[0],
    ) as unknown as Resolver<LoginFormValues>,
    defaultValues,
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    const result = await loginWithEmail(data.email, data.password);

    if (result.success) {
      login(
        result.data.accessToken,
        result.data.refreshToken,
        result.data.user,
      );
      toast.success("Login successful!", {
        description: "Welcome back!",
      });
    }

    setIsLoading(false);
  }

  async function onGoogleSuccess(credentialResponse: CredentialResponse) {
    const result = await handleGoogleAuth(credentialResponse);

    if (result.success) {
      login(
        result.data.accessToken,
        result.data.refreshToken,
        result.data.user,
      );
      toast.success("Login successful!", {
        description: "Welcome back!",
      });
    }
  }

  return (
    <form
      id="login-form"
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-neutral-900 text-h3">
            Login to <span className="text-primary-500">Slender</span>
          </h1>
          <p className="text-neutral-400 text-p-small text-balance">
            Enter your email and password to login
          </p>
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <Input
                {...field}
                id="login-email"
                type="email"
                placeholder="Email"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Input
                  {...field}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label
              htmlFor="remember"
              className="text-p-small text-neutral-600 font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <a
            href="#"
            className="text-p-small text-primary-500 hover:text-primary-600 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Field>
          <Button
            className="cursor-pointer"
            type="submit"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>or continue with</FieldSeparator>

        <div className="grid grid-cols-2 gap-3">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => {
              toast.error("Google login failed", {
                description: "Please try again",
              });
            }}
          />
          <Button
            variant="outline"
            type="button"
            className="cursor-pointer"
            aria-label="Login with Apple"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-5"
              fill="currentColor"
            >
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
          </Button>
        </div>

        <FieldDescription className="text-center">
          {"Don't have an account? "}
          <a href="register" className="underline underline-offset-4">
            Register
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
