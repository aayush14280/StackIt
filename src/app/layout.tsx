import '../globals.css'; // Your global CSS file (where body styles should be)
import React from 'react';
import Header from '@/components/Header/Header'; // Import your new Header component
import layoutStyles from './layout.module.css'; // NEW: Import a layout-specific CSS Module

export const metadata = {
  title: 'StackIt', // Your existing title
  description: 'Minimal Q&A Forum', // Your existing description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        The `min-h-screen bg-gray-50 text-gray-900` classes on the body
        are Tailwind CSS classes. If you've fully transitioned to CSS Modules
        for styling the body, you should remove these classes from here
        and manage the background/text color in your `globals.css` file
        as plain CSS.

        However, if you're keeping Tailwind for global utilities like min-height,
        you can leave them. The `bg-gray-50` is a light background, similar
        to the `#f0f2f5` I suggested for CSS Modules.
      */}
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header /> {/* Add your Header component here */}
        {/* Add a div with a specific class for content padding */}
        <div className={`${layoutStyles.contentWrapper} flex-grow`}> {/* Apply the new class and keep flex-grow */}
          {children} {/* This will render your page specific content */}
        </div>
      </body>
    </html>
  );
}