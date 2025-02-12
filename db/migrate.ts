import { db } from './index'
import { migrate } from 'drizzle-orm/neon-http/migrator'

const main = async () => {
    try {
        await migrate (db, {
            migrationsFolder: './db/migrations',
        })
        console.log('Database migration completed')
    } catch (error){
        console.error('Error while migrating database:', error)
        process.exit(1)
    }
}

main()