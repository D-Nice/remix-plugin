import { Plugin, PluginProfile, IPermissionHandler, ModuleProfile } from "../src"
import { RemixAppManager, Store, PermissionModuleApi } from "../examples/modules"
import { Ethdoc } from "../examples/plugins"

class PermissionHandler implements IPermissionHandler {
  responseToConfirm = { allow: true, remember: true }
  permissions = {}
  async askPermission(from: PluginProfile, to: ModuleProfile) {
    if (!this.responseToConfirm.allow) {
      throw new Error(`${from.name} is not allowed to call ${to.name}.`)
    }
  }

}

const EthdocProfile: PluginProfile<Ethdoc> = {
  name: 'ethdoc',
  events: ['newDoc'],
  methods: ['getdoc'],
  notifications: {
    'solCompiler': ['getCompilationFinished']
  },
  hash: 'Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ',
  url: 'https://ipfs.io/ipfs/Qmdu56TjQLMQmwitM6GRZXwvTWh8LBoNCWmoZbSzykPycJ/'
}

describe('Permissions', () => {
  let app: RemixAppManager
  let ethdoc: Plugin<Ethdoc>
  let permissionModule: PermissionModuleApi
  let permissionHandler: PermissionHandler
  beforeEach(() => {
    permissionHandler = new PermissionHandler()
    permissionModule = new PermissionModuleApi()
    ethdoc = new Plugin(EthdocProfile)
    app = new RemixAppManager(new Store(), permissionHandler)
    app.init([ethdoc, permissionModule.api()])
  })
  test('permission should be pristine', () => {
    expect(permissionHandler.permissions).toEqual({})
  })
  test('Permission should pass', async () => {
    // TODO : find a better way to test that
    try {
      await ethdoc.request({ name: permissionModule.name, key: 'callWithPermission', payload: [] })
      expect(true).toBe(true)
    } catch (err) {
      expect(true).toBe(false)
    }
  })
  test('Permission should not pass', async () => {
    permissionHandler.responseToConfirm = { allow: false, remember: true }
    try {
      await ethdoc.request({ name: permissionModule.name, key: 'callWithPermission', payload: [] })
    } catch (err) {
      expect(err.message).toBe(`${ethdoc.name} is not allowed to call ${permissionModule.name}.`)
    }
  })
})