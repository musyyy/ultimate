/** Instances in the browser: the preview servers started from this host, for the title bar and preview links. Browser-safe. */
import { actionRef } from '../../shared/extension-api.ts'

/** A preview server that served its UI. */
export type Preview = {
  id: string
  url: string
  /** The conversation that started it. */
  conversationId: number
  /** False once it exited or was stopped. */
  running: boolean
  /** Where the tailnet reaches it while it runs, when it publishes itself there. */
  tailnet?: string
}

/** No arguments → the previews that served their UI, running or stopped since; a failed start is not among them. */
export const ListAction = actionRef<null, Preview[]>('instance', 'list')

/** A project on this machine, for the switcher. */
export type ListedProject = {
  name: string
  root: string
  /** The project this server runs. */
  current: boolean
  /** Its loopback URL while it runs. */
  url?: string
  /** Where the tailnet reaches it while it runs and publishes itself there. */
  tailnet?: string
}

/** No arguments → the projects on this machine whose folders exist, by name. */
export const ProjectsAction = actionRef<null, ListedProject[]>('instance', 'projects')
