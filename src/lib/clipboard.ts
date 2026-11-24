/**
 * Copy text to the clipboard. Uses the Clipboard API where available (https, localhost) and falls back to
 * selecting the given input and `document.execCommand("copy")`. Resolves to whether it worked.
 */
export async function copyText(text: string, input?: HTMLInputElement | null): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && globalThis.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to the selection fallback
    }
  }
  if (!input) return false
  try {
    input.focus()
    input.select()
    return document.execCommand('copy')
  } catch {
    return false
  }
}
