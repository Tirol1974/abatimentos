import { prisma } from "./index.js";
import { hash } from 'bcryptjs';

async function main() {

  let admin_password_hashed = await hash("Admin@123456789_2026", 12);
  let operator_password_hashed = await hash("Operator@123456789_2026", 12);

  const admin_account = await prisma.account.upsert({
    where: { email: 'admin@tirol.com.br' },
    update: {},
    create: {
      name: 'Admin T.I',
      email: 'admin@tirol.com.br',
      password: admin_password_hashed
    }
  });

  const operator_account = await prisma.account.upsert({
    where: { email: 'operator@tirol.com.br' },
    update: {},
    create: {
      name: 'Operator T.I',
      email: 'operator@tirol.com.br',
      password: operator_password_hashed
    }
  });

  const admin_role = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      slug: 'admin',
    },
  });

  const operator_role = await prisma.role.upsert({
    where: { slug: 'operator' },
    update: {},
    create: {
      name: 'Operator',
      slug: 'operator',
    },
  });

  await prisma.accountRoles.upsert({
    where: {
      account_id_role_id: {
        account_id: admin_account.id,
        role_id: admin_role.id,
      }
    },
    update: {},
    create: {
      account_id: admin_account.id,
      role_id: admin_role.id
    }
  });
  
  await prisma.accountRoles.upsert({
    where: {
      account_id_role_id: {
        account_id: operator_account.id,
        role_id: operator_role.id,
      }
    },
    update: {},
    create: {
      account_id: operator_account.id,
      role_id: operator_role.id
    }
  });
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