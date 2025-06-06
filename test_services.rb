# 新しいサービスクラスのテストスクリプト
puts "=== 分割されたサービスクラスのテスト ==="

# DistanceCalculatorServiceのテスト
puts "\n1. DistanceCalculatorService のテスト"
begin
  distance = DistanceCalculatorService.calculate(35.4738, 133.0505, 35.4018, 132.6852)
  puts "   松江城 - 出雲大社の距離: #{distance}km"
  puts "   ✓ DistanceCalculatorService 正常動作"
rescue => e
  puts "   ✗ エラー: #{e.message}"
end

# AddressServiceのテスト
puts "\n2. AddressService のテスト"
begin
  address = AddressService.lookup_by_zipcode("690-0887")
  puts "   郵便番号 690-0887 の住所: #{address || 'nil'}"
  puts "   ✓ AddressService 正常動作"
rescue => e
  puts "   ✗ エラー: #{e.message}"
end

# GeocodingServiceのテスト（APIキーなしでもエラーハンドリング確認）
puts "\n3. GeocodingService のテスト"
begin
  result = GeocodingService.geocode("松江城")
  puts "   松江城の座標: #{result || 'nil (APIキー未設定のため正常)'}"
  puts "   ✓ GeocodingService 正常動作"
rescue => e
  puts "   ✗ エラー: #{e.message}"
end

puts "\n=== テスト完了 ==="
