import type { Locale } from "./i18n";

/**
 * Privacy and accessibility copy, kept out of the UI dictionary because it is
 * long-form prose that a lawyer may rewrite wholesale, not interface labels.
 *
 * The privacy text is a starting point drafted around what this site actually
 * collects — it is not legal advice, and the page says so.
 */
export type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type LegalPage = { title: string; intro?: string; notice?: string; sections: LegalSection[] };

const privacyEn: LegalPage = {
  title: "How we handle your information",
  notice:
    "Template notice. This page is a starting point, not legal advice. Have it reviewed against Cameroonian data protection law before launch.",
  sections: [
    {
      heading: "What we collect",
      paragraphs: ["We only collect what you choose to give us through a form on this site:"],
      bullets: [
        "Prayer requests — your request, and your name and contact details if you provide them.",
        "Messages to the office — your name, email, phone number if given, and what you wrote.",
        "Event registrations — your name, contact details, party size, and any notes you add.",
        "Giving — handled by Flutterwave. Your card or Mobile Money details never reach this website.",
      ],
    },
    {
      heading: "How we use it",
      paragraphs: [
        "To pray for you, to reply to you, and to run the event you signed up for. We do not sell your information, and we do not share it outside the church except with the service providers who help us operate this site.",
        "Prayer requests marked private stay with the pastoral team. Requests not marked private may be shared with our wider prayer team, by first name only. Neither is ever published.",
      ],
    },
    {
      heading: "Who processes it for us",
      paragraphs: [
        "This site is hosted on Vercel, its content and your submissions are stored in a Neon database, images are stored with Cloudinary, and gifts are processed by Flutterwave. Each holds data on our behalf under their own terms.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Prayer requests and messages are kept only as long as we need them for pastoral follow-up. Event registrations are deleted after the event. Records of gifts are kept for as long as financial rules require.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You can ask us what we hold about you, ask us to correct it, or ask us to delete it. Message us on WhatsApp or write to the office and we will act on it.",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "This site sets no advertising or tracking cookies. Your language and theme choices are stored in your own browser and never sent to us. Embedded videos and the Flutterwave checkout may set their own cookies under their providers' policies.",
      ],
    },
  ],
};

const privacyFr: LegalPage = {
  title: "Comment nous traitons vos informations",
  notice:
    "Modèle indicatif. Cette page est un point de départ, non un avis juridique. Faites-la relire au regard de la loi camerounaise sur la protection des données avant la mise en ligne.",
  sections: [
    {
      heading: "Ce que nous collectons",
      paragraphs: [
        "Nous ne collectons que ce que vous choisissez de nous donner via un formulaire de ce site :",
      ],
      bullets: [
        "Demandes de prière — votre demande, ainsi que votre nom et vos coordonnées si vous les fournissez.",
        "Messages au secrétariat — votre nom, e-mail, téléphone le cas échéant, et votre message.",
        "Inscriptions aux événements — nom, coordonnées, nombre de participants et remarques éventuelles.",
        "Dons — traités par Flutterwave. Vos données de carte ou de Mobile Money ne transitent jamais par ce site.",
      ],
    },
    {
      heading: "Comment nous les utilisons",
      paragraphs: [
        "Pour prier pour vous, vous répondre, et organiser l’événement auquel vous vous êtes inscrit. Nous ne vendons pas vos informations et ne les partageons pas en dehors de l’église, sauf avec les prestataires qui nous aident à faire fonctionner ce site.",
        "Les demandes marquées privées restent avec l’équipe pastorale. Les autres peuvent être partagées avec notre équipe de prière, par prénom uniquement. Aucune n’est jamais publiée.",
      ],
    },
    {
      heading: "Qui les traite pour nous",
      paragraphs: [
        "Ce site est hébergé chez Vercel, son contenu et vos envois sont stockés dans une base Neon, les images chez Cloudinary, et les dons sont traités par Flutterwave. Chacun conserve des données pour notre compte selon ses propres conditions.",
      ],
    },
    {
      heading: "Durée de conservation",
      paragraphs: [
        "Les demandes de prière et les messages ne sont conservés que le temps du suivi pastoral. Les inscriptions sont supprimées après l’événement. Les traces des dons sont conservées aussi longtemps que les règles financières l’exigent.",
      ],
    },
    {
      heading: "Vos droits",
      paragraphs: [
        "Vous pouvez demander ce que nous détenons à votre sujet, demander une correction ou une suppression. Écrivez-nous sur WhatsApp ou au secrétariat et nous y donnerons suite.",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "Ce site ne dépose aucun cookie publicitaire ou de suivi. Vos choix de langue et de thème sont conservés dans votre navigateur et ne nous sont jamais transmis. Les vidéos intégrées et le paiement Flutterwave peuvent déposer leurs propres cookies selon leurs politiques.",
      ],
    },
  ],
};

const accessibilityEn: LegalPage = {
  title: "Everyone should be able to use this site",
  sections: [
    {
      heading: "What we have built in",
      paragraphs: [],
      bullets: [
        "Every page works with a keyboard alone, with a visible focus outline.",
        "Text and interface colours are checked against WCAG 2.2 AA contrast, in both the light and dark themes.",
        "Text resizes without breaking the layout, and the page never scrolls sideways on a phone.",
        "Headings, landmarks, and form labels are marked up for screen readers.",
        "Animation is reduced automatically if your device asks for that.",
        "The whole site is available in English and French.",
        "Sermons carry transcripts where we have them, so the teaching is readable as well as watchable.",
      ],
    },
    {
      heading: "Where we know we fall short",
      paragraphs: [
        "Transcripts are added as we produce them, so older messages may not have one yet. Embedded video players come from third parties and we do not control their controls. If either of these stops you getting to something, tell us and we will get it to you another way.",
      ],
    },
    {
      heading: "Accessibility when you visit",
      paragraphs: [
        "If you would like someone to meet you at the road on your first visit, or you need a seat with step-free access, message us on WhatsApp beforehand and we will arrange it. We would be glad to.",
      ],
    },
    {
      heading: "Tell us",
      paragraphs: [
        "If something here does not work for you, we want to know — it is a fault on our side, not yours. Message the church and we will fix it and reply to you.",
      ],
    },
  ],
};

const accessibilityFr: LegalPage = {
  title: "Ce site doit être utilisable par tous",
  sections: [
    {
      heading: "Ce que nous avons intégré",
      paragraphs: [],
      bullets: [
        "Chaque page fonctionne au clavier seul, avec un contour de focus visible.",
        "Les couleurs du texte et de l’interface respectent le contraste WCAG 2.2 AA, en thème clair comme en thème sombre.",
        "Le texte s’agrandit sans casser la mise en page, et la page ne défile jamais latéralement sur un téléphone.",
        "Titres, repères et étiquettes de formulaire sont balisés pour les lecteurs d’écran.",
        "Les animations sont réduites automatiquement si votre appareil le demande.",
        "Tout le site est disponible en anglais et en français.",
        "Les prédications sont accompagnées de transcriptions lorsque nous en disposons.",
      ],
    },
    {
      heading: "Nos limites connues",
      paragraphs: [
        "Les transcriptions sont ajoutées au fur et à mesure ; les anciennes prédications peuvent donc ne pas en avoir. Les lecteurs vidéo intégrés proviennent de tiers et nous ne maîtrisons pas leurs commandes. Si l’un de ces points vous empêche d’accéder à quelque chose, dites-le-nous et nous vous le transmettrons autrement.",
      ],
    },
    {
      heading: "Accessibilité lors de votre visite",
      paragraphs: [
        "Si vous souhaitez que quelqu’un vous accueille à la route lors de votre première visite, ou s’il vous faut une place accessible de plain-pied, écrivez-nous sur WhatsApp à l’avance et nous l’organiserons avec plaisir.",
      ],
    },
    {
      heading: "Dites-le-nous",
      paragraphs: [
        "Si quelque chose ici ne fonctionne pas pour vous, nous voulons le savoir — la faute est de notre côté, pas du vôtre. Écrivez à l’église : nous corrigerons et nous vous répondrons.",
      ],
    },
  ],
};

export function getPrivacyPage(locale: Locale): LegalPage {
  return locale === "fr" ? privacyFr : privacyEn;
}

export function getAccessibilityPage(locale: Locale): LegalPage {
  return locale === "fr" ? accessibilityFr : accessibilityEn;
}
