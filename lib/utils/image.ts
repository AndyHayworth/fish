import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.8,
  };

  const compressed = await imageCompression(file, options);
  // Ensure .webp extension
  const webpFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });
  return webpFile;
}

export async function compressThumbnail(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 200,
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.7,
  };
  const compressed = await imageCompression(file, options);
  return new File([compressed], file.name.replace(/\.[^.]+$/, "_thumb.webp"), {
    type: "image/webp",
  });
}
