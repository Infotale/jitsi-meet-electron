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

const API_URL = "http://localhost:3000";

/**
 * Wrapper component to handle authentication
 */
const PrivateComponent = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const authCheckPerformed = React.useRef(false);

  React.useEffect(() => {
    // Only run this once
    if (authCheckPerformed.current) return;
    authCheckPerformed.current = true;

    const checkAuth = async () => {
      console.log("Checking authentication");

      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("accessToken");
      const refreshToken = urlParams.get("refreshToken");

      if (accessToken) {
        console.log("Found token in URL");
        // Store tokens in localStorage or memory
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        return;
      }

      // If no URL tokens, check stored token
      const storedToken = localStorage.getItem("accessToken");

      if (!storedToken) {
        console.log("No stored token, redirecting to login");
        window.location.href = `${API_URL}/auth/login`;
        return;
      }

      try {
        // Verify the stored token
        const response = await fetch(`${API_URL}/auth/verify-token`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            console.log("Stored token is valid");
            setIsAuthenticated(true);
            setIsCheckingAuth(false);
            return;
          }
        }

        // If token verification failed, try refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem("accessToken", refreshData.accessToken);
            if (refreshData.refreshToken) {
              localStorage.setItem("refreshToken", refreshData.refreshToken);
            }
            setIsAuthenticated(true);
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
  }, []);

  if (isCheckingAuth) {
    return <div>Checking authentication...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : <div>Redirecting to login...</div>;
};

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
              render={(props) => <PrivateComponent component={Welcome} {...props} />}
            />
            <Route
              path="/conference"
              render={(props) => <PrivateComponent component={Conference} {...props} />}
            />
          </Switch>
        </Router>
      </AtlasKitThemeProvider>
    );
  }
}

export default connect()(App);
