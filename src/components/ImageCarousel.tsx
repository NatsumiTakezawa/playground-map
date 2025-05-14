/**
 * 温泉画像カルーセル
 * @package MatsueOnsenMap
 * @module components/ImageCarousel
 */
import Image from "next/image";

export function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  // 単純な1枚表示（今後スワイプ対応予定）
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
        画像なし
      </div>
    );
  }
  return (
    <div className="w-full h-64 relative">
      <Image src={images[0]} alt={alt} fill className="object-cover rounded" />
    </div>
  );
}
export default ImageCarousel;
