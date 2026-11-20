import crypto from 'crypto';
import { getTurso } from './turso.js';

// Global model registry for cross-model populate resolution
const modelRegistry = {};

export const registerModel = (name, model) => {
  modelRegistry[name] = model;
};

export const getModel = (name) => {
  return modelRegistry[name];
};

export const generateId = () => {
  return crypto.randomBytes(12).toString('hex');
};

// High-performance in-memory table cache for ultra-fast catalog reads
const tableCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Restrict caching strictly to public catalog/editorial tables
const CACHABLE_TABLES = new Set([
  'products',
  'categories',
  'collections',
  'coupons',
  'reviews',
  'store_settings',
]);

export const invalidateTableCache = (tableName) => {
  if (tableName) {
    tableCache.delete(tableName);
  } else {
    tableCache.clear();
  }
};

const reviveDates = (key, value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
};

// Deep value resolver for dot notation like 'specifications.fabric'
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  if (path === '_id' || path === 'id') {
    return obj._id || obj.id;
  }
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
};

// Deep value setter for dot notation
const setNestedValue = (obj, path, value) => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
};

// Evaluate MongoDB-style filter against a plain object
export const filterMatches = (doc, filter) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const key of Object.keys(filter)) {
    if (key === '$or') {
      const orArr = filter.$or;
      const matchesOr = orArr.some((subFilter) => filterMatches(doc, subFilter));
      if (!matchesOr) return false;
      continue;
    }

    if (key === '$and') {
      const andArr = filter.$and;
      const matchesAnd = andArr.every((subFilter) => filterMatches(doc, subFilter));
      if (!matchesAnd) return false;
      continue;
    }

    const expected = filter[key];
    const actual = getNestedValue(doc, key);

    // Direct null / undefined comparison
    if (expected === null || expected === undefined) {
      if (actual !== expected) return false;
      continue;
    }

    // Direct RegExp
    if (expected instanceof RegExp) {
      if (typeof actual !== 'string' || !expected.test(actual)) return false;
      continue;
    }

    // Operator object
    if (typeof expected === 'object' && !Array.isArray(expected)) {
      const ops = Object.keys(expected);
      const isOperatorObj = ops.some((k) => k.startsWith('$'));

      if (isOperatorObj) {
        for (const op of ops) {
          const target = expected[op];
          if (op === '$regex') {
            const flags = expected.$options || '';
            const re = target instanceof RegExp ? target : new RegExp(target, flags);
            if (Array.isArray(actual)) {
              const matched = actual.some((item) => re.test(String(item)));
              if (!matched) return false;
            } else if (typeof actual !== 'string' || !re.test(actual)) {
              return false;
            }
          } else if (op === '$options') {
            // Handled with $regex
            continue;
          } else if (op === '$in') {
            if (!Array.isArray(target)) return false;
            if (Array.isArray(actual)) {
              // Check if any element in actual matches target
              const matched = actual.some((a) =>
                target.some((t) => {
                  if (t instanceof RegExp) return t.test(String(a));
                  return String(t) === String(a);
                })
              );
              if (!matched) return false;
            } else {
              const matched = target.some((t) => {
                if (t instanceof RegExp) return t.test(String(actual));
                return String(t) === String(actual);
              });
              if (!matched) return false;
            }
          } else if (op === '$nin') {
            if (Array.isArray(target) && target.includes(actual)) return false;
          } else if (op === '$ne') {
            if (String(actual) === String(target)) return false;
          } else if (op === '$gte') {
            if (!(Number(actual) >= Number(target))) return false;
          } else if (op === '$lte') {
            if (!(Number(actual) <= Number(target))) return false;
          } else if (op === '$gt') {
            if (!(Number(actual) > Number(target))) return false;
          } else if (op === '$lt') {
            if (!(Number(actual) < Number(target))) return false;
          } else if (op === '$exists') {
            const exists = actual !== undefined;
            if (exists !== Boolean(target)) return false;
          } else if (op === '$elemMatch') {
            if (!Array.isArray(actual)) return false;
            const matched = actual.some((item) => filterMatches(item, target));
            if (!matched) return false;
          }
        }
        continue;
      }
    }

    // Direct comparison (including id string comparisons)
    if (key === '_id' || key === 'id') {
      const docId = String(doc._id || doc.id || '');
      const filterId = String(expected._id || expected.id || expected);
      if (docId !== filterId) return false;
      continue;
    }

    if (String(actual) !== String(expected)) {
      return false;
    }
  }

  return true;
};

// Query Builder Class
class TursoQuery {
  constructor(model, isSingle = false, filter = {}) {
    this.model = model;
    this.isSingle = isSingle;
    this.filter = filter;
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
    this._select = null;
    this._populates = [];
    this._isLean = false;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = Math.max(0, parseInt(n, 10) || 0);
    return this;
  }

  limit(n) {
    this._limit = Math.max(0, parseInt(n, 10) || 0);
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      this._select = fields.split(/\s+/).filter(Boolean);
    } else if (Array.isArray(fields)) {
      this._select = fields;
    }
    return this;
  }

  populate(field, select) {
    if (typeof field === 'object' && field !== null) {
      this._populates.push(field);
    } else {
      this._populates.push({ path: field, select });
    }
    return this;
  }

  lean() {
    this._isLean = true;
    return this;
  }

  async exec() {
    let allDocs = [];
    const isCachable = CACHABLE_TABLES.has(this.model.tableName);

    if (isCachable) {
      const cached = tableCache.get(this.model.tableName);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        allDocs = cached.docs;
      } else {
        const client = await getTurso();
        const res = await client.execute(`SELECT id, data FROM ${this.model.tableName}`);
        allDocs = [];
        for (const row of res.rows) {
          try {
            const doc = typeof row.data === 'string' ? JSON.parse(row.data, reviveDates) : row.data;
            doc._id = row.id;
            doc.id = row.id;
            allDocs.push(doc);
          } catch (err) {
            // ignore malformed data
          }
        }
        tableCache.set(this.model.tableName, {
          docs: allDocs,
          timestamp: Date.now(),
        });
      }
    } else {
      const client = await getTurso();
      // Fast path for single document query by primary key ID
      if (this.filter && (this.filter._id || this.filter.id) && typeof (this.filter._id || this.filter.id) === 'string') {
        const targetId = this.filter._id || this.filter.id;
        const res = await client.execute({
          sql: `SELECT id, data FROM ${this.model.tableName} WHERE id = ? LIMIT 1`,
          args: [targetId],
        });
        allDocs = [];
        for (const row of res.rows) {
          try {
            const doc = typeof row.data === 'string' ? JSON.parse(row.data, reviveDates) : row.data;
            doc._id = row.id;
            doc.id = row.id;
            allDocs.push(doc);
          } catch (err) {}
        }
      } else {
        const res = await client.execute(`SELECT id, data FROM ${this.model.tableName}`);
        allDocs = [];
        for (const row of res.rows) {
          try {
            const doc = typeof row.data === 'string' ? JSON.parse(row.data, reviveDates) : row.data;
            doc._id = row.id;
            doc.id = row.id;
            allDocs.push(doc);
          } catch (err) {}
        }
      }
    }

    let parsed = allDocs.filter((doc) => filterMatches(doc, this.filter));

    // Sort
    if (this._sort && Object.keys(this._sort).length > 0) {
      const sortKeys = Object.entries(this._sort);
      parsed.sort((a, b) => {
        for (const [key, direction] of sortKeys) {
          const valA = getNestedValue(a, key);
          const valB = getNestedValue(b, key);

          if (valA === valB) continue;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;

          if (valA < valB) return direction === -1 ? 1 : -1;
          if (valA > valB) return direction === -1 ? -1 : 1;
        }
        return 0;
      });
    }

    // Skip & Limit
    if (this._skip > 0) {
      parsed = parsed.slice(this._skip);
    }
    if (this._limit > 0) {
      parsed = parsed.slice(0, this._limit);
    }

    // Copy only returned rows before projection or population can mutate them.
    parsed = parsed.map((doc) => JSON.parse(JSON.stringify(doc), reviveDates));

    // Populate relations
    if (this._populates.length > 0) {
      for (const pop of this._populates) {
        await this._applyPopulate(parsed, pop);
      }
    }

    // Apply projection / select
    if (this._select && this._select.length > 0) {
      parsed = parsed.map((doc) => {
        const projected = { _id: doc._id, id: doc.id };
        for (const field of this._select) {
          if (field.startsWith('-')) {
            delete doc[field.slice(1)];
          } else {
            projected[field] = doc[field];
          }
        }
        return this._select.some((f) => !f.startsWith('-')) ? projected : doc;
      });
    }

    if (this.isSingle) {
      if (parsed.length === 0) return null;
      return this._isLean ? parsed[0] : this.model.hydrate(parsed[0]);
    }

    if (this._isLean) {
      return parsed;
    }
    return parsed.map((p) => this.model.hydrate(p));
  }

  async _applyPopulate(docs, pop) {
    const path = pop.path;
    const selectFields = typeof pop.select === 'string' ? pop.select.split(/\s+/) : null;

    // Detect target model from path name
    let targetModelName = null;
    if (path === 'product' || path === 'products') targetModelName = 'Product';
    else if (path === 'user' || path === 'customer') targetModelName = 'User';
    else if (path === 'order') targetModelName = 'Order';

    const targetModel = getModel(targetModelName);
    if (!targetModel) return;

    for (const doc of docs) {
      const val = doc[path];
      if (!val) continue;

      if (Array.isArray(val)) {
        // Array of IDs
        const populatedItems = [];
        for (const id of val) {
          const item = await targetModel.findById(id);
          if (item) {
            populatedItems.push(item);
          }
        }
        doc[path] = populatedItems;
      } else {
        // Single ID or object with _id
        const idToFind = typeof val === 'object' ? val._id || val.id : val;
        const item = await targetModel.findById(idToFind);
        if (item) {
          if (selectFields && selectFields.length > 0) {
            const projected = { _id: item._id, id: item.id };
            for (const f of selectFields) {
              projected[f] = item[f];
            }
            doc[path] = projected;
          } else {
            doc[path] = item;
          }
        }
      }
    }
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

// Document Class
export class TursoDocument {
  constructor(model, data = {}) {
    this._model = model;
    this._original = JSON.parse(JSON.stringify(data));
    this._data = { ...data };

    const rawId = data._id || data.id || generateId();
    this._id = rawId;
    this.id = rawId;
    this._data._id = rawId;
    this._data.id = rawId;

    const proxy = new Proxy(this, {
      get(target, prop, receiver) {
        if (prop === '_id' || prop === 'id') return target._id;
        if (prop in target._data) return target._data[prop];
        if (prop in target) return target[prop];
        return target._data[prop];
      },
      set(target, prop, value, receiver) {
        if (prop === '_id' || prop === 'id') {
          target._id = value;
          target.id = value;
          target._data._id = value;
          target._data.id = value;
          return true;
        }
        if (typeof target[prop] === 'function' && !(prop in target._data)) {
          target[prop] = value;
          return true;
        }
        target._data[prop] = value;
        return true;
      },
      has(target, prop) {
        return prop === '_id' || prop === 'id' || prop in target._data || prop in target;
      },
    });

    // Attach virtual getters
    if (model.virtuals) {
      for (const [vName, vDef] of Object.entries(model.virtuals)) {
        if (vDef.get) {
          Object.defineProperty(this, vName, {
            get: () => vDef.get.call(proxy),
            enumerable: true,
            configurable: true,
          });
        }
      }
    }

    // Attach instance methods
    if (model.methods) {
      for (const [mName, mFn] of Object.entries(model.methods)) {
        this[mName] = mFn.bind(proxy);
      }
    }

    return proxy;
  }

  isModified(path) {
    const current = getNestedValue(this._data, path);
    const original = getNestedValue(this._original, path);
    return JSON.stringify(current) !== JSON.stringify(original);
  }

  async save() {
    // Run pre-save hooks if registered
    if (this._model.preSaveHook) {
      await this._model.preSaveHook.call(this);
    }

    const now = new Date().toISOString();
    if (!this._data.createdAt) {
      this._data.createdAt = now;
    }
    this._data.updatedAt = now;

    this._data._id = this._id;
    this._data.id = this._id;

    const client = await getTurso();
    await client.execute({
      sql: `INSERT OR REPLACE INTO ${this._model.tableName} (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      args: [this._id, JSON.stringify(this._data), this._data.createdAt, this._data.updatedAt],
    });

    invalidateTableCache(this._model.tableName);
    this._original = JSON.parse(JSON.stringify(this._data));
    return this;
  }

  toObject() {
    const obj = { ...this._data, _id: this._id, id: this._id };
    if (this._model.virtuals) {
      for (const [vName, vDef] of Object.entries(this._model.virtuals)) {
        if (vDef.get) {
          obj[vName] = vDef.get.call(this);
        }
      }
    }
    return obj;
  }

  toJSON() {
    return this.toObject();
  }
}

// Model Factory
export const createTursoModel = (modelName, tableName, options = {}) => {
  class Model {
    static modelName = modelName;
    static tableName = tableName;
    static preSaveHook = options.preSave || null;
    static methods = options.methods || {};
    static virtuals = options.virtuals || {};
    static defaults = options.defaults || {};

    constructor(data = {}) {
      const merged = { ...Model.defaults, ...data };
      return new TursoDocument(Model, merged);
    }

    static hydrate(data) {
      return new TursoDocument(Model, data);
    }

    static async create(data) {
      if (Array.isArray(data)) {
        return await Model.insertMany(data);
      }
      const doc = new Model(data);
      await doc.save();
      return doc;
    }

    static async insertMany(data) {
      if (!Array.isArray(data)) data = [data];
      const client = await getTurso();
      const docs = [];
      const statements = [];
      const now = new Date().toISOString();

      for (const item of data) {
        const doc = new Model(item);
        if (Model.preSaveHook) {
          await Model.preSaveHook.call(doc);
        }
        if (!doc._data.createdAt) doc._data.createdAt = now;
        doc._data.updatedAt = now;
        doc._data._id = doc._id;
        doc._data.id = doc._id;

        statements.push({
          sql: `INSERT OR REPLACE INTO ${Model.tableName} (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
          args: [doc._id, JSON.stringify(doc._data), doc._data.createdAt, doc._data.updatedAt],
        });
        docs.push(doc);
      }

      for (let i = 0; i < statements.length; i += 50) {
        const chunk = statements.slice(i, i + 50);
        await client.batch(chunk);
      }

      invalidateTableCache(Model.tableName);
      return docs;
    }

    static find(filter = {}) {
      return new TursoQuery(Model, false, filter);
    }

    static findOne(filter = {}) {
      return new TursoQuery(Model, true, filter);
    }

    static findById(id) {
      if (!id) return new TursoQuery(Model, true, { _id: '__null__' });
      const targetId = typeof id === 'object' ? id._id || id.id : String(id);
      return new TursoQuery(Model, true, { _id: targetId });
    }

    static async findByIdAndUpdate(id, update, options = {}) {
      const doc = await Model.findById(id);
      if (!doc) return null;

      // Handle MongoDB $set, $inc, $push operators
      if (update.$set) {
        Object.assign(doc._data, update.$set);
      }
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          doc._data[k] = (doc._data[k] || 0) + v;
        }
      }
      if (update.$push) {
        for (const [k, v] of Object.entries(update.$push)) {
          if (!Array.isArray(doc._data[k])) doc._data[k] = [];
          doc._data[k].push(v);
        }
      }

      // Normal keys
      for (const [k, v] of Object.entries(update)) {
        if (!k.startsWith('$')) {
          setNestedValue(doc._data, k, v);
        }
      }

      await doc.save();
      return doc;
    }

    static async findOneAndUpdate(filter, update, options = {}) {
      const doc = await Model.findOne(filter);
      if (!doc) {
        if (options.upsert) {
          const newDoc = new Model({ ...filter, ...(update.$set || update) });
          await newDoc.save();
          return newDoc;
        }
        return null;
      }

      if (update.$set) {
        Object.assign(doc._data, update.$set);
      }
      for (const [k, v] of Object.entries(update)) {
        if (!k.startsWith('$')) {
          setNestedValue(doc._data, k, v);
        }
      }

      await doc.save();
      return doc;
    }

    static async findByIdAndDelete(id) {
      const doc = await Model.findById(id);
      if (!doc) return null;
      const client = await getTurso();
      await client.execute({
        sql: `DELETE FROM ${Model.tableName} WHERE id = ?`,
        args: [doc._id],
      });
      invalidateTableCache(Model.tableName);
      return doc;
    }

    static async findOneAndDelete(filter) {
      const doc = await Model.findOne(filter);
      if (!doc) return null;
      const client = await getTurso();
      await client.execute({
        sql: `DELETE FROM ${Model.tableName} WHERE id = ?`,
        args: [doc._id],
      });
      invalidateTableCache(Model.tableName);
      return doc;
    }

    static async updateOne(filter, update) {
      const doc = await Model.findOne(filter);
      if (!doc) return { matchedCount: 0, modifiedCount: 0 };
      if (update.$set) Object.assign(doc._data, update.$set);
      for (const [k, v] of Object.entries(update)) {
        if (!k.startsWith('$')) setNestedValue(doc._data, k, v);
      }
      await doc.save();
      return { matchedCount: 1, modifiedCount: 1 };
    }

    static async updateMany(filter, update) {
      const docs = await Model.find(filter);
      let count = 0;
      for (const doc of docs) {
        if (update.$set) Object.assign(doc._data, update.$set);
        for (const [k, v] of Object.entries(update)) {
          if (!k.startsWith('$')) setNestedValue(doc._data, k, v);
        }
        await doc.save();
        count++;
      }
      return { matchedCount: count, modifiedCount: count };
    }

    static async deleteOne(filter) {
      const doc = await Model.findOne(filter);
      if (!doc) return { deletedCount: 0 };
      const client = await getTurso();
      await client.execute({
        sql: `DELETE FROM ${Model.tableName} WHERE id = ?`,
        args: [doc._id],
      });
      invalidateTableCache(Model.tableName);
      return { deletedCount: 1 };
    }

    static async deleteMany(filter = {}) {
      const client = await getTurso();
      if (!filter || Object.keys(filter).length === 0) {
        await client.execute(`DELETE FROM ${Model.tableName}`);
        invalidateTableCache(Model.tableName);
        return { deletedCount: 1000 };
      }
      const docs = await Model.find(filter);
      let count = 0;
      for (const doc of docs) {
        await client.execute({
          sql: `DELETE FROM ${Model.tableName} WHERE id = ?`,
          args: [doc._id],
        });
        count++;
      }
      invalidateTableCache(Model.tableName);
      return { deletedCount: count };
    }

    static async countDocuments(filter = {}) {
      const docs = await Model.find(filter);
      return docs.length;
    }
  }

  registerModel(modelName, Model);
  return Model;
};

export default { createTursoModel, registerModel, getModel, generateId };
