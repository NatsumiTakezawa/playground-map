/**
 * 温泉名・評価・レビュー数表示
 * @package MatsueOnsenMap
 * @module components/SpotHeader
 */
export function SpotHeader({
  name,
  rating,
  reviewCount,
}: {
  name: string;
  rating: number;
  reviewCount: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      <div className="flex items-center gap-2">
        <span className="text-accent-500 font-bold">★{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500">({reviewCount}件のレビュー)</span>
      </div>
    </div>
  );
}
export default SpotHeader;
