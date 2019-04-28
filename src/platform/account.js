import request from 'request-promise';
import tough from 'tough-cookie';
import cheerio from 'cheerio';

import { config } from '../config';
import { TIME_PERIODS, getURL, BASE_DOMAIN } from '../utils';

const ssid = config.telegram.platform.ssid;
const token = config.telegram.platform.token;

const accountJar = request.jar();
const cookies = createCookies([ ssid, token ]);

insertCookies( accountJar, cookies );

/**
 * @return {Cookie[]}
 */
function createCookies (cookiesProto) {
  return cookiesProto.map(({ name: key, value }) => {
    return new tough.Cookie({
      key,
      value,
      domain: BASE_DOMAIN,
      httpOnly: true,
      secure: true,
      maxAge: TIME_PERIODS.year
    });
  });
}

/**
 * @param jar
 * @param cookies
 */
function insertCookies (jar, cookies) {
  cookies.forEach(cookie => {
    jar.setCookie( cookie.toString(), `https://${BASE_DOMAIN}` )
  });
}

/**
 * @param {string} pathTo
 * @param {Object?} qs
 * @return {*}
 */
export function getPage (pathTo, qs = {}) {
  const options = {
    uri: getURL( pathTo ),
    qs,
    // jar: accountJar,
    transform (body) {
      return cheerio.load( body );
    }
  };

  return request( options );
}