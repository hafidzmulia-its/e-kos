# 🚀 Vercel Blob Quick Reference

## 📦 Installation

```bash
npm install @vercel/blob
```

## 🔑 Environment Setup

### Local Development (.env.local)
```env
BLOB_READ_WRITE_TOKEN=   # Optional - leave empty for dev
```

### Production (Vercel)
✅ **Automatically configured** - No setup needed!

---

## 📤 Upload Image

```typescript
import VercelBlobService from '@/lib/vercel-blob';

// Single upload
const result = await VercelBlobService.uploadImage(
  base64Image,
  'my-image.jpg',
  { folder: 'kos-images', maxSizeMB: 10 }
);

console.log(result.url);       // Public CDN URL
console.log(result.pathname);  // For deletion
```

```typescript
// Multiple uploads
const images = [
  { base64: '...', filename: 'image1.jpg' },
  { base64: '...', filename: 'image2.jpg' }
];

const results = await VercelBlobService.uploadMultipleImages(
  images,
  { folder: 'kos-images' }
);
```

---

## 🗑️ Delete Image

```typescript
// Delete by URL
await VercelBlobService.deleteImage(imageUrl);

// Delete multiple
await VercelBlobService.deleteMultipleImages([url1, url2, url3]);
```

---

## 📋 List Images

```typescript
// List images in folder
const images = await VercelBlobService.listImages('kos-images', 100);

images.forEach(img => {
  console.log(img.url);
  console.log(img.pathname);
  console.log(img.size);
  console.log(img.uploadedAt);
});
```

---

## 📊 Storage Stats

```typescript
const stats = await VercelBlobService.getStorageStats('kos-images');

console.log(`Total files: ${stats.totalFiles}`);
console.log(`Total size: ${stats.totalSizeMB}MB`);
```

---

## 🌐 API Route Example

```typescript
// src/app/api/upload/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import VercelBlobService from '@/lib/vercel-blob';

export async function POST(request: NextRequest) {
  const { images } = await request.json();
  
  const results = await VercelBlobService.uploadMultipleImages(
    images,
    { folder: 'kos-images', maxSizeMB: 10 }
  );
  
  return NextResponse.json({ data: results });
}
```

---

## 🎨 Client-Side Usage

```typescript
// Format images for upload
const imageData = files.map((file, index) => ({
  base64: compressedBase64String,
  filename: `kos-${Date.now()}-${index}.jpg`
}));

// Upload via API
const response = await fetch('/api/upload/images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ images: imageData })
});

const { data } = await response.json();

// data contains: url, pathname, contentType, size
```

---

## 🔧 Response Format

```typescript
interface UploadResult {
  url: string;          // https://[hash].public.blob.vercel-storage.com/...
  pathname: string;     // kos-images/1234567890-image.jpg
  contentType: string;  // image/jpeg
  size: number;         // 245678 (bytes)
}
```

---

## ⚙️ Configuration Options

```typescript
interface UploadOptions {
  folder?: string;              // Default: 'kos-images'
  maxSizeMB?: number;          // Default: 10
  allowedTypes?: string[];     // Default: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}
```

---

## 🔍 Error Handling

```typescript
try {
  const result = await VercelBlobService.uploadImage(base64, filename);
  console.log('Upload successful:', result.url);
} catch (error) {
  if (error.message.includes('Invalid base64')) {
    console.error('Image format error');
  } else if (error.message.includes('exceeds')) {
    console.error('File too large');
  } else {
    console.error('Upload failed:', error);
  }
}
```

---

## 🚀 Vercel Dashboard

### Enable Blob Storage
1. Go to https://vercel.com/dashboard
2. Select project
3. **Storage** tab → **Create Database** → **Blob**
4. Click **Connect**

### View Files
1. **Storage** → **Blob** → **Browse**
2. See all uploaded files
3. Preview images
4. Check file sizes

### Monitor Usage
1. **Storage** → **Usage**
2. View bandwidth consumption
3. Track storage size
4. Set up alerts

---

## 💡 Pro Tips

### 1. Compress Before Upload
```typescript
// Already implemented in image-upload.tsx
const compressed = await compressImage(file, {
  quality: 0.8,
  maxWidth: 1200,
  maxHeight: 1200
});
```

### 2. Use Timestamps in Filenames
```typescript
const filename = `kos-${Date.now()}-${index}.jpg`;
// Ensures unique names
// Easy to sort by upload time
```

### 3. Batch Uploads for Performance
```typescript
// Upload all at once
await VercelBlobService.uploadMultipleImages(images);

// vs uploading one by one (slower)
for (const img of images) {
  await VercelBlobService.uploadImage(img.base64, img.filename);
}
```

### 4. Store pathname for Deletion
```typescript
// Save pathname to database
await db.kos_listings.insert({
  images: results.map(r => r.pathname),  // ✅ pathname
  image_urls: results.map(r => r.url)    // ✅ public URL
});

// Later, delete easily
await VercelBlobService.deleteImage(pathname);
```

### 5. Clean Up on Delete
```typescript
// When deleting kos, also delete images
const kos = await getKosById(id);
await VercelBlobService.deleteMultipleImages(kos.image_urls);
await deleteKosFromDatabase(id);
```

---

## 📚 Resources

- **Docs:** https://vercel.com/docs/storage/vercel-blob
- **SDK:** https://vercel.com/docs/storage/vercel-blob/using-blob-sdk
- **Pricing:** https://vercel.com/docs/storage/vercel-blob/usage-and-pricing
- **Examples:** https://github.com/vercel/examples/tree/main/storage

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Upload fails with "Unauthorized" | Enable Blob Storage in Vercel Dashboard |
| "Cannot find module @vercel/blob" | Run `npm install @vercel/blob` |
| Images not displaying | Check URLs in database, verify public access |
| Build fails on Vercel | Ensure package.json includes @vercel/blob |
| Large files rejected | Increase maxSizeMB or compress on client |

---

## 🎯 Migration Checklist

- [x] Install `@vercel/blob`
- [x] Create `src/lib/vercel-blob.ts`
- [x] Update API route
- [x] Update form upload functions
- [x] Update TypeScript interfaces
- [x] Update environment variables
- [ ] Enable Blob Storage on Vercel
- [ ] Deploy to production
- [ ] Test uploads
- [ ] Verify images display

---

**Made with ❤️ for ITS KosFinder**
