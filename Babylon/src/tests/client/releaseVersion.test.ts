import { describe, expect, it, vi } from 'vitest'
import {
  loadReleaseVersion,
  resolveReleaseVersion
} from '../../client/scripts/releaseVersion'

describe('release version', () => {
  it('uses the exact stored release tag', () => {
    expect(resolveReleaseVersion('v0.05.1')).toBe('V0.05.1')
  })

  it('uses V0.0.0 when release metadata is invalid', () => {
    expect(resolveReleaseVersion(undefined)).toBe('V0.0.0')
    expect(resolveReleaseVersion('')).toBe('V0.0.0')
    expect(resolveReleaseVersion('v0.05')).toBe('V0.0.0')
    expect(resolveReleaseVersion(5)).toBe('V0.0.0')
  })

  it('loads the release from the runtime environment file', async () => {
    const fetchEnvironment = vi.fn(async () => ({
      json: async () => ({ releaseVersion: 'v0.05.1' }),
      ok: true
    }))

    await expect(loadReleaseVersion('./', fetchEnvironment))
      .resolves.toBe('V0.05.1')
    expect(fetchEnvironment).toHaveBeenCalledWith(
      './environment.json',
      { cache: 'no-store' }
    )
  })

  it('uses V0.0.0 when the runtime environment cannot load', async () => {
    const fetchEnvironment = vi.fn(async () => {
      throw new Error('offline')
    })

    await expect(loadReleaseVersion('./', fetchEnvironment))
      .resolves.toBe('V0.0.0')
  })
})
