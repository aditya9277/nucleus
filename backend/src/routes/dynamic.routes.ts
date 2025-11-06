import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { checkModelPermission } from '../middleware/rbac.middleware';
import { ModelLoader } from '../services/model-loader.service';
import { CRUDService } from '../services/crud.service';
import { AuthRequest } from '../types';

const router = Router();
const crudService = new CRUDService();

// Dynamic CRUD routes for any model
// Format: /api/:modelName

// CREATE - POST /api/:modelName
router.post(
  '/:modelName',
  authenticate,
  checkModelPermission('create'),
  async (req: Request, res: Response) => {
    try {
      const { modelName } = req.params;
      const authReq = req as AuthRequest;
      const modelLoader = ModelLoader.getInstance();
      const model = modelLoader.getModel(modelName);

      if (!model) {
        return res.status(404).json({ error: `Model '${modelName}' not found` });
      }

      const record = await crudService.create(
        modelName,
        req.body,
        authReq.user?.id,
        model
      );

      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// READ ALL - GET /api/:modelName
router.get(
  '/:modelName',
  authenticate,
  checkModelPermission('read'),
  async (req: Request, res: Response) => {
    try {
      const { modelName } = req.params;
      const authReq = req as AuthRequest;
      const modelLoader = ModelLoader.getInstance();
      const model = modelLoader.getModel(modelName);

      if (!model) {
        return res.status(404).json({ error: `Model '${modelName}' not found` });
      }

      const records = await crudService.findAll(
        modelName,
        authReq.user?.id,
        authReq.user?.role,
        model
      );

      res.json({
        count: records.length,
        data: records
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// READ ONE - GET /api/:modelName/:id
router.get(
  '/:modelName/:id',
  authenticate,
  checkModelPermission('read'),
  async (req: Request, res: Response) => {
    try {
      const { modelName, id } = req.params;
      const modelLoader = ModelLoader.getInstance();
      const model = modelLoader.getModel(modelName);

      if (!model) {
        return res.status(404).json({ error: `Model '${modelName}' not found` });
      }

      const record = await crudService.findById(modelName, id);

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE - PUT /api/:modelName/:id
router.put(
  '/:modelName/:id',
  authenticate,
  checkModelPermission('update'),
  async (req: Request, res: Response) => {
    try {
      const { modelName, id } = req.params;
      const modelLoader = ModelLoader.getInstance();
      const model = modelLoader.getModel(modelName);

      if (!model) {
        return res.status(404).json({ error: `Model '${modelName}' not found` });
      }

      const record = await crudService.update(modelName, id, req.body, model);

      res.json(record);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE - DELETE /api/:modelName/:id
router.delete(
  '/:modelName/:id',
  authenticate,
  checkModelPermission('delete'),
  async (req: Request, res: Response) => {
    try {
      const { modelName, id } = req.params;
      const modelLoader = ModelLoader.getInstance();
      const model = modelLoader.getModel(modelName);

      if (!model) {
        return res.status(404).json({ error: `Model '${modelName}' not found` });
      }

      await crudService.delete(modelName, id);

      res.json({ message: 'Record deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export { router as dynamicRouter };
