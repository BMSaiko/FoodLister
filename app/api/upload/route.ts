import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let imageBuffer: Buffer;
    let mimeType: string;
    let fileName: string;

    if (contentType.includes('multipart/form-data')) {
      // Traditional file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
      }

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'O arquivo deve ser uma imagem' }, { status: 400 });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'A imagem deve ter no máximo 10MB' }, { status: 400 });
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type;
      fileName = file.name;

    } else if (contentType.includes('application/json')) {
      // Base64 upload
      const body = await request.json();
      const { imageData, mimeType: providedMimeType, fileName: providedFileName } = body;

      if (!imageData || !providedMimeType) {
        return NextResponse.json({ error: 'Dados da imagem ou tipo MIME não fornecidos' }, { status: 400 });
      }

      // Convert base64 to buffer
      imageBuffer = Buffer.from(imageData, 'base64');
      mimeType = providedMimeType;
      fileName = providedFileName || 'uploaded_image.jpg';

      // Validate size (base64 is ~33% larger, so check decoded size)
      if (imageBuffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'A imagem deve ter no máximo 10MB' }, { status: 400 });
      }

    } else {
      return NextResponse.json({ error: 'Tipo de conteúdo não suportado' }, { status: 400 });
    }

    console.log('Processing upload:', {
      contentType,
      mimeType,
      fileName,
      bufferSize: imageBuffer.length
    });

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

    // Create form data for Cloudinary with base64 data
    const cloudinaryFormData = new FormData();

    // For base64, create a data URL
    const dataUrl = `data:${mimeType};base64,${Buffer.from(imageBuffer).toString('base64')}`;
    cloudinaryFormData.append('file', dataUrl);

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
