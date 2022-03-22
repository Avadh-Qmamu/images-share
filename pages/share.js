import React from "react";

const share = () => {
  if (process.browser) {
    function sleep(delay) {
      return new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }

    function logText(message, isError) {
      if (isError) console.error(message);
      else console.log(message);

      const p = document.createElement("p");
      if (isError) p.setAttribute("class", "error");
      document.querySelector("#output").appendChild(p);
      p.appendChild(document.createTextNode(message));
    }

    function logError(message) {
      logText(message, true);
    }

    function setShareButtonsEnabled(enabled) {
      document.querySelector("#share").disabled = !enabled;
      document.querySelector("#share-no-gesture").disabled = !enabled;
    }

    function checkboxChanged(e) {
      const checkbox = e.target;
      const textfield = document.querySelector("#" + checkbox.id.split("_")[0]);

      textfield.disabled = !checkbox.checked;
      if (!checkbox.checked) textfield.value = "";
    }

    function checkBasicFileShare() {
      // XXX: There is no straightforward API to do this.
      // For now, assume that text/plain is supported everywhere.
      const txt = new Blob(["Hello, world!"], { type: "text/plain" });
      // XXX: Blob support? https://github.com/w3c/web-share/issues/181
      const file = new File([txt], "test.txt");
      return navigator.canShare({ files: [file] });
    }

    async function testWebShare() {
      const title_input = document.querySelector("#title");
      const text_input = document.querySelector("#text");
      const url_input = document.querySelector("#url");
      /** @type {HTMLInputElement} */
      const file_input = document.querySelector("#files");

      const title = title_input.disabled ? undefined : title_input.value;
      const text = text_input.disabled ? undefined : text_input.value;
      const url = url_input.disabled ? undefined : url_input.value;
      const files = file_input.disabled ? undefined : file_input.files;

      if (files && files.length > 0) {
        if (!navigator.canShare) {
          logError(
            "Warning: canShare is not supported. File sharing may not be supported at all."
          );
        } else if (!checkBasicFileShare()) {
          logError("Error: File sharing is not supported in this browser.");
          setShareButtonsEnabled(true);
          return;
        } else if (!navigator.canShare({ files })) {
          logError("Error: share() does not support the given files");
          for (const file of files) {
            logError(
              `File info: name - ${file.name}, size ${file.size}, type ${file.type}`
            );
          }
          setShareButtonsEnabled(true);
          return;
        }
      }

      setShareButtonsEnabled(false);
      try {
        // console.log(window.navigator.share);
        await navigator.share({ files, title, text, url });
        logText("Successfully sent share");
      } catch (error) {
        logError("Error sharing: " + error);
      }
      setShareButtonsEnabled(true);
    }

    async function testWebShareDelay() {
      setShareButtonsEnabled(false);
      await sleep(6000);
      testWebShare();
    }

    function onLoad() {
      // Checkboxes disable and delete textfields.
      document
        .querySelector("#title_checkbox")
        .addEventListener("click", checkboxChanged);
      document
        .querySelector("#text_checkbox")
        .addEventListener("click", checkboxChanged);
      document
        .querySelector("#url_checkbox")
        .addEventListener("click", checkboxChanged);

      document.querySelector("#share").addEventListener("click", testWebShare);
      document
        .querySelector("#share-no-gesture")
        .addEventListener("click", testWebShareDelay);

      //   console.log(navigator.share);
      //   console.log(window.location.protocol);
      // if (window.navigator.share === undefined) {
      //   setShareButtonsEnabled(false);
      //   if (window.location.protocol === "http:") {
      //     // navigator.share() is only available in secure contexts.
      //     window.location.replace(
      //       window.location.href.replace(/^http:/, "https:")
      //     );
      //   } else {
      //     logError(
      //       "Error: You need to use a browser that supports this draft " +
      //         "proposal."
      //     );
      //   }
      // }
    }

    window.addEventListener("load", onLoad);
  }
  return (
    <>
      <table>
        <tr>
          <td>Title:</td>
          <td>
            <input type="checkbox" id="title_checkbox" checked />
          </td>
          <td>
            <input id="title" value="The Title" size="40" />
          </td>
        </tr>
        <tr>
          <td>Text:</td>
          <td>
            <input type="checkbox" id="text_checkbox" checked />
          </td>
          <td>
            <input id="text" value="The message" size="40" />
          </td>
        </tr>
        <tr>
          <td>URL:</td>
          <td>
            <input type="checkbox" id="url_checkbox" checked />
          </td>
          <td>
            <input id="url" value="https://example.com" size="40" />
          </td>
        </tr>
        <tr>
          <td>Files:</td>
          <td></td>
          <td>
            <input id="files" type="file" multiple />
          </td>
        </tr>
      </table>
      <p>
        <input id="share" type="button" value="Share" />{" "}
        <input
          id="share-no-gesture"
          type="button"
          value="Share without user gesture"
        />
      </p>
      <div id="output"></div>
      <p>
        This is a test page for the{" "}
        <a href="https://w3c.github.io/web-share/">Web Share API</a>,
        demonstrating
        <a href="https://w3c.github.io/web-share/#dom-sharedata-files">file</a>
        sharing. It only works in browsers that have implemented file sharing.
      </p>
    </>
  );
};

export default share;
