import { AUTH_LOGOUT, AUTH_SET_AUTHENTICATED } from "../actionTypes/auth";

const DEFAULT_STATE = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

/**
 * Reduces redux actions for authentication features.
 *
 * @param {Object} state - Current reduced redux state.
 * @param {Object} action - Action which was dispatched.
 * @returns {Object} - Updated reduced redux state.
 */
export default function auth(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case AUTH_SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
      };
    default:
      return state;
  }
}
