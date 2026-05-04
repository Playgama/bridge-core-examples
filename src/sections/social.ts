import { el, pretty, setText } from '../util'

export function bindSocialSection(bridge: PlaygamaBridge): void {
    const s = bridge.social
    setText('social-share-supported', s.isShareSupported)
    setText('social-invite-supported', s.isInviteFriendsSupported)
    setText('social-join-supported', s.isJoinCommunitySupported)
    setText('social-create-post-supported', s.isCreatePostSupported)
    setText('social-home-supported', s.isAddToHomeScreenSupported)
    setText('social-home-reward-supported', s.isAddToHomeScreenRewardSupported)
    setText('social-fav-supported', s.isAddToFavoritesSupported)
    setText('social-fav-reward-supported', s.isAddToFavoritesRewardSupported)
    setText('social-rate-supported', s.isRateSupported)
    setText('social-external-links', s.isExternalLinksAllowed)

    const out = el('social-output')
    const wrap = async (label: string, fn: () => Promise<unknown>): Promise<void> => {
        try {
            const result = await fn()
            out.textContent = `${label}: ok ${result === undefined ? '' : pretty(result)}`
        } catch (error) {
            out.textContent = `${label}: failed — ${(error as Error).message ?? error}`
        }
    }

    el<HTMLButtonElement>('social-share-btn').addEventListener('click', () =>
        wrap('share', () => s.share({ vk: { link: el<HTMLInputElement>('social-share-link').value } })),
    )

    el<HTMLButtonElement>('social-invite-btn').addEventListener('click', () =>
        wrap('inviteFriends', () => s.inviteFriends({ ok: { text: el<HTMLInputElement>('social-invite-text').value || 'Invite friends' } })),
    )

    el<HTMLButtonElement>('social-join-btn').addEventListener('click', () =>
        wrap('joinCommunity', () => s.joinCommunity({ vk: { groupId: el<HTMLInputElement>('social-group-id').value } })),
    )

    el<HTMLButtonElement>('social-post-btn').addEventListener('click', () => {
        const message = el<HTMLInputElement>('social-post-message').value
        const attachments = el<HTMLInputElement>('social-post-attachments').value
        return wrap('createPost', () =>
            s.createPost({
                vk: { message, attachments },
                ok: { media: [{ type: 'text', text: message }] },
            }),
        )
    })

    el<HTMLButtonElement>('social-home-btn').addEventListener('click', () =>
        wrap('addToHomeScreen', () => s.addToHomeScreen()),
    )
    el<HTMLButtonElement>('social-home-reward-btn').addEventListener('click', () =>
        wrap('getAddToHomeScreenReward', () => s.getAddToHomeScreenReward()),
    )
    el<HTMLButtonElement>('social-fav-btn').addEventListener('click', () =>
        wrap('addToFavorites', () => s.addToFavorites()),
    )
    el<HTMLButtonElement>('social-fav-reward-btn').addEventListener('click', () =>
        wrap('getAddToFavoritesReward', () => s.getAddToFavoritesReward()),
    )
    el<HTMLButtonElement>('social-rate-btn').addEventListener('click', () => wrap('rate', () => s.rate()))
}
