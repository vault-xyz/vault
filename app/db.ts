import pgPromise from 'pg-promise';

const pg = pgPromise()({});

export const db = {
    /**
     * Query the database directly.
     */
    query: (text: string, params: any[]) => pg.query(text, params),
    /**
     * Get all rows in the table matching the query.
     * @param table
     * @param columns
     * @param where
     */
    async find<T = any>(table: string, columns?: string[], where?: string): Promise<T> {
        const result = await pg.query('SELECT ${columns:name} FROM ${table:name}' + (where ? 'WHERE ${where:name}' : ''), {
            table,
            columns: columns || '*',
            where
        });

        return(result as T);
    },
    /**
     * Find a row in the table by it'd ID.
     * @param table
     * @param id
     */
    async findById<T = any>(table: string, id: number, columns?: string[]): Promise<T> {
        const result = await pg.query('SELECT ${columns:name} FROM ${table:name} WHERE ${where:name}', {
            table,
            columns: columns || '*',
            where: `id=${id}`
        });

        return (result as T);
    },
    /**
     * Delete a row from a table.
     * @param table
     * @param id
     */
    delete: (table: string, id: number) => {},
    /**
     * Create a new row in a table.
     * @param table 
     * @param data 
     */
    insert: (table, data) => {
        return pg.query('INSERT INTO ${table:name}(${columns:name}) VALUES (${values:name})', {
            table,
            columns: data,
            values: Object.values(data)
        });
    }
};