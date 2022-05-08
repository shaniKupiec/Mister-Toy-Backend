const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const toyService = require('./toy.service')

// GET LIST
async function getToys(req, res) {
  try {
    const toys = await toyService.query(req.query)
    res.send(toys)
  } catch (err) {
    logger.error('Cannot get toys', err)
    res.status(500).send({ err: 'Failed to get toys' })
  }
}

// GET BY ID
async function getToyById(req, res) {
  try {
    const toy = await toyService.getById(req.params.id)
    res.send(toy)
  } catch (err) {
    logger.error('Failed to get toy', err)
    res.status(500).send({ err: 'Failed to get toy' })
  }
}

// POST (add toy)
async function addToy(req, res) {
  try {
    var toy = req.body
    toy.creatorId = req.session.user._id
    toy = await toyService.add(toy)

    // console.log('CTRL SessionId:', req.sessionID)
    // socketService.broadcast({ type: 'toy-added', data: toy, userId: toy.byUserId })
    // socketService.emitToUser({ type: 'toy-about-you', data: toy, userId: toy.aboutUserId })
    // socketService.emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })

    res.send(toy)
  } catch (err) {
    console.log(err)
    logger.error('Failed to add toy', err)
    res.status(500).send({ err: 'Failed to add toy' })
  }
}

// PUT (Update toy)
async function updateToy(req, res) {
  try {
    const updatedToy = await toyService.update(req.body)
    res.send(updatedToy)
  } catch (err) {
    logger.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

// DELETE (Remove toy)
async function deleteToy(req, res) {
  try {
    await toyService.remove(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    logger.error('Failed to delete toy', err)
    res.status(500).send({ err: 'Failed to delete toy' })
  }
}

module.exports = {
  getToys,
  getToyById,
  updateToy,
  addToy,
  deleteToy,
}
