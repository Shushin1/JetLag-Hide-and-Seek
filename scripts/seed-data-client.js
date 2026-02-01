// Client-side script to seed data using Firebase SDK
// This can be run in the browser console or as a one-time setup page
// Make sure you're authenticated as an admin or have proper permissions

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  // Powerup Cards
  {
    type: 'powerup',
    name: 'Hand Expansion',
    description: 'Increase hand size by 2 cards',
    effect: 'handSize+2',
  },
  {
    type: 'powerup',
    name: 'Double Draw',
    description: 'Draw twice as many cards next time',
    effect: 'doubleDraw',
  },
  {
    type: 'powerup',
    name: 'Question Shield',
    description: 'Skip the next question without penalty',
    effect: 'skipQuestion',
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

const questions = [
  // Matching Questions (Draw 3, Keep 1)
  {
    category: 'Matching',
    question: 'What landmark is closest to your hiding spot?',
    answer: 'Answer with a specific landmark name',
    type: 'matching',
    drawCards: 3,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Matching',
    question: 'What type of building are you near?',
    answer: 'Answer with building type',
    type: 'matching',
    drawCards: 3,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Matching',
    question: 'What color is the most prominent sign near you?',
    answer: 'Answer with a color',
    type: 'matching',
    drawCards: 3,
    keepCards: 1,
    timeLimit: 300,
  },
  // Measuring Questions (Draw 2, Keep 1)
  {
    category: 'Measuring',
    question: 'How many steps from your hiding spot to the nearest transit stop?',
    answer: 'Answer with a number',
    type: 'measuring',
    drawCards: 2,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Measuring',
    question: 'How many minutes walk to the nearest landmark?',
    answer: 'Answer with a number',
    type: 'measuring',
    drawCards: 2,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Measuring',
    question: 'How many buildings can you see from your spot?',
    answer: 'Answer with a number',
    type: 'measuring',
    drawCards: 2,
    keepCards: 1,
    timeLimit: 300,
  },
  // Radar Questions (Draw 2, Keep 1) - Reveals location for 10 seconds
  {
    category: 'Radar',
    question: 'What is the name of the street you are on?',
    answer: 'Answer with street name',
    type: 'radar',
    drawCards: 2,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Radar',
    question: 'What is the nearest intersection?',
    answer: 'Answer with intersection names',
    type: 'radar',
    drawCards: 2,
    keepCards: 1,
    timeLimit: 300,
  },
  // Thermometer Questions (Draw 1, Keep 1)
  {
    category: 'Thermometer',
    question: 'What direction are you facing?',
    answer: 'Answer with a cardinal direction',
    type: 'thermometer',
    drawCards: 1,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Thermometer',
    question: 'What is the elevation of your hiding spot?',
    answer: 'Answer with approximate elevation',
    type: 'thermometer',
    drawCards: 1,
    keepCards: 1,
    timeLimit: 300,
  },
  // Photo Questions (Draw 3, Keep 2) - 10-20 min time limit
  {
    category: 'Photo',
    question: 'Take a photo of a unique feature near your hiding spot',
    answer: 'Submit a photo',
    type: 'photo',
    drawCards: 3,
    keepCards: 2,
    timeLimit: 600, // 10 minutes for small/medium, 20 for large
  },
  {
    category: 'Photo',
    question: 'Take a photo showing your view from the hiding spot',
    answer: 'Submit a photo',
    type: 'photo',
    drawCards: 3,
    keepCards: 2,
    timeLimit: 600,
  },
  // Tentacle Questions (Draw 4, Keep 1)
  {
    category: 'Tentacle',
    question: 'Describe three distinct features visible from your hiding spot',
    answer: 'Answer with three features',
    type: 'tentacle',
    drawCards: 4,
    keepCards: 1,
    timeLimit: 300,
  },
  {
    category: 'Tentacle',
    question: 'What are the three closest landmarks to your position?',
    answer: 'Answer with three landmark names',
    type: 'tentacle',
    drawCards: 4,
    keepCards: 1,
    timeLimit: 300,
  },
];

export async function seedDeck() {
  if (!db) {
    console.error('Firebase db is not initialized');
    return false;
  }
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
  if (!db) {
    console.error('Firebase db is not initialized');
    return false;
  }
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
