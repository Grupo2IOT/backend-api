const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const roles = [
  { name: "ADMIN", description: "Administrador del sistema AquaEdge" },
  { name: "AGRICULTOR", description: "Usuario agricultor con acceso a sus parcelas" },
  { name: "SUPERVISOR", description: "Supervisor de parcelas asignadas" },
  { name: "INSTITUCION", description: "Usuario institucional para reportes y auditoría" },
  { name: "TECNICO", description: "Técnico encargado de dispositivos" },
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const passwordHash = await bcrypt.hash("Admin123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aquaedge.com" },
    update: {
      isActive: true,
      profile: {
        upsert: {
          update: { fullName: "Admin AquaEdge" },
          create: { fullName: "Admin AquaEdge" },
        },
      },
    },
    create: {
      email: "admin@aquaedge.com",
      passwordHash,
      isActive: true,
      profile: {
        create: { fullName: "Admin AquaEdge" },
      },
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log("Seed completed: base roles and admin user are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
