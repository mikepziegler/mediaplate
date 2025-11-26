export interface GalleryItemInteface {
    id: string;          // full storage key: "galleryName/uuid-filename.jpg"
    gallery: string;     // gallery name (folder)
    fileName: string;    // original filename
    size: number;
    lastModified: Date;
    url: string;         // presigned URL
}
