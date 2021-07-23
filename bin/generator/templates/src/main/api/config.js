import fs from "fs";
import { ipcMain, app } from "electron";
import { getUrlContent } from "../utils";
const path = require("path");

const configPath = path.join(app.getPath("userData"), "config.json");

export let config = {
  loginOrigin: "",
  apiOrigin: "",
  username: "",
  password: "",
};

export let appConfig = {};

export let cookies = [];

ipcMain.handle("config-get", getConfig);
ipcMain.handle("config-set", setConfig);
ipcMain.handle("config-app", getAppConfig);

function getConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, "utf-8", (err, data) => {
      if (err) {
        resolve(config);
      } else {
        resolve(Object.assign(config, JSON.parse(data)));
      }
    });
  });
}

function setConfig(event, obj) {
  Object.assign(config, obj);
  return new Promise((resolve) => {
    fs.writeFile(configPath, JSON.stringify(config), () => {
      resolve();
    });
  });
}

function getAppConfig(event, obj) {
  return new Promise((resolve, reject) => {
    getUrlContent(
      `${obj.loginOrigin}/auth/api/login`,
      "POST",
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
      JSON.stringify({
        loginName: obj.username,
        password: obj.password,
        channel: "suanpan",
      })
    )
      .then(({ data: loginRes }) => {
        loginRes = JSON.parse(loginRes);
        getUrlContent(
          `${obj.apiOrigin}/web?code=${loginRes.data.code}&returnUrl=`,
          "GET",
          {
            headers: {
              Cookie: [`userlogin=${loginRes.data.uid}:1;`],
            },
          }
        ).then(({ headers }) => {
          getUrlContent(`${obj.apiOrigin}/app/config`, "POST", {
            headers: {
              Cookie: headers["set-cookie"],
            },
          }).then(({ data: rawData }) => {
            Object.assign(config, obj);
            cookies = headers["set-cookie"];
            appConfig = convert2Appconfig(JSON.parse(rawData).data);
            resolve(appConfig);
          });
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function convert2Appconfig(obj) {
  const ac = Object.assign(
    {
      ...obj,
      oss: {
        bucket: obj.osBucket,
        endpoint: obj.ossEndpoint,
        ossAccessKey: obj.ossAccessKey,
        ossAccessSecret: obj.ossAccessSecret,
      },
      redirectRequest: config.apiOrigin
    },
  );
  ac.defaultDirs = JSON.parse(ac.defaultDirs);
  ac.appMenu = JSON.parse(ac.appMenu);
  ac.services = JSON.parse(ac.services);
  return ac;
}
