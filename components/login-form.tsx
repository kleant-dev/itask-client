import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Apple, Chrome, EyeOff, Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const LoginForm = (): ReactElement => {
  return (
    <div className="flex w-full max-w-[650px] items-center justify-center p-6 bg-white rounded-xl">
      <div className="flex flex-col w-full max-w-[350px] items-center gap-12">
        {/* Header */}
        <header className="flex flex-col items-center justify-center gap-2 w-full">
          <h1 className="text-h3 text-center">
            <span className="text-neutral-900">Login to </span>
            <span className="text-blue-500">Sprintly</span>
          </h1>
          <p className="text-p-small text-neutral-400 text-center w-full">
            Enter your username and password to Login
          </p>
        </header>

        {/* Form Container */}
        <div className="flex flex-col items-start gap-6 w-full">
          {/* Inputs */}
          <div className="flex flex-col items-start gap-4 w-full">
            <Input
              type="email"
              placeholder="Email"
              className="h-10 px-3 bg-white rounded-[10px] border border-neutral-200 text-p-small placeholder:text-neutral-400 focus-visible:ring-blue-500"
            />

            <div className="relative w-full">
              <Input
                type="password"
                placeholder="Password"
                className="h-10 px-3 pr-10 bg-white rounded-[10px] border border-neutral-200 text-p-small placeholder:text-neutral-400 focus-visible:ring-blue-500"
              />
              <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>

            {/* Actions - Remember Me & Forgot Password */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  className="w-5 h-5 border-neutral-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label
                  htmlFor="remember"
                  className="text-label-small text-neutral-400 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>

              <button className="text-label-small text-blue-500 hover:text-blue-600 transition-colors">
                Forgot password?
              </button>
            </div>
          </div>

          {/* Button Container */}
          <div className="flex flex-col items-start gap-6 w-full">
            {/* Login Button */}
            <Button className="h-10 w-full rounded-[10px] bg-blue-500 hover:bg-blue-600 text-white text-label-small font-medium transition-colors">
              Login
            </Button>

            {/* Divider */}
            <div className="flex items-center justify-center gap-5 w-full">
              <Separator className="flex-1 bg-neutral-200" />
              <span className="text-label-small text-neutral-400 whitespace-nowrap">
                or continue with
              </span>
              <Separator className="flex-1 bg-neutral-200" />
            </div>

            {/* Social Login Buttons */}
            <div className="flex items-center gap-4 w-full">
              <Button
                variant="outline"
                className="h-12 flex-1 bg-white rounded-[10px] border border-neutral-200 hover:bg-neutral-100 transition-colors p-0"
              >
                <FcGoogle className="w-[18px] h-[18px] text-neutral-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-label-small text-center w-full">
          <span className="text-neutral-400">Don&apos;t have account? </span>
          <button className="text-blue-500 hover:text-blue-600 transition-colors">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
