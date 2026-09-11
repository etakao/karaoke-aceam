import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Karaoke ACEAM',
    short_name: 'Karaoke ACEAM',
    description: 'Programação ao vivo do karaoke.',
    start_url: '/',
    display: 'fullscreen',
    orientation: 'landscape',
    background_color: '#e9e2d0',
    theme_color: '#c3352a',
    icons: [
      {
        src: '/logo.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  };
}
