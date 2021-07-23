import http from "http";

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function getUrlContent(url, method='GET', opt={}, resData) {
  return new Promise((resolve, reject) => {
    let opts = mergeDeep({ method }, opt)
    const req = http.request(
      url,
      opts,
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ data, headers: res.headers })
        });
        res.on("error", err => {
          reject(err)
        })
      }
    );
    req.on('error', err => {
      reject(err)
    })
    if(method === 'POST' && resData) {
      req.write(resData)
    }
    req.end();
  });
}