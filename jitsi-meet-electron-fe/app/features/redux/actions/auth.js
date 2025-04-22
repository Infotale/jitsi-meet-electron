import { AUTH_LOGOUT, AUTH_SET_AUTHENTICATED } from "../actionTypes/auth";

/**
 * Sets authentication state.
 *
 * @param {Object} authData - Authentication data.
 * @param {string} authData.accessToken - Access token.
 * @param {string} authData.refreshToken - Refresh token.
 * @returns {Object}
 */
export function setAuthenticated(authData) {
  return {
    type: AUTH_SET_AUTHENTICATED,
    payload: authData,
  };
}

/**
 * Logs out the user.
 *
 * @returns {Object}
 */
export function logout() {
  return {
    type: AUTH_LOGOUT,
  };
}
