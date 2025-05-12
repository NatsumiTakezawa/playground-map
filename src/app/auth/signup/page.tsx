/**
 * S04 サインアップページ
 * @package MatsueOnsenMap
 * @module app/auth/signup/page
 */
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import OAuthButtons from "@/components/OAuthButtons";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/auth/signin"), 1500);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-primary-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">新規登録</h1>
        <OAuthButtons />
        <form onSubmit={handleSignUp} className="space-y-4 mt-4">
          <input
            type="email"
            className="w-full border rounded p-2"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            className="w-full border rounded p-2"
            placeholder="パスワード（8文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-center">
              登録完了！サインイン画面へ移動します
            </div>
          )}
          <button
            type="submit"
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
