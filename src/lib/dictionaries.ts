import type { Locale } from "./i18n";

/**
 * UI strings for the site chrome and page furniture.
 *
 * Everything a church actually edits week to week (sermons, events, service
 * times, ministries) lives in the database, not here. This file holds only the
 * words that never change between one Sunday and the next.
 *
 * `en` is the source of truth for the shape; `fr` must match it, and TypeScript
 * enforces that below.
 */
const en = {
  nav: {
    visit: "Plan your visit",
    about: "About",
    sermons: "Sermons",
    events: "Events",
    ministries: "Ministries",
    give: "Give",
    live: "Watch live",
    prayer: "Request prayer",
    contact: "Contact",
    home: "Home",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    skipToContent: "Skip to content",
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
    languageLabel: "Language",
  },
  common: {
    ministryInternational: "Ministry International",
    readMore: "Read more",
    backToHome: "Go to the homepage",
    getDirections: "Get directions",
    whatsappUs: "Message us on WhatsApp",
    callUs: "Call us",
    emailUs: "Email us",
    allRightsReserved: "All rights reserved.",
    privacy: "Privacy",
    accessibility: "Accessibility",
    loading: "Loading…",
    optional: "optional",
    copy: "Copy",
    copied: "Copied",
  },
  live: {
    liveNow: "We are live right now",
    watchService: "Watch the service",
    happeningNow: "Happening now",
    watchLive: "watch live",
    nextService: "Next service",
    today: "today",
    tomorrow: "tomorrow",
    at: "at",
    offline: "Offline right now",
    streamStartsSoon:
      "The stream starts a few minutes before the service. In the meantime, the whole sermon library is here whenever you want it.",
    browsePast: "Browse past messages",
    joinSunday: "Join us on Sunday",
    watchOnChannel: "Watch on our channel",
    whenWeStream: "When we stream",
    ourChannel: "Our channel",
    title: "Worship with us from wherever you are",
    intro:
      "Travelling, unwell, or trying us out before you visit? You are just as welcome on the stream as you are in the room.",
    missedSunday: "Missed Sunday?",
    mostRecent: "The most recent message",
    allSermons: "All sermons",
  },
  home: {
    welcome: "Welcome home",
    planVisit: "Plan your visit",
    watchAService: "Watch a service",
    firstTime: "First time?",
    whatToExpect: "Here is what to expect",
    whatToExpectIntro:
      "No pressure, no spotlight. Just a straight answer to what walking in on Sunday is actually like.",
    fullGuide: "Read the full visitor guide",
    latestMessage: "Latest message",
    speaker: "Speaker",
    passage: "Passage",
    preached: "Preached",
    length: "Length",
    watchOrListen: "Watch or listen",
    browseAll: "Browse all sermons",
    whatsOn: "What is on",
    upcoming: "Upcoming at Divine Vision",
    upcomingIntro: "Gatherings, groups, and days out that anyone is welcome to join.",
    allEvents: "All events",
    findYourPeople: "Find your people",
    ministriesTitle: "Ministries for every season",
    ministriesIntro:
      "Church gets real when it gets small. Here is where people at Divine Vision actually know each other.",
    everyMinistry: "See every ministry",
    givingTitle: "Every gift goes into the work of this church family",
    giveNow: "Give now",
    outreachEyebrow: "Our hands in the city",
    outreachTitle: "Faith that shows up with rice and soap",
    outreachIntro:
      "Our outreach team takes food and supplies to orphanages and families across Yaoundé. This is not a side project. It is what we believe, carried in our hands.",
    outreachCta: "Join an outreach",
    highlights: [
      {
        title: "Come as you are",
        body: "Suits, jeans, kabas, trainers. Nobody is checking, and nobody will ask you to stand up.",
      },
      {
        title: "Your children are safe",
        body: "Checked in with workers we know and trust, and handed back only to you.",
      },
      {
        title: "About two hours",
        body: "Worship, teaching from the Bible, and prayer. Slip out whenever you need to.",
      },
    ],
  },
  visit: {
    title: "You are welcome here, exactly as you are",
    intro:
      "Walking into a church for the first time takes something. So here is everything ahead of time: where to go, what happens, and how long it takes, with no surprises waiting for you.",
    whenYouArrive: "When you arrive",
    firstTenMinutes: "The first ten minutes",
    firstTenIntro: "What actually happens between arriving and the music starting.",
    straightAnswers: "Straight answers",
    questionsAsked: "Questions people actually ask",
    stillHaveQuestion: "Still have a question?",
    stillHaveQuestionBody:
      "Ask us anything before you come, about accessibility, your children, or anything else. A real person will reply.",
    getInTouch: "Get in touch",
    watchFirst: "Watch first, online",
    steps: [
      {
        title: "Arrive at the church",
        body: "Look for the welcome team near the main entrance. They will show you in, not just point.",
      },
      {
        title: "Say hello at the desk",
        body: "Tell them it is your first time. Someone will walk you in and sit with you if you would like.",
      },
      {
        title: "Settle your children",
        body: "If you would like to, sign your children into their group. They are handed back only to you.",
      },
      {
        title: "Find a seat",
        body: "Sit anywhere. Near the back is completely fine and nobody will think anything of it.",
      },
    ],
  },
  about: {
    title: "A church family carrying hope across Yaoundé and beyond",
    ourMission: "Our mission",
    whyWeExist: "Why we exist",
    ourValues: "Our values",
    howWeLiveIt: "How we live it out",
    whatWeBelieve: "What we believe",
    statementOfFaith: "Our statement of faith",
    statementIntro:
      "The convictions we hold in common with the historic Christian church.",
    ourTeam: "Our team",
    peopleWhoServe: "The people who serve you",
    leadershipIntro: "Leadership you can actually reach.",
    comeAndSee: "The best way to know us is to come and see",
    values: [
      ["Scripture first", "We teach the Bible plainly and let it shape us."],
      ["Everyone belongs", "There is no back row in the family of God."],
      ["Prayer before programme", "We ask God before we plan."],
      ["Generous in the city", "A church for its neighbourhood, not just its members."],
    ] as [string, string][],
  },
  sermons: {
    title: "Teaching you can come back to",
    intro:
      "Watch, listen, or read. Every message is searchable, including the transcripts, so a half-remembered line is enough to find it again.",
    subscribe: "Subscribe to the podcast",
    search: "Search sermons",
    searchPlaceholder: "Search titles, passages, speakers, transcripts",
    allSeries: "All series",
    allSpeakers: "All speakers",
    filterSeries: "Filter by series",
    filterSpeaker: "Filter by speaker",
    message: "message",
    messages: "messages",
    loadMore: "Load more messages",
    noMatch: "No messages match that",
    noMatchBody: "Try a shorter search, or clear the filters to see the whole library.",
    seriesTitle: "Work through a whole series",
    seriesIntro: "Messages that belong together, in the order they were preached.",
    readTranscript: "Read the transcript",
    listen: "Listen",
    mediaComingSoon: "Media coming soon",
    mediaComingBody: "The recording for this message has not been published yet.",
    partOfSeries: "Part of a series",
    wholeSeries: "See the whole series",
    neverMiss: "Never miss a message",
    podcastFeed: "Podcast feed",
    keepListening: "Keep listening",
    part: "Part",
    sermonSeries: "Sermon series",
    beganOn: "began",
    noneInSeries: "No messages in this series yet",
    noneInSeriesBody:
      "Check back after Sunday. Messages are published here as they are preached.",
  },
  events: {
    title: "What is coming up",
    intro:
      "You do not need to be a member to come to any of these. Turn up, bring someone, and see what the family is like on a weekday.",
    startSunday: "New here? Start on Sunday",
    everything: "Everything",
    nothingYet: "Nothing on the calendar yet",
    nothingYetBody:
      "Events are published here as they are scheduled. In the meantime, join us on Sunday.",
    nothingInCategory: "Nothing in that category right now",
    nothingInCategoryBody: "Choose “Everything” to see the full calendar.",
    registrationOpen: "Registration open",
    when: "When",
    where: "Where",
    until: "Until",
    backToEvents: "Back to all events",
    askQuestion: "Ask a question",
    savePlace: "Save your place",
    saveePlaceBody: "Free to attend. We only use your details for this event.",
    registrationClosed: "Registration has closed",
    registrationClosedBody:
      "Get in touch with the church office and we will see what we can do.",
    justTurnUp: "Just turn up",
    justTurnUpBody:
      "No booking needed for this one. Come as you are, and bring someone with you.",
    externalBody: "Registration for this event is handled on another site.",
    register: "Register",
    contactOffice: "Contact the office",
  },
  ministries: {
    title: "Find your people",
    intro:
      "Sunday is where we gather. These are the places where people at Divine Vision are actually known by name, week to week.",
    beingAdded: "Ministries are being added",
    beingAddedBody:
      "Get in touch and we will point you to the right group in person.",
    notSure: "Not sure where you would fit?",
    notSureBody:
      "Tell us a little about yourself and we will introduce you to someone who can help you find your place here.",
    talkToSomeone: "Talk to someone",
    ministry: "Ministry",
    whoLeads: "Who leads it",
    whenItMeets: "When it meets",
    askAbout: "Ask about",
    seeWhatsOn: "See what is on",
    otherMinistries: "Other ministries",
    getInTouchForDate: "Get in touch and we will let you know the next date.",
    comeAndSee:
      "Come along and see what this looks like in person, or ask us anything first. There is no wrong way to start.",
  },
  give: {
    title: "Generosity that keeps this church going",
    noObligation:
      "If you are visiting us for the first time, please do not feel any obligation to give. This is for the church family.",
    howOften: "How often?",
    giveOnce: "Give once",
    giveMonthly: "Give monthly",
    amount: "Amount",
    otherAmount: "Or another amount",
    whereShouldItGo: "Where should it go?",
    emailForReceipt: "for your receipt",
    chooseAmount: "Choose an amount",
    give: "Give",
    monthly: "monthly",
    takingYouToCheckout: "Taking you to checkout…",
    securedBy:
      "Payments are handled by Flutterwave, which supports MTN Mobile Money, Orange Money and cards. Your details never touch this website.",
    notConfigured:
      "Online giving is not switched on yet. Use the Mobile Money details opposite, or give in person.",
    directTitle: "Mobile Money & bank transfer",
    directIntro:
      "The quickest way to give in Cameroon. Send to any of these, then tap the WhatsApp button so we can record it.",
    mtnMomo: "MTN Mobile Money",
    orangeMoney: "Orange Money",
    accountName: "Account name",
    bank: "Bank transfer",
    bankNameLabel: "Bank",
    accountNumber: "Account number",
    confirmOnWhatsApp: "Tell us on WhatsApp",
    confirmBody:
      "Sending us the screenshot means we can thank you properly and keep our records straight.",
    otherWaysTitle: "Other ways to give",
    otherWays: [
      {
        title: "In person",
        body: "There is an offering point during every service.",
      },
      {
        title: "Standing order",
        body: "Ask the office how to set up a monthly transfer from your bank.",
      },
      {
        title: "Give in kind",
        body: "Food, clothing and supplies for our outreach are always needed. Ask us what is short this month.",
      },
    ],
    questionsTitle: "Questions about giving",
    questionsBody:
      "For giving statements, standing orders, or anything about how funds are used, contact the church office",
    thankYouTitle: "Thank you",
    thankYouBody:
      "Your gift has gone through. Thank you for standing with this church family.",
    thankYouFailed: "That payment did not complete",
    thankYouFailedBody:
      "Nothing has been taken. You can try again, or use the Mobile Money details on the giving page.",
    tryAgain: "Back to giving",
    listenToMessage: "Listen to a message",
  },
  prayer: {
    title: "Let us carry this with you",
    intro:
      "You do not have to be a member, and you do not have to explain yourself. Tell us what you can, and our team will pray.",
    whoReads: "Who reads this",
    whoReadsBody:
      "Requests go to the pastoral team. If you tick the private box, it stays with them. If you leave it unticked, it may be shared with our wider prayer team, always by first name only, and never published anywhere.",
    ifUrgent: "If it is urgent",
    ifUrgentBody:
      "This form is checked during office hours, not around the clock. If you need to speak to someone today, please call or message us on WhatsApp.",
    ifCrisis:
      "If you are in crisis or at risk of harm, please contact your local emergency services straight away.",
  },
  contact: {
    title: "Talk to a real person",
    intro:
      "Questions about visiting, your children, accessibility, weddings, funerals, or anything else. The church office reads every message.",
    reachUs: "Reach us directly",
    whatsapp: "WhatsApp",
    phone: "Phone",
    email: "Email",
    officeHours: "Office hours",
    officeHoursValue: "Monday to Friday, 9:00 am – 4:00 pm",
    whenWeGather: "When we gather",
    fastestReply: "Fastest reply",
  },
  serviceTimes: {
    gatheringTimes: "Gathering times",
    where: "Where",
    when: "When we meet",
  },
  forms: {
    yourName: "Your name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    sendRequest: "Send my request",
    register: "Register",
    howCanWePray: "How can we pray?",
    prayerPlaceholder: "Share as much or as little as you want to.",
    anonymousHint: "Leave blank to submit anonymously.",
    keepPrivate: "Keep this between me and the pastoral team",
    keepPrivateHint:
      "Otherwise it may be shared with our wider prayer team. It is never made public either way.",
    contactMe: "I would like someone to contact me",
    subjectPlaceholder: "What is this about?",
    howMany: "How many of you?",
    anythingToKnow: "Anything we should know?",
    anythingHint: "Access needs, children coming with you, anything else.",
    checkFields: "Please check the highlighted fields.",
    nameRequired: "Please tell us your name.",
    emailInvalid: "Please enter a valid email address.",
    messageRequired: "Please write a short message.",
    prayerRequired: "Please tell us how we can pray.",
    contactRequired: "Leave an email or phone number so we can reach you.",
    guestsRange: "Enter a number between 1 and 20.",
    deliveryFailed:
      "We could not deliver that just now. Please message us on WhatsApp instead.",
    prayerSuccess:
      "Thank you. Someone on the pastoral team will pray over this, and will be in touch if you asked us to be.",
    contactSuccess:
      "Thank you. Your message is with the church office. We usually reply within two days.",
    registrationSuccess: "You are registered. We will be in touch before the day.",
    leaveEmpty: "Leave this field empty",
  },
  notFound: {
    title: "We could not find that page",
    body: "The link may be old, or the page may have moved. Everything else is still here.",
    browseSermons: "Browse sermons",
  },
  footer: {
    explore: "Explore",
    findUs: "Find us",
    aboutUs: "About us",
    podcastFeed: "Sermon podcast feed",
  },
};

/** French translation. Typed against `en`, so a missing key is a build error. */
const fr: typeof en = {
  nav: {
    visit: "Préparez votre visite",
    about: "À propos",
    sermons: "Prédications",
    events: "Événements",
    ministries: "Ministères",
    give: "Donner",
    live: "Direct",
    prayer: "Demander une prière",
    contact: "Contact",
    home: "Accueil",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
    skipToContent: "Aller au contenu",
    switchToDark: "Passer au thème sombre",
    switchToLight: "Passer au thème clair",
    languageLabel: "Langue",
  },
  common: {
    ministryInternational: "Ministry International",
    readMore: "Lire la suite",
    backToHome: "Retour à l’accueil",
    getDirections: "Itinéraire",
    whatsappUs: "Écrivez-nous sur WhatsApp",
    callUs: "Appelez-nous",
    emailUs: "Écrivez-nous",
    allRightsReserved: "Tous droits réservés.",
    privacy: "Confidentialité",
    accessibility: "Accessibilité",
    loading: "Chargement…",
    optional: "facultatif",
    copy: "Copier",
    copied: "Copié",
  },
  live: {
    liveNow: "Nous sommes en direct",
    watchService: "Suivre le culte",
    happeningNow: "En ce moment",
    watchLive: "suivre en direct",
    nextService: "Prochain culte",
    today: "aujourd’hui",
    tomorrow: "demain",
    at: "à",
    offline: "Hors ligne pour le moment",
    streamStartsSoon:
      "La diffusion commence quelques minutes avant le culte. En attendant, toute la bibliothèque de prédications est disponible.",
    browsePast: "Voir les prédications passées",
    joinSunday: "Rejoignez-nous dimanche",
    watchOnChannel: "Regarder sur notre chaîne",
    whenWeStream: "Nos horaires de diffusion",
    ourChannel: "Notre chaîne",
    title: "Adorez avec nous, où que vous soyez",
    intro:
      "En voyage, souffrant, ou simplement curieux avant de venir ? Vous êtes aussi bienvenu en ligne que dans la salle.",
    missedSunday: "Vous avez manqué dimanche ?",
    mostRecent: "La prédication la plus récente",
    allSermons: "Toutes les prédications",
  },
  home: {
    welcome: "Bienvenue chez vous",
    planVisit: "Préparez votre visite",
    watchAService: "Suivre un culte",
    firstTime: "Première visite ?",
    whatToExpect: "Voici à quoi vous attendre",
    whatToExpectIntro:
      "Aucune pression, aucun projecteur. Simplement une réponse claire à ce que vivre un dimanche ici veut dire.",
    fullGuide: "Lire le guide complet du visiteur",
    latestMessage: "Dernière prédication",
    speaker: "Prédicateur",
    passage: "Passage",
    preached: "Prêchée le",
    length: "Durée",
    watchOrListen: "Regarder ou écouter",
    browseAll: "Voir toutes les prédications",
    whatsOn: "À l’affiche",
    upcoming: "Prochainement à Divine Vision",
    upcomingIntro:
      "Rassemblements, groupes et sorties ouverts à tous.",
    allEvents: "Tous les événements",
    findYourPeople: "Trouvez les vôtres",
    ministriesTitle: "Des ministères pour chaque saison",
    ministriesIntro:
      "L’Église devient réelle quand elle devient petite. Voici où l’on se connaît vraiment à Divine Vision.",
    everyMinistry: "Voir tous les ministères",
    givingTitle: "Chaque don sert l’œuvre de cette famille",
    giveNow: "Donner maintenant",
    outreachEyebrow: "Nos mains dans la ville",
    outreachTitle: "Une foi qui arrive avec du riz et du savon",
    outreachIntro:
      "Notre équipe d’action sociale apporte vivres et fournitures aux orphelinats et aux familles de Yaoundé. Ce n’est pas un projet annexe. C’est notre foi, portée à bout de bras.",
    outreachCta: "Rejoindre une action",
    highlights: [
      {
        title: "Venez comme vous êtes",
        body: "Costume, jean, kaba, baskets. Personne ne vous jugera et personne ne vous demandera de vous lever.",
      },
      {
        title: "Vos enfants sont en sécurité",
        body: "Confiés à des encadrants que nous connaissons, et rendus à vous seul.",
      },
      {
        title: "Environ deux heures",
        body: "Louange, enseignement biblique et prière. Vous pouvez sortir à tout moment.",
      },
    ],
  },
  visit: {
    title: "Vous êtes le bienvenu, exactement tel que vous êtes",
    intro:
      "Entrer dans une église pour la première fois demande du courage. Voici donc tout à l’avance : où aller, ce qui se passe, et combien de temps cela dure, sans aucune surprise.",
    whenYouArrive: "À votre arrivée",
    firstTenMinutes: "Les dix premières minutes",
    firstTenIntro:
      "Ce qui se passe réellement entre votre arrivée et le début de la louange.",
    straightAnswers: "Réponses claires",
    questionsAsked: "Les questions que l’on nous pose vraiment",
    stillHaveQuestion: "Une autre question ?",
    stillHaveQuestionBody:
      "Posez-nous n’importe quelle question avant de venir : accessibilité, enfants, ou autre. Une vraie personne vous répondra.",
    getInTouch: "Nous contacter",
    watchFirst: "Regarder d’abord en ligne",
    steps: [
      {
        title: "Arrivez à l’église",
        body: "Cherchez l’équipe d’accueil près de l’entrée principale. Elle vous accompagnera à l’intérieur.",
      },
      {
        title: "Dites bonjour à l’accueil",
        body: "Dites que c’est votre première fois. Quelqu’un vous accompagnera et s’assiéra avec vous si vous le souhaitez.",
      },
      {
        title: "Installez vos enfants",
        body: "Si vous le souhaitez, confiez vos enfants à leur groupe. Ils ne seront rendus qu’à vous.",
      },
      {
        title: "Prenez place",
        body: "Asseyez-vous où vous voulez. Près du fond, c’est très bien, et personne n’y verra rien.",
      },
    ],
  },
  about: {
    title: "Une famille qui porte l’espérance à Yaoundé et au-delà",
    ourMission: "Notre mission",
    whyWeExist: "Pourquoi nous existons",
    ourValues: "Nos valeurs",
    howWeLiveIt: "Comment nous les vivons",
    whatWeBelieve: "Ce que nous croyons",
    statementOfFaith: "Notre confession de foi",
    statementIntro:
      "Les convictions que nous partageons avec l’Église chrétienne historique.",
    ourTeam: "Notre équipe",
    peopleWhoServe: "Ceux qui vous servent",
    leadershipIntro: "Des responsables que vous pouvez vraiment joindre.",
    comeAndSee: "Le meilleur moyen de nous connaître est de venir voir",
    values: [
      ["L’Écriture d’abord", "Nous enseignons la Bible simplement et nous la laissons nous façonner."],
      ["Chacun a sa place", "Il n’y a pas de dernier rang dans la famille de Dieu."],
      ["La prière avant le programme", "Nous demandons à Dieu avant de planifier."],
      ["Généreux dans la ville", "Une église pour son quartier, pas seulement pour ses membres."],
    ] as [string, string][],
  },
  sermons: {
    title: "Un enseignement sur lequel revenir",
    intro:
      "Regardez, écoutez ou lisez. Chaque prédication est consultable, transcriptions comprises. Une phrase à moitié retenue suffit à la retrouver.",
    subscribe: "S’abonner au podcast",
    search: "Rechercher une prédication",
    searchPlaceholder: "Titres, passages, prédicateurs, transcriptions",
    allSeries: "Toutes les séries",
    allSpeakers: "Tous les prédicateurs",
    filterSeries: "Filtrer par série",
    filterSpeaker: "Filtrer par prédicateur",
    message: "prédication",
    messages: "prédications",
    loadMore: "Voir plus de prédications",
    noMatch: "Aucune prédication ne correspond",
    noMatchBody:
      "Essayez une recherche plus courte, ou effacez les filtres pour voir toute la bibliothèque.",
    seriesTitle: "Suivre une série entière",
    seriesIntro: "Des prédications qui vont ensemble, dans l’ordre où elles ont été données.",
    readTranscript: "Lire la transcription",
    listen: "Écouter",
    mediaComingSoon: "Enregistrement à venir",
    mediaComingBody: "L’enregistrement de cette prédication n’est pas encore publié.",
    partOfSeries: "Fait partie d’une série",
    wholeSeries: "Voir toute la série",
    neverMiss: "Ne manquez aucune prédication",
    podcastFeed: "Flux du podcast",
    keepListening: "Continuez à écouter",
    part: "Partie",
    sermonSeries: "Série de prédications",
    beganOn: "commencée le",
    noneInSeries: "Aucune prédication dans cette série",
    noneInSeriesBody:
      "Revenez après dimanche. Les prédications sont publiées au fil des cultes.",
  },
  events: {
    title: "Ce qui arrive",
    intro:
      "Nul besoin d’être membre pour venir. Passez, amenez quelqu’un, et voyez à quoi ressemble la famille en semaine.",
    startSunday: "Nouveau ? Commencez un dimanche",
    everything: "Tout",
    nothingYet: "Rien au calendrier pour l’instant",
    nothingYetBody:
      "Les événements sont publiés ici dès qu’ils sont fixés. En attendant, rejoignez-nous dimanche.",
    nothingInCategory: "Rien dans cette catégorie pour l’instant",
    nothingInCategoryBody: "Choisissez « Tout » pour voir le calendrier complet.",
    registrationOpen: "Inscriptions ouvertes",
    when: "Quand",
    where: "Où",
    until: "Jusqu’à",
    backToEvents: "Retour aux événements",
    askQuestion: "Poser une question",
    savePlace: "Réservez votre place",
    saveePlaceBody:
      "Participation gratuite. Vos informations ne servent qu’à cet événement.",
    registrationClosed: "Les inscriptions sont closes",
    registrationClosedBody:
      "Contactez le secrétariat et nous verrons ce que nous pouvons faire.",
    justTurnUp: "Venez simplement",
    justTurnUpBody:
      "Aucune inscription nécessaire. Venez comme vous êtes, et amenez quelqu’un.",
    externalBody: "L’inscription à cet événement se fait sur un autre site.",
    register: "S’inscrire",
    contactOffice: "Contacter le secrétariat",
  },
  ministries: {
    title: "Trouvez les vôtres",
    intro:
      "Le dimanche, nous nous rassemblons. Voici les lieux où l’on connaît vraiment les gens à Divine Vision, par leur nom, semaine après semaine.",
    beingAdded: "Les ministères arrivent bientôt",
    beingAddedBody:
      "Contactez-nous et nous vous orienterons vers le bon groupe en personne.",
    notSure: "Vous ne savez pas où vous situer ?",
    notSureBody:
      "Parlez-nous un peu de vous et nous vous présenterons quelqu’un qui vous aidera à trouver votre place.",
    talkToSomeone: "Parler à quelqu’un",
    ministry: "Ministère",
    whoLeads: "Qui le dirige",
    whenItMeets: "Quand il se réunit",
    askAbout: "Se renseigner sur",
    seeWhatsOn: "Voir ce qui arrive",
    otherMinistries: "Autres ministères",
    getInTouchForDate: "Contactez-nous et nous vous donnerons la prochaine date.",
    comeAndSee:
      "Venez voir ce que cela donne en vrai, ou posez-nous vos questions d’abord. Il n’y a pas de mauvaise façon de commencer.",
  },
  give: {
    title: "Une générosité qui fait vivre cette église",
    noObligation:
      "Si vous nous rendez visite pour la première fois, ne vous sentez aucune obligation de donner. Ceci est pour la famille de l’église.",
    howOften: "À quelle fréquence ?",
    giveOnce: "Donner une fois",
    giveMonthly: "Donner chaque mois",
    amount: "Montant",
    otherAmount: "Ou un autre montant",
    whereShouldItGo: "À quoi doit servir ce don ?",
    emailForReceipt: "pour votre reçu",
    chooseAmount: "Choisissez un montant",
    give: "Donner",
    monthly: "par mois",
    takingYouToCheckout: "Redirection vers le paiement…",
    securedBy:
      "Les paiements sont traités par Flutterwave, qui accepte MTN Mobile Money, Orange Money et les cartes. Vos informations ne transitent jamais par ce site.",
    notConfigured:
      "Le don en ligne n’est pas encore activé. Utilisez les coordonnées Mobile Money ci-contre, ou donnez sur place.",
    directTitle: "Mobile Money et virement",
    directIntro:
      "Le moyen le plus rapide de donner au Cameroun. Envoyez à l’un de ces numéros, puis prévenez-nous sur WhatsApp.",
    mtnMomo: "MTN Mobile Money",
    orangeMoney: "Orange Money",
    accountName: "Nom du compte",
    bank: "Virement bancaire",
    bankNameLabel: "Banque",
    accountNumber: "Numéro de compte",
    confirmOnWhatsApp: "Prévenez-nous sur WhatsApp",
    confirmBody:
      "Nous envoyer la capture d’écran nous permet de vous remercier et de tenir nos registres à jour.",
    otherWaysTitle: "Autres façons de donner",
    otherWays: [
      {
        title: "Sur place",
        body: "Un point de collecte est prévu à chaque culte.",
      },
      {
        title: "Virement permanent",
        body: "Demandez au secrétariat comment mettre en place un virement mensuel.",
      },
      {
        title: "Donner en nature",
        body: "Vivres, vêtements et fournitures pour nos actions sont toujours utiles. Demandez-nous ce qui manque ce mois-ci.",
      },
    ],
    questionsTitle: "Questions sur les dons",
    questionsBody:
      "Pour les reçus, les virements permanents, ou toute question sur l’usage des fonds, contactez le secrétariat",
    thankYouTitle: "Merci",
    thankYouBody:
      "Votre don a bien été reçu. Merci de soutenir cette famille d’église.",
    thankYouFailed: "Ce paiement n’a pas abouti",
    thankYouFailedBody:
      "Rien n’a été prélevé. Vous pouvez réessayer, ou utiliser les coordonnées Mobile Money sur la page des dons.",
    tryAgain: "Retour aux dons",
    listenToMessage: "Écouter une prédication",
  },
  prayer: {
    title: "Laissez-nous porter cela avec vous",
    intro:
      "Vous n’avez pas besoin d’être membre, ni de vous justifier. Dites-nous ce que vous pouvez, et notre équipe priera.",
    whoReads: "Qui lit ces demandes",
    whoReadsBody:
      "Les demandes vont à l’équipe pastorale. Si vous cochez la case privée, elles restent avec eux. Sinon, elles peuvent être partagées avec notre équipe de prière, toujours par prénom seulement, et jamais publiées.",
    ifUrgent: "En cas d’urgence",
    ifUrgentBody:
      "Ce formulaire est consulté aux heures de bureau, pas en continu. Si vous devez parler à quelqu’un aujourd’hui, appelez-nous ou écrivez-nous sur WhatsApp.",
    ifCrisis:
      "Si vous êtes en danger ou en situation de crise, contactez immédiatement les services d’urgence.",
  },
  contact: {
    title: "Parlez à une vraie personne",
    intro:
      "Questions sur une visite, vos enfants, l’accessibilité, un mariage, des funérailles ou autre. Le secrétariat lit chaque message.",
    reachUs: "Nous joindre directement",
    whatsapp: "WhatsApp",
    phone: "Téléphone",
    email: "E-mail",
    officeHours: "Heures d’ouverture",
    officeHoursValue: "Du lundi au vendredi, 9h00 – 16h00",
    whenWeGather: "Quand nous nous rassemblons",
    fastestReply: "Réponse la plus rapide",
  },
  serviceTimes: {
    gatheringTimes: "Horaires des cultes",
    where: "Où",
    when: "Quand nous nous réunissons",
  },
  forms: {
    yourName: "Votre nom",
    email: "E-mail",
    phone: "Téléphone",
    subject: "Objet",
    message: "Message",
    send: "Envoyer le message",
    sending: "Envoi…",
    sendRequest: "Envoyer ma demande",
    register: "S’inscrire",
    howCanWePray: "Comment pouvons-nous prier ?",
    prayerPlaceholder: "Partagez autant ou aussi peu que vous le souhaitez.",
    anonymousHint: "Laissez vide pour envoyer anonymement.",
    keepPrivate: "Garder ceci entre moi et l’équipe pastorale",
    keepPrivateHint:
      "Sinon, la demande pourra être partagée avec notre équipe de prière. Elle n’est jamais rendue publique.",
    contactMe: "Je souhaite être recontacté",
    subjectPlaceholder: "De quoi s’agit-il ?",
    howMany: "Combien serez-vous ?",
    anythingToKnow: "Quelque chose à nous signaler ?",
    anythingHint: "Besoins d’accessibilité, enfants qui vous accompagnent, autre.",
    checkFields: "Merci de vérifier les champs indiqués.",
    nameRequired: "Merci d’indiquer votre nom.",
    emailInvalid: "Merci de saisir une adresse e-mail valide.",
    messageRequired: "Merci d’écrire un court message.",
    prayerRequired: "Merci de nous dire comment prier.",
    contactRequired: "Laissez un e-mail ou un téléphone pour que nous puissions vous joindre.",
    guestsRange: "Saisissez un nombre entre 1 et 20.",
    deliveryFailed:
      "Nous n’avons pas pu transmettre cela. Merci de nous écrire sur WhatsApp.",
    prayerSuccess:
      "Merci. Un membre de l’équipe pastorale priera pour cela, et vous recontactera si vous l’avez demandé.",
    contactSuccess:
      "Merci. Votre message est bien arrivé au secrétariat. Nous répondons généralement sous deux jours.",
    registrationSuccess: "Vous êtes inscrit. Nous vous recontacterons avant le jour J.",
    leaveEmpty: "Laissez ce champ vide",
  },
  notFound: {
    title: "Page introuvable",
    body: "Le lien est peut-être ancien, ou la page a été déplacée. Tout le reste est toujours là.",
    browseSermons: "Voir les prédications",
  },
  footer: {
    explore: "Explorer",
    findUs: "Nous trouver",
    aboutUs: "À propos de nous",
    podcastFeed: "Flux podcast des prédications",
  },
};

export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
