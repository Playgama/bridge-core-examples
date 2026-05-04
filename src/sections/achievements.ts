import { el, pretty, setText } from '../util'

export function bindAchievementsSection(bridge: PlaygamaBridge): void {
    const a = bridge.achievements
    setText('ach-supported', a.isSupported)
    setText('ach-list-supported', a.isGetListSupported)
    setText('ach-popup-supported', a.isNativePopupSupported)

    const out = el('ach-output')

    el<HTMLButtonElement>('ach-list-btn').addEventListener('click', async () => {
        try {
            out.textContent = pretty(await a.getList())
        } catch (error) {
            out.textContent = `getList failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('ach-popup-btn').addEventListener('click', async () => {
        try {
            await a.showNativePopup()
            out.textContent = 'showNativePopup: ok'
        } catch (error) {
            out.textContent = `showNativePopup failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('ach-unlock-btn').addEventListener('click', async () => {
        const id = el<HTMLInputElement>('ach-id').value
        const name = el<HTMLInputElement>('ach-name').value
        const platformId = bridge.platform.id
        let options: Record<string, unknown> = {}
        if (platformId === 'lagged') {
            options = { achievement: id }
        } else if (platformId === 'y8') {
            options = { achievement: name, achievementkey: id }
        } else {
            options = { id, name }
        }
        try {
            out.textContent = pretty(await a.unlock(options))
        } catch (error) {
            out.textContent = `unlock failed: ${(error as Error).message ?? error}`
        }
    })
}
