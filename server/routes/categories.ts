/**
 * Categories API routes
 * Category management
 */
import { Router } from 'express';

const router = Router()

const categoryLabels: Record<string, string> = {
  device: 'Device',
  liquid: 'Liquid',
  peripheral: 'Peripheral',
  service: 'Service'
}

const validCategories = Object.keys(categoryLabels)

router.get('/', (req, res) => {
  const categories = validCategories.map(category => ({
    id: category,
    name: categoryLabels[category]
  }))

  res.json({ categories })
})

router.get('/:id', (req, res) => {
  const { id } = req.params

  if (!validCategories.includes(id)) {
    return res.status(404).json({ error: 'Category not found' })
  }

  res.json({
    category: {
      id,
      name: categoryLabels[id]
    }
  })
})

router.post('/', (req, res) => {
  res.status(405).json({ error: 'Categories cannot be created or modified' })
})

router.put('/:id', (req, res) => {
  res.status(405).json({ error: 'Categories cannot be created or modified' })
})

router.delete('/:id', (req, res) => {
  res.status(405).json({ error: 'Categories cannot be deleted' })
})

export default router
