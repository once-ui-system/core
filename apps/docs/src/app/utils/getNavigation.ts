import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Schemes } from '@once-ui-system/core';

interface NavigationItem {
    slug: string;
    title: string;
    label?: string;
    navTag?: string;
    navLabel?: string;
    navIcon?: string;
    navTagVariant?: Schemes;
    keywords?: string;
    children?: NavigationItem[];
    order?: number;
    pro?: boolean;
}

interface MetaData {
    title?: string;
    order?: number;
    pages?: Record<string, number>;
    pro?: boolean;
}

// Shared sorting function to ensure consistent sorting at all levels
function sortItems(items: NavigationItem[]): NavigationItem[] {
  return items.sort((a, b) => {
    // First, separate uncategorized items (files) from categorized items (directories)
    const aIsCategory = !!a.children;
    const bIsCategory = !!b.children;
    
    // Prioritize uncategorized pages (files) over categorized ones (directories)
    if (!aIsCategory && bIsCategory) return -1;
    if (aIsCategory && !bIsCategory) return 1;
    
    // If both are the same type (both files or both directories)
    // Then prioritize items with order property
    const aHasOrder = typeof a.order === 'number';
    const bHasOrder = typeof b.order === 'number';
    
    // If only one item has order, prioritize it
    if (aHasOrder && !bHasOrder) return -1;
    if (!aHasOrder && bHasOrder) return 1;
    
    // If both have order, sort by order
    if (aHasOrder && bHasOrder) {
      if (a.order !== b.order) {
        return a.order! - b.order!;
      }
    }
    
    // Fall back to alphabetical
    return a.title.localeCompare(b.title);
  });
}

export default function getNavigation(dirPath = path.join(process.cwd(), 'src/content')): NavigationItem[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  const dirMetaPath = path.join(dirPath, 'meta.json');
  let dirMeta: MetaData | null = null;
  
  try {
    if (fs.existsSync(dirMetaPath)) {
      const metaContent = fs.readFileSync(dirMetaPath, 'utf8');
      dirMeta = JSON.parse(metaContent);
    }
  } catch (error) {
    console.error(`Error reading directory meta.json in ${dirPath}:`, error);
  }

  const navigationItems = entries.map((entry) => {
    // Skip meta.json files themselves from being included in navigation
    if (entry.name === 'meta.json') {
      return null;
    }
    
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const metaPath = path.join(fullPath, 'meta.json');
      let metaData: MetaData | null = null;
      
      try {
        if (fs.existsSync(metaPath)) {
          const metaContent = fs.readFileSync(metaPath, 'utf8');
          
          try {
            metaData = JSON.parse(metaContent);
          } catch (jsonError) {
            console.error(`Error parsing meta.json in ${fullPath}:`, jsonError);
          }
        }
      } catch (error) {
        console.error(`Error reading meta.json in ${fullPath}:`, error);
      }
      
      // Get children and sort them before returning
      const children = getNavigation(fullPath);
      
      const item = {
        slug: entry.name,
        title: metaData?.title || entry.name,
        order: metaData?.order,
        pro: metaData?.pro,
        children: children, // Already sorted by the recursive call
      };
      
      return item;
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      
      const filenameNoExt = entry.name.replace(/\.mdx$/, '');
      
      let pageOrder: number | undefined;
      
      if (dirMeta?.pages?.[entry.name] !== undefined) {
        pageOrder = dirMeta.pages[entry.name];
      } 
      else if (dirMeta?.pages?.[filenameNoExt] !== undefined) {
        pageOrder = dirMeta.pages[filenameNoExt];
      }

      const contentDir = path.join(process.cwd(), 'src/content');
      const relativePath = path.relative(contentDir, fullPath);
      const normalizedPath = relativePath.replace(/\\/g, '/').replace(/\.mdx?$/, '');

      const item = {
        slug: normalizedPath,
        title: data.title || entry.name.replace(/\.mdx?$/, ''),
        navTag: data.navTag,
        navLabel: data.navLabel,
        navIcon: data.navIcon,
        navTagVariant: data.navTagVariant,
        keywords: data.keywords,
        order: pageOrder !== undefined ? pageOrder : data.order,
      };
      
      return item;
    }
    
    return null; // Skip non-directory, non-MDX files
  }).filter(Boolean) as NavigationItem[];
  
  // Sort the items using the shared sorting function
  const sortedItems = sortItems(navigationItems);
  
  return sortedItems;
}