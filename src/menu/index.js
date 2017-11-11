import styles from './styles.css'

function validateItem(item) {
  if (!('key' in item) || typeof item.key !== 'string') {
    throw new Error('item should have a key (string)')
  }
  if (!('name' in item) || typeof item.name !== 'string') {
    throw new Error('item should have a name (string)')
  }
}

export default (container, items, onChange) => {
  if (!Array.isArray(items)) {
    throw new Error('items should be an array of ids')
  }
  for (const item of items) {
    validateItem(item)
    const el = document.createElement('li')
    el.dataset.item = item.key
    el.classList.add(styles.menuItem)
    if (item === items[0]) {
      el.classList.add(styles.selected)
    }
    el.textContent = item.name
    container.appendChild(el)
  }
  container.addEventListener('click', ({ target }) => {
    if (!target.classList.contains(styles.menuItem)) {
      return
    }
    for (const child of container.children) {
      child.classList.remove(styles.selected)
    }
    target.classList.add(styles.selected)
    onChange(target.dataset.item)
  })
  return container
}
