const returnUser = (user) => {
  return {
    name: {
      first: user.name.first,
      last: user.name.last,
    },
    email: user.email,
    image: {
      url: user.image.url,
      alt: user.image.alt,
    },
  };
};

module.exports = returnUser;