'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, ArrowLeft, Package, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Upload progress
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    );
  };

  const uploadFile = async (file: File, bucket: string): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!digitalFile) {
        throw new Error('Please select a digital file to upload');
      }

      const priceNum = parseInt(price, 10);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Price must be a positive number');
      }

      // 1. Upload digital file to private bucket
      setUploadingFile(true);
      const fileResult = await uploadFile(digitalFile, 'digital-assets');
      setUploadingFile(false);

      // 2. Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        setUploadingThumb(true);
        const thumbResult = await uploadFile(thumbnailFile, 'product-thumbnails');
        thumbnailUrl = thumbResult.url;
        setUploadingThumb(false);
      }

      // 3. Create product
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          price_inr: priceNum,
          thumbnail_url: thumbnailUrl,
          file_path: fileResult.path,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      setSuccess(true);
      setTimeout(() => router.push('/admin'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setUploadingFile(false);
      setUploadingThumb(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-xl font-bold text-gray-900">Product Created!</h2>
        <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Product Title *
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., React Component Library"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug *
          </label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="react-component-library"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <p className="mt-1 text-xs text-gray-500">Auto-generated from title. Edit if needed.</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your product..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹ INR) *
          </label>
          <input
            id="price"
            type="number"
            required
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 499"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Digital File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Digital File (paid download) *
          </label>
          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 cursor-pointer hover:border-brand-400 hover:text-brand-600 transition-colors">
            <Package className="h-5 w-5" />
            {digitalFile ? digitalFile.name : 'Click to select file'}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setDigitalFile(e.target.files?.[0] || null)}
            />
          </label>
          {uploadingFile && (
            <p className="mt-1 text-xs text-brand-600 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading digital file...
            </p>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail Image (optional)
          </label>
          <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 cursor-pointer hover:border-brand-400 hover:text-brand-600 transition-colors">
            <ImageIcon className="h-5 w-5" />
            {thumbnailFile ? thumbnailFile.name : 'Click to select image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
          </label>
          {uploadingThumb && (
            <p className="mt-1 text-xs text-brand-600 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading thumbnail...
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Product...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Publish Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}
