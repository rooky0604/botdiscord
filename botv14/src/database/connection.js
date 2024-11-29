import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false
});

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('MySQL connection error:', error);
    process.exit(1);
  }
}

export default sequelize;