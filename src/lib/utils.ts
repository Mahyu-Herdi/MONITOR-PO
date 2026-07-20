import React, { useState } from 'react';
import { Upload, LogIn, Save, FileText, FileSpreadsheet, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL Apps Script (Proxied through backend to avoid browser CORS/sandbox "Failed to fetch" errors)
export const GAS_URL = "/api/proxy"; 

// Format number to currency (IDR logic with dots)
export const formatRp = (num: number) => {
  return num.toLocaleString('id-ID');
};

// Parse formatted string back to number
export const parseRp = (str: string) => {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, '')) || 0;
};

// Robust helper to parse number from any input format
export const parseNumber = (val: any) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Robust helper to parse PM/Insentif count, converting Excel/Sheets date serial number representation if needed
export const parsePM = (val: any): number => {
  const num = parseNumber(val);
  // If it's a huge negative number corresponding to the 1900-1930 date range (e.g. -1949987232000)
  if (num < -1000000000000 && num > -2209161600000) {
    // Convert timestamp back to Google Sheets serial number (days since 1899-12-30)
    // Dec 30 1899 UTC is -2209161600000
    const sheetEpoch = -2209161600000;
    const diffMs = num - sheetEpoch;
    // Convert to days and round to the nearest integer
    return Math.round(diffMs / 86400000);
  }
  return num;
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
