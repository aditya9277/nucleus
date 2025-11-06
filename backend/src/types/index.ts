export interface ModelField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'json';
  required?: boolean;
  unique?: boolean;
  default?: any;
  relation?: {
    model: string;
    field: string;
  };
}

export interface ModelRBAC {
  [role: string]: Array<'create' | 'read' | 'update' | 'delete' | 'all'>;
}

export interface ModelDefinition {
  name: string;
  tableName?: string;
  fields: ModelField[];
  ownerField?: string;
  rbac: ModelRBAC;
  timestamps?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  password?: string;
}

export interface AuthRequest extends Express.Request {
  user?: User;
}
