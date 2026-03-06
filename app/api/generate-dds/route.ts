import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt inválido.' }, { status: 400 });
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
        { error: 'Chave de API não configurada. Defina GEMINI_API_KEY, GOOGLE_AI_STUDIO_API_KEY ou GOOGLE_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Você é um especialista em Segurança do Trabalho. Elabore um texto curto e direto para um Diálogo Diário de Segurança (DDS) sobre o tema: "${prompt.trim()}". O texto deve ser educativo, focado em prevenção e ter no máximo 3 parágrafos.`,
    });

    const text = response.text ?? 'Não foi possível gerar o conteúdo.';
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo com IA:', error);

    const message = String(error?.message || '');
    const isAuthError = /401|403|api key|permission|unauth|invalid/i.test(message);

    if (isAuthError) {
      return NextResponse.json(
        { error: 'Chave da IA inválida ou sem permissão. Verifique a chave configurada no ambiente.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'Erro ao gerar conteúdo com IA.' }, { status: 500 });
  }
}
