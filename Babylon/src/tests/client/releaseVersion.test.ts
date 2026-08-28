import { describe, expect, it, vi } from 'vitest'
import {
  formatDownloadSize,
  loadReleaseMetadata,
  loadReleaseVersion,
  resolveReleaseVersion
} from '../../client/scripts/model/releaseVersion'

describe('release version', () => {
  it('uses the exact stored release tag', () => {
    expect(resolveReleaseVersion('v0.05.1')).toBe('v0.05.1')
  })

  it('uses V0.0.0 when release metadata is invalid', () => {
    expect(resolveReleaseVersion(undefined)).toBe('v0.0.0')
    expect(resolveReleaseVersion('')).toBe('v0.0.0')
    expect(resolveReleaseVersion('v0.05')).toBe('v0.0.0')
    expect(resolveReleaseVersion(5)).toBe('v0.0.0')
  })

  it('formats valid download sizes in megabytes', () => {
    expect(formatDownloadSize(100000000)).toBe('100.0Mb')
    expect(formatDownloadSize('1250000')).toBe('1.3Mb')
    expect(formatDownloadSize(-1)).toBe('')
  })

  it('loads the release from the runtime environment file', async () => {
    const fetchEnvironment = vi.fn(async () => ({
      json: async () => ({
        downloadSize: 100000000,
        releaseVersion: 'v0.05.1'
      }),
      ok: true
    }))

    await expect(loadReleaseVersion('./', fetchEnvironment))
      .resolves.toBe('v0.05.1')
    expect(fetchEnvironment).toHaveBeenCalledWith(
      './environment.json',
      { cache: 'no-store' }
    )
  })

  it('loads version and download size together', async () => {
    const fetchEnvironment = vi.fn(async () => ({
      json: async () => ({
        downloadSize: 2500000,
        releaseVersion: 'v0.05.1'
      }),
      ok: true
    }))

    await expect(loadReleaseMetadata('./', fetchEnvironment))
      .resolves.toEqual({
        downloadSize: '2.5Mb',
        releaseVersion: 'v0.05.1'
      })
  })

  it('uses V0.0.0 when the runtime environment cannot load', async () => {
    const fetchEnvironment = vi.fn(async () => {
      throw new Error('offline')
    })

    await expect(loadReleaseVersion('./', fetchEnvironment))
      .resolves.toBe('v0.0.0')
  })
})
