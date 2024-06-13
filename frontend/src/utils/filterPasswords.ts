export interface MyDict {
  val: string
  idx: number
}

export function filterUpToDateItems(data: MyDict[]): MyDict[] {
  const updatedItems: Record<number, MyDict> = {}

  for (const item of data) {
    if (item.idx === -1) {
      // If idx is -1, it's a new item, so add it to updatedItems
      updatedItems[Object.keys(updatedItems).length] = item
    } else {
      // If idx is not -1, it's an update, so update the corresponding item in updatedItems
      updatedItems[item.idx] = item
    }
  }

  // Convert updatedItems back to an array
  const upToDateItems: MyDict[] = []
  for (const idx in updatedItems) {
    if (Object.prototype.hasOwnProperty.call(updatedItems, idx)) {
      upToDateItems.push(updatedItems[idx])
    }
  }

  return upToDateItems
}
