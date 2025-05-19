# UI / UX 仕様書（Tailwind + Hotwire）

## 1. デザイン指針

- **Tailwind CSS** をユーティリティファーストで使用。共通色はカスタム CSS 変数に定義。
- **Atomic Design** 準拠（Atoms / Molecules / Organisms / Templates）。
- レスポンシブは Tailwind 既定の `sm / md / lg` ブレークポイント。

## 2. レイアウトワイヤーフレーム

```
+---------------------------------------------+
|              ナビバー (partial)              |
+--------------------+------------------------+
|                    |                        |
|     MapPane        |  SpotList (scroll)     |
|  (iframe / div)    |    SpotCard × N        |
|                    |                        |
+--------------------+------------------------+
|             フッター (partial)              |
+---------------------------------------------+
```

- **MapPane**: 左側に配置される地図表示エリア（iframe または div で実装）
- **SpotList**: 右側にスクロール可能なリスト形式で温泉スポットを表示
- **ナビバー/フッター**: 共通パーシャルとして実装

## 3. コンポーネントカタログ

| コンポーネント | ファイル                        | Stimulus Controller | 主な Tailwind クラス例            |
| -------------- | ------------------------------- | ------------------- | --------------------------------- |
| SpotCard       | `onsens/_spot_card.html.erb`    | `spot-card`         | `bg-white rounded shadow p-4`     |
| ReviewModal    | `reviews/_form.html.erb`        | `modal`             | `fixed inset-0 flex items-center` |
| RatingStars    | `shared/_rating_stars.html.erb` | ―                   | `text-yellow-400`                 |

## 4. モーダル要件

- Escape キー・背景クリックで閉じる (`keydown.escape->modal#close`)
- フォーカストラップを実装（初要素に `autofocus`）

## 5. アクセシビリティ

- ボタン／リンクに `aria-label` 付与
- 画像は必ず `alt`
