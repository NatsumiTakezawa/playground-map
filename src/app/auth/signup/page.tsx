"use client";
/**
 * S04 サインアップページ
 * @package MatsueOnsenMap
 * @module app/auth/signup/page
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OAuthButtons from "@/components/OAuthButtons";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 既にログイン済みなら管理画面へ
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("loginUser");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.role === "admin") {
          router.replace("/admin/spots");
        }
      }
    }
  }, [router]);

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    // 仮登録: admin@example.comのみ管理者
    const role = email === "admin@example.com" ? "admin" : "user";
    if (typeof window !== "undefined") {
      localStorage.setItem("loginUser", JSON.stringify({ email, role }));
    }
    setSuccess(true);
    setTimeout(
      () => router.replace(role === "admin" ? "/admin/spots" : "/auth/signin"),
      1200
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-primary-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">新規登録</h1>
        <OAuthButtons />
        <form onSubmit={handleSignUp} className="space-y-4 mt-4">
          <input
            type="email"
            aria-label="メールアドレス"
            className="w-full border rounded p-2"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">登録完了！</div>
          )}
          <button
            type="submit"
            aria-label="サインアップ（メール）"
            className="w-full bg-primary-500 text-white py-2 rounded font-bold hover:bg-primary-700 transition"
          >
            新規登録
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          すでにアカウントをお持ちの方は
          <a
            href="/auth/signin"
            className="text-primary-700 hover:underline ml-1"
          >
            サインイン
          </a>
        </div>
      </div>
    </main>
  );
}
