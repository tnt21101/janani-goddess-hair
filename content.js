/* JANANI copy, brand tokens, image references, and integration settings. */
window.JANANI = {
  brand: {
    name: "JANANI",
    tagline: "Hair · Ritual · Radiance",
    headerNote: ["Luxury Hair.", "Timeless Beauty."],
    productName: "JANANI Hair Mist",
    pillars: ["Strength", "Length", "Shine"],
    scent: "Saffron Hibiscus",
    launch: "Spring 2027",
  },

  colors: {
    ruby: "#9E182D",
    rubyGlow: "#E56B80",
    oxblood: "#4B0F18",
    ivory: "#F7F1E7",
    ivoryDeep: "#EFE4D2",
    gold: "#C59A4A",
    goldLight: "#D9B56A",
    goldDeep: "#8E6A2C",
    softBlack: "#181417",
    night: "#120C0E",
    nightSurface: "#1C1316",
  },

  ui: {
    theme: {
      default: "light",
      toDark: "Switch to dark theme",
      toLight: "Switch to light theme",
    },
    scrollTop: { label: "Back to top", showAfter: 600 },
  },

  images: {
    heroProduct: {
      src: "images/Product Image.jpeg",
      focus: { x: 0.57, y: 0.5 },
      alt: "JANANI hair mist in ruby glass with hibiscus",
      placeholder: "JANANI hair mist",
    },
    ingredientRice: {
      src: "images/red-rice.jpg",
      focus: { x: 0.62, y: 0.55 },
      alt: "Glossy red rice grains on ivory silk with water droplets",
      placeholder: "Fermented red rice",
    },
    ingredientHibiscus: {
      src: "images/hibiscus.jpg",
      focus: { x: 0.6, y: 0.5 },
      alt: "Red hibiscus flower with dew on ivory silk",
      placeholder: "Hibiscus",
    },
    founder: {
      src: "images/janani-hibiscus.jpeg",
      focus: { x: 0.5, y: 0.2 },
      alt: "Janani, founder of JANANI, at the ocean at sunset",
      placeholder: "Janani, founder of JANANI",
    },
    finalPolaroid: {
      src: "images/Polaroid Image.jpeg",
      focus: { x: 0.5, y: 0.5 },
      alt: "Janani on the beach at golden hour",
      placeholder: "Janani at golden hour",
    },
  },

  hero: {
    eyebrow: "THE JANANI FOUNDING LIST · LAUNCHING SPRING 2027",
    headline: "THE WEIGHTLESS RITUAL FOR SOFTER, FULLER-LOOKING HAIR",
    category: "Luxury Daily Hair + Scalp Essence Mist",
    body: "A fine daily mist powered by fermented red rice and hibiscus, created for softness, shine, and length retention without greasy roots, heavy buildup, or another complicated routine.",
    incentive: "Join free for 48-hour early access, 20% off your first order, beta-testing opportunities, and the Goddess Hair Ritual Guide.",
    scentBadge: "SIGNATURE SCENT · SAFFRON HIBISCUS · ",
  },

  form: {
    emailPlaceholder: "Email address",
    button: "RESERVE EARLY ACCESS",
    sending: "RESERVING YOUR ACCESS",
    trust: "No payment required. Unsubscribe anytime.",
    invalidEmail: "Please enter a valid email address.",
    duplicateMessage: "That email is already on the Founding List.",
    errorMessage: "We could not reserve your access. Please try again.",
    successTitle: "WELCOME TO THE FOUNDING LIST",
    successBody: "You’re on the Founding List. Check your inbox for your Goddess Hair Ritual Guide.",
    guideLabel: "OPEN THE GODDESS HAIR RITUAL GUIDE",
    guideUrl: "goddess-hair-ritual-guide.html",
  },

  postSignup: {
    surveyHeading: "A little about your hair",
    surveyQuestion: "What’s your biggest frustration with your hair right now?",
    surveyOptions: [
      "Dryness or damage",
      "Breakage or retaining length",
      "Frizz or flyaways",
      "Oily roots or heavy buildup",
      "Flat or lifeless hair",
      "Finding a simple routine",
      "Something else",
    ],
    surveySubmit: "SHARE MY ANSWER",
    surveySending: "SENDING",
    surveySkip: "SKIP THIS QUESTION",
    surveySuccess: "Thank you for sharing. Your answer has been received.",
    surveySkipMessage: "No problem. Your signup is complete.",
    surveyError: "We couldn’t save your answer. Please try again or skip this question.",
    referralHeading: "Know someone who would love JANANI?",
    referralBody: "Invite her to join the Founding List for early access and launch updates.",
    referralShare: "SHARE AN INVITE",
    referralCopy: "COPY INVITE LINK",
    referralCopied: "Invite link copied. Thank you for sharing JANANI.",
    referralShared: "Your invite is ready to share.",
    referralError: "We couldn’t copy the link. Please try sharing it from your browser.",
  },

  stickySignup: {
    message: "Be first to experience JANANI.",
    button: "JOIN THE FOUNDING LIST",
    label: "Founding List signup",
  },

  signup: {
    kitFormId: "",
  },

  foundingList: {
    eyebrow: "FREE PRIORITY ACCESS",
    heading: "The JANANI Founding List",
    intro: "A closer seat at the beginning of JANANI, created for the women helping shape what comes next.",
    benefits: [
      "48-hour access before the public launch",
      "20% off your first order",
      "Opportunities to apply for beta product testing",
      "Immediate Goddess Hair Ritual Guide",
      "Private formulation and launch updates",
      "No payment required",
    ],
  },

  benefits: {
    heading: "What to Expect",
    items: [
      { icon: "strength", title: "Strength", text: "Helps protect fragile hair from everyday brushing, styling, and breakage." },
      { icon: "length", title: "Length", text: "Supports length retention by caring for vulnerable strands and ends." },
      { icon: "shine", title: "Shine", text: "Creates healthy-looking luminosity without oily roots or heavy residue." },
    ],
  },

  ingredients: {
    eyebrow: "THE JANANI DIFFERENCE",
    headline: ["Rooted in Ritual.", "Reimagined by Science."],
    differentiation: "Inspired by the weightless feel of a facial essence, JANANI refreshes the scalp and lengths without the heaviness of a traditional oil or leave-in.",
    cards: [
      { image: "ingredientRice", kicker: "Hero ingredient", label: "Fermented Red Rice" },
      { image: "ingredientHibiscus", kicker: "Hero ingredient", label: "Hibiscus" },
    ],
    notes: ["Water-thin", "Fine mist", "Weightless", "For damp or dry hair", "Signature saffron hibiscus scent"],
    usage: "Being developed for scalp, roots, mid-lengths, and ends across hair textures - after washing, before styling, after exercise, or between wash days.",
  },

  founderPreview: {
    eyebrow: "A RITUAL BORN FROM EXPERIENCE",
    quote: "After experiencing damaged hair, shedding, and the loss of confidence that followed, Janani returned to one simple daily ritual. That ritual became JANANI.",
    cta: "READ JANANI'S STORY",
  },

  founder: {
    eyebrow: "Why I Created JANANI",
    heading: "Created From Something Personal",
    paragraphs: [
      "Hair loss, balding, and shedding run through both sides of my family. I knew they could become part of my story, but I never expected to face them so soon.",
      "For years, I dyed and permed my hair until it became dry, crunchy, and damaged. Then, during one of the hardest periods of my life, an eating disorder caused my hair to fall out. Every pass of the brush felt like another loss of confidence.",
      "Through every stage, I returned to the simple act of caring for my hair each day. The ritual helped me feel beautiful, confident, and like myself again. It became the inspiration for JANANI.",
      "I created JANANI for myself, for my family, and for every woman who has looked in the mirror and longed to feel confident in her hair and herself again.",
    ],
    closing: ["JANANI is more than hair care.", "It is a return to your fearless self."],
    signoff: "Love,",
    signature: "Janani",
  },

  final: {
    eyebrow: "THE JANANI FOUNDING LIST",
    headline: ["Be First To", "The Ritual."],
    sub: "Join free today for priority access, your first-order offer, beta opportunities, and private updates through launch.",
  },

  footer: {
    links: [
      { label: "Instagram", href: "#" },
      { label: "TikTok", href: "#" },
      { label: "Privacy", href: "#" },
    ],
    legal: "© JANANI",
    disclaimer: "The JANANI formula is in development. Descriptions reflect the intended cosmetic experience.",
  },
};
