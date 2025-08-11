import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Schemes } from "@once-ui-system/core";

interface Post {
  slug: string;
  content: string;
  navTag?: string;
  navLabel?: string;
  navIcon?: string;
  navTagVariant?: Schemes;
  metadata: {
    title: string;
    summary?: string;
    github?: string;
    docs?: string;
    updatedAt: string;
    image?: string;
    order?: number;
  };
}

export function getPages(customPath = ["src", "content"]): Post[] {
  const postsDir = path.join(process.cwd(), ...customPath);
  const contentBasePath = path.join(process.cwd(), "src", "content");
  
  // Check if directory exists before trying to read it
  if (!fs.existsSync(postsDir)) {
    console.warn(`Directory does not exist: ${postsDir}`);
    return [];
  }
  
  const files = fs.readdirSync(postsDir);
  const posts: Post[] = [];
  
  // Try to read meta.json if it exists in the current directory
  let metaData: { pages?: Record<string, number>, order?: number, title?: string } = {};
  const metaPath = path.join(postsDir, "meta.json");
  if (fs.existsSync(metaPath)) {
    try {
      metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (error) {
      console.warn(`Error reading meta.json: ${metaPath}`, error);
    }
  }

  files.forEach((file) => {
    const filePath = path.join(postsDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      try {
        posts.push(...getPages([...customPath, file]));
      } catch (error) {
        console.warn(`Error reading directory: ${filePath}`, error);
      }
    } else if (file.endsWith('.mdx')) {
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        // Create slug without src/content prefix
        const slug = path.relative(contentBasePath, filePath)
          .replace(/\.mdx?$/, '')
          .replace(/\\/g, '/');
          
        // Get order from meta.json if available
        const fileName = path.basename(file, path.extname(file));
        const metaOrder = metaData.pages?.[fileName];

        posts.push({
          slug,
          content,
          navTag: data.tag,
          navLabel: data.tagLabel,
          navIcon: data.navIcon,
          navTagVariant: data.navTagVariant,
          metadata: {
            title: data.title || '',
            summary: data.summary,
            docs: data.docs,
            github: data.github,
            updatedAt: data.updatedAt || '',
            image: data.image,
            // Priority: 1. Frontmatter order, 2. meta.json order, 3. undefined
            order: data.order !== undefined ? Number(data.order) : (metaOrder !== undefined ? Number(metaOrder) : undefined),
          },
        });
      } catch (error) {
        console.warn(`Error reading file: ${filePath}`, error);
      }
    }
  });

  return posts;
}

// Sort types for documentation pages
export type SortType = 'order' | 'alphabetical' | 'date' | 'section';

// Function to sort pages consistently across the application
export function sortPages(pages: Post[], sortType: SortType = 'order'): Post[] {
  if (!pages || pages.length === 0) {
    return [];
  }

  // Create a copy to avoid mutating the original array
  const sortedPages = [...pages];

  switch (sortType) {
    case 'order':
      // First sort by explicit order (if available), then alphabetically by slug as fallback
      return sortedPages.sort((a, b) => {
        // If both have order, sort by order
        if (a.metadata.order !== undefined && b.metadata.order !== undefined) {
          return a.metadata.order - b.metadata.order;
        }
        // If only a has order, a comes first
        if (a.metadata.order !== undefined) {
          return -1;
        }
        // If only b has order, b comes first
        if (b.metadata.order !== undefined) {
          return 1;
        }
        // If neither has order, sort alphabetically by slug
        return a.slug.localeCompare(b.slug);
      });

    case 'alphabetical':
      // Sort alphabetically by title
      return sortedPages.sort((a, b) => 
        a.metadata.title.localeCompare(b.metadata.title)
      );

    case 'date':
      // Sort by update date (newest first)
      return sortedPages.sort((a, b) => 
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      );

    case 'section':
      // Sort by section (directory structure) first, then by order within section
      return sortedPages.sort((a, b) => {
        // Get the section (first part of the slug)
        const aSection = a.slug.split('/')[0];
        const bSection = b.slug.split('/')[0];
        
        // If sections are different, sort by section
        if (aSection !== bSection) {
          return aSection.localeCompare(bSection);
        }
        
        // If in the same section, use order logic
        if (a.metadata.order !== undefined && b.metadata.order !== undefined) {
          return a.metadata.order - b.metadata.order;
        }
        if (a.metadata.order !== undefined) return -1;
        if (b.metadata.order !== undefined) return 1;
        
        // Fallback to alphabetical by title
        return a.metadata.title.localeCompare(b.metadata.title);
      });

    default:
      return sortedPages;
  }
}

// Function to get adjacent pages based on the current slug
export function getAdjacentPages(currentSlug: string, sortType: SortType = 'section') {
  try {
    // Get all pages
    const allPages = getPages();
    
    // First, create a flattened array that represents the exact order of the sidebar
    const sidebarOrderedPages: Post[] = [];
    
    // Read root meta.json for section ordering
    let rootMetaData: { pages?: Record<string, number> } = {};
    const rootMetaPath = path.join(process.cwd(), "src", "content", "meta.json");
    if (fs.existsSync(rootMetaPath)) {
      try {
        rootMetaData = JSON.parse(fs.readFileSync(rootMetaPath, 'utf8'));
      } catch (error) {
        console.warn(`Error reading root meta.json: ${rootMetaPath}`, error);
      }
    }
    
    // Handle top-level pages first (pages without a section)
    const topLevelPages = allPages.filter(page => !page.slug.includes('/'));
    
    // Sort top-level pages based on meta.json order
    const sortedTopLevelPages = topLevelPages.sort((a, b) => {
      const aOrder = rootMetaData.pages?.[a.slug];
      const bOrder = rootMetaData.pages?.[b.slug];
      
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      
      // Fallback to alphabetical by title
      return a.metadata.title.localeCompare(b.metadata.title);
    });
    
    // Add top-level pages to the ordered list
    sortedTopLevelPages.forEach(page => {
      sidebarOrderedPages.push(page);
    });
    
    // Group pages by their main section (first part of the path)
    const sectionMap = new Map<string, Post[]>();
    
    allPages.forEach(page => {
      if (page.slug.includes('/')) {
        const section = page.slug.split('/')[0];
        if (!sectionMap.has(section)) {
          sectionMap.set(section, []);
        }
        sectionMap.get(section)!.push(page);
      }
    });
    
    // Get sections and sort them based on meta.json if available
    const sections = Array.from(sectionMap.entries()).map(([section, pages]) => ({ section, pages }));
    
    const sortedSections = [...sections].sort((a, b) => {
      const aOrder = rootMetaData.pages?.[a.section];
      const bOrder = rootMetaData.pages?.[b.section];
      
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      
      // Fallback to alphabetical
      return a.section.localeCompare(b.section);
    });
    
    // Process each section and add its pages to the ordered list
    sortedSections.forEach(({ section, pages }) => {
      // Try to read section meta.json for page ordering within the section
      let sectionMetaData: { pages?: Record<string, number>, order?: number, folders?: Record<string, number> } = {};
      const sectionMetaPath = path.join(process.cwd(), "src", "content", section, "meta.json");
      
      if (fs.existsSync(sectionMetaPath)) {
        try {
          sectionMetaData = JSON.parse(fs.readFileSync(sectionMetaPath, 'utf8'));
        } catch (error) {
          console.warn(`Error reading section meta.json: ${sectionMetaPath}`, error);
        }
      }
      
      // Group pages by subfolder within the section
      const folderMap = new Map<string, Post[]>();
      
      // First, identify all direct children of the section (no additional slashes)
      const directChildren = pages.filter(page => {
        const pathParts = page.slug.split('/');
        return pathParts.length === 2; // section/page.mdx format
      });
      
      // Add direct children to the folder map under an empty key
      if (directChildren.length > 0) {
        folderMap.set('', directChildren);
      }
      
      // Then group the nested pages by their immediate subfolder
      pages.forEach(page => {
        const pathParts = page.slug.split('/');
        if (pathParts.length > 2) { // It's in a subfolder
          const folder = pathParts[1]; // Get the subfolder name
          if (!folderMap.has(folder)) {
            folderMap.set(folder, []);
          }
          folderMap.get(folder)!.push(page);
        }
      });
      
      // Sort the folders based on meta.json if available
      const folders = Array.from(folderMap.entries()).map(([folder, folderPages]) => ({ folder, pages: folderPages }));
      
      const sortedFolders = [...folders].sort((a, b) => {
        // Empty folder (direct children) always comes first
        if (a.folder === '') return -1;
        if (b.folder === '') return 1;
        
        // Check if folders have order in section meta.json
        const aOrder = sectionMetaData.folders?.[a.folder];
        const bOrder = sectionMetaData.folders?.[b.folder];
        
        if (aOrder !== undefined && bOrder !== undefined) {
          return aOrder - bOrder;
        }
        if (aOrder !== undefined) return -1;
        if (bOrder !== undefined) return 1;
        
        // Fallback to alphabetical by folder name
        return a.folder.localeCompare(b.folder);
      });
      
      // Process each folder and add its pages to the ordered list
      sortedFolders.forEach(({ folder, pages: folderPages }) => {
        // Sort pages within the folder
        const sortedFolderPages = [...folderPages].sort((a, b) => {
          // Extract page name from slug (last part after the slash)
          const aName = a.slug.split('/').pop()!;
          const bName = b.slug.split('/').pop()!;
          
          // For direct children, check if pages have order in section meta.json
          if (folder === '') {
            const aOrder = sectionMetaData.pages?.[aName];
            const bOrder = sectionMetaData.pages?.[bName];
            
            if (aOrder !== undefined && bOrder !== undefined) {
              return aOrder - bOrder;
            }
            if (aOrder !== undefined) return -1;
            if (bOrder !== undefined) return 1;
          }
          
          // Try to read folder meta.json for nested pages
          if (folder !== '') {
            let folderMetaData: { pages?: Record<string, number> } = {};
            const folderMetaPath = path.join(process.cwd(), "src", "content", section, folder, "meta.json");
            
            if (fs.existsSync(folderMetaPath)) {
              try {
                folderMetaData = JSON.parse(fs.readFileSync(folderMetaPath, 'utf8'));
                
                const aOrder = folderMetaData.pages?.[aName];
                const bOrder = folderMetaData.pages?.[bName];
                
                if (aOrder !== undefined && bOrder !== undefined) {
                  return aOrder - bOrder;
                }
                if (aOrder !== undefined) return -1;
                if (bOrder !== undefined) return 1;
              } catch (error) {
                console.warn(`Error reading folder meta.json: ${folderMetaPath}`, error);
              }
            }
          }
          
          // If no explicit order, check if pages have order in their frontmatter
          if (a.metadata.order !== undefined && b.metadata.order !== undefined) {
            return a.metadata.order - b.metadata.order;
          }
          if (a.metadata.order !== undefined) return -1;
          if (b.metadata.order !== undefined) return 1;
          
          // Fallback to alphabetical by title
          return a.metadata.title.localeCompare(b.metadata.title);
        });
        
        // Add sorted folder pages to the ordered list
        sortedFolderPages.forEach(page => {
          sidebarOrderedPages.push(page);
        });
      });
    });
    
    // Find current page index in the flattened sidebar order
    const currentIndex = sidebarOrderedPages.findIndex(page => page.slug === currentSlug);
    
    if (currentIndex === -1) {
      return { prevPage: null, nextPage: null };
    }
    
    // Get previous and next pages based on the sidebar order
    let prevPage = currentIndex > 0 ? sidebarOrderedPages[currentIndex - 1] : null;
    let nextPage = currentIndex < sidebarOrderedPages.length - 1 ? sidebarOrderedPages[currentIndex + 1] : null;
    
    // Check if current page is in a section or nested folder
    if (currentSlug.includes('/')) {
      const currentParts = currentSlug.split('/');
      const currentSection = currentParts[0];
      
      // Handle previous page navigation
      if (prevPage) {
        if (!prevPage.slug.includes('/')) {
          // If previous page is a top-level page, set it to null
          prevPage = null;
        } else {
          const prevParts = prevPage.slug.split('/');
          const prevSection = prevParts[0];
          
          // If previous page is from a different section, set it to null
          if (prevSection !== currentSection) {
            prevPage = null;
          } else if (currentParts.length > 2 && prevParts.length > 2) {
            // If both are in nested folders, check if they're in the same folder
            if (currentParts[1] !== prevParts[1]) {
              // If they're in different folders within the same section, set prevPage to null
              prevPage = null;
            }
          } else if (currentParts.length > 2 && prevParts.length === 2) {
            // If current page is in a nested folder but prev is direct child of section
            prevPage = null;
          }
        }
      }
      
      // Handle next page navigation
      if (nextPage) {
        if (!nextPage.slug.includes('/')) {
          // If next page is a top-level page (shouldn't happen normally), set it to null
          nextPage = null;
        } else {
          const nextParts = nextPage.slug.split('/');
          const nextSection = nextParts[0];
          
          // If next page is from a different section, set it to null
          if (nextSection !== currentSection) {
            nextPage = null;
          } else if (currentParts.length > 2 && nextParts.length > 2) {
            // If both are in nested folders, check if they're in the same folder
            if (currentParts[1] !== nextParts[1]) {
              // If they're in different folders within the same section, set nextPage to null
              nextPage = null;
            }
          } else if (currentParts.length === 2 && nextParts.length > 2) {
            // If current page is direct child of section but next is in a nested folder
            nextPage = null;
          }
        }
      }
    }
    
    return { prevPage, nextPage };
  } catch (error) {
    console.error("Error getting adjacent pages:", error);
    return { prevPage: null, nextPage: null };
  }
}

// Function to get all sections with their pages
export function getSections(sortType: SortType = 'order'): { section: string, pages: Post[] }[] {
  try {
    // Get all pages
    const allPages = getPages();
    
    // Group pages by section
    const sectionMap = new Map<string, Post[]>();
    
    allPages.forEach(page => {
      const section = page.slug.split('/')[0];
      if (!sectionMap.has(section)) {
        sectionMap.set(section, []);
      }
      sectionMap.get(section)!.push(page);
    });
    
    // Sort sections based on meta.json order if available
    const sections: { section: string, pages: Post[] }[] = [];
    
    // Try to read root meta.json for section ordering
    let rootMetaData: { sections?: Record<string, number> } = {};
    const rootMetaPath = path.join(process.cwd(), "src", "content", "meta.json");
    if (fs.existsSync(rootMetaPath)) {
      try {
        rootMetaData = JSON.parse(fs.readFileSync(rootMetaPath, 'utf8'));
      } catch (error) {
        console.warn(`Error reading root meta.json: ${rootMetaPath}`, error);
      }
    }
    
    // Convert map to array and sort sections
    for (const [section, pages] of sectionMap.entries()) {
      sections.push({
        section,
        pages: sortPages(pages, sortType)
      });
    }
    
    // Sort sections based on meta.json order if available, otherwise alphabetically
    return sections.sort((a, b) => {
      const aOrder = rootMetaData.sections?.[a.section];
      const bOrder = rootMetaData.sections?.[b.section];
      
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      
      return a.section.localeCompare(b.section);
    });
  } catch (error) {
    console.error("Error getting sections:", error);
    return [];
  }
}