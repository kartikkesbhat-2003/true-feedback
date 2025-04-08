import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST() {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'API key is missing',
        },
        { status: 500 }
      );
    }

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText',
      {
        prompt: { text: prompt },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const textResponse = response.data?.candidates?.[0]?.output || '';
    const responsesArray = textResponse.split('||').map((item: string) => item.trim());

    return NextResponse.json(
      {
        responses: responsesArray,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating messages:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error generating messages',
      },
      { status: 500 }
    );
  }
}
