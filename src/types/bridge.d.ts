// Type declarations for the Playgama Bridge global (`window.bridge`).
// Mirrors the public surface of `playgama/bridge` v1.30.x.

export {}

declare global {
    type PlatformId =
        | 'vk' | 'ok' | 'yandex' | 'crazy_games' | 'absolute_games'
        | 'game_distribution' | 'playgama' | 'playdeck' | 'telegram'
        | 'y8' | 'lagged' | 'facebook' | 'poki' | 'mock' | 'qa_tool'
        | 'msn' | 'microsoft_store' | 'huawei' | 'bitquest' | 'gamepush'
        | 'discord' | 'jio_games' | 'youtube' | 'portal' | 'reddit'
        | 'xiaomi' | 'tiktok' | 'dlightek' | 'gamesnacks'

    type ModuleName =
        | 'core' | 'platform' | 'player' | 'game' | 'storage'
        | 'advertisement' | 'social' | 'device' | 'leaderboards'
        | 'payments' | 'remote_config' | 'clipboard' | 'achievements'
        | 'analytics' | 'recorder'

    type EventName =
        | 'interstitial_state_changed' | 'rewarded_state_changed'
        | 'banner_state_changed' | 'advanced_banners_state_changed'
        | 'visibility_state_changed' | 'audio_state_changed'
        | 'pause_state_changed' | 'orientation_state_changed'
        | 'screen_size_changed' | 'platform_message_sent'
        | 'default_storage_type_changed'

    type CloudStorageMode = 'none' | 'eager' | 'lazy'

    type VisibilityState = 'visible' | 'hidden'
    type InterstitialState = 'loading' | 'opened' | 'closed' | 'failed'
    type RewardedState = 'loading' | 'opened' | 'closed' | 'failed' | 'rewarded'
    type BannerState = 'loading' | 'shown' | 'hidden' | 'failed'
    type BannerPosition = 'top' | 'bottom'
    type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'tv'
    type DeviceOs = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'other'
    type DeviceOrientation = 'portrait' | 'landscape'
    type LeaderboardType = 'not_available' | 'in_game' | 'native' | 'native_popup'

    type PlatformMessage =
        | 'game_ready' | 'level_started' | 'level_completed' | 'level_failed'
        | 'level_paused' | 'level_resumed' | 'in_game_loading_started'
        | 'in_game_loading_stopped' | 'gameplay_started' | 'gameplay_stopped'
        | 'player_got_achievement'

    interface Emitter<E extends string = string> {
        on(event: E, listener: (...args: any[]) => void): void
        off(event: E, listener?: (...args: any[]) => void): void
        once(event: E, listener: (...args: any[]) => void): void
        emit(event: E, ...args: unknown[]): void
    }

    interface PlatformModuleApi extends Emitter<EventName> {
        readonly id: PlatformId
        readonly sdk: unknown
        readonly language: string
        readonly payload: string | null
        readonly tld: string | null
        readonly isAudioEnabled: boolean
        readonly isPaused: boolean
        readonly isGetAllGamesSupported: boolean
        readonly isGetGameByIdSupported: boolean
        sendMessage(message: PlatformMessage | string, options?: Record<string, unknown>): Promise<void>
        sendCustomMessage(id: string, options?: Record<string, unknown>): Promise<unknown>
        getServerTime(): Promise<number>
        getAllGames(): Promise<unknown>
        getGameById(options: string | Record<string, unknown>): Promise<unknown>
    }

    interface PlayerModuleApi extends Emitter<EventName> {
        readonly isAuthorizationSupported: boolean
        readonly isAuthorized: boolean
        readonly id: string | null
        readonly name: string | null
        readonly photos: string[]
        readonly extra: Record<string, unknown> | null
        authorize(options?: Record<string, unknown>): Promise<void>
    }

    interface GameModuleApi extends Emitter<EventName> {
        readonly visibilityState: VisibilityState
        setLoadingProgress(percent: number, isFallback?: boolean): void
    }

    interface StorageModuleApi extends Emitter<EventName> {
        get<T = unknown>(key: string | string[], tryParseJson?: boolean): Promise<T>
        set(key: string | string[], value: unknown | unknown[]): Promise<void>
        delete(key: string | string[]): Promise<void>
    }

    interface AdvertisementModuleApi extends Emitter<EventName> {
        readonly isBannerSupported: boolean
        readonly isInterstitialSupported: boolean
        readonly isRewardedSupported: boolean
        readonly isAdvancedBannersSupported: boolean
        readonly bannerState: BannerState | null
        readonly interstitialState: InterstitialState | null
        readonly rewardedState: RewardedState | null
        readonly rewardedPlacement: string | null
        readonly advancedBannersState: Record<string, BannerState> | null
        readonly minimumDelayBetweenInterstitial: number
        setMinimumDelayBetweenInterstitial(value: number | string): void
        showBanner(position?: BannerPosition, placement?: string | null): void
        hideBanner(): void
        preloadInterstitial(placement?: string | null): void
        showInterstitial(placement?: string | null): void
        preloadRewarded(placement?: string | null): void
        showRewarded(placement?: string | null): void
        showAdvancedBanners(placement: string): void
        hideAdvancedBanners(): void
        checkAdBlock(): Promise<boolean>
    }

    interface SocialModuleApi extends Emitter<EventName> {
        readonly isShareSupported: boolean
        readonly isInviteFriendsSupported: boolean
        readonly isJoinCommunitySupported: boolean
        readonly isCreatePostSupported: boolean
        readonly isAddToHomeScreenSupported: boolean
        readonly isAddToHomeScreenRewardSupported: boolean
        readonly isAddToFavoritesSupported: boolean
        readonly isAddToFavoritesRewardSupported: boolean
        readonly isRateSupported: boolean
        readonly isExternalLinksAllowed: boolean
        share(options: Record<string, unknown>): Promise<void>
        inviteFriends(options?: Record<string, unknown>): Promise<void>
        joinCommunity(options?: Record<string, unknown>): Promise<void>
        createPost(options: Record<string, unknown>): Promise<void>
        addToHomeScreen(): Promise<void>
        getAddToHomeScreenReward(): Promise<unknown>
        addToFavorites(): Promise<void>
        getAddToFavoritesReward(): Promise<unknown>
        rate(): Promise<void>
    }

    interface DeviceSafeArea {
        top: number
        bottom: number
        left: number
        right: number
    }

    interface DeviceModuleApi extends Emitter<EventName> {
        readonly type: DeviceType
        readonly os: DeviceOs
        readonly orientation: DeviceOrientation
        readonly safeArea: DeviceSafeArea
    }

    interface LeaderboardEntry {
        id: string
        name: string
        score: number
        rank: number
        photo?: string
    }

    interface LeaderboardsModuleApi extends Emitter<EventName> {
        readonly type: LeaderboardType
        setScore(id: string, score: number | string): Promise<void>
        getEntries(id: string): Promise<LeaderboardEntry[]>
        showNativePopup(id: string): Promise<void>
    }

    interface PaymentsModuleApi extends Emitter<EventName> {
        readonly isSupported: boolean
        purchase(id: string, options?: Record<string, unknown>): Promise<unknown>
        getPurchases(): Promise<unknown[]>
        getCatalog(): Promise<unknown[]>
        consumePurchase(id: string): Promise<unknown>
    }

    interface AchievementsModuleApi extends Emitter<EventName> {
        readonly isSupported: boolean
        readonly isGetListSupported: boolean
        readonly isNativePopupSupported: boolean
        unlock(options?: Record<string, unknown>): Promise<unknown>
        getList(options?: Record<string, unknown>): Promise<unknown[]>
        showNativePopup(options?: Record<string, unknown>): Promise<void>
    }

    interface RemoteConfigModuleApi extends Emitter<EventName> {
        readonly isSupported: boolean
        get(options?: Record<string, unknown>): Promise<Record<string, unknown>>
    }

    interface ClipboardModuleApi extends Emitter<EventName> {
        readonly isSupported: boolean
        read(): Promise<string>
        write(text: string): Promise<void>
    }

    interface AnalyticsModuleApi {
        send(eventType: string, data?: Record<string, unknown>): void
    }

    interface PlaygamaBridge extends Emitter<EventName> {
        readonly version: string
        readonly isInitialized: boolean
        readonly options: Record<string, unknown>
        engine: string

        readonly platform: PlatformModuleApi
        readonly player: PlayerModuleApi
        readonly game: GameModuleApi
        readonly storage: StorageModuleApi
        readonly advertisement: AdvertisementModuleApi
        readonly social: SocialModuleApi
        readonly device: DeviceModuleApi
        readonly leaderboard: LeaderboardsModuleApi
        readonly leaderboards: LeaderboardsModuleApi
        readonly payments: PaymentsModuleApi
        readonly achievements: AchievementsModuleApi
        readonly remoteConfig: RemoteConfigModuleApi
        readonly clipboard: ClipboardModuleApi
        readonly analytics: AnalyticsModuleApi

        readonly PLATFORM_ID: Record<string, PlatformId>
        readonly PLATFORM_MESSAGE: Record<string, PlatformMessage>
        readonly MODULE_NAME: Record<string, ModuleName>
        readonly EVENT_NAME: Record<string, EventName>
        readonly INTERSTITIAL_STATE: Record<string, InterstitialState>
        readonly REWARDED_STATE: Record<string, RewardedState>
        readonly BANNER_STATE: Record<string, BannerState>
        readonly VISIBILITY_STATE: Record<string, VisibilityState>
        readonly DEVICE_TYPE: Record<string, DeviceType>
        readonly DEVICE_ORIENTATION: Record<string, DeviceOrientation>

        initialize(options?: { configFilePath?: string } & Record<string, unknown>): Promise<void>
    }

    interface Window {
        bridge: PlaygamaBridge
    }
}
