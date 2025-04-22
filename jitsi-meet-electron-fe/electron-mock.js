// jitsi-meet-electron-fe/electron-mock.js

// Only initialize mocks when running in a browser, not in Electron
if (typeof window !== "undefined" && !window.jitsiNodeAPI) {
  console.log("Initializing Electron API mocks for browser development");

  // Create minimal mocks for the Electron APIs we need
  window.jitsiNodeAPI = {
    openExternalLink: (url) => {
      console.log("Mock: Opening external link", url);
      window.open(url, "_blank");
    },
    setupRenderer: () => {
      console.log("Mock: Setup renderer called");
    },
    ipc: {
      on: (channel, listener) => {
        console.log(`Mock IPC on: ${channel}`);
        // We need to track listeners for proper cleanup
        window._mockIpcListeners = window._mockIpcListeners || {};
        window._mockIpcListeners[channel] = window._mockIpcListeners[channel] || [];
        window._mockIpcListeners[channel].push(listener);
      },
      send: (channel, ...args) => {
        console.log(`Mock IPC send: ${channel}`, args);
      },
      removeListener: (channel, listener) => {
        console.log(`Mock IPC removeListener: ${channel}`);
        if (window._mockIpcListeners && window._mockIpcListeners[channel]) {
          const index = window._mockIpcListeners[channel].indexOf(listener);
          if (index !== -1) {
            window._mockIpcListeners[channel].splice(index, 1);
          }
        }
      },
    },
  };

  // Mock JitsiMeetElectronAPI if needed
  window.JitsiMeetElectronAPI = {
    RemoteControl: class {},
    setupScreenSharingRender: () => {},
    setupAlwaysOnTopRender: () => {},
    initPopupsConfigurationRender: () => {},
    setupPowerMonitorRender: () => {},
  };
}
