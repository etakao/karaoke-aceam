import type { Metadata, Viewport } from 'next';
import { Zen_Antique, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';

const zenAntique = Zen_Antique({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Karaoke ACEAM',
  description: 'Programação ao vivo do karaoke.',
  icons: {
    icon: '/logo.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Karaoke ACEAM',
  },
};

export const viewport: Viewport = {
  themeColor: '#c3352a',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='pt-BR'
      className={`${zenAntique.variable} ${zenKaku.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

