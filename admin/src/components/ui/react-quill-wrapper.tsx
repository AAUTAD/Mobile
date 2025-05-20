"use client";

import React, { forwardRef, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ReactInstance } from 'react';
import 'react-quill/dist/quill.snow.css';

// Function to create a polyfill for findDOMNode that avoids the React 18 warning
const createFindDOMNodePolyfill = () => {
  if (typeof window === 'undefined') {
    return undefined; // Return undefined when not in browser
  }
  
  // Return a function that matches React's findDOMNode signature
  return function findDOMNode(
    component: ReactInstance | null | undefined
  ): Element | Text | null {
    if (!component) return null;
    
    // If it's a DOM node, just return it
    if ('nodeType' in component) return component as Element;
    
    // Use type assertion for internal React properties
    const comp = component as any;
    
    // If it has a ref property with current, use that
    if (comp.ref?.current) return comp.ref.current;
    
    // If component has _reactInternalFiber with stateNode, use that
    if (comp._reactInternalFiber?.stateNode) {
      return comp._reactInternalFiber.stateNode;
    }
    
    return null;
  };
};

// Define the props for our QuillComponent
interface QuillComponentProps {
  forwardedRef?: React.Ref<any>;
  [key: string]: any;
}

// Dynamically import ReactQuill and patch it
const ReactQuill = dynamic<QuillComponentProps>(
  async () => {
    // This applies our patch to ReactDOM before ReactQuill is loaded
    if (typeof window !== 'undefined') {
      const ReactDOM = await import('react-dom');
      
      // Type-safe application of our polyfill
      const findDOMNodePolyfill = createFindDOMNodePolyfill();
      // Only replace if our polyfill exists and findDOMNode doesn't
      if (findDOMNodePolyfill && !ReactDOM.default.findDOMNode) {
        // We need to use type assertion to bypass TypeScript's type checking
        (ReactDOM.default as any).findDOMNode = findDOMNodePolyfill;
      }
    }
    
    const { default: RQ } = await import('react-quill');
    
    // Create a component that passes forwardedRef to ReactQuill
    const QuillComponent = ({ forwardedRef, ...props }: QuillComponentProps) => {
      return <RQ ref={forwardedRef} {...props} />;
    };
    
    QuillComponent.displayName = 'QuillComponent';
    return QuillComponent;
  },
  { ssr: false }
);

// Rich text editor modules and formats configuration
export const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

export const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'link', 'image'
];

export interface QuillWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const QuillWrapper = forwardRef<any, QuillWrapperProps>(
  ({ value, onChange, placeholder, style }, ref) => {
    const editorRef = useRef<any>(null);

    // If external ref is provided, update it when our internal ref changes
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(editorRef.current);
        } else {
          (ref as React.MutableRefObject<any>).current = editorRef.current;
        }
      }
    }, [editorRef, ref]);

    return (
      <ReactQuill
        forwardedRef={editorRef}
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        theme="snow"
        style={style}
      />
    );
  }
);

QuillWrapper.displayName = 'QuillWrapper';
