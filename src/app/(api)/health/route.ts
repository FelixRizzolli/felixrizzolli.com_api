import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
};
