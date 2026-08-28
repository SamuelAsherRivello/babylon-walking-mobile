// releaseVersion.ts - Loads and resolves runtime release metadata.
const localDevelopmentVersion = 'V0.0.0'
const releaseVersionPattern = /^[vV][0-9]+[.][0-9]+[.][0-9]+$/

type ReleaseEnvironmentResponse = {
  json: () => Promise<unknown>
  ok: boolean
}

export type ReleaseEnvironmentFetcher = (
  url: string,
  init: { cache: 'no-store' }
) => Promise<ReleaseEnvironmentResponse>

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

  return releaseVersion.replace(/^v/, 'V')
}

export async function loadReleaseVersion(
  baseUrl: string,
  fetcher: ReleaseEnvironmentFetcher = fetchEnvironment
): Promise<string> {
  try {
    const response = await fetcher(
      `${baseUrl}environment.json`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return localDevelopmentVersion
    }

    const environment = await response.json()

    if (!environment || typeof environment !== 'object') {
      return localDevelopmentVersion
    }

    const releaseVersion = (
      environment as { releaseVersion?: unknown }
    ).releaseVersion

    return resolveReleaseVersion(releaseVersion)
  } catch {
    return localDevelopmentVersion
  }
}
