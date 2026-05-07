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

  return products.filter((product) => {
    const matchesCategory =
      filters.categoryId === 'all' || product.categoryId === filters.categoryId
    const matchesSearch =
      !searchKeyword ||
      [product.name, product.summary, product.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchKeyword))
    const matchesThickness =
      !filters.thickness ||
      product.specifications.thickness.toLowerCase() === filters.thickness.toLowerCase()
    const matchesGlueType =
      !filters.glueType ||
      product.specifications.glueType.toLowerCase() === filters.glueType.toLowerCase()
    const matchesMoisture =
      !filters.moisture ||
      product.specifications.moisture.toLowerCase() === filters.moisture.toLowerCase()

    return (
      matchesCategory &&
      matchesSearch &&
      matchesThickness &&
      matchesGlueType &&
      matchesMoisture
    )
  })
}
