import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminMenu() {
  const router = useRouter();
  function handleSignOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("loginUser");
      router.replace("/auth/signin");
    }
  }
  return (
    <aside
      className="w-56 bg-white border-r flex flex-col p-4 gap-4 min-h-screen"
      data-testid="admin-menu"
    >
      <div className="font-bold text-lg text-primary-700 mb-6">
        管理メニュー
      </div>
      <nav className="flex flex-col gap-2">
        <Link href="/admin" className="font-medium text-primary-700">
          ダッシュボード
        </Link>
        <Link
          href="/admin/spots"
          className="text-gray-700 hover:text-primary-700"
        >
          スポットCMS
        </Link>
        <Link
          href="/admin/ads"
          className="text-gray-700 hover:text-primary-700"
        >
          広告管理
        </Link>
        <Link
          href="/admin/themes"
          className="text-gray-700 hover:text-primary-700"
        >
          テーマ管理
        </Link>
      </nav>
      <div className="mt-auto">
        <button
          className="text-xs text-gray-400 hover:underline relative z-[1000]"
          data-testid="signout-btn"
          onClick={handleSignOut}
        >
          サインアウト
        </button>
      </div>
    </aside>
  );
}
