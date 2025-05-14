/**
 * S02 レビュー投稿モーダル（雛形）
 * @package MatsueOnsenMap
 * @module components/ReviewModal
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import StarRatingInput from "./StarRatingInput";

export type ReviewModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, image?: File) => void;
  error?: string | null;
};

export default function ReviewModal({
  open,
  onClose,
  onSubmit,
  error,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<File | undefined>(undefined);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レビューを書く</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <StarRatingInput value={rating} onChange={setRating} />
          <label className="block text-sm font-medium">1つ星</label>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            placeholder="コメントを入力..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0])}
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </div>
        <DialogFooter>
          <button
            className="bg-primary-500 text-white px-4 py-2 rounded font-bold hover:bg-primary-700 transition"
            onClick={() => onSubmit(rating, comment, image)}
            disabled={rating === 0 || comment.length === 0}
          >
            投稿する
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
