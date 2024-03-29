// ==UserScript==
// @name         Rule34.xxx: Extra Post Info
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Shows file size of images/videos on the statistics pane
// @author       mja00
// @match        https://rule34.xxx/index.php?page=post&s=view&id=*
// @icon         https://www.google.com/s2/favicons?domain=rule34.xxx
// @downloadURL  https://raw.githubusercontent.com/mja00/userscripts/main/rule34/more-image-info.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Since we append to a list we push content down, in order to combat this(since it'll take a little time to get the stats, we'll use a placeholder)
    let statsDiv = document.getElementById("stats");
    let statsList = statsDiv.getElementsByTagName("ul")[0];

    let sizeListElement = document.createElement("li");
    sizeListElement.innerHTML = "File Size: Loading...";
    sizeListElement.id = "size-list-element";
    statsList.appendChild(sizeListElement);

    var val;
    var returned_data;
    var updateStatsDiv = function(returned_data) {
        let headersArray = returned_data.split("\r\n");
        // We need to make this array into a key pair object
        let headers = {};
        headers = headersToObject(headersArray);
        let fileSize = headers["content-length"];
        let fileSizeReadable = humanFileSize(fileSize);
        let fileType = headers["content-type"].split("/")[1];
        sizeListElement = statsDiv.querySelector("#size-list-element");
        sizeListElement.innerHTML = "File Size: " + fileSizeReadable + " " + fileType;
    }

    // Get an image tag with the id image
    let imageElement = document.getElementById("image");
    let videoElements;
    if (imageElement == null) {
        imageElement = document.querySelector("#gelcomVideoPlayer > source");
    }
    let imageURI = imageElement.src;
    imageURI = imageURI.split(".");
    imageURI.shift();
    imageURI = imageURI.join(".");

    startXHR(imageURI, updateStatsDiv);

    // Create function that does a xhr request to a url
    function startXHR(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, true);
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4 && xhr.status == 200) {
                returned_data = xhr.getAllResponseHeaders();
                //fire your callback function
                callback.apply(this,[returned_data]);
            }
        };
        xhr.send(null);
    }

    // Function that converts an array of headers into a key pair object
    function headersToObject(headersArray) {
        let headersObject = {};
        for (let i = 0; i < headersArray.length; i++) {
            let header = headersArray[i].split(":");
            headersObject[header[0]] = header[1];
        }
        return headersObject;
    }


    /**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
    function humanFileSize(bytes, si=false, dp=3) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KB', 'MB', 'GB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10**dp;
        let returnBytes = 0;

        do {
            bytes /= thresh;
            ++u;
        } while ((Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

        if (units[u] == "kB" || units[u] == "KiB") {
            returnBytes = bytes.toFixed(4);
        } else {
            returnBytes = bytes.toFixed(4);
        }

        function truncateDecimals (num, digits) {
            var numS = num.toString(),
                decPos = 3,
                substrLength = decPos == -1 ? numS.length : 1 + digits,
                trimmedResult = numS.substr(0, substrLength),
                finalResult = isNaN(trimmedResult) ? 0 : trimmedResult;

            return parseFloat(finalResult);
        }

        return truncateDecimals(returnBytes,3) + ' ' + units[u];
    }
})();
