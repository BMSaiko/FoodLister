import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates if a file is an image based on MIME type or file extension
 * More permissive validation for mobile devices
 */
function isValidImageFile(file: File): boolean {
  // First check MIME type (most reliable)
  if (file.type && file.type.startsWith('image/')) {
    return true;
  }

  // Fallback to file extension for mobile devices that don't set MIME type correctly
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
  const fileName = file.name.toLowerCase();

  return validExtensions.some(ext => fileName.endsWith(ext));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in upload request');
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    console.log('Processing upload for file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Verifica se é uma imagem (more permissive validation)
    if (!isValidImageFile(file)) {
      console.error('File validation failed:', {
        name: file.name,
        type: file.type,
        hasValidMimeType: file.type?.startsWith('image/'),
        extension: file.name.toLowerCase().split('.').pop()
      });
      return NextResponse.json({ error: 'O arquivo deve ser uma imagem válida (JPG, PNG, GIF, WebP, etc.)' }, { status: 400 });
    }

    // Verifica o tamanho do arquivo (máximo 10MB para Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'A imagem deve ter no máximo 10MB' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !uploadPreset || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Configuração do Cloudinary incompleta' }, { status: 500 });
    }

    // Create signed upload parameters
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature({
      timestamp,
      upload_preset: uploadPreset,
      folder: 'foodlist'
    }, apiSecret);

    // Create form data for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', 'foodlist');
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('api_key', apiKey);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error:', errorText);
      return NextResponse.json({ error: 'Erro no upload para Cloudinary' }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({ url: result.secure_url });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function generateSignature(params: Record<string, any>, apiSecret: string): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Create SHA-1 hash
  const crypto = require('crypto');
  return crypto.createHash('sha1').update(sortedParams + apiSecret).digest('hex');
}
