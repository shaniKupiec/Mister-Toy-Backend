const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getReviews, getReviewById, addReview, updateReview, deleteReview } = require('./review.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getReviews)
router.post('/', addReview)
router.delete('/:id', requireAuth, deleteReview)

// router.get('/:id', getReviewById)
// router.put('/:id', requireAuth, requireAdmin, updateReview)

module.exports = router