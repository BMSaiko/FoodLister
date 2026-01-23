import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for image upload to Cloudinary
 * Complete reimplementation from scratch
 */
export async function POST(request: NextRequest) {
  try {
    // Get content type from request headers
    const contentType = request.headers.get('content-type') || '';

    // Define file size limit (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB

    let imageBuffer: Buffer;
    let mimeType: string;
    let fileName: string;

    // Handle multipart/form-data uploads (traditional file upload)
    if (contentType.includes('multipart/form-data')) {

      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        console.error('No file provided in form data');
        return NextResponse.json(
          { error: 'Nenhum arquivo fornecido' },
          { status: 400 }
        );
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        return NextResponse.json(
          { error: 'O arquivo deve ser uma imagem' },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (file.size > maxSize) {
        console.error('File too large:', file.size);
        return NextResponse.json(
          { error: 'A imagem deve ter no máximo 10MB' },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type;
      fileName = file.name;

    } else if (contentType.includes('application/json')) {
      // Handle base64 uploads

      const body = await request.json();
      const { imageData, mimeType: providedMimeType, fileName: providedFileName } = body;

      // Validate required fields
      if (!imageData || !providedMimeType) {
        console.error('Missing required fields for base64 upload');
        return NextResponse.json(
          { error: 'Dados da imagem ou tipo MIME não fornecidos' },
          { status: 400 }
        );
      }

      // Convert base64 to buffer
      try {
        imageBuffer = Buffer.from(imageData, 'base64');
        mimeType = providedMimeType;
        fileName = providedFileName || 'uploaded_image.jpg';
      } catch (conversionError) {
        console.error('Base64 conversion failed:', conversionError);
        return NextResponse.json(
          { error: 'Dados da imagem base64 inválidos' },
          { status: 400 }
        );
      }

      // Validate decoded size (base64 is ~33% larger)
      if (imageBuffer.length > maxSize) {
        console.error('Decoded image too large:', imageBuffer.length);
        return NextResponse.json(
          { error: 'A imagem deve ter no máximo 10MB' },
          { status: 400 }
        );
      }

    } else {
      console.error('Unsupported content type:', contentType);
      return NextResponse.json(
        { error: 'Tipo de conteúdo não suportado' },
        { status: 400 }
      );
    }
    // Get Cloudinary configuration from environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Validate Cloudinary configuration
    if (!cloudName || !uploadPreset || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary environment variables');
      return NextResponse.json(
        { error: 'Configuração do Cloudinary incompleta' },
        { status: 500 }
      );
    }

    // Generate timestamp and signature for authenticated upload
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateCloudinarySignature({
      timestamp,
      upload_preset: uploadPreset,
      folder: 'foodlist'
    }, apiSecret);
    // Prepare form data for Cloudinary API
    const cloudinaryFormData = new FormData();

    // Convert buffer to data URL for Cloudinary
    const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    cloudinaryFormData.append('file', dataUrl);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('folder', 'foodlist');
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('api_key', apiKey);
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API error:', errorText);
      return NextResponse.json(
        { error: 'Erro no upload para Cloudinary' },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json({ url: result.secure_url });

  } catch (error) {
    console.error('Unexpected upload error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Generates a signature for Cloudinary authenticated upload
 */
function generateCloudinarySignature(params: Record<string, any>, apiSecret: string): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Create SHA-1 hash
  const crypto = require('crypto');
  return crypto.createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');
}
