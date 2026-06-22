/** Shared club access code until Google Auth is wired up. */
export const DEFAULT_MEMBER_ACCESS_CODE = 'flf-members'

/**
 * When true, members can open /members without signing in.
 * Set to false (or remove) once Google Auth is live.
 */
export const USE_DEFAULT_MEMBER_ACCESS = true

export function getMemberAccessCode(): string {
  return import.meta.env.VITE_MEMBER_ACCESS_CODE ?? DEFAULT_MEMBER_ACCESS_CODE
}
