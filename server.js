app.use(async (req, res, next) => {
  // check if there's an auth token in the header
  try {
    // Check if the request has an "Authorization" header
    if (!req.headers.authorization) {
      return next();
    } // If not, continue to the next middleware

    const token = req.headers.authorization.split(' ')[1];
    // Use the userId from the decoded token to find the corresponding user in the database
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    // If no user is found with the given userId, continue to the next middleware
    if (!user) {
      return next();
    }
    // Remove the "password" property from the user object for security (assuming it's sensitive)
    delete user.password;
    // Attach the user object to the request object for later use in route handlers
    req.user = user;
    next();
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});
