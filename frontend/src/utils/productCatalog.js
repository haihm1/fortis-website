export function getUniqueOptions(products, selector) {
  return Array.from(
    new Set(
      products
        .map(selector)
        .filter(Boolean)
        .map((value) => value.trim()),
    ),
  )
}

export function filterProducts(products, filters) {
  const searchKeyword = filters.search.trim().toLowerCase()
  const selectedSpec = parseSpecFilter(filters.specification)

  return products.filter((product) => {
    const matchesCategory =
      filters.categoryId === 'all' || product.categoryId === filters.categoryId
    const matchesSearch =
      !searchKeyword ||
      [product.name, product.summary, product.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchKeyword))
    const matchesSpecification =
      !selectedSpec ||
      (product.specifications ?? []).some(
        (spec) =>
          spec.label.toLowerCase() === selectedSpec.label &&
          spec.value.toLowerCase() === selectedSpec.value,
      )

    return (
      matchesCategory &&
      matchesSearch &&
      matchesSpecification
    )
  })
}

export function getSpecificationOptions(products) {
  const options = new Map()
  products.forEach((product) => {
    ;(product.specifications ?? []).forEach((spec) => {
      if (!spec.label || !spec.value) return
      const key = buildSpecFilterValue(spec)
      options.set(key, `${spec.label}: ${spec.value}`)
    })
  })
  return Array.from(options.entries()).map(([value, label]) => ({ value, label }))
}

export function buildSpecFilterValue(spec) {
  return `${spec.label.trim()}::${spec.value.trim()}`
}

function parseSpecFilter(value) {
  if (!value) return null
  const [label, specValue] = value.split('::')
  if (!label || !specValue) return null
  return {
    label: label.toLowerCase(),
    value: specValue.toLowerCase(),
  }
}
