const mongoose = require("../../common/services/mongoose.service").mongoose;
const Schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  permissionLevel: Number,
  friends: [
    {
      type: objectId,
      ref: "Users",
    },
  ],
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.findById = function (cb) {
  return this.model("Users").find({ id: this.id }, cb);
};

const User = mongoose.model("Users", userSchema);

exports.findByEmail = (email) => {
  return User.find({ email: email }).populate(
    "friends",
    "_id firstName lastName email"
  );
};

// exports.findById = (id, populate) => {
//   return User.findById(id)
//     .populate("friends", "_id firstName lastName email")
//     .then((result) => {
//       result = result.toJSON();
//       delete result._id;
//       delete result.__v;
//       return result;
//     });
// };

exports.findById = async (id, extendFriends) => {
  let user;
  if (extendFriends == "true") {
    user = await User.findById(id).populate(
      "friends",
      "_id firstName lastName email"
    );
  } else {
    user = await User.findById(id);
  }
  user = user.toJSON();
  delete user._id;
  delete user.__v;
  return user;
};

exports.createUser = (userData) => {
  const user = new User(userData);
  return user.save();
};

exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    User.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.patchUser = (id, userData) => {
  return User.findOneAndUpdate(
    {
      _id: id,
    },
    userData
    // why?
  );
};

exports.removeById = (userId) => {
  return new Promise((resolve, reject) => {
    User.deleteMany({ _id: userId }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
        // resolve error?
      }
    });
  });
};

exports.addFriend = (userId, friendId) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

exports.removeFriend = (userId, friendId) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { $pull: { friends: { $eq: friendId } } },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};
