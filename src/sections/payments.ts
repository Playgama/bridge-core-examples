import { el, pretty, setText } from '../util'

export function bindPaymentsSection(bridge: PlaygamaBridge): void {
    const p = bridge.payments
    setText('pay-supported', p.isSupported)

    const out = el('pay-output')
    const idInput = el<HTMLInputElement>('pay-id')

    el<HTMLButtonElement>('pay-get-purchases-btn').addEventListener('click', async () => {
        try {
            out.textContent = pretty(await p.getPurchases())
        } catch (error) {
            out.textContent = `getPurchases failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('pay-get-catalog-btn').addEventListener('click', async () => {
        try {
            out.textContent = pretty(await p.getCatalog())
        } catch (error) {
            out.textContent = `getCatalog failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('pay-purchase-btn').addEventListener('click', async () => {
        try {
            out.textContent = pretty(await p.purchase(idInput.value))
        } catch (error) {
            out.textContent = `purchase failed: ${(error as Error).message ?? error}`
        }
    })

    el<HTMLButtonElement>('pay-consume-btn').addEventListener('click', async () => {
        try {
            out.textContent = pretty(await p.consumePurchase(idInput.value))
        } catch (error) {
            out.textContent = `consumePurchase failed: ${(error as Error).message ?? error}`
        }
    })
}
