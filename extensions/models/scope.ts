import { join, matchesGlob } from 'node:path'
import type { ExtensionHost } from '../../server/extensions.ts'
import { projectKey } from '../../lib/families-settings.ts'
import { readSettings, userSettingsPath } from '../../lib/settings.ts'

type ScopeHost = Pick<ExtensionHost, 'userHome' | 'projectRoot' | 'notice'>

export function blockedProviders(settings: unknown, root: string, home: string) {
  const providers = (settings as { providers?: unknown } | undefined)?.providers
  if (!providers || typeof providers !== 'object') return []
  return Object.entries(providers).flatMap(([id, rule]) => {
    const onlyIn = (rule as { onlyIn?: unknown } | null)?.onlyIn
    if (!Array.isArray(onlyIn)) return []
    const allowed = onlyIn.some(
      (glob) =>
        typeof glob === 'string' &&
        matchesGlob(root, glob.startsWith('~/') ? join(home, glob.slice(2)) : glob),
    )
    return allowed ? [] : [id]
  })
}

export async function hostBlockedProviders(host: ScopeHost) {
  const settings = await readSettings(userSettingsPath(host.userHome)).catch((error: unknown) => {
    host.notice(`Provider rules not read: ${String(error)}`)
    return {}
  })
  return new Set(blockedProviders(settings, projectKey(host.projectRoot), host.userHome))
}
