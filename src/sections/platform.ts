import { el, parseJsonLoose, pretty, setStatus, setText } from '../util'

export function bindPlatformSection(bridge: PlaygamaBridge): void {
    const p = bridge.platform

    setText('platform-id', p.id)
    setText('platform-language', p.language)
    setText('platform-payload', p.payload)
    setText('platform-tld', p.tld)
    setText('platform-audio', p.isAudioEnabled)
    setText('platform-paused', p.isPaused)
    setText('platform-getall-supported', p.isGetAllGamesSupported)
    setText('platform-getbyid-supported', p.isGetGameByIdSupported)

    document.querySelectorAll<HTMLButtonElement>('#platform-section .action[data-message]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const message = btn.dataset.message as PlatformMessage | undefined
            if (!message) return
            try {
                await p.sendMessage(message)
                setStatus('platform-send-message-status', `sent: ${message}`, 'ok')
            } catch (error) {
                setStatus('platform-send-message-status', `failed: ${(error as Error).message ?? error}`, 'err')
            }
        })
    })

    el<HTMLButtonElement>('platform-server-time-btn').addEventListener('click', async () => {
        try {
            const time = await p.getServerTime()
            setText('platform-server-time', `${time} (${new Date(Number(time)).toISOString()})`)
        } catch (error) {
            setText('platform-server-time', `failed: ${(error as Error).message ?? error}`)
        }
    })

    el<HTMLButtonElement>('platform-send-custom-btn').addEventListener('click', async () => {
        const id = el<HTMLInputElement>('platform-custom-id').value
        const optionsRaw = el<HTMLInputElement>('platform-custom-options').value
        const options = parseJsonLoose(optionsRaw) as Record<string, unknown> | undefined
        try {
            const result = await p.sendCustomMessage(id, options)
            setStatus('platform-send-message-status', `custom ok: ${pretty(result)}`, 'ok')
        } catch (error) {
            setStatus('platform-send-message-status', `custom failed: ${(error as Error).message ?? error}`, 'err')
        }
    })

    el<HTMLButtonElement>('platform-get-all-games-btn').addEventListener('click', async () => {
        const out = el('platform-games-output')
        try {
            out.textContent = pretty(await p.getAllGames())
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('platform-get-game-by-id-btn').addEventListener('click', async () => {
        const id = el<HTMLInputElement>('platform-game-id').value
        const out = el('platform-games-output')
        try {
            out.textContent = pretty(await p.getGameById(id))
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })
}
