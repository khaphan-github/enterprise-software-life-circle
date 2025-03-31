module.exports = async (client, schema) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${schema}."auth_users" (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      status VARCHAR(50),
      type VARCHAR(50),
      mfa JSONB DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ${schema}."auth_roles" (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      status VARCHAR(50),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ${schema}."auth_user_roles" (
      user_id VARCHAR(255) REFERENCES ${schema}."auth_users"(id) ON DELETE CASCADE,
      role_id VARCHAR(255) REFERENCES ${schema}."auth_roles"(id) ON DELETE CASCADE,
      status VARCHAR(50),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS ${schema}."auth_actions" (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      status VARCHAR(50),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ${schema}."auth_endpoints" (
      id VARCHAR(255) PRIMARY KEY,
      path VARCHAR(255) NOT NULL,
      method VARCHAR(10) NOT NULL,
      metadata JSONB DEFAULT '{}',
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT unique_path_method UNIQUE (path, method)
    );

    CREATE TABLE IF NOT EXISTS ${schema}."auth_role_action_permissions" (
      role_id VARCHAR(255) REFERENCES ${schema}."auth_roles"(id) ON DELETE CASCADE,
      action_id VARCHAR(255) REFERENCES ${schema}."auth_actions"(id) ON DELETE CASCADE,
      status VARCHAR(50),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (role_id, action_id)
    );

    CREATE TABLE IF NOT EXISTS ${schema}."auth_role_endpoint_permissions" (
      role_id VARCHAR(255) REFERENCES ${schema}."auth_roles"(id) ON DELETE CASCADE,
      endpoint_id VARCHAR(255) REFERENCES ${schema}."auth_endpoints"(id) ON DELETE CASCADE,
      status VARCHAR(50),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (role_id, endpoint_id)
    );
  `);
};
