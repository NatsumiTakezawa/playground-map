import Link from "next/link";

/**
 * サイト共通ヘッダー
 */
export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-white border-b">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-primary-700 text-lg">
          松江市温泉マップ
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        <Link
          href="/auth/signin"
          className="text-primary-700 font-medium hover:underline"
        >
          サインイン
        </Link>
      </nav>
    </header>
  );
}
