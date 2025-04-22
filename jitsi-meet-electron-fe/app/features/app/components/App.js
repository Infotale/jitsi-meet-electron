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
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try to get auth URL
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          credentials: "include",
        });

        if (loginResponse.ok) {
          const authUrl = await loginResponse.json();
          // Simple redirect to auth URL
          window.location.href = authUrl;
        } else {
          console.error("Failed to get auth URL");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    // Check if we have a token in URL params (after auth callback)
    // const urlParams = new URLSearchParams(window.location.search);
    // const accessToken = urlParams.get("accessToken");

    // if (accessToken) {
    //   // Store token
    //   localStorage.setItem("jitsi_token", accessToken);
    //   // Clean URL
    //   window.history.replaceState({}, document.title, window.location.pathname);
    // } else {
    // If no token, check auth
    checkAuth();
    // }
  }, []);

  // If we have a token, render component
  // const token = localStorage.getItem("jitsi_token");
  // if (!token) {
  //   return null; // or some loading state
  // }

  return <Component {...rest} />;
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
    // start listening on this events
    window.jitsiNodeAPI.ipc.on("protocol-data-msg", this._listenOnProtocolMessages);

    // send notification to main process
    window.jitsiNodeAPI.ipc.send("renderer-ready");
  }

  /**
   * Implements React's {@link Component#componentWillUnmount()}.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    // remove listening for this events
    window.jitsiNodeAPI.ipc.removeListener("protocol-data-msg", this._listenOnProtocolMessages);
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
