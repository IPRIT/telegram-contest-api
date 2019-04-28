import http from 'http';
import assert from 'assert';

import { config } from "../src/config/config";
import { ApiError } from "../src/utils/error";
import '../server.js';

describe('Starts Node Server', () => {
  it('should return 200', done => {
    http.get(`http://localhost:${config.port}`, res => {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('should return 401', done => {
    http.get(`http://localhost:${config.port}/api/user/me`, res => {
      assert.equal(401, res.statusCode);
      done();
    });
  });

  it('should return error object', done => {
    const apiError = new ApiError( 'unauthorized', 401 );

    http.get(`http://localhost:${config.port}/api/user/me`, res => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse( rawData );
          assert.deepEqual(parsedData, { error: apiError.plainError });
          done();
        } catch (e) {
          done( e );
        }
      });
    });
  });
});