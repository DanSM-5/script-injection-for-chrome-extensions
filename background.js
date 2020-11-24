/**
 * Script injection for Chrome extensions
 * Injected script is accessible in client context
 * You can expose functions to the console this way
 * 
 * NOTE: if the script to be inject contains strings 
 * with `` there may be some issued with the string building 
 * 
 * NOTE: This script won't have access to Chrome APIs and there is no way to contact
 * back the background script nor content scripts. Howerver you can use the interaction
 * with the DOM as a way of communication
 */
const loadScriptOnClient = () => {
  const scriptURL = "myScript.js"; // script to inject must be a file in the extension folder
  const scriptId = "myId"; // id to identify script on page
  const command = () => {
    return (() => {
      if (!document.querySelector("script#{ID}")) { // inject if script isn't present      
        const scriptElement = document.createElement("script");
        scriptElement.innerHTML = `{script}`; // string to be replaced by script
        scriptElement.id = "{ID}"; // assign an id for identification
        document.body.appendChild(scriptElement);
        console.log("Script was injected successfully!");
      }
    });
  };

  const cb = async(res) => {  
    const file = await res.text();
    const commandString = 
      `(${command().toString()})()` // wrap it in an IIFE
        .replaceAll("{ID}", scriptId) // Add id to string
        .replace("{script}", `${file}`); // Add script to string
    execOnClient(commandString);
  };

  fetch(scriptURL)
    .then(cb);
};

const execOnClient = (command) => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: command}
    );
  });
}; 

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    // add conditions for loading scripts here
    loadScriptOnClient();
  }
});
