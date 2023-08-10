import { createConnection } from 'mysql2/promise';

export async function mysqlConnect() {
  const connection = await createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234abcd',
    database: 'mycompany',
  });
  return connection;
}