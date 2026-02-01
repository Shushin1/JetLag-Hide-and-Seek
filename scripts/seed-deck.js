// Firebase Admin SDK script to seed the deck collection
// Run with: node scripts/seed-deck.js
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS or use service account

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to download service account key)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

const db = admin.firestore();

const deckCards = [
  // Time Bonus Cards
  {
    type: 'timeBonus',
    name: 'Extra Minute',
    description: 'Add 60 seconds to your hiding time',
    value: 60,
  },
  {
    type: 'timeBonus',
    name: 'Time Boost',
    description: 'Add 120 seconds to your hiding time',
    value: 120,
  },
  {
    type: 'timeBonus',
    name: 'Bonus Round',
    description: 'Add 180 seconds to your hiding time',
    value: 180,
  },
  
  // Curse Cards
  {
    type: 'curse',
    name: 'FREEZE',
    description: 'Stay still for 3 minutes',
    value: 3,
  },
  {
    type: 'curse',
    name: 'SLOW MOTION',
    description: 'Move at half speed for 5 minutes',
    value: 5,
  },
  {
    type: 'curse',
    name: 'BLIND',
    description: 'Hide your location for 2 minutes',
    value: 2,
  },
  {
    type: 'curse',
    name: 'STUN',
    description: 'Cannot use cards for 4 minutes',
    value: 4,
  },
];

async function seedDeck() {
  const batch = db.batch();
  
  deckCards.forEach((card) => {
    const docRef = db.collection('deck').doc();
    batch.set(docRef, card);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${deckCards.length} cards to deck collection`);
}

// Uncomment to run:
// seedDeck().catch(console.error);

module.exports = { seedDeck, deckCards };
