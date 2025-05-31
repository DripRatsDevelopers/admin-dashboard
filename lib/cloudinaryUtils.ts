// lib/cloudinaryLoader.ts
const cloudinaryLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => {
  return `https://res.cloudinary.com/driprats/image/upload/q_${
    quality || 200
  },w_${width},f_auto/${src}`;
};

export default cloudinaryLoader;
