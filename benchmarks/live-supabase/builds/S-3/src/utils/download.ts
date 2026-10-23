/**
 * Utility functions for downloading files
 */

/**
 * Download any image file directly from a URL
 * @param url URL of the image file
 * @param filename Name to save the file as
 */
export const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

/**
 * Download a PNG version of an SVG file
 * @param url URL of the SVG file to convert to PNG
 * @param filename Name to save the PNG file as
 */
export const downloadPNG = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const svgText = await response.text();
    
    // Create a temporary container for the SVG
    const container = document.createElement('div');
    container.innerHTML = svgText;
    const svgElement = container.firstChild as SVGSVGElement;
    
    // Get SVG dimensions
    const svgWidth = svgElement.width.baseVal.value || Number.parseInt(svgElement.getAttribute('width') || '300');
    const svgHeight = svgElement.height.baseVal.value || Number.parseInt(svgElement.getAttribute('height') || '150');
    
    // Create canvas with 2x resolution for better quality
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth * 2;
    canvas.height = svgHeight * 2;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Scale for higher resolution
    ctx.scale(2, 2);
    
    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svgText], {type: 'image/svg+xml'});
    const url2 = URL.createObjectURL(svgBlob);
    
    // Wait for image to load before drawing to canvas
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url2;
    });
    
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url2);
    
    // Convert canvas to PNG and download
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PNG:', error);
  }
};
