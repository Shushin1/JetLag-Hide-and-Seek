// Firebase Admin SDK script to seed the questions collection
// Run with: node scripts/seed-questions.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to download service account key)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

const db = admin.firestore();

const questions = [
  // Geography Questions
  {
    category: 'Geography',
    question: 'What is the capital of France?',
    answer: 'Paris',
    type: 'normal',
  },
  {
    category: 'Geography',
    question: 'Which river is the longest in the world?',
    answer: 'Nile',
    type: 'normal',
  },
  {
    category: 'Geography',
    question: 'What is the smallest country in the world?',
    answer: 'Vatican City',
    type: 'normal',
  },
  
  // History Questions
  {
    category: 'History',
    question: 'In which year did World War II end?',
    answer: '1945',
    type: 'normal',
  },
  {
    category: 'History',
    question: 'Who was the first person to walk on the moon?',
    answer: 'Neil Armstrong',
    type: 'normal',
  },
  
  // Science Questions
  {
    category: 'Science',
    question: 'What is the chemical symbol for water?',
    answer: 'H2O',
    type: 'normal',
  },
  {
    category: 'Science',
    question: 'How many planets are in our solar system?',
    answer: '8',
    type: 'normal',
  },
  
  // Ping Questions (reveal location briefly)
  {
    category: 'Ping',
    question: 'What is 2 + 2?',
    answer: '4',
    type: 'ping',
  },
  {
    category: 'Ping',
    question: 'What color is the sky?',
    answer: 'Blue',
    type: 'ping',
  },
  
  // Radar Questions (reveal location for longer)
  {
    category: 'Radar',
    question: 'What is the capital of Japan?',
    answer: 'Tokyo',
    type: 'radar',
  },
  {
    category: 'Radar',
    question: 'How many continents are there?',
    answer: '7',
    type: 'radar',
  },
];

async function seedQuestions() {
  const batch = db.batch();
  
  questions.forEach((question) => {
    const docRef = db.collection('questions').doc();
    batch.set(docRef, question);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${questions.length} questions to questions collection`);
}

// Uncomment to run:
// seedQuestions().catch(console.error);

module.exports = { seedQuestions, questions };
