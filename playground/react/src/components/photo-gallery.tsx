import * as React from "react";

type Thumbnail = {
  height: number;
  width: number;
  url: string;
};

type Image = {
  height?: number;
  width?: number;
  url: string;
  thumbnails?: Thumbnail[];
};

type PhotoGallery = {
  photoGallery: Image[];
};

const PhotoGallery = (props: PhotoGallery) => {
  const { photoGallery } = props;

  return (
    <div>
      {photoGallery.map((image, index) => (
        <img src={image.url} key={index} />
      ))}
    </div>
  );
};

export default PhotoGallery;
