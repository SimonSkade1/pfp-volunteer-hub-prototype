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
    case 'groups':
      return { name: 'groups' } // all local groups
    case 'g':
      return c ? { name: 'project', groupId: b, projectId: c } : { name: 'group', id: b }
    case 'vacancies':
      return { name: 'vacancies' }
    case 'v':
      return { name: 'vacancy', id: b }
    case 'apply':
      return { name: 'apply', id: b } // a stream, group or vacancy
    case 'me':
      return { name: 'me' } // your profile
    case 'p':
      return { name: 'person', id: b } // a lead's profile
    case 'manage':
      return { name: 'manage', id: b, projectId: c } // the lead view of a stream or group, or of a group's project
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
  groups: '#/groups',
  group: (id) => `#/g/${id}`,
  project: (groupId, projectId) => `#/g/${groupId}/${projectId}`,
  vacancies: '#/vacancies',
  vacancy: (id) => `#/v/${id}`,
  item: (item) => `#/${{ group: 'g', vacancy: 'v' }[item.kind] ?? 's'}/${item.id}`, // a stream, group or vacancy
  apply: (id) => `#/apply/${id}`,
  me: '#/me',
  person: (id) => `#/p/${id}`,
  manage: (id, projectId) => `#/manage/${id}${projectId ? `/${projectId}` : ''}`,
}

export function navigate(to) {
  location.hash = to
}
