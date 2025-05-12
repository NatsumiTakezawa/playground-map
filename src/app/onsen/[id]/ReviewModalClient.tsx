"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReviewModal from "@/components/ReviewModal";
import { supabase } from "@/lib/supabaseClient";

export default function ReviewModalClient({ onsenId }: { onsenId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(rating: number, comment: string, image?: File) {
    setError(null);
    // TODO: 認証ユーザー取得
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("投稿にはサインインが必要です");
      return;
    }

    let imageUrl: string | null = null;

    // 画像アップロード対応
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${onsenId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("reviews")
        .upload(filePath, image);

      if (uploadError) {
        setError("画像アップロードに失敗しました: " + uploadError.message);
        return;
      }

      imageUrl = filePath;
    }

    const { error } = await supabase.from("review").insert({
      onsen_id: onsenId,
      user_id: user.id,
      rating,
      comment,
      image_url: imageUrl,
    });
    if (error) {
      setError("投稿に失敗しました: " + error.message);
      return;
    }
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <button
        className="bg-primary-500 text-white px-6 py-2 rounded font-bold hover:bg-primary-700 transition"
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        レビューを書く
      </button>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
      {error && (
        <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
      )}
    </>
  );
}
