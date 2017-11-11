import styles from './styles.css'

function createSelector(optionElements) {
  const el = document.createElement('select')
  el.classList.add(styles.select)
  for (const o of optionElements) {
    const optionEl = document.createElement('option')
    optionEl.value = o
    optionEl.textContent = o
    el.appendChild(optionEl)
  }
  return el
}

export default (container, [startYear, endYear], onChange) => {
  const years = []
  for (let i = startYear; i <= endYear; ++i) {
    years.push(i)
  }
  const startEl = createSelector(years)
  const endEl = createSelector(years)

  const handleChange = () => onChange([startEl.value, endEl.value])
  startEl.addEventListener('change', handleChange)
  endEl.addEventListener('change', handleChange)

  container.appendChild(startEl)
  container.appendChild(endEl)
}
