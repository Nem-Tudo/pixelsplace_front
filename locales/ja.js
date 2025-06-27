module.exports = {
    _LANGUAGE: {
        NAME: "日本語",
        CODE: "ja",
        FLAG: "🇯🇵"
    },
    COMMON: {
        YES: "はい",
        NO: "いいえ",
        OK: "OK",
        CANCEL: "キャンセル",
        SUBMIT: "送信",
        DELETE: "削除",
        EDIT: "編集",
        SAVE: "保存",
        CLOSE: "閉じる",
        NAME: "名前",
        AUTHOR: "作成者",
        USE: "使用する",
        NOT_IMPLEMENTED_YET: "まだ実装されていません",
        ADMIN: "管理者",
        REDIRECTING: "リダイレクト中...",
        LOADING: "読み込み中...",
        NO_PERMISSION: "これを行う権限がありません",
    },
    COMPONENTS: {
        BUILD_SWITCHER: {
            ERROR_FETCH_BUILDS: "ビルドの取得エラー",
            UNKNOWN_ERROR: "不明なエラー",
            INVALID_BUILD_MESSAGE: "無効なビルドを使用しています。メインビルドに戻ります...",
            BUILD_NOT_FOUND: "ビルドが見つかりません",
            ERROR_SWITCH_BUILD: "ビルドの切り替えエラー",
            ERROR_FETCH_BRANCH: "現在のブランチの取得エラー",
            BUILD_OVERRIDE: "ビルドオーバーライド",
            CUSTOM_BRANCH_WARNING: "カスタムブランチを編集しています",
            ACTIVE_BUILD: "アクティブなビルド",
            ACTIVE_BRANCH: "アクティブなブランチ",
            SWITCHING_BUILD: "ビルドを切り替え中..."
        },
        HEADER: {
            ADVANTAGES: "利点",
            PROFILE: "プロフィール",
            DISCONNECT: "ログアウト",
            REMOVE_BUILD_OVERRIDE: "ビルドオーバーライドを削除",
            LOGIN: "ログイン",
            LOGGED_OUT: "ログアウト済み"
        },
        PREMIUM_POPUP: {
            TITLE: "プレミアムが必要です！",
            DESCRIPTION1: "宇宙中のどんな色でも選べると想像してください…できます！",
            DESCRIPTION2: "PixelsPlace Premiumでそれ以上の体験を！",
            MAYBE_LATER: "後で",
            DISCOVER_PREMIUM: "Premium を確認！"
        },
        PREMIUM_WARNING: {
            FEATURE_PREMIUM_ONLY: "この機能はプレミアム限定です",
            BUY_PREMIUM_HERE: "ここでプレミアムを購入！"
        }
    },
    LAYOUTS: {
        MAIN_LAYOUT: {
            BANNED_TITLE: "あなたはBANされました。",
            AFFECTED_AREAS: "影響を受けるエリア",
            NO_FANCY_UNBAN_PAGE: "おしゃれなBAN解除ページはありません。これがすべてです。",
            OPEN_TICKET_INSTRUCTION: "できることは以下でチケットを開くことだけです:",
            EXPLAIN_WHAT_HAPPENED: "そして何が起きたか説明してみてください",
            MODS_HAVE_RECORDS: "モデレーターはすべての記録を持っています。つまり全知全能です... 本当にうまい言い訳をしないといけません。",
            FAREWELL_MESSAGE: "まあ、そんな感じです。またね",
            INVALID_BUILD_ALERT: "無効なビルドを使用中です。メインビルドに戻ります。"
        }
    },
    PAGES: {
        HOME: {
            META_DESCRIPTION: "PixelsPlaceに参加しよう！",
            LOGO_ALT: "ロゴ",
            TIME_TRAVEL: "タイムトラベル",
            SERVERS: "サーバー",
            START: "始める",
        },
        DISCORD_OAUTH2: {
            LOGGED_IN: "ログイン済み",
            DISCONNECTED: "切断されました",
            SUCCESS_REDIRECTING: "成功しました。リダイレクト中..."
        },
        BUILD_OVERRIDE: {
            LOADING_BUILD: "ビルドを読み込み中...",
            REMOVING_BUILDS: "ビルドを削除中...",
            INVALID_BUILD: "無効なビルド",
            ERROR_FETCHING_BUILD: "ビルドの取得中にエラーが発生しました",
            TITLE: "PixelsPlaceでカスタムビルドを使用しますか？",
            SIGNED_BY: "署名者",
            UPDATING_BUILD: "ビルドを更新中...",
            REMOVE_INSTRUCTION: "後で削除したい場合は、プロフィール設定から削除できます"
        },
        USER_PROFILE: {
            PROFILE_BACKGROUND_ALT: "プロフィールの背景",
            USER_AVATAR_ALT: "ユーザーのアバター",
            GUILD_ICON_ALT: "{{guildName}}のアイコン",
            JOIN_GUILD: "参加する",
            PIXELS_PLACED: "{{displayName}} は {{pixelQuantity}} ピクセルを配置しました",
            VIEW_PIXELS: "{{displayName}} のピクセルを見る"
        },
        PARTNERS: {
            SERVERS: "サーバー",
            PARTICIPATING_SERVERS: "参加中のサーバー",
            SECRET: "秘密...",
            GUILD_ICON_ALT: "{{guildName}}のアイコン",
            JOIN: "参加"
        },
        TIME_TRAVEL: {
            PAGE_TITLE: "PixelsPlace タイムトラベル",
            PAGE_DESCRIPTION: "PixelsPlaceに参加しよう！",
            API_ERROR: "メインAPIへの接続でエラーが発生しました",
            RELOAD_BUTTON: "再読み込み",
            FULL_HISTORY: "すべての履歴",
            CHANGES_ONLY: "変更のみ",
            MARCH_LABEL: "マーチ (m):",
            MULTIPLIER_LABEL: "倍率:"
        },
        PLACE: {
            META_DESCRIPTION: "PixelsPlaceに参加しよう！",
            COPY_LINK: "ピクセルリンクをコピー",
            LINK_GENERATED: "リンクが生成されました：",
            LINK_SUCCESSFULLY_COPIED: "リンクがクリップボードにコピーされました！",
            PICK_COLOR: "色を選択",
            PICK_A_COLOR: "色を選んでください",
            PREMIUM_ONLY_COLOR: "この色はプレミアムユーザーのみ利用可能です！ :(",
            PLACE_PIXEL: "ピクセルを配置",
            LOG_IN_TO_PLACE_PIXEL: "ピクセルを配置するにはログインしてください",
            PLACE: "配置！",
            PREMIUM_ANY_COLOR: "お好きな色を選択できます",
            WEBSOCKET_KICKED: "WebSocket切断：ルームからキックされました",
            ERROR_MAIN_API_CONNECT: "メインAPIへの接続でエラーが発生しました",
            ERROR_FAILED_WEBSOCKET: "WebSocket接続に失敗しました",
            WEBSOCKET_SEARCH: "WebSocketを検索中..."
        }
    },
}
