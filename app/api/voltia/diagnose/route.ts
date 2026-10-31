import { NextResponse } from 'next/server';
import { executeDiagnosticEvaluation } from '@/lib/voltia/voltia-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = executeDiagnosticEvaluation(body);
    return NextResponse.json({ success: true, diagnosis: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar diagnóstico';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
