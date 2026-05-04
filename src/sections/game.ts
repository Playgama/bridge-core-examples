import { appendLog, el, setText } from '../util'

export function bindGameSection(bridge: PlaygamaBridge): void {
    const log = el('game-visibility-log')
    setText('game-visibility', bridge.game.visibilityState)

    bridge.game.on('visibility_state_changed', (state: VisibilityState) => {
        setText('game-visibility', state)
        appendLog(log, `→ ${state}`)
    })

    el<HTMLButtonElement>('game-progress-btn').addEventListener('click', () => {
        const raw = el<HTMLInputElement>('game-progress-input').value
        const percent = Number(raw)
        if (Number.isFinite(percent)) {
            bridge.game.setLoadingProgress(percent)
        }
    })
}
