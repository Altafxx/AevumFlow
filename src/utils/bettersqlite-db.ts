import Database, { Database as typeDB } from 'better-sqlite3';

const dbPath = __dirname + '/../' + 'data.db';

let db: typeDB

db = new Database(dbPath, { verbose: console.log })

async function insertVideoData(title: string, description: string, filename: string) {
    const insertQuery = `
    INSERT INTO videos (title, description, filename)
    VALUES (?, ?, ?)
  `;

    const dataToInsert = [title, description, filename];

    try {
        await db.prepare(insertQuery).run(dataToInsert);
        console.log('Data inserted into database');
    } catch (error: any) {
        console.error(`Error inserting data: ${error.message}`);
    }
}

async function createTableIfNotExists() {


    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      filename TEXT,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    try {
        await db.exec(createTableQuery); // Use exec for multiple statements
        console.log('Table created (if it didn\'t exist)');
    } catch (error: any) {
        console.error(`Error creating table: ${error.message}`);
    }
}

async function getAllVideoData(): Promise<any> {
    try {
        const rows = await db.prepare('SELECT * FROM videos').all();
        return rows;
    } catch (error: any) {
        console.error(`Error retrieving video data: ${error?.message}`);
        return []; // Handle errors by returning an empty array
    }
}

// No need for closeConnection with better-sqlite3 (connection pool)

export { insertVideoData, createTableIfNotExists, getAllVideoData };
