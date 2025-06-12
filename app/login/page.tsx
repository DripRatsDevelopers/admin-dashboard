"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

interface FormData {
  email: string;
  password: string;
  twoFactorCode: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  twoFactorCode?: string;
  general?: string;
}

export default function SecureAdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginStatus, setLoginStatus] = useState("");
  const [step, setStep] = useState(1); // 1: credentials, 2: 2FA
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Predefined admin emails (in production, store these securely)
  const ADMIN_EMAILS = ["admin@driprats.com", "superadmin@driprats.com"];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEmail = (email: string) => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Unauthorized email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (step === 2 && !formData.twoFactorCode) {
      newErrors.twoFactorCode = "2FA code is required";
    }

    return newErrors;
  };

  const handleLockout = () => {
    setIsLocked(true);
    setLockoutTime(15 * 60); // 15 minutes

    const timer = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setAttemptCount(0);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoginStatus("");

    if (isLocked) {
      setErrors({
        general: `Account locked. Try again in ${Math.ceil(
          lockoutTime / 60
        )} minutes.`,
      });
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const endpoint =
        step === 1 ? "/api/admin/login" : "/api/admin/verify-2fa";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          step === 1
            ? {
                email: formData.email,
                password: formData.password,
              }
            : {
                email: formData.email,
                twoFactorCode: formData.twoFactorCode,
              }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        if (step === 1 && data.requiresTwoFactor) {
          setStep(2);
          setLoginStatus("2fa-required");
          setAttemptCount(0); // Reset on successful first step
        } else {
          setLoginStatus("success");
          // Store secure token with expiration
          const tokenData = {
            token: data.token,
            expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
            role: data.role || "admin",
          };

          // Using sessionStorage instead of localStorage for better security
          sessionStorage.setItem("adminAuth", JSON.stringify(tokenData));

          setTimeout(() => {
            router.push("/admin/dashboard");
          }, 1000);
        }
      } else {
        setLoginStatus("error");
        setAttemptCount((prev) => prev + 1);

        if (attemptCount >= 4) {
          // 5 total attempts
          handleLockout();
          setErrors({
            general: "Too many failed attempts. Account locked for 15 minutes.",
          });
        } else {
          setErrors({ general: data.message || "Invalid credentials" });
        }
      }
    } catch {
      setLoginStatus("error");
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl mb-4 mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {step === 1 ? "Admin Access" : "Two-Factor Authentication"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {step === 1
                ? "Secure login for authorized personnel"
                : "Enter your 2FA code to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Messages */}
            {loginStatus === "success" && (
              <Alert className="bg-green-500/20 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  Login successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            {loginStatus === "2fa-required" && (
              <Alert className="bg-blue-500/20 border-blue-500/30">
                <Shield className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Please enter your 2FA code to complete login.
                </AlertDescription>
              </Alert>
            )}

            {errors.general && (
              <Alert
                className="bg-red-500/20 border-red-500/30"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}

            {isLocked && (
              <Alert className="bg-yellow-500/20 border-yellow-500/30">
                <Lock className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  Account locked for security. Time remaining:{" "}
                  {formatTime(lockoutTime)}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="admin@driprats.com"
                        disabled={isLocked}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="Enter secure password"
                        disabled={isLocked}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLocked}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>
                </>
              ) : (
                /* 2FA Code Field */
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode" className="text-gray-300">
                    2FA Code
                  </Label>
                  <Input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                    className="text-center text-lg tracking-widest bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.twoFactorCode && (
                    <p className="text-sm text-red-400">
                      {errors.twoFactorCode}
                    </p>
                  )}
                </div>
              )}

              {/* Attempt Counter */}
              {attemptCount > 0 && attemptCount < 5 && (
                <p className="text-sm text-yellow-400 text-center">
                  {5 - attemptCount} attempt{5 - attemptCount !== 1 ? "s" : ""}{" "}
                  remaining
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
                disabled={isLoading || isLocked}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {step === 1 ? "Authenticating..." : "Verifying..."}
                  </div>
                ) : step === 1 ? (
                  "Sign In"
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              {step === 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-gray-300"
                  onClick={() => setStep(1)}
                >
                  ← Back to login
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg">
          <p className="text-slate-300 text-sm text-center">
            🔒 This system is for authorized personnel only. All access attempts
            are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
