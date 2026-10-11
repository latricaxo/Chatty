/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TRIVIA_TECH } from "./triviaTech";
import { TRIVIA_SCIENCE } from "./triviaScience";
import { TRIVIA_CULTURE } from "./triviaCulture";

export interface TriviaQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const TRUTH_DARES = {
  friendly: {
    truths: [
      "What is your most useless talent?",
      "Have you ever laughed so hard you cried?",
      "What is the most embarrassing fashion trend you've ever followed?",
      "What's your biggest pet peeve?",
      "What was your childhood nickname and why?",
      "If you could only eat one food for the rest of your life, what would it be?",
      "What is the funniest dream you can remember having?",
      "What was your first impression of the other people in this chat?",
    ],
    dares: [
      "Type a sentence using only emojis and let the group guess what it means.",
      "Send a message in all caps for the next 5 minutes.",
      "Tell the funniest dad joke you know.",
      "Speak in a dramatic whisper for your next 3 voice messages or next 5 minutes.",
      "Send a selfie making the most ridiculous face you can.",
      "Give a virtual high-five to everyone in the chat and write a 1-sentence compliment for each.",
      "Recite a popular nursery rhyme in a theatrical movie-villain voice.",
    ]
  },
  deep: {
    truths: [
      "What is a secret about yourself that you've never told anyone in this chat?",
      "What is your biggest fear about the future?",
      "What is the most valuable lesson you've learned from a failure?",
      "If you could change one decision from your past, what would it be?",
      "When was the last time you felt genuinely vulnerable?",
      "What does 'success' truly mean to you?",
      "What is something you are currently struggling with that you hide from others?",
    ],
    dares: [
      "Write a heartfelt, 3-sentence thank you note to someone in this chat.",
      "Share a screenshot of your screen's current active background or last taken photo.",
      "Admit something you did wrong in the past and how you made peace with it.",
      "Type out a list of 3 things you are incredibly grateful for right now.",
      "Write a short, custom 4-line poem about friendship and post it.",
    ]
  },
  party: {
    truths: [
      "What is the most awkward text message you've ever sent by mistake?",
      "Who was your first celebrity crush?",
      "What is the weirdest habit you have when you are completely alone?",
      "Have you ever pretended to be sick to get out of social plans?",
      "What is the silliest thing you've ever bought with your own money?",
      "What's the worst meal you've ever cooked for someone else?",
    ],
    dares: [
      "Do your best impression of a famous celebrity and let the group guess.",
      "Sing the chorus of your favorite song or write the lyrics out in super-dramatic poetry formatting.",
      "Send a funny GIF that represents your current state of mind.",
      "Type the next three messages with your eyes closed (no correcting typos!).",
      "Invent a brand new word, define it, and use it in a sentence.",
    ]
  }
};

export const TRIVIA_QUESTIONS: Record<string, TriviaQuestion[]> = {
  tech: TRIVIA_TECH,
  science: TRIVIA_SCIENCE,
  culture: TRIVIA_CULTURE
};

