// Main API module - re-exports all API functions for backward compatibility
// This allows gradual migration from single api.ts to modular structure

// Core
export {
  API_CONFIG,
  API_BASE_URL,
  apiRequest,
  apiFetch,
  apiJson,
  apiData,
  testBackendConnection,
  getBackendInfo,
  getApiCandidates,
  applyBackendOverride,
  maybePercentDecode,
} from './core'

// Meta (categories, countries, etc.)
export { getCategories, getCountries, getCountryOptions, getDtoVersion } from './meta'
export type { CountryOption } from './meta'

// Persons
export {
  getPersons,
  getPersonById,
  adminUpsertPerson,
  proposePersonEdit,
  proposeNewPerson,
  updatePerson,
  getPersonDrafts,
  submitPersonDraft,
  createPersonDraft,
  revertPersonToDraft,
  getMyPersonsCount,
} from './persons'

// Achievements
export {
  addAchievement,
  getMyAchievements,
  getMyAchievementsCount,
  getPendingAchievements,
  reviewAchievement,
  addGenericAchievement,
  getAchievementDrafts,
  updateAchievement,
  submitAchievementDraft,
  createAchievementDraft,
} from './achievements'

// Periods
export {
  saveLifePeriods,
  getMyPeriodsCount,
  getPeriodDrafts,
  updatePeriod,
  submitPeriodDraft,
  createPeriodDraft,
} from './periods'
export type { LifePeriodInput } from './periods'

// Lists
export {
  createListShareCode,
  resolveListShare,
  requestListPublication,
  reviewListPublication,
  getListModerationQueue,
  getPublicLists,
  getPublicListDetail,
} from './lists'

// Quiz
export {
  saveQuizAttempt,
  createSharedQuiz,
  getSharedQuiz,
  startSharedQuiz,
  checkSharedQuizAnswer,
  finishSharedQuiz,
  getGlobalLeaderboard,
  getUserStats,
  getSharedQuizLeaderboard,
} from './quiz'



