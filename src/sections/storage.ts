import { appendLog, el, pretty, setText } from '../util'

export function bindStorageSection(bridge: PlaygamaBridge): void {
    const s = bridge.storage
    setText('storage-default-type', s.defaultType)

    const out = el('storage-output')
    const log = el('storage-default-type-log')
    log.textContent = ''

    const coinsInput = el<HTMLInputElement>('storage-key-coins')
    const levelInput = el<HTMLInputElement>('storage-key-level')
    const tryParseJsonInput = el<HTMLInputElement>('storage-try-parse-json')

    s.on('default_storage_type_changed', () => {
        setText('storage-default-type', s.defaultType)
        appendLog(log, `→ ${s.defaultType}`)
    })

    el<HTMLButtonElement>('storage-get-btn').addEventListener('click', async () => {
        try {
            const data = await s.get<unknown[]>(['coins', 'level'], tryParseJsonInput.checked)
            out.textContent = pretty(data)
            if (Array.isArray(data)) {
                coinsInput.value = data[0] != null ? String(data[0]) : ''
                levelInput.value = data[1] != null ? String(data[1]) : ''
            }
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('storage-set-btn').addEventListener('click', async () => {
        try {
            await s.set(['coins', 'level'], [coinsInput.value, levelInput.value])
            out.textContent = 'set: ok'
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('storage-delete-btn').addEventListener('click', async () => {
        try {
            await s.delete(['coins', 'level'])
            coinsInput.value = ''
            levelInput.value = ''
            out.textContent = 'delete: ok'
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })
}
