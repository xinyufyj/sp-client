import { protocol, session } from "electron";
import { parse } from "node-html-parser";
import fs from "fs";
import path from "path";
import { appConfig, cookies} from "./api/config"
import { getUrlContent } from './utils'

export async function appInjectDev() {
  protocol.interceptStringProtocol("http", async (request, callback) => {
    protocol.uninterceptProtocol("http");
    let url = new URL(request.url);
    let {data: htmlStr} = await getUrlContent(url.href);
    callback({ mimeType: "text/html", data: injectAppConfig(htmlStr, appConfig) });
  });
  interceptProxyUrl();
}

function injectAppConfig(htmlStr, ac) {
  const root = parse(htmlStr);
  let acNode = parse(
    `<script>window.appConfig = ${JSON.stringify(ac)}</script>`
  );
  root.querySelector("head").appendChild(acNode);
  return root.toString();
}

export function appInjectProd() {
  protocol.registerBufferProtocol(
    "app",
    (request, respond) => {
      let pathName = new URL(request.url).pathname;
      pathName = decodeURI(pathName); // Needed in case URL contains spaces
      let pathNameOrigin = pathName;
      fs.readFile(path.join(__dirname, pathName), (error, data) => {
        if (error) {
          console.error(`Failed to read ${pathName} on app protocol`, error);
        }
        const extension = path.extname(pathName).toLowerCase();
        let mimeType = "";

        if (extension === ".js") {
          mimeType = "text/javascript";
        } else if (extension === ".html") {
          mimeType = "text/html";
          if (pathNameOrigin === "/index.html") {
            data = Buffer.from(injectAppConfig(data.toString(), appConfig));
          }
        } else if (extension === ".css") {
          mimeType = "text/css";
        } else if (extension === ".svg" || extension === ".svgz") {
          mimeType = "image/svg+xml";
        } else if (extension === ".json") {
          mimeType = "application/json";
        } else if (extension === ".wasm") {
          mimeType = "application/wasm";
        }

        respond({ mimeType, data });
      });
    },
    (error) => {
      if (error) {
        console.error(`Failed to register app protocol`, error);
      }
    }
  );
  interceptProxyUrl();
}

function interceptProxyUrl() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    let url = new URL(details.url);
    if((url.href.indexOf(appConfig.RtoOrigin) === -1) && (url.pathname.startsWith('/proxr') || url.pathname.startsWith('/proxrs'))) {
      callback({redirectURL: `${appConfig.RtoOrigin}${url.pathname}${url.search}`, cancel: false})
    }else {
      callback({});
    }
  });
  let firstQuery = false;
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    let url = new URL(details.url);
    let reqHeaders = details.requestHeaders;
    if(!firstQuery && (url.href.indexOf('/oss/object/get') !== -1)) {
      firstQuery = true
      reqHeaders = Object.assign({}, details.requestHeaders, {
        Cookie: cookies[0]
      });
    }
    callback({
      cancel: false,
      requestHeaders: reqHeaders,
    });
  })
}

export function interceptUrl(url) {
  let startIdx = url.indexOf('proxr')
  if(startIdx === -1) {
    startIdx = url.indexOf('proxy')
  }
  if(startIdx === -1) {
    return url;
  }
  return path.join(appConfig.RtoOrigin, url.slice(startIdx));
}