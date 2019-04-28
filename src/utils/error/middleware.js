import { ApiError } from "./api-error";

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const defaultErrorCode = 'internal_server_error';

/**
 * @param {*} error
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {*}
 */
export function clientError (error, req, res, next) {
  if (!error.httpCode) {
    return next( error );
  }

  isDevelopment && console.error( 'Bad request:', error );

  res.status( error.httpCode ).json({
    error: error.plainError
  });
}

/**
 * @param {*} error
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {*}
 */
export function serverError(error, req, res, next) {
  (isDevelopment || isProduction) && console.error( 'Internal Server Error:', error );

  if (res.headersSent) {
    return next( error );
  }

  const isDevelopmentMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  const {
    message = defaultErrorCode,
    params = {}
  } = ( isDevelopmentMode ? error : {} ) || {};

  const apiError = new ApiError( message, 500, params );

  res.status( apiError.httpCode ).json({
    error: apiError.plainError
  });
}