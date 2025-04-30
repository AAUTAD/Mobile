"use client";

import { forwardRef, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Function to create a polyfill for findDOMNode that avoids the React 18 warning
const createFindDOMNodePolyfill = () => {
  if (typeof window === 'undefined') return null;
  
  // Return a function that will be used as findDOMNode replacement
  return (component) => {
    if (!component) return null;
    
    // If it's a DOM node, just return it
    if (component.nodeType) return component;
    
    // If it has a ref property with current, use that
    if (component.ref && component.ref.current) return component.ref.current;
    
    // If component has _reactInternalFiber with stateNode, use that
    if (component._reactInternalFiber && component._reactInternalFiber.stateNode) {
      return component._reactInternalFiber.stateNode;
    }
    
    return null;
  };
};

// Dynamically import ReactQuill and patch it
const ReactQuill = dynamic(
  async () => {
    // This applies our patch to ReactDOM before ReactQuill is loaded
    if (typeof window !== 'undefined') {
      const ReactDOM = await import('react-dom');
      
      // Only replace findDOMNode if it doesn't exist
      if (!ReactDOM.default.findDOMNode) {
        ReactDOM.default.findDOMNode = createFindDOMNodePolyfill();
      }
    }
    
    const { default: RQ } = await import('react-quill');
    
    return function QuillComponent({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
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