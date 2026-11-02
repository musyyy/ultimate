/**
 * Providers the user allows only in some projects: `providers.<id>.onlyIn` in `~/.ultimate/settings.json` lists globs
 * (`~/Projects/my-org/**`) of project folders. A project whose main checkout (a linked worktree counts as its main
 * checkout) matches none of them gets an overlay with no models for that provider, so they drop out of availability,
 * the picker, pins and defaults, and a request on one finds no model. Read once per load; project settings never
 * take part, so a repository cannot loosen it.
 */
import { join, matchesGlob } from 'node:path'
import type { ExtensionHost } from '../../server/extensions.ts'
import { projectKey } from '../../lib/families-settings.ts'
import { readSettings, userSettingsPath } from '../../lib/settings.ts'

type ScopeHost = Pick<ExtensionHost, 'userHome' | 'projectRoot' | 'notice'>

/** The providers `settings` does not allow in the project at `root`, a main checkout's real path; `~` is `home`. */
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

/** The providers this host's project may not use, read from the user's settings. */
export async function hostBlockedProviders(host: ScopeHost) {
  const settings = await readSettings(userSettingsPath(host.userHome)).catch((error: unknown) => {
    // An unreadable settings file is reported where settings load; here it holds no rule.
    host.notice(`Provider rules not read: ${String(error)}`)
    return {}
  })
  return new Set(blockedProviders(settings, projectKey(host.projectRoot), host.userHome))
}
