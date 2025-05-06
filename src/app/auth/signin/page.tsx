/**
 * S03 サインインページ
 * @package MatsueOnsenMap
 * @module app/auth/signin/page
 */
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-primary-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">サインイン</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            className="w-full border rounded p-2"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border rounded p-2"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-2 rounded font-bold hover:bg-primary-700 transition"
          >
            サインイン
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="/auth/signup" className="text-primary-700 hover:underline">
            新規登録はこちら
          </a>
        </div>
      </div>
    </main>
  );
}
