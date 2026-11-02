import { expect, it } from 'vitest'
import { listProjects } from '../extensions/instance/server.ts'

const project = (name: string, extra: object = {}) => ({
  name,
  root: `/code/${name}`,
  home: `/homes/${name}`,
  current: false,
  conversations: [],
  ...extra,
})

it('lists existing projects with their local and live tailnet addresses', () => {
  const listed = listProjects(
    [
      project('zeta', { running: { pid: 10, url: 'http://127.0.0.1:4748' }, current: true }),
      project('alpha', { running: { pid: 20, url: 'http://127.0.0.1:4747' } }),
      project('stopped'),
      project('gone'),
      // Running, but the server that registered its tailnet port has exited: no tailnet link.
      project('local', { running: { pid: 30, url: 'http://127.0.0.1:4749' } }),
    ],
    [
      { key: '/code/alpha', pid: 21, url: 'https://box.ts.net:4747' },
      { key: '/code/stopped', pid: 40, url: 'https://box.ts.net:4750' },
      { key: '/code/local', pid: 31, url: 'https://box.ts.net:4749' },
    ],
    (path) => path !== '/code/gone',
    (pid) => pid !== 31,
  )
  expect(listed).toEqual([
    {
      name: 'alpha',
      root: '/code/alpha',
      current: false,
      url: 'http://127.0.0.1:4747',
      tailnet: 'https://box.ts.net:4747',
    },
    { name: 'local', root: '/code/local', current: false, url: 'http://127.0.0.1:4749' },
    { name: 'stopped', root: '/code/stopped', current: false },
    { name: 'zeta', root: '/code/zeta', current: true, url: 'http://127.0.0.1:4748' },
  ])
})
