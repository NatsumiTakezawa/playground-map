/**
 * StarRatingInput（レビュー投稿用 星評価入力）
 * @package MatsueOnsenMap
 * @module components/StarRatingInput
 */
import { useState } from "react";

export default function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1" aria-label="評価">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl focus:outline-none ${star <= (hover ?? value) ? "text-accent-500" : "text-gray-300"}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          aria-label={`星${star}を選択`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
