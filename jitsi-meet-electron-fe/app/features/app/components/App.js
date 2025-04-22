// @flow

import { AtlasKitThemeProvider } from "@atlaskit/theme";

import React, { Component } from "react";
import { Route, Switch } from "react-router";
import { connect } from "react-redux";
import { ConnectedRouter as Router, push } from "react-router-redux";

import { Conference } from "../../conference";
import config from "../../config";
import { history } from "../../router";
import { createConferenceObjectFromURL } from "../../utils";
import { Welcome } from "../../welcome";
import { AUTH_SET_AUTHENTICATED } from "../../redux/actionTypes/auth";

const API_URL = "http://localhost:3000";

/**
 * Wrapper component to handle authentication
 */
const PrivateComponent = ({ component: Component, ...rest }) => {
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const authCheckPerformed = React.useRef(false);
  const dispatch = rest.dispatch; // Get dispatch from props

  React.useEffect(() => {
    if (authCheckPerformed.current) return;
    authCheckPerformed.current = true;

    const checkAuth = async () => {
      console.log("Checking authentication");

      try {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");

        let tokenToUse = accessToken;

        if (accessToken) {
          console.log("Found token in URL");
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
        } else {
          // If no URL tokens, check stored token
          tokenToUse = localStorage.getItem("accessToken");
        }

        if (!tokenToUse) {
          console.log("No token available, redirecting to login");
          window.location.href = `${API_URL}/auth/login`;
          return;
        }

        // Verify the token
        const response = await fetch(`${API_URL}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
            Accept: "application/json",
          },
        });

        console.log("Verify token response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Auth verification response:", data);

          if (data.authenticated) {
            console.log("Dispatching authentication with payload:", {
              accessToken: tokenToUse,
              refreshToken: localStorage.getItem("refreshToken"),
              user: data.user,
            });

            dispatch({
              type: AUTH_SET_AUTHENTICATED,
              payload: {
                accessToken: tokenToUse,
                refreshToken: localStorage.getItem("refreshToken"),
                user: data.user,
              },
            });
            setIsCheckingAuth(false);
            return;
          }
        }

        // If verification failed, try refresh token
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (storedRefreshToken) {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            headers: {
              Authorization: `Bearer ${storedRefreshToken}`,
              Accept: "application/json",
            },
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("accessToken", refreshData.accessToken);
            if (refreshData.refreshToken) {
              localStorage.setItem("refreshToken", refreshData.refreshToken);
            }

            dispatch({
              type: AUTH_SET_AUTHENTICATED,
              payload: {
                accessToken: refreshData.accessToken,
                refreshToken: refreshData.refreshToken,
                user: refreshData.user,
              },
            });
            setIsCheckingAuth(false);
            return;
          }
        }

        // If we get here, authentication failed
        console.log("Authentication failed, redirecting to login");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = `${API_URL}/auth/login`;
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return <div>Checking authentication...</div>;
  }

  return <Component {...rest} />;
};

// Make sure PrivateComponent is connected to Redux
const ConnectedPrivateComponent = connect()(PrivateComponent);

/**
 * Main component encapsulating the entire application.
 */
class App extends Component<*> {
  /**
   * Initializes a new {@code App} instance.
   *
   * @inheritdoc
   */
  constructor(props) {
    super(props);

    document.title = config.appName;

    this._listenOnProtocolMessages = this._listenOnProtocolMessages.bind(this);
  }

  /**
   * Implements React's {@link Component#componentDidMount()}.
   *
   * @returns {void}
   */
  componentDidMount() {
    // Check if we're in Electron or browser environment
    if (window.jitsiNodeAPI && window.jitsiNodeAPI.ipc) {
      // start listening on this events
      window.jitsiNodeAPI.ipc.on("protocol-data-msg", this._listenOnProtocolMessages);

      // send notification to main process
      window.jitsiNodeAPI.ipc.send("renderer-ready");
    } else {
      console.log("Not in Electron environment, skipping IPC setup");
    }
  }

  /**
   * Implements React's {@link Component#componentWillUnmount()}.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    // Check if we're in Electron or browser environment
    if (window.jitsiNodeAPI && window.jitsiNodeAPI.ipc) {
      // remove listening for this events
      window.jitsiNodeAPI.ipc.removeListener("protocol-data-msg", this._listenOnProtocolMessages);
    }
  }

  _listenOnProtocolMessages: (*) => void;

  /**
   * Handler when main proccess contact us.
   *
   * @param {Object} event - Message event.
   * @param {string} inputURL - String with room name.
   *
   * @returns {void}
   */
  _listenOnProtocolMessages(event, inputURL: string) {
    // Remove trailing slash if one exists.
    if (inputURL.slice(-1) === "/") {
      inputURL = inputURL.slice(0, -1); // eslint-disable-line no-param-reassign
    }

    const conference = createConferenceObjectFromURL(inputURL);

    // Don't navigate if conference couldn't be created
    if (!conference) {
      return;
    }

    // change route when we are notified
    this.props.dispatch(push("/conference", conference));
  }

  /**
   * Implements React's {@link Component#render()}.
   *
   * @inheritdoc
   * @returns {ReactElement}
   */
  render() {
    return (
      <AtlasKitThemeProvider mode="dark">
        <Router history={history}>
          <Switch>
            <Route
              exact={true}
              path="/"
              render={(props) => <ConnectedPrivateComponent component={Welcome} {...props} />}
            />
            <Route
              path="/conference"
              render={(props) => <ConnectedPrivateComponent component={Conference} {...props} />}
            />
          </Switch>
        </Router>
      </AtlasKitThemeProvider>
    );
  }
}

export default connect()(App);
