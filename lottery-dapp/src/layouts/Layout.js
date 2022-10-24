import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ children }) => {
  return (
    <>
      <Header />
        <div className='p-4 w-full md:w-8/12 mx-auto'>
          {children}
        </div>
      <Footer />
    </>
  )
}
