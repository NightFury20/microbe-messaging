import bcrypt from 'bcryptjs'
import { prisma } from './lib/prisma'

// The database has already been seeded with the users below:
// username: 'peter', password: '1234'
// username: 'benjamin', password: '1234'
// username: 'jess', password: '1234'
// username: 'tom', password: '1234'

// You can seed additional users in main()
// Make sure any new users have unique usernames
// Run this script with `npx tsx seedUsers.ts`

const createUser = async (username: string, password: string) => {
    const user = await prisma.user.create({
        data: {
            username,
            hashedPassword: await bcrypt.hash(password, 10)
        },
    })

    console.log('Created user:', user)

    return user;
}

async function main() {
  // Create users
  await createUser('peter', '1234')
  await createUser('benjamin', '1234')
  await createUser('jess', '1234')
  await createUser('tom', '1234')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })