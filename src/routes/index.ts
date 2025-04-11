import { Router } from 'express';
const router = Router();

import apiRoutes from './api/trade-routes'



router.use('/api', apiRoutes);


export default router;