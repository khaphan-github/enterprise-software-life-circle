module.exports = async (client, schema) => {
  await client.query(`
    ALTER TABLE ${schema}."auth_users"
    ADD COLUMN IF NOT EXISTS mfa JSONB DEFAULT '{}';
  `);
};
