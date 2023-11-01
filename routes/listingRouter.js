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

//POST / jobListings

listingRouter.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      type,
      salary,
      country,
      city,
      contactEmail,
    } = req.body;

    const { id, role } = req.user;
    if (!id) {
      return res.send({
        success: false,
        error: 'You must be logged in to post a job listing',
      });
    }
    if (role !== 'EMPLOYER') {
      return res.send({
        success: false,
        error: 'You must be an employer',
      });
    }

    if (
      !title ||
      !description ||
      !shortDescription ||
      !type ||
      !salary ||
      !country ||
      !city ||
      !contactEmail
    ) {
      return res.send({
        success: false,
        error: 'Please fill out the entire form',
      });
    }

    const listing = await prisma.jobDescription.create({
      data: {
        userId: id,
        title,
        description,
        shortDescription,
        type,
        salary,
        country,
        city,
        contactEmail,
      },
    });
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

listingRouter.delete('/:listingId', async (req, res) => {
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
        error: 'Listing not found',
      });
    }
    if (req.user.id !== listing.userId) {
      return res.send({
        success: false,
        error: 'You must be the owner of the listing to delete',
      });
    }

    await prisma.jobDescription.delete({
      where: {
        id: listingId,
      },
    });
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
