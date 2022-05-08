const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('toy')
    var toys = await collection.find(criteria).toArray()
    // toys = _sort(toys, sortBy)
    return toys
  } catch (err) {
    logger.error('cannot find toys', err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    // var toy = collection.findOne({ _id: ObjectId(toyId) })
    // console.log('1 toyId', toyId);
    var toys = await collection
      .aggregate([
        {
          $match: {_id: ObjectId(toyId)},
        },
        {
          $lookup: {
            localField: 'creatorId',
            from: 'user',
            foreignField: '_id',
            as: 'creator',
          },
        },
        {
          $unwind: '$creator',
        },
      ])
      .toArray()
    var toy = toys[0]
    toy.creator = { _id: toy.creator._id, fullname: toy.creator.fullname }
    toy.createdAt = ObjectId(toy._id).getTimestamp()
    delete toy.creatorId
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function update(toy) {
  try {
    var id = ObjectId(toy._id)
    delete toy._id
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: id }, { $set: { ...toy } })
    toy._id = id
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: ObjectId(toyId) })
    return toyId
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    toy.creatorId = ObjectId(toy.creatorId)
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  console.log('filterBy',filterBy)
  const criteria = {}
  if (filterBy.name) {
    const txtCriteria = { $regex: filterBy.name, $options: 'i' }
    criteria.$or = [
      {
        name: txtCriteria,
      },
    ]
  }

  if (filterBy.stock !== 'All') {
    criteria.inStock = { $eq: filterBy.stock === 'In Stock' }
  }

  if (filterBy.labels?.length) {
    criteria.labels = { $in: filterBy.labels }
  }
  console.log('criteria',criteria)
  return criteria
}

function _sort(toys, sortBy) {
  if (!sortBy) return

  switch (sortBy) {
    case 'createdAt':
      toys.sort((t1, t2) => t1.createdAt - t2.createdAt)
      break
    case 'name':
      toys.sort((t1, t2) => t1.name.localeCompare(t2.name))
      break
    case 'price':
      toys.sort((t1, t2) => t1.price - t2.price)
      break
  }
}

module.exports = {
  query,
  getById,
  update,
  add,
  remove,
}
