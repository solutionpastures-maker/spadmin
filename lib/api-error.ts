import { NextResponse } from 'next/server';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === 'string' ? message : String(message);
  }
  return 'Internal server error';
}

export function apiErrorResponse(error: unknown, status = 500) {
  return NextResponse.json({ error: getErrorMessage(error) }, { status });
}
