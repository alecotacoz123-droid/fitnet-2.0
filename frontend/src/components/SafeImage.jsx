import React, { useState, useEffect } from 'react';

export const SafeImage = ({ src, fallback = '/default-avatar.svg', alt = '', className = '', ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  // Sync state if src prop changes
  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;
