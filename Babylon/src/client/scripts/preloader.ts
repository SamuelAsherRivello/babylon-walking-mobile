export interface Preloader {
  loadingUIBackgroundColor: string
  loadingUIText: string
  loadingUI(): void
  displayLoadingUI(): void
  hideLoadingUI(): void
  setStatus(status: string): void
  complete(): void
  fail(message: string): void
}

export function createPreloader(documentRef: Document): Preloader {
  const root = documentRef.createElement('div')
  root.id = 'game-preloader'
  root.setAttribute('role', 'status')
  root.setAttribute('aria-live', 'polite')
  root.innerHTML = `
    <div class="preloader-card">
      <div class="preloader-mark" aria-hidden="true">✦</div>
      <p class="preloader-kicker">Babylon Walking</p>
      <p class="preloader-status">Preparing your walk...</p>
      <div class="preloader-track" aria-hidden="true">
        <span></span>
      </div>
    </div>
  `
  documentRef.body.append(root)

  const statusElement = root.querySelector('.preloader-status')

  return {
    loadingUIBackgroundColor: 'transparent',
    loadingUIText: '',
    loadingUI() {
      root.hidden = false
    },
    displayLoadingUI() {
      root.hidden = false
    },
    hideLoadingUI() {
      this.complete()
    },
    setStatus(status: string) {
      if (statusElement) {
        statusElement.textContent = status
      }
    },
    complete() {
      root.classList.add('is-complete')
      window.setTimeout(() => root.remove(), 280)
    },
    fail(message: string) {
      root.classList.add('is-error')
      if (statusElement) {
        statusElement.textContent = message
      }
    }
  }
}
