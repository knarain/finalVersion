import React from "react";

type ImageProps = {
  url: string; // always .webp from JSON
  title: string;
  description: string;
};

const ImageCard: React.FC<ImageProps> = ({ url, title, description }) => {
  // High Quality JPG (replace .webp with -compressed.jpg)
  const highQualityUrl = url.replace(/\.webp$/, "-compressed.jpg");
  const mobileQualityUrl = url;

  return (
    <div className="rounded-xl shadow-lg p-4 bg-white">
      <img src={url} alt={title} className="w-full h-auto rounded-lg mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>

      <div className="flex gap-2 mt-3">
        <a
          href={highQualityUrl}
          download
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Download HQ
        </a>
        <a
          href={mobileQualityUrl}
          download
          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Download Mobile
        </a>
      </div>
    </div>
  );
};

export default ImageCard;
