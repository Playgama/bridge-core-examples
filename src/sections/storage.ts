import { el, pretty, setText } from '../util'

export function bindStorageSection(bridge: PlaygamaBridge): void {
    const s = bridge.storage
    setText('storage-default-type', s.defaultType)
    setText('storage-ls', `${s.isSupported('local_storage')} / ${s.isAvailable('local_storage')}`)
    setText('storage-pi', `${s.isSupported('platform_internal')} / ${s.isAvailable('platform_internal')}`)

    const out = el('storage-output')
    const typeSel = el<HTMLSelectElement>('storage-type')
    const coinsInput = el<HTMLInputElement>('storage-key-coins')
    const levelInput = el<HTMLInputElement>('storage-key-level')

    el<HTMLButtonElement>('storage-get-btn').addEventListener('click', async () => {
        const type = typeSel.value as StorageType
        try {
            const data = await s.get<unknown[]>(['coins', 'level'], type)
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
        const type = typeSel.value as StorageType
        try {
            await s.set(['coins', 'level'], [coinsInput.value, levelInput.value], type)
            out.textContent = 'set: ok'
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('storage-delete-btn').addEventListener('click', async () => {
        const type = typeSel.value as StorageType
        try {
            await s.delete(['coins', 'level'], type)
            coinsInput.value = ''
            levelInput.value = ''
            out.textContent = 'delete: ok'
        } catch (error) {
            out.textContent = `failed: ${(error as Error).message ?? error}`
        }
    })
}
