import React, { useEffect, useRef, useState, useMemo } from 'react';

const ApperFileFieldComponent = ({ config, elementId }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles;
    if (!files || !Array.isArray(files)) return [];
    
    // Deep equality check to detect actual changes
    const currentFiles = JSON.stringify(files);
    const previousFiles = JSON.stringify(existingFilesRef.current);
    
    if (currentFiles === previousFiles) {
      return existingFilesRef.current;
    }
    
    existingFilesRef.current = files;
    return files;
  }, [config.existingFiles]);

  // Initial Mount Effect
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Wait for ApperSDK to load - 50 attempts × 100ms
        let attempts = 0;
        while (!window.ApperSDK && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        elementIdRef.current = `file-uploader-${elementId}`;
        
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });

        mountedRef.current = true;
        setIsReady(true);
        setError(null);

      } catch (error) {
        console.error('Error mounting ApperFileFieldComponent:', error);
        setError(error.message);
        setIsReady(false);
      }
    };

    initializeSDK();

    // Cleanup on component destruction
    return () => {
      try {
        if (window.ApperSDK?.ApperFileUploader && elementIdRef.current && mountedRef.current) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        setIsReady(false);
      } catch (error) {
        console.error('Error unmounting ApperFileFieldComponent:', error);
      }
    };
  }, [elementId, config.fieldKey, config.fieldName, config.tableName]);

  // File Update Effect
  useEffect(() => {
    const updateFiles = async () => {
      // Early returns
      if (!isReady || !window.ApperSDK || !config.fieldKey) return;

      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Deep equality check
        const currentFiles = JSON.stringify(memoizedExistingFiles);
        const previousFiles = JSON.stringify(existingFilesRef.current);
        
        if (currentFiles === previousFiles) return;

        // Format detection - check for .Id vs .id property
        let formattedFiles = memoizedExistingFiles;
        if (memoizedExistingFiles.length > 0 && memoizedExistingFiles[0].Id) {
          // Convert from API format to UI format
          formattedFiles = ApperFileUploader.toUIFormat(memoizedExistingFiles);
        }

        // Update or clear files
        if (formattedFiles.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, formattedFiles);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }

        existingFilesRef.current = memoizedExistingFiles;

      } catch (error) {
        console.error('Error updating files:', error);
        setError(error.message);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-red-500 rounded-md bg-red-50">
        <p className="text-red-700 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="apper-file-field-container">
      {/* Main container with unique ID */}
      <div id={`file-uploader-${elementId}`} className="min-h-[100px]">
        {/* Loading UI */}
        {!isReady && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-md">
            <div className="text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-400">Loading file uploader...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;