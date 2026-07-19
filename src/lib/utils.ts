import React, { useState } from 'react';
import { Upload, LogIn, Save, FileText, FileSpreadsheet, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL Apps Script
export const GAS_URL = "https://script.google.com/macros/s/AKfycbyPXN27fzLtNSqzPC9N88LYMJeQdSRmbnRCbVrKxzrdzYvJlg4e8kOWBNa6JDmOvjps/exec"; 

// Format number to currency (IDR logic with dots)
export const formatRp = (num: number) => {
  return num.toLocaleString('id-ID');
};

// Parse formatted string back to number
export const parseRp = (str: string) => {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, '')) || 0;
};

// Utility to print HTML content using a hidden iframe
export const printHtml = (htmlContent: string) => {
  // Extract body content from HTML string if it contains a body tag
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const contentToPrint = bodyMatch ? bodyMatch[1] : htmlContent;

  // Extract style tags from HTML string
  const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*)<\/style>/i);
  const stylesToPrint = styleMatch ? styleMatch[1] : '';

  const originalContent = document.body.innerHTML;
  
  // Inject print CSS
  const printStyle = document.createElement('style');
  printStyle.id = 'print-style';
  printStyle.innerHTML = `
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      .no-print {
        display: none !important;
      }
    }
    ${stylesToPrint}
  `;
  document.head.appendChild(printStyle);

  // Set body to only contain the print content
  document.body.innerHTML = contentToPrint;
  document.body.style.background = 'white';

  setTimeout(() => {
    window.print();
    // Restore original content
    document.body.innerHTML = originalContent;
    document.body.style.background = '';
    const styleElem = document.getElementById('print-style');
    if (styleElem) styleElem.remove();
    // Reload to re-attach React listeners if necessary
    window.location.reload();
  }, 250);
};
