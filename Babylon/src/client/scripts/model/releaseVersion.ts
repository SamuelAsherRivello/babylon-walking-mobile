// releaseVersion.ts - Loads and resolves runtime release metadata.
const localDevelopmentVersion = 'v0.0.0'
const releaseVersionPattern = /^[vV][0-9]+[.][0-9]+[.][0-9]+$/

type ReleaseEnvironmentResponse = {
  json: () => Promise<unknown>
  ok: boolean
}

export type ReleaseEnvironmentFetcher = (
  url: string,
  init: { cache: 'no-store' }
) => Promise<ReleaseEnvironmentResponse>

export type ReleaseMetadata = {
  downloadSize: string
  releaseVersion: string
}

const fetchEnvironment: ReleaseEnvironmentFetcher = (url, init) => {
  return fetch(url, init)
}

export function resolveReleaseVersion(
  releaseVersion: unknown
): string {
  if (
    typeof releaseVersion !== 'string' ||
    !releaseVersionPattern.test(releaseVersion)
  ) {
    return localDevelopmentVersion
  }

  return releaseVersion.replace(/^V/, 'v')
}

export function formatDownloadSize(downloadSize: unknown): string {
  if (typeof downloadSize === 'string' && downloadSize.trim() !== '') {
    downloadSize = Number(downloadSize)
  }

  if (
    typeof downloadSize !== 'number' ||
    !Number.isFinite(downloadSize) ||
    downloadSize < 0
  ) {
    return ''
  }

  return `${(downloadSize / 1000000).toFixed(1)}Mb`
}

export async function loadReleaseMetadata(
  baseUrl: string,
  fetcher: ReleaseEnvironmentFetcher = fetchEnvironment
): Promise<ReleaseMetadata> {
  try {
    const response = await fetcher(
      `${baseUrl}environment.json`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return {
        downloadSize: '',
        releaseVersion: localDevelopmentVersion
      }
    }

    const environment = await response.json()

    if (!environment || typeof environment !== 'object') {
      return {
        downloadSize: '',
        releaseVersion: localDevelopmentVersion
      }
    }

    const metadata = environment as {
      downloadSize?: unknown
      releaseVersion?: unknown
    }

    return {
      downloadSize: formatDownloadSize(metadata.downloadSize),
      releaseVersion: resolveReleaseVersion(metadata.releaseVersion)
    }
  } catch {
    return {
      downloadSize: '',
      releaseVersion: localDevelopmentVersion
    }
  }
}

export async function loadReleaseVersion(
  baseUrl: string,
  fetcher: ReleaseEnvironmentFetcher = fetchEnvironment
): Promise<string> {
  const metadata = await loadReleaseMetadata(baseUrl, fetcher)
  return metadata.releaseVersion
}
