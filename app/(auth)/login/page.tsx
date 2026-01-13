"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ============================
        Auto redirect if logged in
    ============================ */

    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    /* ============================
        Login handler
    ============================ */

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",   // ✅ add this
                body: JSON.stringify({
                    type: "login",
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Invalid credentials"
                );
            }

            login(data.user);
            console.log("Logged in user:", data.user);
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(
                err.message || "Unable to login. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
                <h1 className="mb-1 text-xl font-semibold">
                    Welcome Back
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    Login to access dashboard
                </p>

                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    {/* Password */}
                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPass(!showPass)
                            }
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                            {showPass ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        loading={loading}
                        disabled={!email || !password}
                    >
                        Login
                    </Button>
                    {/* Register Link */}
                    <div className="pt-2 text-center text-sm">
                        <span className="text-gray-500">
                            Don&apos;t have an account?
                        </span>{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/register")}
                            className="font-medium text-black hover:underline"
                        >
                            Register
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
