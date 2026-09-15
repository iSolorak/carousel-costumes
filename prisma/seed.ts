import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_DIR = path.join(process.cwd(), "content", "seed-images");
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.isAbsolute(process.env.UPLOADS_DIR)
    ? process.env.UPLOADS_DIR
    : path.join(process.cwd(), process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "uploads");

function copyIntoUploads(filename: string) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
  const src = path.join(SEED_DIR, filename);
  const dest = path.join(UPLOADS_DIR, filename);
  if (existsSync(src)) {
    copyFileSync(src, dest);
  }
  return filename;
}

const DEMO_COSTUMES = [
  {
    title: "Little Hero",
    description:
      "A bold, comfy superhero costume with a cape that's made for running, jumping, and saving the day.",
    image: "costume-superhero.png",
    featured: true,
    order: 0,
  },
  {
    title: "Friendly Dino",
    description:
      "Soft, plush, and huggable — a dinosaur costume built for roaring around the backyard.",
    image: "costume-dino.png",
    featured: true,
    order: 1,
  },
  {
    title: "Star Explorer",
    description:
      "A comfy astronaut suit with colorful patches, ready for a trip to the moon and back.",
    image: "costume-astronaut.png",
    featured: true,
    order: 2,
  },
  {
    title: "Garden Fairy",
    description:
      "A soft tulle skirt with sparkly details, made for twirling all afternoon.",
    image: "costume-princess.png",
    featured: true,
    order: 3,
  },
];

async function main() {
  for (const costume of DEMO_COSTUMES) {
    const imagePath = copyIntoUploads(costume.image);

    await prisma.costume.upsert({
      where: { id: costume.image },
      create: {
        id: costume.image,
        title: costume.title,
        description: costume.description,
        imagePath,
        featured: costume.featured,
        order: costume.order,
      },
      update: {
        title: costume.title,
        description: costume.description,
        imagePath,
        featured: costume.featured,
        order: costume.order,
      },
    });
  }

  console.log(`Seeded ${DEMO_COSTUMES.length} demo costumes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
