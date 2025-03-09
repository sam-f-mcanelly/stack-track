'use client';

import React, { useEffect, useRef, useState } from 'react';
import './address-display.css';

interface AddressDisplayProps {
  addresses: string[];
}

/**
 * Component for displaying Bitcoin addresses in a smooth auto-scrolling animation
 * Each address is a clickable link to mempool.space
 */
const AddressDisplay: React.FC<AddressDisplayProps> = ({ addresses }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  
  // No need to manually format addresses
  // Let the CSS handle any necessary truncation
  
  // Set up the scrolling animation
  useEffect(() => {
    if (!addresses || addresses.length === 0 || !scrollRef.current) return;
    
    let animationId: number;
    let scrollPos = 0;
    const scrollSpeed = 0.5; // pixels per frame
    const containerHeight = scrollRef.current.clientHeight;
    const contentHeight = scrollRef.current.scrollHeight;
    const halfContentHeight = contentHeight / 2;
    
    const scroll = () => {
      if (isPaused || !scrollRef.current) return;
      
      scrollPos += scrollSpeed;
      
      // Reset scroll position when we've scrolled through half the content
      // (since we duplicate the addresses, half = one complete cycle)
      if (scrollPos >= halfContentHeight) {
        scrollPos = 0;
      }
      
      scrollRef.current.scrollTop = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [addresses, isPaused]);
  
  if (!addresses || addresses.length === 0) {
    return <div className="text-xs text-muted-foreground">No addresses found</div>;
  }
  
  return (
    <div 
      className="address-display-container"
      style={{ height: '70px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        ref={scrollRef}
        className="address-scroll-container"
      >
        {/* First set of addresses */}
        {addresses.map((address, index) => (
          <div 
            key={`first-${index}`} 
            className="address-item py-1"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a 
              href={`https://mempool.space/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:text-blue-500 transition-colors duration-200 flex items-center w-full"
            >
              <div className="address-text">
                {address}
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-3 h-3 ml-1 flex-shrink-0"
              >
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        ))}
        
        {/* Duplicate addresses for seamless loop */}
        {addresses.map((address, index) => (
          <div 
            key={`second-${index}`} 
            className="address-item py-1"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a 
              href={`https://mempool.space/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:text-blue-500 transition-colors duration-200 flex items-center"
            >
                {address}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressDisplay;
