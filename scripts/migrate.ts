#!/usr/bin/env tsx
/**
 * Automated Database Migration Runner
 *
 * Runs SQL migrations from supabase/migrations/ folder automatically.
 * Uses postgres-migrations library for reliable migration management.
 *
 * Usage: npm run migrate
 */

import { migrate } from 'postgres-migrations';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable');
  console.error('\nPlease ensure it is set in your .env.local file');
  process.exit(1);
}

/**
 * Main migration runner using postgres-migrations library
 */
async function runMigrations() {
  console.log('🚀 Flowboard Migration Runner\n');

  try {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');

    console.log('🔌 Connecting to Supabase PostgreSQL...');
    console.log(`📁 Migrations directory: ${migrationsDir}\n`);

    // Parse connection string into components
    const config = parse(DATABASE_URL);

    console.log(`🔍 Parsed connection config:`, {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      passwordLength: config.password?.length,
    });

    // Configure database connection
    const dbConfig = {
      host: config.host!,
      port: parseInt(config.port || '5432'),
      database: config.database!,
      user: config.user!,
      password: config.password!,
      ssl: {
        rejectUnauthorized: false,
      },
    };

    console.log(`📡 Connecting to: ${config.host}:${config.port}/${config.database}\n`);

    // Run migrations using postgres-migrations library
    // This automatically creates a migrations table and tracks which migrations have been run
    const appliedMigrations = await migrate(dbConfig, migrationsDir);

    if (appliedMigrations.length === 0) {
      console.log('✓ All migrations are already up to date!');
    } else {
      console.log('─'.repeat(80));
      console.log(`✅ Successfully applied ${appliedMigrations.length} migration(s):`);
      appliedMigrations.forEach((migration) => {
        console.log(`   ✓ ${migration.fileName} (${migration.name})`);
      });
      console.log('─'.repeat(80));
    }

    console.log('\n✓ Migration complete');
  } catch (error: any) {
    console.error('\n❌ Migration error:', error.message);
    console.error('\n💡 Tip: Verify DATABASE_URL in .env.local is correct');
    console.error(
      '   Connection string should be from Supabase Dashboard → Database → Connection String'
    );

    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run migrations
runMigrations();
