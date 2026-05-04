import { el, parseJsonLoose, pretty, setText } from '../util'

export function bindRemoteConfigSection(bridge: PlaygamaBridge): void {
    setText('rc-supported', bridge.remoteConfig.isSupported)

    const out = el('rc-output')
    el<HTMLButtonElement>('rc-get-btn').addEventListener('click', async () => {
        const optionsRaw = el<HTMLInputElement>('rc-options').value
        const options = parseJsonLoose(optionsRaw) as Record<string, unknown> | undefined
        try {
            out.textContent = pretty(await bridge.remoteConfig.get(options))
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })
}
