import styles from './styles.css'

function createSelector(optionElements, selectedVal) {
  const el = document.createElement('select')
  el.classList.add(styles.select)
  for (const o of optionElements) {
    const optionEl = document.createElement('option')
    optionEl.value = o
    optionEl.selected = selectedVal === o
    optionEl.textContent = o
    el.appendChild(optionEl)
  }
  return el
}

function getRange(startEl, endEl) {
  const start = startEl.value
  const end = endEl.value
  if (start > end) {
    startEl.value = end
    endEl.value = start;
    return [end, start]
  }
  return [start, end]
}

export default (container, [startYear, endYear], onChange) => {
  const years = []
  for (let i = startYear; i <= endYear; ++i) {
    years.push(i)
  }
  const startEl = createSelector(years, startYear)
  const endEl = createSelector(years, endYear)

  const handleChange = () => {
    const range = getRange(startEl, endEl)
    onChange(range)
  }
  startEl.addEventListener('change', handleChange)
  endEl.addEventListener('change', handleChange)

  container.appendChild(startEl)
  container.appendChild(endEl)
}
