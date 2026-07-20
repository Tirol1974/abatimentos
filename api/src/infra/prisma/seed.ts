import { hash } from 'bcryptjs';
import { prisma } from "./index.js";

const isProduction = process.env.NODE_ENV == "production";

async function main() {
  const admin_role = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      slug: 'admin',
    },
  });

  const client_role = await prisma.role.upsert({
    where: { slug: 'cliente' },
    update: {},
    create: {
      name: 'Cliente',
      slug: 'cliente',
    },
  });

  const admin_account = await seedAdminAccount();

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

  if (!isProduction) {
    const client_account = await seedClientAccount();

    await prisma.accountRoles.upsert({
      where: {
        account_id_role_id: {
          account_id: client_account.id,
          role_id: client_role.id,
        }
      },
      update: {},
      create: {
        account_id: client_account.id,
        role_id: client_role.id
      }
    });
  }
}

const seedAdminAccount = async () => {
  const adminName = process.env.ADMIN_NAME ?? "Admin T.I";
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const adminCnpjRoot = process.env.ADMIN_CNPJ_ROOT ?? "";

  if (isProduction && (adminEmail == "" || adminPassword == "")) {
    throw new Error("Configure ADMIN_EMAIL e ADMIN_PASSWORD para executar o seed em producao");
  }

  const email = adminEmail || "admin@tirol.local";
  const password = adminPassword || "Admin@123456789_2026";
  const hashedPassword = await hash(password, 12);

  const adminAccount = await prisma.account.upsert({
    where: { email },
    update: {
      name: adminName,
      cnpj_root: adminCnpjRoot,
    },
    create: {
      name: adminName,
      cnpj_root: adminCnpjRoot,
      email,
      password: hashedPassword
    }
  });

  return adminAccount;
}

const seedClientAccount = async () => {
  const clientPasswordHashed = await hash("Cliente@123456789_2026", 12);

  const clientAccount = await prisma.account.upsert({
    where: { email: 'cliente@tirol.local' },
    update: {},
    create: {
      name: 'Cliente T.I',
      cnpj_root: '',
      email: 'cliente@tirol.local',
      password: clientPasswordHashed
    }
  });

  return clientAccount;
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
