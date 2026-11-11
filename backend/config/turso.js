import { createClient } from '@libsql/client';

let tursoClient = null;
let tablesInitialized = false;

const TABLES = [
  'users',
  'addresses',
  'products',
  'categories',
  'collections',
  'carts',
  'wishlists',
  'orders',
  'payments',
  'coupons',
  'reviews',
  'store_settings',
  'inventory_movements',
  'newsletter_subscribers',
  'return_requests',
];

export const initTables = async (client) => {
  if (tablesInitialized) return;

  const stmts = TABLES.map((table) => `
    CREATE TABLE IF NOT EXISTS ${table} (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(json_extract(data, '$.email'))`,
    `CREATE INDEX IF NOT EXISTS idx_users_googleId ON users(json_extract(data, '$.googleId'))`,
    `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(json_extract(data, '$.slug'))`,
    `CREATE INDEX IF NOT EXISTS idx_products_sku ON products(json_extract(data, '$.sku'))`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(json_extract(data, '$.category'))`,
    `CREATE INDEX IF NOT EXISTS idx_orders_orderNumber ON orders(json_extract(data, '$.orderNumber'))`,
    `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(json_extract(data, '$.customer'))`,
    `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(json_extract(data, '$.slug'))`,
    `CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(json_extract(data, '$.slug'))`,
    `CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(json_extract(data, '$.code'))`,
    `CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(json_extract(data, '$.user'))`,
    `CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(json_extract(data, '$.user'))`,
  ];

  try {
    await client.batch([...stmts, ...indexes]);
  } catch (err) {
    // Fallback to sequential execution if batch has a syntax variant
    for (const s of stmts) {
      await client.execute(s).catch(() => {});
    }
    for (const idx of indexes) {
      await client.execute(idx).catch(() => {});
    }
  }

  tablesInitialized = true;
};

export const connectTurso = async () => {
  if (tursoClient) return tursoClient;

  const url = process.env.TURSO_DATABASE_URL || 'file:dulia.db';
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

  tursoClient = createClient({
    url,
    authToken,
  });

  await tursoClient.execute('SELECT 1');
  await initTables(tursoClient);
  console.log(`✓ Turso Database Connected (${url.startsWith('libsql://') ? 'Cloud Edge' : 'Local'})`);

  return tursoClient;
};

export const getTurso = () => {
  if (!tursoClient) {
    return connectTurso();
  }
  return tursoClient;
};

export const closeTurso = async () => {
  if (tursoClient) {
    tursoClient = null;
    tablesInitialized = false;
  }
};

export default { connectTurso, getTurso, closeTurso, initTables };
