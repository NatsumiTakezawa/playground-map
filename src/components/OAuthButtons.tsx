/**
 * ソーシャル認証ボタンコンポーネント
 * @package MatsueOnsenMap
 * @module components/OAuthButtons
 */
import { supabase } from "@/lib/supabaseClient";

export default function OAuthButtons() {
  /**
   * Google OAuth認証を開始
   */
  async function handleGoogleSignIn() {
    // ※開発段階では省略された形のみ実装
    // Supabaseのコアライブラリを使用した本実装は、Google開発コンソールの設定後に修正
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error("Google認証エラー:", error.message);
    }
  }

  return (
    <div className="w-full space-y-4 mb-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded p-2 hover:bg-gray-50 transition"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.766 12.2764c0-.9287-.093-1.8317-.262-2.7069H12.2422v5.1232h6.4871c-.2791 1.5026-1.1252 2.7736-2.3963 3.6265v3.0148h3.8804c2.2702-2.0915 3.5723-5.1705 3.5723-9.0576" fill="#4285F4" />
          <path d="M12.2422 24c3.2425 0 5.9573-1.0735 7.9422-2.9183l-3.8804-3.0147c-1.0746.7223-2.4535 1.1477-4.0618 1.1477-3.1234 0-5.7659-2.1108-6.7076-4.9456H1.5436v3.1127C3.5189 21.2137 7.5524 24 12.2422 24" fill="#34A853" />
          <path d="M5.5346 14.217c-.2402-.7166-.3767-1.4813-.3767-2.269 0-.7876.1365-1.5523.3767-2.2689V6.5664H1.5436C.551 8.3294 0 10.3534 0 12.5c0 2.1466.551 4.1706 1.5436 5.9335l3.991-3.2165" fill="#FBBC05" />
          <path d="M12.2422 4.9909c1.7607 0 3.3443.6052 4.5881 1.7935l3.4444-3.4456C18.2187 1.4116 15.5034 0 12.2422 0 7.5524 0 3.5189 2.7863 1.5436 6.5664l3.991 3.2165c.9417-2.8348 3.5842-4.792 6.7076-4.792" fill="#EA4335" />
        </svg>
        <span>Googleでサインイン</span>
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200"></span>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-sm text-gray-500">または</span>
        </div>
      </div>
    </div>
  );
}