import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function buildDdsPrompt(topic: string) {
  return `Você é um especialista em Segurança do Trabalho. Elabore um texto curto e direto para um Diálogo Diário de Segurança (DDS) sobre o tema: "${topic}". O texto deve ser educativo, focado em prevenção, em português do Brasil e ter no máximo 3 parágrafos.`;
}

function extractOpenRouterText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';

  return content
    .map((part: any) => {
      if (typeof part === 'string') return part;
      if (typeof part?.text === 'string') return part.text;
      return '';
    })
    .join('\n')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt inválido.' }, { status: 400 });
    }

    const openRouterApiKey = (
      process.env.OPENROUTER_API_KEY ||
      process.env.OPEN_ROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    )?.trim();

    if (openRouterApiKey) {
      const openRouterModel = process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-2.0-flash-001';
      const referer = process.env.APP_URL?.trim() || 'http://localhost:3000';

      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': referer,
          'X-Title': 'Jomaga SafeWork',
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em Segurança do Trabalho e escreve conteúdos claros para DDS.',
            },
            {
              role: 'user',
              content: buildDdsPrompt(prompt.trim()),
            },
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      });

      const openRouterPayload = await openRouterResponse.json().catch(() => ({} as any));

      if (!openRouterResponse.ok) {
        const apiMessage =
          openRouterPayload?.error?.message ||
          openRouterPayload?.message ||
          `Falha no OpenRouter (${openRouterResponse.status}).`;
        throw new Error(apiMessage);
      }

      const text = extractOpenRouterText(openRouterPayload?.choices?.[0]?.message?.content);
      return NextResponse.json({ text: text || 'Não foi possível gerar o conteúdo.' });
    }

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_STUDIO_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY
    )?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API não configurada. Defina OPENROUTER_API_KEY ou GEMINI_API_KEY (também aceito: GOOGLE_AI_STUDIO_API_KEY, GOOGLE_API_KEY).' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: buildDdsPrompt(prompt.trim()),
    });

    const text = response.text ?? 'Não foi possível gerar o conteúdo.';
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo com IA:', error);

    const message = String(error?.message || '');
    const isAuthError = /401|403|api key|permission|unauth|invalid/i.test(message);

    if (isAuthError) {
      return NextResponse.json(
        { error: 'Chave da IA inválida ou sem permissão. Verifique OPENROUTER_API_KEY (ou GEMINI_API_KEY) no ambiente.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'Erro ao gerar conteúdo com IA.' }, { status: 500 });
  }
}
