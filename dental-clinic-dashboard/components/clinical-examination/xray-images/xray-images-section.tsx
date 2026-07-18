'use client';

import {
  Camera,
  ImagePlus,
  RefreshCw,
  ScanSearch,
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CapturePhotoPlaceholder } from './capture-photo-placeholder';
import { ImageCard } from './image-card';
import { ImageDetailsPanel } from './image-details-panel';
import { ImageFilters } from './image-filters';
import { ImageViewerModal } from './image-viewer-modal';
import { dummyImages, recentUploads, type XrayImage } from './image-data';
import { RecentImages } from './recent-images';
import { UploadModal } from './upload-modal';

export function XrayImagesSection() {
  const [images, setImages] = useState<XrayImage[]>(dummyImages);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState('All');
  const [toothFilter, setToothFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [uploadedByFilter, setUploadedByFilter] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedImage, setSelectedImage] = useState<XrayImage | null>(null);
  const [viewerImage, setViewerImage] = useState<XrayImage | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredImages = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return images.filter((image) => {
      const matchesSearch =
        !normalizedSearch ||
        image.name.toLowerCase().includes(normalizedSearch) ||
        image.type.toLowerCase().includes(normalizedSearch) ||
        image.patientName.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === 'All' || image.type === typeFilter;
      const matchesTooth = !toothFilter || (image.toothNumber && image.toothNumber.includes(toothFilter));
      const matchesDate = !dateFilter || image.uploadDate.includes(dateFilter);
      const matchesUploader = uploadedByFilter === 'All' || image.uploadedBy === uploadedByFilter;
      const matchesFavorite = !favoritesOnly || image.isFavorite;

      return matchesSearch && matchesType && matchesTooth && matchesDate && matchesUploader && matchesFavorite;
    });
  }, [images, deferredSearch, typeFilter, toothFilter, dateFilter, uploadedByFilter, favoritesOnly]);

  const handleToggleFavorite = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
      )
    );
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setImages(dummyImages);
      setIsLoading(false);
    }, 600);
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setToothFilter('');
    setDateFilter('');
    setUploadedByFilter('All');
    setFavoritesOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">X-rays & Clinical Images</h2>
          <p className="text-sm text-muted-foreground">
            Review diagnostic images and upload new records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
            <ImagePlus className="size-4" />
            Upload Images
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsCaptureModalOpen(true)}>
            <Camera className="size-4" />
            Capture Photo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Gallery
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: Gallery */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
            <ImageFilters
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              toothFilter={toothFilter}
              onToothFilterChange={setToothFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              uploadedByFilter={uploadedByFilter}
              onUploadedByFilterChange={setUploadedByFilter}
              favoritesOnly={favoritesOnly}
              onFavoritesOnlyChange={setFavoritesOnly}
              onReset={handleResetFilters}
            />
          </div>

          {/* Image grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border bg-card/60">
                  <div className="aspect-[4/3] rounded-t-2xl bg-muted" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 w-3/4 rounded-full bg-muted" />
                    <div className="h-3 w-1/2 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
              <div className="relative mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary theme-strong-shadow">
                <ScanSearch className="size-10" aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <ImagePlus className="size-4" aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">No diagnostic images available.</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Upload the first image or adjust your filters.
              </p>
              <Button
                className="mt-5"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <ImagePlus className="size-4" />
                Upload First Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onView={(img) => setViewerImage(img)}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Image count */}
          {!isLoading && filteredImages.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredImages.length} of {images.length} images
              </span>
              {filteredImages.length < images.length && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-semibold text-primary transition-all hover:text-primary/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Side panels */}
        <div className="space-y-4">
          <ImageDetailsPanel image={selectedImage ?? filteredImages[0] ?? null} />
          <RecentImages
            images={recentUploads}
            onSelect={(img) => setSelectedImage(img)}
            selectedImageId={selectedImage?.id ?? null}
          />
        </div>
      </div>

      {/* Modals */}
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <CapturePhotoPlaceholder isOpen={isCaptureModalOpen} onClose={() => setIsCaptureModalOpen(false)} />
      {viewerImage && (
        <ImageViewerModal
          image={viewerImage}
          images={filteredImages}
          onClose={() => setViewerImage(null)}
          onNavigate={(img) => setViewerImage(img)}
        />
      )}
    </div>
  );
}