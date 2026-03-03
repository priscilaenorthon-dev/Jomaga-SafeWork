import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt inválido.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave de API não configurada.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Você é um especialista em Segurança do Trabalho. Elabore um texto curto e direto para um Diálogo Diário de Segurança (DDS) sobre o tema: "${prompt.trim()}". O texto deve ser educativo, focado em prevenção e ter no máximo 3 parágrafos.`,
    });

    const text = response.text ?? 'Não foi possível gerar o conteúdo.';
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Erro ao gerar conteúdo com IA:', error);
    return NextResponse.json({ error: 'Erro ao gerar conteúdo com IA.' }, { status: 500 });
  }
}
