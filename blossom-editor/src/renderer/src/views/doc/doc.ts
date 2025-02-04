import Notify from '@renderer/scripts/notify'
import { isEmpty } from 'lodash'
import { Ref } from 'vue'
import type { InjectionKey } from 'vue'

/**
 * 依赖注入的 key, 用于限制类型
 */
export const provideKeyDocTree = Symbol() as InjectionKey<Ref<DocTree[]>>
export const provideKeyDocInfo = Symbol() as InjectionKey<Ref<DocInfo | undefined>>
export const provideKeyCurArticleInfo = Symbol() as InjectionKey<Ref<DocInfo | undefined>>

/**
 * 将 docTree 对象转换为 docInfo
 * @param tree DocTree
 * @returns DocInfo
 */
export const treeToInfo = (tree: DocTree): DocInfo => {
  return {
    id: tree.i,
    pid: 0,
    name: tree.n,
    tags: tree.t,
    sort: 1,
    openStatus: 0,
    starStatus: 0,
    type: tree.ty
  }
}

export enum TitleColor {
  ONE = '#C9515193',
  TWO = '#E6981293',
  THREE = '#127EA993',
  FOUR = '#4AA40E93'
}

/**
 * 通过标题等级计算颜色
 * @param level 标题等级
 * @returns
 */
export const computedDocTitleColor = (level: number) => {
  if (level === 1) {
    return TitleColor.ONE
  }
  if (level === 2) {
    return TitleColor.TWO
  }
  if (level === 3) {
    return TitleColor.THREE
  }
  return TitleColor.FOUR
}

/**
 * 检查上级层级, 上级层级超过4级时无法保存
 * @param pid   上级ID
 * @param trees 树状列表
 * @returns
 */
export const checkLevel = (pid: number, trees: DocTree[]): boolean => {
  let parents = getPDocsByPid(pid, trees)
  if (parents.length >= 4) {
    Notify.error('最多仅支持4级层级关系', '菜单层级错误')
    return false
  }
  return true
}

/**
 * 递归从文档树状列表中获取指定ID的文章信息
 *
 * @param articleId 文档ID, 通常是文章ID, 也兼容文件夹ID的获取
 * @param trees 文档树状列表
 */
export const getDocById = (articleId: number, trees: DocTree[]): DocTree | undefined => {
  let target: DocTree | undefined
  for (let i = 0; i < trees.length; i++) {
    let tree = trees[i]
    if (tree.i == articleId) {
      target = tree
    } else if (!isEmpty(tree.children)) {
      target = getDocById(articleId, tree.children!)
    }
    if (target != undefined) {
      break
    }
  }
  return target
}

/**
 * 获取指定文档的所有父文档
 * @param id
 * @param trees
 * @returns
 */
export const getPDocsByPid = (id: number, trees: DocTree[], result?: DocInfo[]): DocInfo[] => {
  let target: DocTree | undefined = getDocById(id, trees)
  if (!target) {
    return []
  }
  if (isEmpty(result)) {
    result = [treeToInfo(target)]
  } else {
    result!.push(treeToInfo(target))
  }
  if (target.p !== 0) {
    getPDocsByPid(target.p, trees, result)
  }
  return result!
}

/**
 * 递归从文档树状列表中获取指定文档ID的子文档
 *
 * @param pid
 * @param trees 文档树状列表
 */
export const getCDocsByPid = (id: number, trees: DocTree[]): DocInfo[] => {
  let target: DocTree | undefined = getDocById(id, trees)
  if (!target) {
    return []
  }
  let result: DocInfo[] = []
  treeToArrays([target], result)
  return result
}

const treeToArrays = (trees: DocTree[], result: DocInfo[]) => {
  for (let i = 0; i < trees.length; i++) {
    let tree = trees[i]
    if (!isEmpty(tree.children)) {
      treeToArrays(tree.children!, result)
    }
    result.push(treeToInfo(tree))
  }
}
