/*
 * Photography for the charcoal line.
 *
 * Every ID below was opened and looked at before being used — an Unsplash ID tells
 * you nothing about its subject, and a wrong one ships a photo that contradicts the
 * copy beside it. Replace these with FortisVN's own factory and product photography
 * when it is available; stock charcoal reads as stock to a trade buyer.
 */

const unsplash = (id, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

export const CHARCOAL_MEDIA = {
  /** Glowing charcoal bed, dramatic reds. */
  heroEmber: unsplash('photo-1680027412524-dcabcd83dc59', 1920),
  /** Dark unlit charcoal chunks — used for the raw-material slide. */
  heroRaw: unsplash('photo-1703359905448-6ceada4db44e', 1920),
  /** Pressed briquettes glowing; the shapes read clearly as briquettes. */
  heroBriquette: unsplash('photo-1622641146379-2672c7437900', 1920),
  /** Charcoal burning under a grill grate. */
  grill: unsplash('photo-1621851709622-e19c9a4f0cc5'),
  /** Charcoal burning in a pan. */
  burning: unsplash('photo-1494358856891-c9a46d446c39'),
  /** Logs with embers — stands in for the carbonisation stage. */
  kiln: unsplash('photo-1597353811858-fbb7ce0a9ca6'),
}

export const CHARCOAL_PRODUCT_IMAGES = [
  CHARCOAL_MEDIA.heroBriquette,
  CHARCOAL_MEDIA.grill,
  CHARCOAL_MEDIA.burning,
  CHARCOAL_MEDIA.heroRaw,
]
