const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * @swagger
 * definition:
 *   usecase:
 *     properties:
 *       _id:
 *         type: string
 *       name:
 *          type: string
 *       description:
 *          type: string
 *       createdAt:
 *          type: string
 *          format: date-time
 *       author:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *       smartContracts:
 *         type: array
 *         items:
 *           type: string
 *         example:
 *           - 5e903747ecd14931789e1761
 *           - 5e905b62df605e3be6031ff7
 *           - 5e905b62df690e3cd6031ce9
 */
const UsecaseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  smartContracts: [
    {
      type: Schema.Types.ObjectId,
      ref: "contracts",
    },
  ],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    name: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Usecase = mongoose.model("usecases", UsecaseSchema);
