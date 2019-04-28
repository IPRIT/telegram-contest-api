import express from 'express';
import bodyParser from 'body-parser';
import cors from './cors';
import { router as platformRouter } from "./platform";
import { router as testRouter } from "./test";

const router = express.Router();

router.use( bodyParser.json() );
router.use( bodyParser.urlencoded({ extended: false }) );

router.all( '*', cors );

router.use( '/platform', platformRouter );
router.use( '/test', testRouter );

export {
  router
};