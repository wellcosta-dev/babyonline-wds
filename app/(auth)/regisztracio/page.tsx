"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const registrationSchema = z
  .object({
    name: z.string().min(2, "A név legalább 2 karakter legyen"),
    email: z.string().email("Érvényes email címet adj meg"),
    password: z
      .string()
      .min(8, "A jelszó legalább 8 karakter legyen")
      .regex(/[A-Z]/, "A jelszónak legalább egy nagybetűt kell tartalmaznia")
      .regex(/[0-9]/, "A jelszónak legalább egy számot kell tartalmaznia"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Az ÁSZF és Adatvédelmi szabályzat elfogadása kötelező",
    }),
    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A jelszavak nem egyeznek",
    path: ["confirmPassword"],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (!password) return "weak";
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function RegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { acceptTerms: false, newsletter: false },
  });

  const password = watch("password");
  const passwordStrength = useMemo(
    () => getPasswordStrength(password || ""),
    [password]
  );

  const onSubmit = async (data: RegistrationFormData) => {
    setSubmitError(null);
    setIsAuthLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "register",
          name: data.name,
          email: data.email,
          password: data.password,
          newsletter: data.newsletter ?? false,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        user?: { id: string; email: string; name?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "A regisztráció sikertelen.");
      }

      if (typeof window !== "undefined" && payload.user) {
        localStorage.setItem("bo-auth-user", JSON.stringify(payload.user));
      }
      router.push("/fiokom");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Regisztrációs hiba");
      setIsAuthLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="card p-8 shadow-medium">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-neutral-dark mb-2">
            Regisztráció
          </h1>
          <p className="text-neutral-medium text-sm">
            Hozd létre fiókodat és vásárolj könnyedén
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              Teljes név
            </label>
            <input
              id="name"
              {...register("name")}
              className={cn("input-field", errors.name && "border-error focus:ring-error/30")}
              placeholder="Kovács János"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={cn("input-field", errors.email && "border-error focus:ring-error/30")}
              placeholder="email@pelda.hu"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              Jelszó
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={cn(
                  "input-field pr-12",
                  errors.password && "border-error focus:ring-error/30"
                )}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-medium hover:text-neutral-dark transition-colors"
                aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-gray-200">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      passwordStrength === "weak" && "w-1/3 bg-error",
                      passwordStrength === "medium" && "w-2/3 bg-warning",
                      passwordStrength === "strong" && "w-full bg-success"
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-medium">
                  {passwordStrength === "weak" && "Gyenge jelszó"}
                  {passwordStrength === "medium" && "Közepes jelszó"}
                  {passwordStrength === "strong" && "Erős jelszó"}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-sm text-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              Jelszó megerősítése
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={cn(
                  "input-field pr-12",
                  errors.confirmPassword && "border-error focus:ring-error/30"
                )}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-medium hover:text-neutral-dark transition-colors"
                aria-label={
                  showConfirmPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("acceptTerms")}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
              />
              <span className="text-sm text-neutral-dark">
                Elfogadom az{" "}
                <Link href="/aszf" className="text-primary hover:underline font-medium">
                  ÁSZF
                </Link>
                -et és az{" "}
                <Link href="/adatvedelem" className="text-primary hover:underline font-medium">
                  Adatvédelmi szabályzat
                </Link>
                ot
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-error">{errors.acceptTerms.message}</p>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("newsletter")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-neutral-dark">
                Feliratkozás hírlevélre
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isAuthLoading}
            className="btn-primary w-full"
          >
            Regisztráció
          </button>
          {submitError && (
            <p className="text-sm text-error text-center">{submitError}</p>
          )}
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-neutral-medium">vagy</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-outline w-full flex items-center justify-center gap-2"
        >
          <GoogleIcon className="size-5" />
          Regisztráció Google-lel
        </button>

        <p className="mt-6 text-center text-sm text-neutral-medium">
          Már van fiókod?{" "}
          <Link
            href="/bejelentkezes"
            className="text-primary hover:text-primary-light font-semibold transition-colors"
          >
            Jelentkezz be!
          </Link>
        </p>
      </div>
      {isAuthLoading && (
        <div className="fixed inset-0 z-[70] bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-lg flex items-center gap-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <div>
              <p className="text-sm font-bold text-neutral-dark tracking-tight">Regisztráció folyamatban</p>
              <p className="text-xs text-neutral-medium">Kérlek várj, ne zárd be az oldalt.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
