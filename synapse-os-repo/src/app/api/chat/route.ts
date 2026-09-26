import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const kernelUrl = process.env.NEXT_PUBLIC_KERNEL_URL || 'http://127.0.0.1:8000';
    const body = await req.json();

    const response = await fetch(`${kernelUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Kernel responded with ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to proxy request to Synapse Kernel' },
      { status: 502 }
    );
  }
}
