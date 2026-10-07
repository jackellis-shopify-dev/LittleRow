/* No Little Row photography supplied yet.

   Both maps are intentionally empty, so every Photo slot renders its placeholder:
   a tinted block with the monogram at 14%. To bring real imagery in, add entries here —
   product ids keyed by product title, scene keys as listed below — pointing at local
   files in ../../assets/ or any URL. Nothing else in the kit needs to change.

   Scene keys used: hero, newborn, baby, kids, fabric,
   product-front, product-detail, product-worn. */

const PRODUCT_IMAGES = {};
const SCENE_IMAGES = {};

const productImage = (title, w, h) => PRODUCT_IMAGES[title] || null;
const sceneImage = (key, w, h) => SCENE_IMAGES[key] || null;

Object.assign(window, { productImage, sceneImage, PRODUCT_IMAGES, SCENE_IMAGES });
