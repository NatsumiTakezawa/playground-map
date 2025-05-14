"use client";
/**
 * S03 サインインページ
 * @package MatsueOnsenMap
 * @module app/auth/signin/page
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OAuthButtons from "@/components/OAuthButtons";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
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

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    // 仮認証: admin@example.comのみ管理者
    const role = email === "admin@example.com" ? "admin" : "user";
    if (typeof window !== "undefined") {
      localStorage.setItem("loginUser", JSON.stringify({ email, role }));
    }
    if (role === "admin") {
      router.replace("/admin/spots");
    } else {
      setError("管理者権限がありません");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-primary-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">サインイン</h1>
        <OAuthButtons />
        <form onSubmit={handleSignIn} className="space-y-4 mt-4">
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
          <button
            type="submit"
            aria-label="サインイン（メール）"
            className="w-full bg-primary-500 text-black py-2 rounded font-bold hover:bg-primary-700 transition"
          >
            サインイン（メール）
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          アカウントをお持ちでない方は
          <a
            href="/auth/signup"
            className="text-primary-700 hover:underline ml-1"
          >
            新規登録
          </a>
        </div>
      </div>
    </main>
  );
}
