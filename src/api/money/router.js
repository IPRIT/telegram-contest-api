import express from 'express';
import * as methods from './methods';

const router = express.Router();

router.get( '/initTable', methods.initMoneyTableRequest );
router.get( '/table', methods.getTableRequest );

export {
  router
};