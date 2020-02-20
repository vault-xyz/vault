import { Pool } from 'pg';

const pool = new Pool();

export const db = {
    /**
     * Query the database directly.
     */
    query: (text: string, params: any[]) => pool.query(text, params),
    find(table: string) {

    },
    findById: (table: string, id?: number) => {
        // First row in table
        if (!id) {
            return pool.query(`SELECT * FROM ${table} LIMIT 1`);
        }

        // Row matching id
        return pool.query(`SELECT * FROM ${table} WHERE id=$1;`, [id]);
    },
    /**
     * Delete a row from a table.
     * @param table
     * @param id
     */
    delete: (table: string, id: number) => pool.query(`DELETE FROM ${table} WHERE id=$1;`, [id]),
    /**
     * Create a new row in a table.
     * @param table 
     * @param data 
     */
    insert: (table, data) => pool.query(`INSERT INTO ${table} (${Object.keys(data).join(', ')})`, Object.values(data))
};