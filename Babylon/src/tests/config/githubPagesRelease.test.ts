import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveConfig } from 'vite'

const babylonRoot = process.cwd()
const repositoryRoot = path.resolve(babylonRoot, '..')
const workflowPath = path.join(
  repositoryRoot,
  '.github',
  'workflows',
  'release-web-build-to-github-pages.yml'
)

describe('GitHub Pages release publishing', () => {
  it('installs the Babylon workspace from the repository root', () => {
    const rootPackagePath = path.join(repositoryRoot, 'package.json')

    expect(existsSync(rootPackagePath)).toBe(true)

    if (!existsSync(rootPackagePath)) {
      return
    }

    const rootPackage = JSON.parse(
      readFileSync(rootPackagePath, 'utf8')
    ) as {
      private?: boolean
      workspaces?: string[]
    }

    expect(rootPackage.private).toBe(true)
    expect(rootPackage.workspaces).toContain('Babylon')
  })

  it('builds Vite assets with paths relative to each release folder',
    async () => {
      const config = await resolveConfig(
        {
          configFile: path.join(babylonRoot, 'vite.config.ts')
        },
        'build'
      )

      expect(config.base).toBe('./')
      expect(path.normalize(config.cacheDir)).toBe(
        path.join(repositoryRoot, 'node_modules', '.vite', 'babylon')
      )
    })

  it('uses the Vite base URL for runtime audio assets', () => {
    const source = readFileSync(
      path.join(babylonRoot, 'src', 'client', 'scripts', 'controller', 'index.ts'),
      'utf8'
    )

    expect(source).toContain('import.meta.env.BASE_URL')
    expect(source).not.toContain("playSound('/assets/")
  })

  it('publishes a Babylon build when a GitHub release is published', () => {
    expect(existsSync(workflowPath)).toBe(true)

    if (!existsSync(workflowPath)) {
      return
    }

    const workflow = readFileSync(workflowPath, 'utf8')

    expect(workflow).toMatch(/release:\s*\n\s*types:\s*\n\s*- published/)
    expect(workflow).toContain('cache-dependency-path: package-lock.json')
    expect(workflow).not.toContain(
      'cache-dependency-path: Babylon/package-lock.json'
    )
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm run build')
    expect(workflow).toContain('actions/upload-pages-artifact@v3')
    expect(workflow).toContain('actions/deploy-pages@v4')
    expect(workflow).toContain('pages-store/releases/${release_version}')
  })

  it('writes an exact release version to the runtime environment', () => {
    const workflow = readFileSync(workflowPath, 'utf8')
    const environmentPath = path.join(
      babylonRoot,
      'public',
      'environment.json'
    )

    expect(workflow).toContain(
      "version_pattern='^v[0-9]+[.][0-9]+[.][0-9]+$'"
    )
    expect(workflow).toContain(
      '> Babylon/public/environment.json'
    )
    expect(workflow).toContain('"releaseVersion": "%s"')
    expect(workflow).toContain('"downloadSize": "000000000000"')
    expect(workflow).toContain('Record total browser download size')
    expect(workflow).toContain('artifact_size=')
    expect(workflow).toContain('Babylon/dist/environment.json')
    expect(workflow).toContain(
      'Release tag must look like v0.0.0.'
    )
    expect(existsSync(environmentPath)).toBe(true)

    if (!existsSync(environmentPath)) {
      return
    }

    const environment = JSON.parse(
      readFileSync(environmentPath, 'utf8')
    ) as { downloadSize?: number; releaseVersion?: string }

    expect(environment.releaseVersion).toMatch(
      /^v[0-9]+[.][0-9]+[.][0-9]+$/
    )
    expect([undefined, '000000000000']).toContain(
      environment.downloadSize
    )
  })

  it('documents the live demo and versioned releases', () => {
    const readme = readFileSync(
      path.join(repositoryRoot, 'README.md'),
      'utf8'
    )

    expect(readme).toContain('## Live Demo')
    expect(readme).toContain(
      'https://samuelasherrivello.github.io/' +
        'babylon-walking-mobile/latest/'
    )
    expect(readme).toContain('/releases/<version>/')
  })
})
