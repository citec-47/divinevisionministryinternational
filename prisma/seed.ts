/**
 * Seeds the database with what we actually know about the church.
 *
 * Deliberately conservative: the church's identity, its pastor, its outreach,
 * and generic-but-editable material (statement of faith, visitor questions) are
 * seeded. Sermons and events are NOT, because inventing a sermon title or an event date
 * for a real church would put a falsehood on a public website. Those start empty
 * and the site's empty states handle it honestly.
 *
 * Safe to re-run: every write is an upsert keyed on a stable slug or id.
 *
 *   npm run db:push   # create the tables
 *   npm run db:seed   # fill them
 */
import { randomBytes } from "node:crypto";
import { loadEnvFile } from "node:process";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// tsx does not load .env the way `prisma` CLI does, so do it explicitly.
for (const file of [".env.local", ".env"]) {
  try {
    loadEnvFile(file);
  } catch {
    // Missing file is fine; the next one (or the real environment) may have it.
  }
}

const prisma = new PrismaClient();

async function seedSettings() {
  const data = {
    name: "Divine Vision Ministry International",
    shortName: "Divine Vision",

    taglineEn: "A family on mission, carrying hope to the nations.",
    taglineFr: "Une famille en mission, portant l’espérance aux nations.",
    descriptionEn:
      "Divine Vision Ministry International is a Christ-centred church family in Yaoundé, led by Prophet Emmanuel Ayuh. Join us on Sunday for worship, teaching from the Scriptures, and a welcome that has room for you.",
    descriptionFr:
      "Divine Vision Ministry International est une famille d’église centrée sur Christ à Yaoundé, conduite par le Prophète Emmanuel Ayuh. Rejoignez-nous le dimanche pour la louange, l’enseignement biblique et un accueil qui a de la place pour vous.",

    // TODO(church): replace with the exact street address and neighbourhood.
    addressLine: "Yaoundé",
    city: "Yaoundé",
    country: "Cameroon",
    addressNoteEn: "Message us on WhatsApp and we will send you directions and a landmark.",
    addressNoteFr:
      "Écrivez-nous sur WhatsApp et nous vous enverrons l’itinéraire et un point de repère.",

    whatsapp: "237672916120",
    email: "divinevisionministryinternatio@gmail.com",
    timezone: "Africa/Douala",
    currency: "XAF",

    givingBlurbEn:
      "Every gift goes into the ministry of this church family: Sunday worship, our work with young people, and the food and supplies we take to orphanages across Yaoundé.",
    givingBlurbFr:
      "Chaque don sert le ministère de cette famille : la louange du dimanche, notre travail auprès des jeunes, et les vivres que nous apportons aux orphelinats de Yaoundé.",

    // The church gave one number for both networks; correct in the admin if
    // the Orange Money line is different.
    momoMtn: "+237 672 91 61 20",
    momoOrange: "+237 672 91 61 20",
    momoAccountName: "Divine Vision Ministry International",

    forceLive: false,
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  console.log("✓ Church details");
}

async function seedServiceTimes() {
  // One Sunday morning gathering, per the church. Times are a starting point,
  // the office should confirm them on the admin dashboard before launch.
  const sunday = {
    id: "service-sunday",
    labelEn: "Sunday Celebration",
    labelFr: "Culte du dimanche",
    dayOfWeek: 0,
    startTime: "09:00",
    endTime: "12:00",
    noteEn: "Children are welcome in the service.",
    noteFr: "Les enfants sont les bienvenus au culte.",
    sortOrder: 0,
  };

  await prisma.serviceTime.upsert({
    where: { id: sunday.id },
    create: sunday,
    update: sunday,
  });

  console.log("✓ Service times (confirm the exact hours in the admin)");
}

async function seedPeople() {
  const speaker = {
    slug: "prophet-emmanuel-ayuh",
    name: "Prophet Emmanuel Ayuh",
    roleEn: "Founder & Lead Pastor",
    roleFr: "Fondateur et pasteur principal",
    bioEn:
      "Prophet Emmanuel Ayuh leads Divine Vision Ministry International in Yaoundé. Alongside the Sunday pulpit, he leads the church's outreach to orphanages and families across the city.",
    bioFr:
      "Le Prophète Emmanuel Ayuh conduit Divine Vision Ministry International à Yaoundé. Au-delà de la chaire du dimanche, il dirige les actions de l’église auprès des orphelinats et des familles de la ville.",
    photoUrl: "/images/pastor-portrait-2.jpeg",
  };

  await prisma.speaker.upsert({
    where: { slug: speaker.slug },
    create: speaker,
    update: speaker,
  });

  const staff = {
    id: "staff-lead-pastor",
    name: "Prophet Emmanuel Ayuh",
    roleEn: "Founder & Lead Pastor",
    roleFr: "Fondateur et pasteur principal",
    bioEn:
      "Leads the church, teaches on Sundays, and is usually the first one carrying the bags of rice on an outreach day.",
    bioFr:
      "Il conduit l’église, enseigne le dimanche, et il est en général le premier à porter les sacs de riz les jours d’action sociale.",
    photoUrl: "/images/pastor-portrait-2.jpeg",
    sortOrder: 0,
  };

  await prisma.staffMember.upsert({
    where: { id: staff.id },
    create: staff,
    update: staff,
  });

  console.log("✓ Prophet Emmanuel Ayuh");
}

async function seedMinistries() {
  const ministries = [
    {
      slug: "outreach",
      titleEn: "Missions & Outreach",
      titleFr: "Missions et action sociale",
      summaryEn:
        "Food, clothing and supplies carried to orphanages and families across Yaoundé.",
      summaryFr:
        "Vivres, vêtements et fournitures apportés aux orphelinats et aux familles de Yaoundé.",
      descriptionEn:
        "This is the part of our life together that happens outside the building. We buy rice, oil, soap and household supplies, and we take them where they are needed: orphanages, widows, families having a hard month.\n\nYou do not need to be a member to come with us. If you can carry a bag, you can serve.",
      descriptionFr:
        "C’est la part de notre vie commune qui se passe hors des murs. Nous achetons riz, huile, savon et produits ménagers, et nous les apportons là où ils manquent : orphelinats, veuves, familles en difficulté.\n\nNul besoin d’être membre pour venir avec nous. Si vous pouvez porter un sac, vous pouvez servir.",
      imageUrl: "/images/outreach-orphanage.jpeg",
      imageAltEn:
        "Prophet Emmanuel Ayuh and church members standing with children at an orphanage, beside donated rice, drinks and household supplies.",
      imageAltFr:
        "Le Prophète Emmanuel Ayuh et des membres de l’église avec des enfants d’un orphelinat, à côté de riz, de boissons et de produits ménagers offerts.",
      sortOrder: 1,
    },
    {
      slug: "kids",
      titleEn: "Children",
      titleFr: "Enfants",
      summaryEn: "Safe, joyful teaching for children during the Sunday service.",
      summaryFr: "Un enseignement sûr et joyeux pour les enfants pendant le culte.",
      audienceEn: "Up to 12 years",
      audienceFr: "Jusqu’à 12 ans",
      meetingTimeEn: "Sunday service",
      meetingTimeFr: "Culte du dimanche",
      sortOrder: 2,
    },
    {
      slug: "youth",
      titleEn: "Youth",
      titleFr: "Jeunesse",
      summaryEn: "A place for teenagers and young adults to belong before they are asked to believe.",
      summaryFr:
        "Un lieu où adolescents et jeunes adultes ont leur place avant qu’on leur demande de croire.",
      audienceEn: "13 – 25 years",
      audienceFr: "13 – 25 ans",
      sortOrder: 3,
    },
    {
      slug: "worship",
      titleEn: "Worship & Creative Arts",
      titleFr: "Louange et arts",
      summaryEn: "Musicians, vocalists and production volunteers who serve our gatherings.",
      summaryFr:
        "Musiciens, chanteurs et bénévoles techniques qui servent nos rassemblements.",
      sortOrder: 4,
    },
    {
      slug: "prayer",
      titleEn: "Prayer",
      titleFr: "Prière",
      summaryEn: "We ask God before we plan. Join the team that carries the church in prayer.",
      summaryFr:
        "Nous demandons à Dieu avant de planifier. Rejoignez l’équipe qui porte l’église dans la prière.",
      sortOrder: 5,
    },
    {
      slug: "care",
      titleEn: "Pastoral Care",
      titleFr: "Accompagnement pastoral",
      summaryEn: "Visitation, counsel, and practical help for members walking through hard seasons.",
      summaryFr:
        "Visites, conseil et aide concrète pour les membres traversant des temps difficiles.",
      sortOrder: 6,
    },
  ];

  for (const ministry of ministries) {
    await prisma.ministry.upsert({
      where: { slug: ministry.slug },
      create: ministry,
      update: ministry,
    });
  }

  console.log(`✓ ${ministries.length} ministries`);
}

async function seedBeliefs() {
  const beliefs = [
    {
      id: "belief-scriptures",
      titleEn: "The Scriptures",
      titleFr: "Les Écritures",
      bodyEn:
        "We believe the Bible is the inspired Word of God and our final authority for faith and life.",
      bodyFr:
        "Nous croyons que la Bible est la Parole inspirée de Dieu et notre autorité ultime pour la foi et la vie.",
      sortOrder: 1,
    },
    {
      id: "belief-god",
      titleEn: "God",
      titleFr: "Dieu",
      bodyEn:
        "We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit.",
      bodyFr:
        "Nous croyons en un seul Dieu, éternellement existant en trois personnes : le Père, le Fils et le Saint-Esprit.",
      sortOrder: 2,
    },
    {
      id: "belief-jesus",
      titleEn: "Jesus Christ",
      titleFr: "Jésus-Christ",
      bodyEn:
        "We believe in the deity of Jesus Christ, his virgin birth, sinless life, atoning death, bodily resurrection, and return.",
      bodyFr:
        "Nous croyons en la divinité de Jésus-Christ, sa naissance virginale, sa vie sans péché, sa mort expiatoire, sa résurrection corporelle et son retour.",
      sortOrder: 3,
    },
    {
      id: "belief-salvation",
      titleEn: "Salvation",
      titleFr: "Le salut",
      bodyEn:
        "We believe salvation is by grace through faith in Christ alone, and is the free gift of God.",
      bodyFr:
        "Nous croyons que le salut est par grâce, au moyen de la foi en Christ seul, et qu’il est le don gratuit de Dieu.",
      sortOrder: 4,
    },
    {
      id: "belief-spirit",
      titleEn: "The Holy Spirit",
      titleFr: "Le Saint-Esprit",
      bodyEn:
        "We believe the Holy Spirit indwells, gifts, and empowers believers for holy living and witness.",
      bodyFr:
        "Nous croyons que le Saint-Esprit habite, dote et fortifie les croyants pour une vie sainte et un témoignage fidèle.",
      sortOrder: 5,
    },
    {
      id: "belief-church",
      titleEn: "The Church",
      titleFr: "L’Église",
      bodyEn: "We believe the church is the body of Christ, sent into the world with the good news.",
      bodyFr:
        "Nous croyons que l’Église est le corps de Christ, envoyée dans le monde avec la bonne nouvelle.",
      sortOrder: 6,
    },
  ];

  for (const belief of beliefs) {
    await prisma.belief.upsert({
      where: { id: belief.id },
      create: belief,
      update: belief,
    });
  }

  console.log(`✓ ${beliefs.length} statements of faith`);
}

async function seedFaqs() {
  const faqs = [
    {
      id: "faq-arrive",
      questionEn: "What time should I arrive?",
      questionFr: "À quelle heure dois-je arriver ?",
      answerEn:
        "Ten minutes early is perfect. Someone from the welcome team will meet you at the door and help you find a seat.",
      answerFr:
        "Dix minutes en avance, c’est parfait. Quelqu’un de l’équipe d’accueil vous recevra à la porte et vous aidera à trouver une place.",
      sortOrder: 1,
    },
    {
      id: "faq-length",
      questionEn: "How long is the service?",
      questionFr: "Combien de temps dure le culte ?",
      answerEn:
        "About three hours, including worship, the message, and prayer. You are free to slip out at any point if you need to.",
      answerFr:
        "Environ trois heures, entre la louange, la prédication et la prière. Vous pouvez sortir à tout moment si vous en avez besoin.",
      sortOrder: 2,
    },
    {
      id: "faq-wear",
      questionEn: "What do people wear?",
      questionFr: "Comment les gens s’habillent-ils ?",
      answerEn:
        "Anything you are comfortable in. You will see suits and kabas, and you will see jeans, sometimes in the same row.",
      answerFr:
        "Ce dans quoi vous êtes à l’aise. Vous verrez des costumes et des kabas, et vous verrez des jeans, parfois sur le même rang.",
      sortOrder: 3,
    },
    {
      id: "faq-children",
      questionEn: "What happens with my children?",
      questionFr: "Que se passe-t-il pour mes enfants ?",
      answerEn:
        "Children are welcome to stay with you in the service, or to join their own group. They are only ever handed back to the adult who brought them.",
      answerFr:
        "Les enfants peuvent rester avec vous au culte ou rejoindre leur propre groupe. Ils ne sont rendus qu’à l’adulte qui les a amenés.",
      sortOrder: 4,
    },
    {
      id: "faq-singled-out",
      questionEn: "Will I be singled out?",
      questionFr: "Vais-je être mis en avant ?",
      answerEn:
        "No. We will not ask you to stand, to introduce yourself, or to give. Come, sit, and watch as long as you like.",
      answerFr:
        "Non. Nous ne vous demanderons ni de vous lever, ni de vous présenter, ni de donner. Venez, asseyez-vous, et observez aussi longtemps que vous voulez.",
      sortOrder: 5,
    },
    {
      id: "faq-find",
      questionEn: "How do I find you?",
      questionFr: "Comment vous trouver ?",
      answerEn:
        "Message us on WhatsApp and we will send you directions, a landmark, and someone's number for the day you come.",
      answerFr:
        "Écrivez-nous sur WhatsApp et nous vous enverrons l’itinéraire, un point de repère et le numéro de quelqu’un pour le jour de votre venue.",
      sortOrder: 6,
    },
  ];

  for (const faq of faqs) {
    await prisma.visitFaq.upsert({
      where: { id: faq.id },
      create: faq,
      update: faq,
    });
  }

  console.log(`✓ ${faqs.length} visitor questions`);
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@divinevision.org").toLowerCase().trim();
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    console.log(`✓ Admin user already exists: ${email}`);
    return;
  }

  // Never invent a weak default. If none is supplied, mint a strong one and
  // print it exactly once. This is the only time it can be read.
  const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");

  await prisma.adminUser.create({
    data: {
      email,
      name: "Church Office",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  console.log(`✓ Admin user created: ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`\n  ⚠  Generated password (shown once, save it now): ${password}\n`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Put your Neon connection string in .env.local");
  }

  await seedSettings();
  await seedServiceTimes();
  await seedPeople();
  await seedMinistries();
  await seedBeliefs();
  await seedFaqs();
  await seedAdmin();

  console.log(
    "\nSeeded. Sermons and events are intentionally empty. Add real ones in /admin.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
