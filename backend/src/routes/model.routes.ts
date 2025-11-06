import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ModelLoader } from '../services/model-loader.service';
import { ModelDefinition, AuthRequest } from '../types';

const router = Router();

// Get all models
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const modelLoader = ModelLoader.getInstance();
    const models = modelLoader.getAllModels();
    
    res.json({
      count: models.length,
      models: models.map(m => ({
        name: m.name,
        tableName: m.tableName,
        fieldCount: m.fields.length,
        ownerField: m.ownerField,
        timestamps: m.timestamps,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get model by name
router.get('/:name', authenticate, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const modelLoader = ModelLoader.getInstance();
    const model = modelLoader.getModel(name);

    if (!model) {
      return res.status(404).json({ error: `Model '${name}' not found` });
    }

    res.json(model);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Publish new model (Admin only)
router.post('/', authenticate, authorize(['Admin']), async (req: Request, res: Response) => {
  try {
    const modelData: ModelDefinition = req.body;
    const modelLoader = ModelLoader.getInstance();

    // Check if model already exists
    if (modelLoader.modelExists(modelData.name)) {
      return res.status(400).json({ error: `Model '${modelData.name}' already exists` });
    }

    // Save model to file and memory
    await modelLoader.saveModel(modelData);

    res.status(201).json({
      message: `Model '${modelData.name}' published successfully`,
      model: modelData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update model (Admin only)
router.put('/:name', authenticate, authorize(['Admin']), async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const modelData: ModelDefinition = req.body;
    const modelLoader = ModelLoader.getInstance();

    // Check if model exists
    if (!modelLoader.modelExists(name)) {
      return res.status(404).json({ error: `Model '${name}' not found` });
    }

    // Ensure name matches
    modelData.name = name;

    // Update model
    await modelLoader.saveModel(modelData);

    res.json({
      message: `Model '${name}' updated successfully`,
      model: modelData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete model (Admin only)
router.delete('/:name', authenticate, authorize(['Admin']), async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const modelLoader = ModelLoader.getInstance();

    // Check if model exists
    if (!modelLoader.modelExists(name)) {
      return res.status(404).json({ error: `Model '${name}' not found` });
    }

    // Delete model
    await modelLoader.deleteModel(name);

    res.json({
      message: `Model '${name}' deleted successfully`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as modelRouter };
