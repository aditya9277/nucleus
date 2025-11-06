import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ModelDefinition } from '../types';
import { ModelLoader } from '../services/model-loader.service';

export function checkModelPermission(operation: 'create' | 'read' | 'update' | 'delete') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;
      const modelName = req.params.modelName || extractModelFromPath(req.path);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!modelName) {
        return res.status(400).json({ error: 'Model name not found' });
      }

      const modelLoader = ModelLoader.getInstance();
      const model = modelLoader.getModel(modelName);

      if (!model) {
        return res.status(404).json({ error: `Model '${modelName}' not found` });
      }

      // Admin has all permissions
      if (user.role === 'Admin') {
        return next();
      }

      // Check RBAC permissions
      const permissions = model.rbac[user.role] || [];
      const hasPermission = permissions.includes('all') || permissions.includes(operation);

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions for this operation',
          operation,
          role: user.role
        });
      }

      // Check ownership for update/delete operations
      if ((operation === 'update' || operation === 'delete') && model.ownerField) {
        const recordId = req.params.id;
        if (recordId) {
          const isOwner = await checkOwnership(modelName, recordId, user.id, model.ownerField);
          if (!isOwner && user.role !== 'Admin') {
            return res.status(403).json({ 
              error: 'You can only modify your own records'
            });
          }
        }
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}

function extractModelFromPath(path: string): string | null {
  // Extract model name from path like /api/products or /api/products/123
  const match = path.match(/\/api\/([^\/]+)/);
  return match ? match[1] : null;
}

async function checkOwnership(
  modelName: string, 
  recordId: string, 
  userId: string, 
  ownerField: string
): Promise<boolean> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const record = await prisma.dynamicRecord.findFirst({
      where: {
        id: recordId,
        modelName: modelName.toLowerCase()
      }
    });

    if (!record) return false;

    const data = JSON.parse(record.data);
    return data[ownerField] === userId;
  } finally {
    await prisma.$disconnect();
  }
}
