import express from 'express';
import { prisma } from '../server.js';

export const listingRouter = express.Router();

//GET / job listings;
listingRouter.get('/', async (req, res) => {
  try {
    const listings = await prisma.jobDescription.findMany();
    res.send({
      success: true,
      listings,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

listingRouter.get('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await prisma.jobDescription.findUnique({
      where: {
        id: listingId,
      },
    });
    if (!listing) {
      return res.send({
        success: false,
        error: 'listing not found',
      });
    }
    res.send({
      success: true,
      listing,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
