const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('review')

    var reviews = await collection
      .aggregate([
        { $match: criteria },
        {
          $lookup: {
            from: 'user',
            foreignField: '_id',
            localField: 'userId',
            as: 'user',
          },
        },
        { $unwind: '$user' }, // [{.....}] ==> {.....}
        {
          $lookup: {
            from: 'toy',
            foreignField: '_id',
            localField: 'toyId',
            as: 'toy',
          },
        },
        { $unwind: '$toy' }, // [{.....}] ==> {.....}
        {
          $project: {
            _id: 1,
            content: 1,
            rate: 1,
            user: { _id: 1, username: 1 },
            toy: { _id: 1, name: 1, price: 1 },
            // userId: 0,
            // toyId: 0,
          },
        },
      ])
      .toArray()

    // // return reviews
    // reviews = reviews.map((review) => {
    //   review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
    //   review.aboutUser = { _id: review.aboutUser._id, fullname: review.aboutUser.fullname }
    //   delete review.byUserId
    //   delete review.aboutUserId
    //   return review
    // })

    return reviews
  } catch (err) {
    logger.error('cannot find reviews', err)
    throw err
  }
}

async function addReview(review) {
  try {
    const reviewToAdd = {
      userId: ObjectId(review.userId),
      toyId: ObjectId(review.toyId),
      content: review.content,
      rate: review.rate,
    }

    const collection = await dbService.getCollection('review')
    const addedReview = await collection.insertOne(reviewToAdd)

    reviewToAdd._id = addedReview.insertedId
    return reviewToAdd
  } catch (err) {
    logger.error('cannot insert review', err)
    throw err
  }
}

async function removeReview(reviewId) {
  try {
    // const store = asyncLocalStorage.getStore()
    // const { userId, isAdmin } = store

    const collection = await dbService.getCollection('review')
    const criteria = { _id: ObjectId(reviewId) }
    await collection.deleteOne(criteria)
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  if (filterBy.userId) return { userId: ObjectId(filterBy.userId) }
  else if (filterBy.toyId) return { toyId: ObjectId(filterBy.toyId) }
  return {}
}

module.exports = {
  query,
  addReview,
  removeReview,
}
