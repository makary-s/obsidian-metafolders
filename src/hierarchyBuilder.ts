import { TFile } from 'obsidian';
import { PluginContext } from './types';
import { getFileBacklinks, getFileByPath } from './helpers';

export const getParentFiles = (ctx: PluginContext, file: TFile): TFile[] => {
    const frontMatterLinks = ctx.app.metadataCache.getFileCache(file)?.frontmatterLinks

    if (!frontMatterLinks) return []

    return frontMatterLinks.reduce((acc, item) => {
        const [itemKey] = item.key.split('.')
        if (itemKey === ctx.settings.parentPropName) {
            const file = ctx.app.metadataCache.getFirstLinkpathDest(item.link, '')
            if (file) {
                acc.push(file)
            }
        }
        return acc
    }, [] as TFile[])
}

export const getChildFiles = (ctx: PluginContext, file: TFile): TFile[] => {
  const childFiles: TFile[] = [];

  const backlinks = getFileBacklinks(ctx, file)

  for (const [childPath, childLinks] of Object.entries(backlinks)) {
    for (const childLink of childLinks) {
      if (!childLink.key) continue

      const [childLinkKey] = childLink.key.split('.')

      if (childLinkKey === ctx.settings.parentPropName) {
        const file = getFileByPath(ctx, childPath)
        if (file) {
          childFiles.push(file)
        }
      }
    }
  }

  return childFiles;
}


interface HierarchyNode {
  file: TFile;
  getParents: () => HierarchyNode[];
  getChildren: () => HierarchyNode[];
}

export const getFileHierarchy = (ctx: PluginContext, file: TFile) => {
  const hierarchy: HierarchyNode = {
    file,
    getParents: () => getParentFiles(ctx, file).map(f => getFileHierarchy(ctx, f)),
    getChildren: () => getChildFiles(ctx, file).map(f => getFileHierarchy(ctx, f))
  }

  return hierarchy
}