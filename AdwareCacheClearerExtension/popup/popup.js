document.getElementById('clearButton').addEventListener('click', () => {
    const timeRange = document.getElementById('timeRange').value;
    chrome.runtime.sendMessage({ action: 'clearData', timeRange: parseInt(timeRange) });
  });
  