import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = decodeURIComponent(params.filename);
  const publicUrl = `${process.env.R2_PUBLIC_URL}/pdfs/${filename}`;

  return Response.redirect(publicUrl, 307);
}
