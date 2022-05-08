const logger = require('../../services/logger.service')
const socketService = require('../../services/socket.service')
const reviewService = require('./review.service')

async function getReviews(req, res) {
  try {
    const reviews = await reviewService.query(req.query)
    res.send(reviews)
  } catch (err) {
    logger.error('Cannot get reviews', err)
    res.status(500).send({ err: 'Failed to get reviews' })
  }
}

async function getReviewById(req, res) {
}

async function updateReview(req, res) {
}

async function addReview(req, res) {
  try {
    const review = req.body
    review.userId = req.session.user._id
    const addedReview = await reviewService.addReview(review)

    // console.log('CTRL SessionId:', req.sessionID)
    // socketService.broadcast({ type: 'review-added', data: review, userId: review.byUserId })
    // socketService.emitToUser({ type: 'review-about-you', data: review, userId: review.aboutUserId })
    // socketService.emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })

    res.send(addedReview)
  } catch (err) {
    console.log(err)
    logger.error('Failed to add review', err)
    res.status(500).send({ err: 'Failed to add review' })
  }
}

async function deleteReview(req, res) {
  try {
    await reviewService.removeReview(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    logger.error('Failed to delete review', err)
    res.status(500).send({ err: 'Failed to delete review' })
  }
}

module.exports = {
  getReviews,
  deleteReview,
  addReview,
  getReviewById,
  updateReview,
}
