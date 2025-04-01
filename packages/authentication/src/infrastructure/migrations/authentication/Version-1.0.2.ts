module.exports = async (client, schema) => {
  await client.query(`
    ALTER TABLE ${schema}."auth_users"
    ADD COLUMN IF NOT EXISTS reset_password JSONB DEFAULT '{}';
  `);
};
