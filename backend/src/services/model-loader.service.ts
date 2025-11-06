import fs from 'fs/promises';
import path from 'path';
import { ModelDefinition } from '../types';

export class ModelLoader {
  private static instance: ModelLoader;
  private models: Map<string, ModelDefinition> = new Map();
  private modelsDir: string;

  private constructor() {
    this.modelsDir = path.join(process.cwd(), 'models');
  }

  public static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader();
    }
    return ModelLoader.instance;
  }

  async loadAllModels(): Promise<void> {
    try {
      // Ensure models directory exists
      await fs.mkdir(this.modelsDir, { recursive: true });
      
      const files = await fs.readdir(this.modelsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        await this.loadModel(file);
      }

      console.log(`✅ Loaded ${this.models.size} model(s)`);
    } catch (error: any) {
      console.error('Error loading models:', error.message);
    }
  }

  async loadModel(filename: string): Promise<ModelDefinition | null> {
    try {
      const filePath = path.join(this.modelsDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const model: ModelDefinition = JSON.parse(content);
      
      // Validate model
      this.validateModel(model);
      
      // Store in memory with lowercase key for case-insensitive lookup
      const key = model.name.toLowerCase();
      this.models.set(key, model);
      
      console.log(`📦 Loaded model: ${model.name}`);
      return model;
    } catch (error: any) {
      console.error(`Error loading model ${filename}:`, error.message);
      return null;
    }
  }

  async saveModel(model: ModelDefinition): Promise<void> {
    try {
      // Ensure models directory exists
      await fs.mkdir(this.modelsDir, { recursive: true });

      // Validate model
      this.validateModel(model);

      // Add timestamps
      const now = new Date().toISOString();
      model.updatedAt = now;
      if (!model.createdAt) {
        model.createdAt = now;
      }

      // Save to file
      const filename = `${model.name}.json`;
      const filePath = path.join(this.modelsDir, filename);
      await fs.writeFile(filePath, JSON.stringify(model, null, 2), 'utf-8');

      // Update in-memory cache
      const key = model.name.toLowerCase();
      this.models.set(key, model);

      console.log(`💾 Saved model: ${model.name}`);
    } catch (error: any) {
      throw new Error(`Failed to save model: ${error.message}`);
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      const filename = `${modelName}.json`;
      const filePath = path.join(this.modelsDir, filename);
      
      await fs.unlink(filePath);
      
      const key = modelName.toLowerCase();
      this.models.delete(key);
      
      console.log(`🗑️  Deleted model: ${modelName}`);
    } catch (error: any) {
      throw new Error(`Failed to delete model: ${error.message}`);
    }
  }

  getModel(modelName: string): ModelDefinition | undefined {
    return this.models.get(modelName.toLowerCase());
  }

  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  getModelCount(): number {
    return this.models.size;
  }

  modelExists(modelName: string): boolean {
    return this.models.has(modelName.toLowerCase());
  }

  private validateModel(model: ModelDefinition): void {
    if (!model.name || typeof model.name !== 'string') {
      throw new Error('Model name is required and must be a string');
    }

    if (!model.fields || !Array.isArray(model.fields) || model.fields.length === 0) {
      throw new Error('Model must have at least one field');
    }

    // Validate fields
    for (const field of model.fields) {
      if (!field.name || typeof field.name !== 'string') {
        throw new Error('Field name is required and must be a string');
      }

      const validTypes = ['string', 'number', 'boolean', 'date', 'email', 'json'];
      if (!validTypes.includes(field.type)) {
        throw new Error(`Invalid field type: ${field.type}. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Validate RBAC
    if (!model.rbac || typeof model.rbac !== 'object') {
      throw new Error('Model must have RBAC configuration');
    }

    // Set default table name if not provided
    if (!model.tableName) {
      model.tableName = model.name.toLowerCase() + 's';
    }

    // Set default timestamps
    if (model.timestamps === undefined) {
      model.timestamps = true;
    }
  }
}
