const returnUser = (user) => {
  return {
    name: {
      first: user.name.first,
      last: user.name.last,
    },
    email: user.email,
    image: {
      url: user.image?.url || "",
    },
  };
};

module.exports = returnUser;