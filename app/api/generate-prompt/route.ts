import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { title, description, notes } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Card title is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Create a detailed system prompt for generating Claude Code prompts
    const systemPrompt = `You are an expert software architect and technical writer. Your job is to take a brief task title (and optional description/notes) from a Kanban board card and transform it into a detailed, actionable prompt that can be given to Claude Code to implement that feature.

The generated prompt should:
1. Be clear, specific, and actionable
2. Include technical implementation details
3. Specify file structures when relevant
4. Mention best practices and patterns
5. Include testing considerations
6. Be formatted in a way that's ready to copy-paste to Claude Code
7. Be comprehensive enough that Claude Code can implement the feature without ambiguity

Format the output as a well-structured prompt that a developer could give directly to Claude Code.`;

    const userPrompt = `Task Title: ${title}${description ? `\nDescription: ${description}` : ''}${notes ? `\nNotes: ${notes}` : ''}

Generate a detailed prompt for Claude Code to implement this feature.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedPrompt = completion.choices[0]?.message?.content;

    if (!generatedPrompt) {
      return NextResponse.json(
        { error: 'Failed to generate prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prompt: generatedPrompt,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('Error generating prompt:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
