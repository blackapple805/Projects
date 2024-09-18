chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'clearData') {
      const timeRangeInHours = message.timeRange;
      const milliseconds = timeRangeInHours * 3600 * 1000;
  
      chrome.browsingData.remove({
        "since": Date.now() - milliseconds
      }, {
        "cache": true,
        "cookies": true,
        "history": true,
        "localStorage": true,
        "serviceWorkers": true,
        "downloads": true,
        "fileSystems": true,
        "formData": true,
        "indexedDB": true,
        "passwords": true,
        "webSQL": true
      }, () => {
        console.log(`All data cleared for the last ${timeRangeInHours} hours.`);
      });
    }
  });
  