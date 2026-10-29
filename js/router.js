// Hash routing: GitHub Pages has no SPA fallback, so every page lives behind index.html#/…

export function parseRoute(hash) {
  const path = hash.replace(/^#\/?/, '').split('?')[0]
  const [a, b, c] = path.split('/').filter(Boolean).map(decodeURIComponent)
  switch (a) {
    case 'email':
      return { name: 'email' }
    case 'welcome':
      return { name: 'onboarding' }
    case 'hub':
      return { name: 'home' }
    case 's':
      return c ? { name: 'task', streamId: b, taskId: c } : { name: 'stream', id: b }
    case 'g':
      return { name: 'group', id: b }
    case 'apply':
      return { name: 'apply', id: b }
    case 'lead':
      return { name: 'lead', kind: b } // 'group' | 'stream'
    case 'manage':
      return { name: 'manage', id: b } // the lead view of a stream or group
    default:
      return { name: 'start' } // no route: the email on a first visit, else the hub
  }
}

export const href = {
  email: '#/email',
  onboarding: '#/welcome',
  home: '#/hub',
  stream: (id) => `#/s/${id}`,
  task: (streamId, taskId) => `#/s/${streamId}/${taskId}`,
  group: (id) => `#/g/${id}`,
  item: (item) => (item.kind === 'group' ? `#/g/${item.id}` : `#/s/${item.id}`),
  apply: (id) => `#/apply/${id}`,
  lead: (kind) => `#/lead/${kind}`,
  manage: (id) => `#/manage/${id}`,
}

export function navigate(to) {
  location.hash = to
}
