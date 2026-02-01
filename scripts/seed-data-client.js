// Client-side script to seed data using Firebase SDK
// This can be run in the browser console or as a one-time setup page
// Make sure you're authenticated as an admin or have proper permissions

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const deckCards = [
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

const questions = [
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

export async function seedDeck() {
  try {
    for (const card of deckCards) {
      await addDoc(collection(db, 'deck'), card);
    }
    console.log(`✅ Seeded ${deckCards.length} cards to deck collection`);
    return true;
  } catch (error) {
    console.error('Error seeding deck:', error);
    return false;
  }
}

export async function seedQuestions() {
  try {
    for (const question of questions) {
      await addDoc(collection(db, 'questions'), question);
    }
    console.log(`✅ Seeded ${questions.length} questions to questions collection`);
    return true;
  } catch (error) {
    console.error('Error seeding questions:', error);
    return false;
  }
}

export async function seedAll() {
  const deckResult = await seedDeck();
  const questionsResult = await seedQuestions();
  return deckResult && questionsResult;
}
