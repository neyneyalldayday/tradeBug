import { Router } from 'express';
const router = Router();

import apiRoutes from './api/trade-routes.js'



router.use('/api', apiRoutes);


export default router;